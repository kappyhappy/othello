import { connectMySQL } from "../../infrastructure/connection"
import { GameRepository } from "../../domain/model/game/gameRepository"
import { Disc, toDisc } from "../../domain/model/turn/disc"
import { Point } from "../../domain/model/turn/point"
import { TurnRepository } from "../../domain/model/turn/turnRepository"
import { ApplicationError } from "../error/applicationError"

const gameRepository = new GameRepository()
const turnRepository = new TurnRepository()

class findLatestGameTurnByTurnCountOutput {
    constructor (
        private _turnCount: number,
        private _board: number[][],
        private _nextDisc: number | undefined,
        private _winnerDisc: number | undefined
    ) {}

    get turnCount() {
        return this._turnCount
    }

    get board() {
        return this._board
    }

    get nextDisc() {
        return this._nextDisc
    }

    get winnerDisc() {
        return this._winnerDisc
    }
}

export class TurnService {
    async findLatestGameTurnByTurnCount (
        turnCount: number
    ): Promise<findLatestGameTurnByTurnCountOutput>{
        const conn = await connectMySQL()
    
        try {
            const game = await gameRepository.findLatest(conn)
            if (!game){
                throw new ApplicationError(
                    'LatestGameNotFound',
                    'Latest game not found'
                )
            }
            if (!game.id){
                throw new Error('game.id not exist')
            }
            
            const turn = await turnRepository.findForGameIdAndTurnCount(
                conn,
                game.id,
                turnCount
            )

            return new findLatestGameTurnByTurnCountOutput(
                turnCount,
                turn.board.discs,
                turn.nextDisc,
                //Todo get from games_result table if game is over
                undefined
            )
        } finally {
            await conn.end()
        }   
    }

    async registerTurn (
        turnCount: number,
        disc: Disc,
        point: Point
    ) {
        // get one turn before
        const conn = await connectMySQL()
        try {
            const game = await gameRepository.findLatest(conn)
            if (!game){
                throw new ApplicationError(
                    'LatestGameNotFound',
                    'Latest game not found'
                )
            }
            if (!game.id){
                throw new Error('game.id not exist')
            }

            const previousTurnCount = turnCount - 1
            const previousTurn = await turnRepository.findForGameIdAndTurnCount(
                conn,
                game.id,
                previousTurnCount
            )

            const newTurn = previousTurn.placeNext(disc, point)

            // store the turn
            await turnRepository.save(conn, newTurn)

            await conn.commit()
        } finally {
            await conn.end()
        }    
    }
}