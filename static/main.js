const EMPTY = 0
const DARK = 1
const LIGHT = 2

const WINNER_DRAW = 0
const WINNER_DARK = 1
const WINNER_LIGHT = 2

const boardElement = document.getElementById('board')
const nextDiscMessageElement = document.getElementById('next-disc-message')
const warningMessageElement = document.getElementById('warning-message')

async function showBoard(turnCount, previousDisc){
    const response = await fetch(`/api/games/latest/turns/${turnCount}`)
    const responseBody = await response.json()
    const board = responseBody.board
    const nextDisc = responseBody.nextDisc
    const winnerDisc = responseBody.winnerDisc

    showWarningMessage(previousDisc, nextDisc, winnerDisc)

    showNextDiscMessage(nextDisc)

    while (boardElement.firstChild) {
        boardElement.removeChild(boardElement.firstChild)
    }

    board.forEach((line, y) => {
        line.forEach((square, x) => {
            const squareElement = document.createElement('div')
            squareElement.className = 'square'

            if (square !== EMPTY) {
                const stoneElement = document.createElement('div')
                const color = square === DARK ? 'dark' : 'light'
                stoneElement.className = `stone ${color}`

                squareElement.appendChild(stoneElement)
            } else {
                squareElement.addEventListener('click', async () => {
                    const nextTurnCount = turnCount + 1
                    const registerTurnResponse = await registerTurn(nextTurnCount, nextDisc, x, y)
                    if (registerTurnResponse.ok) {
                        await showBoard(nextTurnCount, nextDisc)
                    }
                })
            }

            boardElement.appendChild(squareElement)
        })
    })
}

function showNextDiscMessage(nextDisc){
    if (nextDisc) {
        const color = nextDisc === DARK ? 'Black' : 'White'
        nextDiscMessageElement.innerText = `Next Turn is ${color}`
    } else {
        nextDiscMessageElement.innerText = ''
    }
}

function discToString(disc) {
    return disc === DARK ? 'Black': 'White'
}

function showWarningMessage(previousDisc, nextDisc, winnerDisc){
    const message = warningMessage(previousDisc, nextDisc, winnerDisc)

    warningMessageElement.innerText = message

    if (message === null) {
        warningMessageElement.style.display = 'none'
    } else {
        warningMessageElement.style.display = 'block'
    }
}

function warningMessage(previousDisc, nextDisc, winnerDisc) {
    if (nextDisc !== null) {
        if (previousDisc === nextDisc) {
            const skipped = nextDisc === DARK ? LIGHT : DARK
            return `Turn for ${discToString(skipped)} is skipped`
        } else {
            return null
        }
    } else {
        if (winnerDisc === WINNER_DRAW) {
            return 'The result is DRAW !'
        } else {
            return `The winner is ${discToString(winnerDisc)} !!`
        }
    }
}


async function registerGame() {
    await fetch('/api/games', {
        method: 'POST'
    })
}

async function registerTurn(turnCount, disc, x, y){
    const requestBody = {
        turnCount,
        move: {
            disc,
            x,
            y
        }
    }

    return await fetch('/api/games/latest/turns', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
    })
}

async function main(){
    await registerGame()
    await showBoard(0)
}

main()