"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import type { AudioManager } from "@/lib/audio-manager"
import { ChevronLeft, ChevronRight, ChevronUp, Play, Pause } from "lucide-react"

interface RhythmGameProps {
  onBack: () => void
  audioManager: AudioManager
}

type Direction = "left" | "center" | "right"
type GameState = "intro" | "ready" | "playing" | "paused" | "gameOver" | "resuming"

interface Beat {
  direction: Direction
  time: number
  id: string
}

export default function RhythmGame({ onBack, audioManager }: RhythmGameProps) {
  const [gameState, setGameState] = useState<GameState>("intro")
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(950)
  const [timeLeft, setTimeLeft] = useState(60)
  const [beats, setBeats] = useState<Beat[]>([])
  const [currentBeatIndex, setCurrentBeatIndex] = useState(0)
  const [combo, setCombo] = useState(0)
  const [currentDirection, setCurrentDirection] = useState<Direction | null>(null)

  // Generar secuencia de beats
  const generateBeats = useCallback(() => {
    const directions: Direction[] = ["left", "center", "right"]
    const newBeats: Beat[] = []

    for (let i = 0; i < 60; i++) {
      // 60 beats para 60 segundos
      newBeats.push({
        direction: directions[Math.floor(Math.random() * directions.length)],
        time: i * 1000, // Un beat por segundo
        id: `beat-${i}`,
      })
    }

    setBeats(newBeats)
  }, [])

  // Inicializar juego
  useEffect(() => {
    if (gameState === "intro") {
      const introText =
        "Has elegido la opción 1. Ritmo auditivo. Sigue el ritmo con tus teclas. Escucha los sonidos que vienen de la izquierda, centro o derecha y presiona las teclas correctas al compás de la música. Si deseas jugar pulsa 1, si deseas volver al menú principal pulsa 0."
      audioManager.speak(introText)
    }
  }, [gameState, audioManager])

  const playNextSound = useCallback(() => {
    const directions: Direction[] = ["left", "center", "right"]
    const randomDirection = directions[Math.floor(Math.random() * directions.length)]
    setCurrentDirection(randomDirection)
    audioManager.playDirectionalSound(randomDirection)
  }, [audioManager])

  // Manejar teclas
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()

      if (gameState === "intro") {
        if (key === "1" || key === "enter") {
          audioManager.playSound("confirm")
          audioManager.speak(
            "¡Perfecto! Has elegido jugar Ritmo Auditivo. ¿Estás listo? Presiona 1 o Enter para comenzar a jugar o 0 para volver al menú anterior",
          )
          setGameState("ready")
        } else if (key === "0") {
          audioManager.playSound("back")
          onBack()
        }
      } else if (gameState === "ready") {
        if (key === "1" || key === "enter") {
          startGame()
        } else if (key === "0") {
          onBack()
        }
      } else if (gameState === "playing") {
        if (key === "p" || key === " ") {
          pauseGame()
        } else if (key === "arrowleft" || key === "a") {
          handleBeatInput("left")
        } else if (key === "arrowup" || key === "w") {
          handleBeatInput("center")
        } else if (key === "arrowright" || key === "d") {
          handleBeatInput("right")
        } else if (key === "0") {
          pauseGame()
          audioManager.speak(
            "Juego pausado. Presiona P o barra espaciadora para continuar, o presiona 0 para volver al menú principal.",
          )
        }
      } else if (gameState === "paused") {
        if (key === "p" || key === " ") {
          resumeGame()
        } else if (key === "0") {
          onBack()
        }
      } else if (gameState === "gameOver") {
        if (key === "1" || key === "enter") {
          // Reiniciar juego
          setGameState("ready")
          audioManager.speak("Preparándose para nuevo juego. Presiona 1 o Enter para comenzar.")
        } else if (key === "0") {
          onBack()
        }
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [gameState, currentDirection, audioManager, onBack])

  const startGame = () => {
    audioManager.playSound("start")
    audioManager.speak("¡El juego comenzará en 3, 2, 1!")

    setTimeout(() => {
      setGameState("playing")
      setScore(0)
      setTimeLeft(60)
      setCombo(0)
      playNextSound()
    }, 3000)
  }

  const pauseGame = () => {
    setGameState("paused")
    audioManager.playSound("pause")
    audioManager.speak(
      "Para reanudar la partida presione la tecla P o Barra espaciadora. Si desea regresar al menú presione 0.",
    )
  }

  const resumeGame = () => {
    setGameState("resuming")
    audioManager.playSound("resume")
    audioManager.speak("Reanudando juego en 3, 2, 1")

    // Esperar 3 segundos antes de reanudar el juego
    setTimeout(() => {
      setGameState("playing")
      playNextSound()
    }, 3000)
  }

  const handleBeatInput = (direction: Direction) => {
    if (!currentDirection) return

    if (currentDirection === direction) {
      // Acierto
      const newCombo = combo + 1
      const points = 10 + combo * 2
      setScore((prev) => prev + points)
      setCombo(newCombo)
      audioManager.playSound("correct")

      if (newCombo > 0 && newCombo % 5 === 0) {
        audioManager.speak(`¡Combo de ${newCombo}!`)
      }
    } else {
      // Error
      setCombo(0)
      audioManager.playSound("wrong")
    }

    setCurrentDirection(null)
    setTimeout(() => {
      if (gameState === "playing") {
        playNextSound()
      }
    }, 500)
  }

  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && gameState === "playing") {
      setGameState("gameOver")
    }
  }, [gameState, timeLeft])

  useEffect(() => {
    if (gameState === "gameOver") {
      if (score > highScore) {
        setHighScore(score)
        audioManager.speak(
          `¡Nuevo récord! Has conseguido ${score} puntos. Presiona 1 para jugar de nuevo o 0 para volver al menú.`,
        )
      } else {
        audioManager.speak(
          `Juego terminado. Tu puntuación final es ${score} puntos. Presiona 1 para jugar de nuevo o 0 para volver al menú.`,
        )
      }
    }
  }, [gameState, score, highScore, audioManager])

  const getDirectionIcon = (direction: Direction) => {
    switch (direction) {
      case "left":
        return ChevronLeft
      case "center":
        return ChevronUp
      case "right":
        return ChevronRight
    }
  }

  const getDirectionLabel = (direction: Direction) => {
    switch (direction) {
      case "left":
        return "Izquierda"
      case "center":
        return "Centro"
      case "right":
        return "Derecha"
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-amber-100 flex items-center justify-center">
            <img src="/images/katamaran-logo.png" alt="Logo de Katamaran" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-teal-700">Ritmo auditivo</h1>
        </div>

        <div className="text-right">
          <div className="bg-white px-4 py-2 rounded-full border-2 border-gray-300">
            <span className="font-mono text-lg">
              {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>

      {/* Puntuación */}
      <div className="mb-8">
        <div className="text-teal-700">
          <div className="text-lg">
            SCORE: <span className="font-bold">{score}</span>
          </div>
          <div className="text-lg">
            HIGH SCORE: <span className="font-bold">{highScore}</span>
          </div>
          {combo > 0 && (
            <div className="text-lg text-orange-600">
              COMBO: <span className="font-bold">x{combo}</span>
            </div>
          )}
        </div>
      </div>

      {/* Área de juego */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {gameState === "intro" && (
          <div className="text-center max-w-2xl">
            <div className="w-20 h-20 mx-auto mb-6 bg-teal-600 rounded-full flex items-center justify-center">
              <Play className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-teal-700 mb-4">Ritmo Auditivo</h2>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              Sigue el ritmo con tus teclas. Escucha los sonidos que vienen de la izquierda, centro o derecha y presiona
              las teclas correctas al compás de la música.
            </p>
            <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
              <p className="text-teal-700 text-sm">
                <strong>Asistente:</strong> Has elegido la opción 1. Ritmo auditivo. Sigue el ritmo con tus teclas.
                Escucha los sonidos que vienen de la izquierda, centro o derecha y presiona las teclas correctas al
                compás de la música. Si deseas jugar pulsa 1 o Enter, si deseas volver al menú principal pulsa 0.
              </p>
            </div>
          </div>
        )}

        {gameState === "ready" && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-teal-700 mb-4">¿Listo para jugar?</h2>
            <p className="text-lg text-gray-700 mb-8">Presiona 1 o Enter para comenzar, o 0 para volver al menú</p>
          </div>
        )}

        {(gameState === "playing" || gameState === "paused" || gameState === "resuming") && (
          <div className="w-full max-w-4xl">
            {/* Controles de juego */}
            <div className="flex justify-center items-center gap-8 mb-8">
              <Button
                className="w-20 h-20 rounded-full bg-amber-200 hover:bg-amber-300 border-2 border-amber-400 game-button"
                onClick={() => handleBeatInput("left")}
                aria-label="Flecha izquierda - Sonido del auricular izquierdo"
                disabled={gameState !== "playing"}
              >
                <ChevronLeft className="w-8 h-8 text-amber-700" />
              </Button>

              <div className="text-center">
                {gameState === "paused" || gameState === "resuming" ? (
                  <div className="bg-white px-8 py-4 rounded-lg border-2 border-gray-300">
                    <Pause className="w-8 h-8 mx-auto text-gray-600 mb-2" />
                    <span className="text-xl font-bold text-gray-700">
                      {gameState === "resuming" ? "REANUDANDO..." : "PAUSA"}
                    </span>
                  </div>
                ) : (
                  <Button
                    className="w-20 h-20 rounded-full bg-amber-200 hover:bg-amber-300 border-2 border-amber-400 game-button"
                    onClick={() => handleBeatInput("center")}
                    aria-label="Flecha arriba - Sonido en ambos auriculares"
                  >
                    <ChevronUp className="w-8 h-8 text-amber-700" />
                  </Button>
                )}
              </div>

              <Button
                className="w-20 h-20 rounded-full bg-amber-200 hover:bg-amber-300 border-2 border-amber-400 game-button"
                onClick={() => handleBeatInput("right")}
                aria-label="Flecha derecha - Sonido del auricular derecho"
                disabled={gameState !== "playing"}
              >
                <ChevronRight className="w-8 h-8 text-amber-700" />
              </Button>
            </div>

            {/* Instrucciones */}
            <div className="bg-teal-50 p-4 rounded-lg border border-teal-200 text-center">
              <p className="text-teal-700 text-sm leading-relaxed">
                <strong>Asistente:</strong> Recuerda que debes presionar la flecha izquierda si escuchas un sonido en el
                auricular izquierdo, debe presionar la flecha de arriba si escucha un sonido en ambos auriculares, y
                debe de presionar la flecha de la derecha si escucha un sonido en el auricular derecho. Si desea pausar
                pulse la tecla "P" o "Barra espaciadora".
                {gameState === "paused" &&
                  " Para reanudar la partida presione la tecla P o Barra espaciadora. Si desea regresar al menú presione 0."}
                {gameState === "resuming" && " El juego se reanudará en unos momentos..."}
              </p>
            </div>
          </div>
        )}

        {gameState === "gameOver" && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-teal-700 mb-4">Juego Terminado</h2>
            <p className="text-lg text-gray-700 mb-8">
              Tu puntuación final es {score} puntos. Presiona 1 o Enter para jugar de nuevo o 0 para volver al menú.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
