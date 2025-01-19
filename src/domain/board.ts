import { Disc } from "./disc";
import { Move } from "./move";

export class Board {
    constructor (
        private _discs: Disc[][]
    ) {}

    place(move: Move): Board {
        // check if we can place a disc

        // copy a board
        const newDiscs = this._discs.map((line) => {
            return line.map((disc) => disc)
        })

        // place a disc
        newDiscs[move.point.y][move.point.x] = move.disc

        // flip over discs

        return new Board(newDiscs)
    }

    get discs() {
        return this._discs
    }
}