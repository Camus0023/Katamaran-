"use client"

import { useState, useEffect } from "react"
import MainMenu from "@/components/main-menu"
import RhythmGame from "@/components/rhythm-game"
import PrecisionGame from "@/components/precision-game"
import MemoryGame from "@/components/memory-game"
import { AudioManager } from "@/lib/audio-manager"

export type GameMode = "menu" | "rhythm" | "precision" | "memory"

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
      {currentMode === "menu" && <MainMenu onModeSelect={handleModeChange} audioManager={audioManager} />}
      {currentMode === "rhythm" && <RhythmGame onBack={() => handleModeChange("menu")} audioManager={audioManager} />}
      {currentMode === "precision" && (
        <PrecisionGame onBack={() => handleModeChange("menu")} audioManager={audioManager} />
      )}
      {currentMode === "memory" && <MemoryGame onBack={() => handleModeChange("menu")} audioManager={audioManager} />}
    </main>
  )
}
