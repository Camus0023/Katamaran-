"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import type { AudioManager } from "@/lib/audio-manager"
import { ChevronLeft, ChevronRight, Ear } from "lucide-react"

interface PrecisionGameProps {
  onBack: () => void
  audioManager: AudioManager
}

type Frequency = "high" | "low"
type GameState = "intro" | "ready" | "playing" | "paused" | "gameOver"

export default function PrecisionGame({ onBack, audioManager }: PrecisionGameProps) {
  const [gameState, setGameState] = useState<GameState>("intro")
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(1000)
  const [timeLeft, setTimeLeft] = useState(60)
  const [combo, setCombo] = useState(0)

  const [currentSound, setCurrentSound] = useState<Frequency | null>(null)
  const [soundTime, setSoundTime] = useState<number>(0)
  const [isWaitingForInput, setIsWaitingForInput] = useState(false)

  const gameIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (gameState === "intro") {
      setTimeout(() => {
        audioManager.speak(
          "Has elegido la opción 2. Precisión Auditiva. Reacciona al instante. Identifica sonidos agudos o graves y responde rápido según el tipo o secuencia. Recuerda que debe presionar la flecha izquierda si escucha una frecuencia aguda, o debe presionar la flecha derecha si escucha una frecuencia grave. Si desea pausar pulse la tecla P o Barra espaciadora. Presiona 1 para comenzar a jugar o 0 para volver al menú anterior.",
        )
      }, 500)
    }
  }, [gameState, audioManager])

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase()

      if (gameState === "intro") {
        if (key === "1" || key === "enter") {
          audioManager.playSound("confirm")
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
        } else if (key === "0") {
          pauseGame()
        } else if (event.key === "ArrowLeft" || key === "a") {
          handleInput("high")
        } else if (event.key === "ArrowRight" || key === "d") {
          handleInput("low")
        }
      } else if (gameState === "paused") {
        if (key === "p" || key === " ") {
          resumeGame()
        } else if (key === "0") {
          onBack()
        }
      } else if (gameState === "gameOver") {
        if (key === "1" || key === "enter") {
          resetGame()
        } else if (key === "0") {
          onBack()
        }
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [gameState, currentSound, isWaitingForInput])

  const startGame = () => {
    audioManager.playSound("start")
    audioManager.speak("¡El juego comenzará en 3, 2, 1!")

    setTimeout(() => {
      setGameState("playing")
      setScore(0)
      setTimeLeft(60)
      setCombo(0)
      startGameLoop()
    }, 3000)
  }

  const startGameLoop = () => {
    const playNextSound = () => {
      if (gameState !== "playing") return

      // Generate random frequency
      const frequency: Frequency = Math.random() < 0.5 ? "high" : "low"

      // Set state immediately
      setCurrentSound(frequency)
      setSoundTime(Date.now())
      setIsWaitingForInput(true)

      // Play sound
      audioManager.playFrequencySound(frequency)

      // Schedule next sound after 3 seconds
      setTimeout(() => {
        if (gameState === "playing" && isWaitingForInput) {
          // Player didn't respond in time
          setIsWaitingForInput(false)
          setCombo(0)
          audioManager.playSound("wrong")
          audioManager.speak("Tiempo agotado")
        }

        // Play next sound after a short delay
        setTimeout(playNextSound, 1000)
      }, 3000)
    }

    playNextSound()
  }

  const handleInput = (inputFreq: Frequency) => {
    if (!isWaitingForInput || !currentSound) return

    setIsWaitingForInput(false)
    const reactionTime = Date.now() - soundTime

    if (inputFreq === currentSound) {
      // Correct answer
      let points = 15 + combo * 3
      if (reactionTime < 500) points += 10
      else if (reactionTime < 1000) points += 5

      setScore((prev) => prev + points)
      setCombo((prev) => prev + 1)
      audioManager.playSound("correct")

      if (combo > 0 && combo % 5 === 0) {
        audioManager.speak(`¡Combo de ${combo + 1}! Excelente precisión!`)
      }
    } else {
      // Wrong answer
      setCombo(0)
      audioManager.playSound("wrong")
      const correctAnswer = currentSound === "high" ? "Era agudo, flecha izquierda" : "Era grave, flecha derecha"
      audioManager.speak(correctAnswer)
    }

    setCurrentSound(null)
  }

  const pauseGame = () => {
    setGameState("paused")
    setIsWaitingForInput(false)
    audioManager.playSound("pause")
    audioManager.speak("Juego pausado. Presiona P o Espacio para continuar, o 0 para volver al menú.")
  }

  const resumeGame = () => {
    setGameState("playing")
    audioManager.playSound("resume")
    audioManager.speak("Reanudando en 3, 2, 1")

    setTimeout(() => {
      startGameLoop()
    }, 3000)
  }

  const resetGame = () => {
    setGameState("ready")
    setScore(0)
    setTimeLeft(60)
    setCombo(0)
    setCurrentSound(null)
    setIsWaitingForInput(false)
    audioManager.speak("Preparándose para nuevo juego. Presiona 1 o Enter para comenzar.")
  }

  // Timer effect
  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      timerRef.current = setTimeout(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current)
      }
    } else if (timeLeft === 0 && gameState === "playing") {
      setGameState("gameOver")
      setIsWaitingForInput(false)

      if (score > highScore) {
        setHighScore(score)
        audioManager.speak(`¡Nuevo récord! ${score} puntos. Presiona 1 para jugar de nuevo o 0 para volver al menú.`)
      } else {
        audioManager.speak(`Juego terminado. ${score} puntos. Presiona 1 para jugar de nuevo o 0 para volver al menú.`)
      }
    }
  }, [gameState, timeLeft, score, highScore])

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-amber-100 flex items-center justify-center">
            <img src="/images/katamaran-logo.png" alt="Logo de Katamaran" className="w-10 h-10 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-teal-700">Precisión auditiva</h1>
        </div>

        {(gameState === "playing" || gameState === "paused") && (
          <div className="text-right">
            <div className="bg-white px-4 py-2 rounded-full border-2 border-gray-300">
              <span className="font-mono text-lg">
                {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, "0")}
              </span>
            </div>
          </div>
        )}

        {gameState === "intro" && (
          <Button
            className="bg-white hover:bg-gray-50 text-teal-700 border-2 border-teal-700 px-6 py-2 rounded-full font-bold"
            onClick={() => {
              audioManager.playSound("confirm")
              setGameState("ready")
            }}
          >
            START
          </Button>
        )}
      </div>

      {/* Score */}
      {(gameState === "playing" || gameState === "paused") && (
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
      )}

      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {gameState === "intro" && (
          <div className="text-center max-w-2xl">
            <div className="w-20 h-20 mx-auto mb-6 bg-teal-600 rounded-full flex items-center justify-center">
              <Ear className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-teal-700 mb-4">Precisión Auditiva</h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              Reacciona al instante. Identifica sonidos agudos o graves y responde rápido según el tipo o secuencia.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mb-6">
              <h3 className="font-bold text-blue-800 mb-2">Instrucciones:</h3>
              <p className="text-blue-700 text-sm leading-relaxed">
                • <strong>Sonidos AGUDOS</strong> → Presiona <strong>Flecha Izquierda</strong> o <strong>A</strong>
                <br />• <strong>Sonidos GRAVES</strong> → Presiona <strong>Flecha Derecha</strong> o <strong>D</strong>
                <br />• Responde lo más rápido posible para obtener más puntos
              </p>
            </div>
            <div className="bg-teal-50 p-4 rounded-lg border border-teal-200">
              <p className="text-teal-700 text-sm">
                <strong>Asistente:</strong> Has elegido la opción 2. Precisión Auditiva. Reacciona al instante.
                Identifica sonidos agudos o graves y responde rápido según el tipo o secuencia. Si deseas jugarlo pulsa
                1, si deseas volver al menú principal pulsa 0.
              </p>
            </div>
          </div>
        )}

        {gameState === "ready" && (
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-teal-600 rounded-full flex items-center justify-center">
              <Ear className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-teal-700 mb-4">Precisión Auditiva</h2>
            <div className="bg-teal-50 p-4 rounded-lg border border-teal-200 mb-6">
              <p className="text-teal-700 text-sm">
                <strong>Asistente:</strong> ¡Perfecto! Has elegido jugar Precisión Auditiva. ¿Estás listo? Recuerda que
                debe presionar la flecha izquierda si escucha una frecuencia aguda, o debe presionar la flecha derecha
                si escucha una frecuencia grave. Si desea pausar pulse la tecla "P" o "Barra espaciadora". Presiona 1
                para comenzar a jugar o 0 para volver al menú anterior.
              </p>
            </div>
          </div>
        )}

        {(gameState === "playing" || gameState === "paused") && (
          <div className="w-full max-w-4xl">
            <div className="flex justify-center items-center gap-12 mb-8">
              <Button
                className="w-24 h-24 rounded-full bg-amber-200 hover:bg-amber-300 border-2 border-amber-400"
                onClick={() => handleInput("high")}
                aria-label="Flecha izquierda - Sonido agudo"
              >
                <ChevronLeft className="w-10 h-10 text-amber-700" />
              </Button>

              <div className="text-center">
                {gameState === "paused" ? (
                  <div className="bg-white px-8 py-4 rounded-lg border-2 border-gray-300">
                    <span className="text-xl font-bold text-gray-700">PAUSA</span>
                  </div>
                ) : (
                  <div className="w-32 h-16 flex items-center justify-center">
                    <span className="text-lg font-bold text-teal-700">
                      {isWaitingForInput ? "¡RESPONDE!" : "ESCUCHA"}
                    </span>
                  </div>
                )}
              </div>

              <Button
                className="w-24 h-24 rounded-full bg-amber-200 hover:bg-amber-300 border-2 border-amber-400"
                onClick={() => handleInput("low")}
                aria-label="Flecha derecha - Sonido grave"
              >
                <ChevronRight className="w-10 h-10 text-amber-700" />
              </Button>
            </div>

            <div className="bg-teal-50 p-4 rounded-lg border border-teal-200 text-center">
              <p className="text-teal-700 text-sm leading-relaxed">
                <strong>Asistente:</strong>
                {gameState === "paused"
                  ? " Para reanudar la partida presione la tecla 'P' o 'Barra espaciadora'. Si desea regresar al menú presione 0."
                  : " Recuerda que debe presionar la flecha izquierda si escucha una frecuencia aguda, o debe presionar la flecha derecha si escucha una frecuencia grave. Si desea pausar pulse la tecla 'P' o 'Barra espaciadora'. ¡El juego comenzará en 3, 2, 1!"}
              </p>
            </div>
          </div>
        )}

        {gameState === "gameOver" && (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-teal-700 mb-4">Juego Terminado</h2>
            <p className="text-lg text-gray-700 mb-4">Tu puntuación final es {score} puntos.</p>
            <p className="text-md text-gray-600 mb-8">
              Presiona 1 o Enter para jugar de nuevo o 0 para volver al menú.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
