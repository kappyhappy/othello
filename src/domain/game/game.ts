export class Game {
    constructor (
        private _gameId: number | undefined,
        private _startedAt: Date    
    ) {}

    get id() {
        return this._gameId
    }

    get startedAt() {
        return this._startedAt
    }
}