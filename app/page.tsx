"use client"

import { useState, useEffect } from "react"
import RhythmGame from "@/components/rhythm-game"
import { AudioManager } from "@/lib/audio-manager"

export type GameMode = "menu" | "rhythm"

export default function Home() {
  const [currentMode, setCurrentMode] = useState<GameMode>("menu")
  const [audioManager, setAudioManager] = useState<AudioManager | null>(null)

  useEffect(() => {
    // Inicializar el gestor de audio
    const audio = new AudioManager()
    setAudioManager(audio)

    // Registrar service worker para PWA
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then(() => console.log("Service Worker registrado"))
        .catch(() => console.log("Error al registrar Service Worker"))
    }

    return () => {
      audio.cleanup()
    }
  }, [])

  useEffect(() => {
    if (audioManager && currentMode === "menu") {
      const welcomeText =
        "Bienvenido a Katamaran, un juego inclusivo diseñado para personas con discapacidad visual o visión reducida. Vas a jugar Ritmo Auditivo. Sigue el ritmo con tus teclas. Escucha los sonidos que vienen de la izquierda, centro o derecha y presiona las teclas correctas al compás de la música. Presiona 1 o Enter para comenzar a jugar, o 0 para escuchar esta información nuevamente."

      const timer = setTimeout(() => {
        audioManager.speak(welcomeText)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [audioManager, currentMode])

  useEffect(() => {
    if (currentMode === "menu" && audioManager) {
      const handleKeyPress = (event: KeyboardEvent) => {
        const key = event.key

        if (key === "1" || key === "Enter") {
          audioManager.playSound("confirm")
          audioManager.speak("¡Perfecto! Comenzando Ritmo Auditivo...")
          setTimeout(() => {
            setCurrentMode("rhythm")
          }, 1500)
        } else if (key === "0") {
          audioManager.playSound("info")
          const welcomeText =
            "Bienvenido a Katamaran. Vas a jugar Ritmo Auditivo. Sigue el ritmo con tus teclas. Escucha los sonidos que vienen de la izquierda, centro o derecha y presiona las teclas correctas. Presiona 1 o Enter para comenzar."
          audioManager.speak(welcomeText)
        }
      }

      window.addEventListener("keydown", handleKeyPress)
      return () => window.removeEventListener("keydown", handleKeyPress)
    }
  }, [currentMode, audioManager])

  const handleModeChange = (mode: GameMode) => {
    setCurrentMode(mode)
  }

  if (!audioManager) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold mb-4">Cargando Katamaran...</div>
          <div className="text-lg">Preparando experiencia accesible</div>
        </div>
      </div>
    )
  }

  return (
    <main className="min-h-screen">
      {currentMode === "menu" && (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-amber-50 to-amber-100">
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-amber-100 flex items-center justify-center">
              <img
                src="/images/katamaran-logo.png"
                alt="Logo de Katamaran - Personaje con gorro puntiagudo y gafas sonriendo"
                className="w-16 h-16 object-contain"
              />
            </div>
            <h1 className="text-4xl font-bold text-teal-700 mb-2">Katamaran</h1>
            <p className="text-xl text-teal-600 font-medium">"Navega el sonido sin límites"</p>
          </div>

          <div className="bg-white rounded-lg p-8 shadow-lg border-2 border-teal-500 max-w-2xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-teal-700 mb-4">Ritmo Auditivo</h2>
              <p className="text-gray-700 leading-relaxed mb-6">
                Sigue el ritmo con tus teclas. Escucha los sonidos que vienen de la izquierda, centro o derecha y
                presiona las teclas correctas al compás de la música.
              </p>
              <button
                onClick={() => {
                  audioManager.playSound("confirm")
                  audioManager.speak("¡Perfecto! Comenzando Ritmo Auditivo...")
                  setTimeout(() => {
                    setCurrentMode("rhythm")
                  }, 1500)
                }}
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded-lg font-medium text-lg"
              >
                Comenzar Juego
              </button>
            </div>
          </div>

          <div className="mt-8 text-center max-w-4xl">
            <p className="text-teal-600 text-sm leading-relaxed">
              <strong>Asistente:</strong> Bienvenido a Katamaran, un juego inclusivo diseñado para personas con
              discapacidad visual o visión reducida. Vas a jugar Ritmo Auditivo. Presiona 1 o Enter para comenzar a
              jugar, o 0 para escuchar esta información nuevamente.
            </p>
          </div>
        </div>
      )}
      {currentMode === "rhythm" && <RhythmGame onBack={() => handleModeChange("menu")} audioManager={audioManager} />}
    </main>
  )
}
