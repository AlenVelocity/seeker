import { useState, useEffect } from 'react'
import { Player, Team } from '@prisma/client'
import { addDays, differenceInSeconds, startOfDay, isSameDay } from 'date-fns'

type PlayerWithTeam = Player & {
    team: Team
}

interface GameState {
    guesses: PlayerWithTeam[]
    gameOver: boolean
    targetPlayer: PlayerWithTeam | null
    nextGameTime: Date
    lastPlayedDate: Date
}

const STORAGE_KEY = 'VCTLE_GAME_STATE'

export function useVCTLEGame(players: PlayerWithTeam[], initialTargetPlayer: PlayerWithTeam) {
    const [gameState, setGameState] = useState<GameState>(() => {
        if (typeof window === 'undefined') {
            return initializeNewGame(initialTargetPlayer)
        }

        const storedState = localStorage.getItem(STORAGE_KEY)
        if (storedState) {
            const parsedState = JSON.parse(storedState, (key, value) => {
                if (key === 'nextGameTime' || key === 'lastPlayedDate') {
                    return new Date(value)
                }
                return value
            }) as GameState

            if (isSameDay(parsedState.lastPlayedDate, new Date())) {
                return parsedState
            }
        }

        return initializeNewGame(initialTargetPlayer)
    })

    useEffect(() => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState))
        }
    }, [gameState])

    const makeGuess = (guessedPlayer: PlayerWithTeam) => {
        if (gameState.gameOver) return

        const newGuesses = [...gameState.guesses, guessedPlayer]
        const isCorrect = guessedPlayer.id === gameState.targetPlayer?.id
        const isOutOfGuesses = newGuesses.length >= 8

        setGameState((prevState) => ({
            ...prevState,
            guesses: newGuesses,
            gameOver: isCorrect || isOutOfGuesses,
            lastPlayedDate: new Date()
        }))
    }

    const getTimeUntilNextGame = (): number => {
        return Math.max(0, differenceInSeconds(gameState.nextGameTime, new Date()))
    }

    const resetGame = () => {
        setGameState(initializeNewGame(initialTargetPlayer))
    }

    return {
        guesses: gameState.guesses,
        gameOver: gameState.gameOver,
        targetPlayer: gameState.targetPlayer,
        makeGuess,
        getTimeUntilNextGame,
        resetGame
    }
}

function initializeNewGame(targetPlayer: PlayerWithTeam): GameState {
    return {
        guesses: [],
        gameOver: false,
        targetPlayer: targetPlayer,
        nextGameTime: addDays(startOfDay(new Date()), 1),
        lastPlayedDate: new Date()
    }
}
