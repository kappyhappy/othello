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

const E = Disc.Empty
const D = Disc.Dark
const L = Disc.Light

const INITIAL_DISCS = [
    [E, E, E, E, E, E, E, E],
    [E, E, E, E, E, E, E, E],
    [E, E, E, E, E, E, E, E],
    [E, E, E, D, L, E, E, E],
    [E, E, E, L, D, E, E, E],
    [E, E, E, E, E, E, E, E],
    [E, E, E, E, E, E, E, E],
    [E, E, E, E, E, E, E, E],
]

export const initialBoard = new Board(INITIAL_DISCS)