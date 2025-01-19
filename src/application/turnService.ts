import { connectMySQL } from "../dataaccess/connection"
import { GameGateway } from "../dataaccess/gameGateway"
import { TurnGateway } from "../dataaccess/turnGateway"
import { MoveGateway } from "../dataaccess/moveGateway"
import { SquareGateway } from "../dataaccess/squareGateway"
import { DARK, LIGHT } from "./constants"
import { Turn } from "../presentation/domain/turn"
import { Board } from "../presentation/domain/board"
import { toDisc } from "../presentation/domain/disc"
import { Point } from "../presentation/domain/point"

const gameGateway = new GameGateway()
const turnGateway = new TurnGateway()
const moveGateway = new MoveGateway()
const squareGateway = new SquareGateway()

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
            const gameRecord = await gameGateway.findLatest(conn)
            if (!gameRecord){
                throw new Error('Latest game not found')
            }
    
            const turnRecord = await turnGateway.findForGameIdAndTurnCount(
                conn, gameRecord.id, turnCount
            )
            if (!turnRecord){
                throw new Error('Specified turn not found')
            }
    
            const board = Array.from(Array(8)).map(() => Array.from(Array(8)))
    
            const squareRecords = await squareGateway.findForTurnId(conn, turnRecord.id)
            squareRecords.forEach((s) => {
                board[s.y][s.x] = s.disc
            })

            return new findLatestGameTurnByTurnCountOutput(
                turnCount,
                board,
                turnRecord.nextDisc,
                //Todo get from games_result table if game is over
                undefined
            )
        } finally {
            await conn.end()
        }   
    }

    async registerTurn (
        turnCount: number,
        disc: number,
        x: number,
        y: number
    ) {
        // get one turn before
        const conn = await connectMySQL()
        try {
            const gameRecord = await gameGateway.findLatest(conn)
            if (!gameRecord){
                throw new Error('Latest game not found')
            }

            const previousTurnCount = turnCount - 1
            const previousTurnRecord = await turnGateway.findForGameIdAndTurnCount(
                conn, gameRecord.id, previousTurnCount
            )
            if (!previousTurnRecord){
                throw new Error('Specified turn not found')
            }

            const squareRecords = await squareGateway.findForTurnId(conn, previousTurnRecord.id)

            const board = Array.from(Array(8)).map(() => Array.from(Array(8)))
            squareRecords.forEach((s) => {
                board[s.y][s.x] = s.disc
            })

            const previousTurn = new Turn(
                gameRecord.id,
                previousTurnCount,
                toDisc(previousTurnRecord.nextDisc),
                undefined,
                new Board(board),
                previousTurnRecord.endAt
            )

            const newTurn = previousTurn.placeNext(toDisc(disc), new Point(x, y))



            // store the turn
            const turnRecord = await turnGateway.insert(
                conn,
                newTurn.gameId,
                newTurn.turnCount,
                newTurn.nextDisc,
                newTurn.endAt
            )
            
            await squareGateway.insertAll(
                conn, turnRecord.id, newTurn.board.discs
            )

            await moveGateway.insert(conn, turnRecord.id, disc, x, y)

            await conn.commit()
        } finally {
            await conn.end()
        }    
    }
}