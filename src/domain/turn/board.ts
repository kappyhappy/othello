import { Disc, isOppositeDisc } from "./disc";
import { Move } from "./move";
import { Point } from "./point";

export class Board {
    private _walledDiscs: Disc[][]

    constructor (
        private _discs: Disc[][]
    ) {
        this._walledDiscs = this.wallDiscs()
    }

    place(move: Move): Board {
        // check if we can place a disc
        if (this._discs[move.point.y][move.point.x] !== Disc.Empty) {
            throw new Error('Selected point is not empty')
        }

        const flipPoints = this.listFlipPoints(move)

        if (flipPoints.length == 0){
            throw new Error('Flip point is empty')
        }

        // copy a board
        const newDiscs = this._discs.map((line) => {
            return line.map((disc) => disc)
        })

        // place a disc
        newDiscs[move.point.y][move.point.x] = move.disc

        // flip over discs
        flipPoints.forEach((p) => {
            newDiscs[p.y][p.x] = move.disc
        })

        return new Board(newDiscs)
    }

    private listFlipPoints(move: Move): Point[] {
        const flipPoints: Point[] = []

        const walledX = move.point.x + 1
        const walledY = move.point.y + 1

        const checkFlipPoints = (xMove: number, yMove: number) => {
            const flipCandidate: Point[] = []

            let cursorX = walledX + xMove
            let cursorY = walledY + yMove

            while (isOppositeDisc(move.disc, this._walledDiscs[cursorY][cursorX])) {
                flipCandidate.push(new Point(cursorX-1, cursorY-1))
                cursorX += xMove
                cursorY += yMove
                if (move.disc === this._walledDiscs[cursorY][cursorX]){
                    flipPoints.push(...flipCandidate)
                    break
                }
            }
        }
        
        // Top
        checkFlipPoints(0, -1) 
        // Top Left
        checkFlipPoints(-1, -1) 
        // Left
        checkFlipPoints(-1, 0)
        // Bottom Left
        checkFlipPoints(-1, 1)
        // Bottom
        checkFlipPoints(0, 1)
        // Bottom Right
        checkFlipPoints(1, 1)
        // Right
        checkFlipPoints(1, 0)
        // Top Right
        checkFlipPoints(1, -1)

        return flipPoints
    }
    
    private wallDiscs(): Disc[][] {
        const walled: Disc[][] = []

        const topAndBottomWall = Array(this._discs[0].length + 2).fill(Disc.Wall)

        walled.push(topAndBottomWall)

        this._discs.forEach((line) => {
            const walledLines = [Disc.Wall, ...line, Disc.Wall]
            walled.push(walledLines)
        })

        walled.push(topAndBottomWall)

        return walled
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