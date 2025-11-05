"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import type { AudioManager } from "@/lib/audio-manager"

interface MemoryGameProps {
  onBack: () => void
  audioManager: AudioManager
}

type GameState = "intro" | "playing" | "listening" | "inputting" | "paused" | "gameOver"
type Instrument = "drum" | "trumpet" | "guitar" | "piano"

export default function MemoryGame({ onBack, audioManager }: MemoryGameProps) {
  const [gameState, setGameState] = useState<GameState>("intro")
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(500)
  const [timeLeft, setTimeLeft] = useState(60)
  const [sequence, setSequence] = useState<Instrument[]>([])
  const [playerInput, setPlayerInput] = useState<Instrument[]>([])
  const [currentLevel, setCurrentLevel] = useState(1)
  const [isPlayingSequence, setIsPlayingSequence] = useState(false)

  const gameStateRef = useRef<GameState>("intro")
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const sequenceTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Actualizar ref cuando cambie el estado
  useEffect(() => {
    gameStateRef.current = gameState
  }, [gameState])

  // Timer del juego
  useEffect(() => {
    if (gameState === "playing" || gameState === "listening" || gameState === "inputting") {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setGameState("gameOver")
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [gameState])

  // Limpiar timeouts al desmontar
  useEffect(() => {
    return () => {
      if (sequenceTimeoutRef.current) {
        clearTimeout(sequenceTimeoutRef.current)
      }
    }
  }, [])

  // Manejar teclas
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()

      if (key === "0") {
        audioManager.playSound("back")
        onBack()
        return
      }

      if (gameState === "intro") {
        if (key === "1" || key === "enter") {
          startGame()
        }
      } else if (gameState === "playing" || gameState === "listening" || gameState === "inputting") {
        if (key === "p" || key === " ") {
          togglePause()
        }
      } else if (gameState === "paused") {
        if (key === "p" || key === " ") {
          togglePause()
        }
      } else if (gameState === "gameOver") {
        if (key === "1" || key === "enter") {
          restartGame()
        }
      }

      // Controles del juego durante la fase de input
      if (gameState === "inputting") {
        let instrument: Instrument | null = null

        if (key === "arrowleft" || key === "a") {
          instrument = "drum"
        } else if (key === "arrowup" || key === "w") {
          instrument = "trumpet"
        } else if (key === "arrowright" || key === "d") {
          instrument = "guitar"
        } else if (key === "arrowdown" || key === "s") {
          instrument = "piano"
        }

        if (instrument) {
          handlePlayerInput(instrument)
        }
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [gameState, playerInput, sequence])

  useEffect(() => {
    if (gameState === "intro") {
      // Reproducir la explicación completa del asistente
      setTimeout(() => {
        audioManager.speak(
          "Has elegido la opción 3. Memoria Auditiva. Escucha, memoriza y repite. Sigue la secuencia de sonidos y repítela en el mismo orden usando las teclas correspondientes. Recuerda que debe presionar la flecha izquierda si escucha un tambor, la flecha de arriba si escucha una trompeta, la flecha de la derecha si escucha una guitarra, y la flecha de abajo si escucha un piano. Si desea pausar pulse la tecla P o Barra espaciadora. Presiona 1 o Enter para comenzar a jugar o 0 para volver al menú anterior.",
        )
      }, 500)
    }
  }, [gameState, audioManager])

  const startGame = () => {
    audioManager.playSound("start")
    audioManager.speak("¡Comenzando Memoria Auditiva! Escucha atentamente la secuencia de instrumentos.")

    setGameState("playing")
    setScore(0)
    setTimeLeft(60)
    setCurrentLevel(1)
    setPlayerInput([])

    // Generar primera secuencia
    setTimeout(() => {
      generateNewSequence(1)
    }, 2000)
  }

  const generateNewSequence = (level: number) => {
    const instruments: Instrument[] = ["drum", "trumpet", "guitar", "piano"]
    const sequenceLength = Math.min(2 + level, 8) // Empezar con 3, máximo 9
    const newSequence: Instrument[] = []

    for (let i = 0; i < sequenceLength; i++) {
      const randomInstrument = instruments[Math.floor(Math.random() * instruments.length)]
      newSequence.push(randomInstrument)
    }

    setSequence(newSequence)
    setPlayerInput([])
    playSequence(newSequence)
  }

  const playSequence = (seq: Instrument[]) => {
    setGameState("listening")
    setIsPlayingSequence(true)

    audioManager.speak(`Nivel ${currentLevel}. Escucha la secuencia de ${seq.length} instrumentos.`)

    let index = 0
    const playNext = () => {
      if (index < seq.length && gameStateRef.current === "listening") {
        audioManager.playInstrumentSound(seq[index])
        index++

        if (index < seq.length) {
          sequenceTimeoutRef.current = setTimeout(playNext, 800)
        } else {
          // Secuencia terminada
          sequenceTimeoutRef.current = setTimeout(() => {
            setIsPlayingSequence(false)
            setGameState("inputting")
            audioManager.speak(
              "Ahora repite la secuencia. Usa las flechas: izquierda para tambor, arriba para trompeta, derecha para guitarra, abajo para piano.",
            )
          }, 1000)
        }
      }
    }

    sequenceTimeoutRef.current = setTimeout(playNext, 1000)
  }

  const handlePlayerInput = (instrument: Instrument) => {
    if (gameState !== "inputting" || isPlayingSequence) return

    audioManager.playInstrumentSound(instrument)
    const newInput = [...playerInput, instrument]
    setPlayerInput(newInput)

    // Verificar si la entrada es correcta hasta ahora
    const isCorrectSoFar = sequence.slice(0, newInput.length).every((inst, index) => inst === newInput[index])

    if (!isCorrectSoFar) {
      // Error
      audioManager.playSound("wrong")
      audioManager.speak("¡Incorrecto! Inténtalo de nuevo.")
      setPlayerInput([])
      return
    }

    // Si completó la secuencia correctamente
    if (newInput.length === sequence.length) {
      audioManager.playSound("correct")
      const points = currentLevel * 50
      setScore((prev) => prev + points)

      audioManager.speak(`¡Excelente! Secuencia correcta. Has ganado ${points} puntos.`)

      // Siguiente nivel
      setTimeout(() => {
        const nextLevel = currentLevel + 1
        setCurrentLevel(nextLevel)
        generateNewSequence(nextLevel)
      }, 2000)
    }
  }

  const togglePause = () => {
    if (gameState === "paused") {
      audioManager.playSound("resume")
      audioManager.speak("Reanudando juego")
      setGameState("playing")
    } else {
      audioManager.playSound("pause")
      audioManager.speak("Juego pausado. Presiona P o Barra espaciadora para continuar.")
      setGameState("paused")
    }
  }

  const restartGame = () => {
    audioManager.playSound("start")
    startGame()
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-amber-50 to-amber-100">
      {/* Header */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-amber-100 flex items-center justify-center">
          <img src="/images/katamaran-logo.png" alt="Logo de Katamaran" className="w-12 h-12 object-contain" />
        </div>
        <h1 className="text-2xl font-bold text-teal-700">Memoria auditiva</h1>
        <div className="bg-white px-4 py-2 rounded-full border-2 border-gray-300">
          <span className="font-mono text-lg">{formatTime(timeLeft)}</span>
        </div>
      </div>

      {gameState === "intro" && (
        <div className="text-center max-w-2xl">
          <div className="mb-8">
            <div className="grid grid-cols-3 gap-2 w-24 h-24 mx-auto mb-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="w-6 h-6 bg-teal-600 rounded-full"></div>
              ))}
            </div>
            <h2 className="text-3xl font-bold text-teal-700 mb-4">Memoria Auditiva</h2>
            <p className="text-lg text-teal-600 mb-6 leading-relaxed">
              Escucha, memoriza y repite. Sigue la secuencia de sonidos y repítela en el mismo orden usando las teclas
              correspondientes.
            </p>
            <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
              <h3 className="text-xl font-bold text-teal-700 mb-4">Instrucciones:</h3>
              <div className="text-left space-y-2 text-gray-700">
                <p>
                  <strong>Flecha Izquierda (A):</strong> Tambor
                </p>
                <p>
                  <strong>Flecha Arriba (W):</strong> Trompeta
                </p>
                <p>
                  <strong>Flecha Derecha (D):</strong> Guitarra
                </p>
                <p>
                  <strong>Flecha Abajo (S):</strong> Piano
                </p>
              </div>
            </div>
            <Button
              onClick={startGame}
              className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-full text-lg font-medium"
            >
              START
            </Button>
          </div>
        </div>
      )}

      {(gameState === "playing" ||
        gameState === "listening" ||
        gameState === "inputting" ||
        gameState === "paused") && (
        <div className="w-full max-w-4xl">
          {/* Score */}
          <div className="mb-8">
            <div className="text-teal-700 text-lg">
              <div>SCORE: {score}</div>
              <div>HIGH SCORE: {highScore}</div>
            </div>
          </div>

          {/* Game Area */}
          <div className="flex flex-col items-center justify-center space-y-8">
            {/* Flecha Arriba */}
            <div className="flex justify-center">
              <div className="w-24 h-24 border-4 border-gray-800 bg-amber-200 flex items-center justify-center">
                <div className="w-0 h-0 border-l-8 border-r-8 border-b-12 border-l-transparent border-r-transparent border-b-gray-800"></div>
              </div>
            </div>

            {/* Flechas Izquierda y Derecha */}
            <div className="flex justify-center space-x-32">
              <div className="w-24 h-24 border-4 border-gray-800 bg-amber-200 flex items-center justify-center">
                <div className="w-0 h-0 border-t-8 border-b-8 border-r-12 border-t-transparent border-b-transparent border-r-gray-800"></div>
              </div>
              <div className="w-24 h-24 border-4 border-gray-800 bg-amber-200 flex items-center justify-center">
                <div className="w-0 h-0 border-t-8 border-b-8 border-l-12 border-t-transparent border-b-transparent border-l-gray-800"></div>
              </div>
            </div>

            {/* Flecha Abajo */}
            <div className="flex justify-center">
              <div className="w-24 h-24 border-4 border-gray-800 bg-amber-200 flex items-center justify-center">
                <div className="w-0 h-0 border-l-8 border-r-8 border-t-12 border-l-transparent border-r-transparent border-t-gray-800"></div>
              </div>
            </div>

            {/* Botón Pausa */}
            {gameState === "paused" && (
              <div className="bg-amber-100 px-8 py-4 rounded-full border-2 border-gray-800">
                <span className="text-2xl font-bold text-teal-700">PAUSA</span>
              </div>
            )}
          </div>

          {/* Estado del juego */}
          <div className="mt-8 text-center">
            <p className="text-teal-600 text-sm">
              {gameState === "listening" && <strong>Escuchando secuencia...</strong>}
              {gameState === "inputting" && <strong>Tu turno - Repite la secuencia</strong>}
              {gameState === "paused" && <strong>Juego pausado - Presiona P para continuar</strong>}
            </p>
          </div>

          {/* Instrucciones */}
          <div className="mt-8 text-center">
            <p className="text-teal-600 text-sm leading-relaxed">
              <strong>Asistente:</strong>
              {gameState === "listening" && " Escucha atentamente la secuencia de instrumentos."}
              {gameState === "inputting" &&
                " Repite la secuencia usando las flechas: izquierda para tambor, arriba para trompeta, derecha para guitarra, abajo para piano."}
              {gameState === "paused" &&
                " Para reanudar la partida presione la tecla 'P' o 'Barra espaciadora'. Si desea regresar al menú presione 0."}
            </p>
          </div>
        </div>
      )}

      {gameState === "gameOver" && (
        <div className="text-center max-w-2xl">
          <h2 className="text-3xl font-bold text-teal-700 mb-4">¡Juego Terminado!</h2>
          <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
            <p className="text-xl mb-2">
              Puntuación Final: <strong>{score}</strong>
            </p>
            <p className="text-lg mb-2">
              Nivel Alcanzado: <strong>{currentLevel}</strong>
            </p>
            <p className="text-lg">
              Récord: <strong>{highScore}</strong>
            </p>
          </div>
          <Button
            onClick={restartGame}
            className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-full text-lg font-medium mr-4"
          >
            Jugar de Nuevo
          </Button>
          <Button
            onClick={onBack}
            className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-full text-lg font-medium"
          >
            Menú Principal
          </Button>
        </div>
      )}
    </div>
  )
}
