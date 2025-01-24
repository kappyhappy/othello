import { Game } from "../../domain/model/game/game"
import { connectMySQL } from "../../infrastructure/connection"
import { firstTurn } from "../../domain/model/turn/turn"
import { GameMySQLRepository } from "../../infrastructure/repository/game/gameMySQLRepository"
import { TurnMySQLRepository } from "../../infrastructure/repository/turn/turnMySQLRepository"
import { GameRepository } from "../../domain/model/game/gameRepository"
import { TurnRepository } from "../../domain/model/turn/turnRepository"

// const gameRepository = new GameMySQLRepository()
// const turnRepository = new TurnMySQLRepository()

export class StartNewGameUseCase {
    constructor(
        private _gameRepository: GameRepository,
        private _turnRepository: TurnRepository
    ) {}

    async run() {
        const now = new Date()

        const conn = await connectMySQL()
        try {
            await conn.beginTransaction()
            
            const game = await this._gameRepository.save(
                conn, new Game(undefined, now)
            )
            if (!game.id) {
                throw new Error('game.id not exist')
            }

            const turn = firstTurn(game.id, now)

            await this._turnRepository.save(conn, turn)
    
            await conn.commit()
        } finally {
            await conn.end()
        }    
    }
}