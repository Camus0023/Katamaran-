"use client"

import { useState, useEffect } from "react"
import { Music, Ear, Grid3X3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { AudioManager } from "@/lib/audio-manager"
import type { GameMode } from "@/app/page"

interface MainMenuProps {
  onModeSelect: (mode: GameMode) => void
  audioManager: AudioManager
}

export default function MainMenu({ onModeSelect, audioManager }: MainMenuProps) {
  const [selectedOption, setSelectedOption] = useState<number>(0)
  const [showModes, setShowModes] = useState(false)

  const gameOptions = [
    {
      id: "rhythm" as GameMode,
      title: "Ritmo Auditivo",
      icon: Music,
      description:
        "Sigue el ritmo con tus teclas. Escucha los sonidos que vienen de la izquierda, centro o derecha y presiona las teclas correctas al compás de la música.",
      instructions: "Presiona 1 para escuchar información sobre el juego Ritmo Auditivo",
    },
    {
      id: "precision" as GameMode,
      title: "Precisión Auditiva",
      icon: Ear,
      description:
        "Reacciona al instante. Identifica sonidos agudos o graves y responde rápido según el tipo o secuencia.",
      instructions: "Presiona 2 para conocer el modo Precisión Auditiva",
    },
    {
      id: "memory" as GameMode,
      title: "Memoria Auditiva",
      icon: Grid3X3,
      description:
        "Escucha, memoriza y repite. Sigue la secuencia de sonidos y repítela en el mismo orden usando las teclas correspondientes.",
      instructions: "Presiona 3 para descubrir cómo jugar Memoria Auditiva",
    },
  ]

  useEffect(() => {
    // Narrar bienvenida al cargar
    const welcomeText =
      "Bienvenido a Katamaran, un juego inclusivo diseñado para personas con discapacidad visual o visión reducida. Por favor, selecciona una opción para continuar: pulsa 1 para escuchar información sobre el juego Ritmo Auditivo, 2 para conocer el modo Precisión Auditiva, 3 para descubrir cómo jugar Memoria Auditiva, 4 para recibir información general sobre Katamaran, o 0 para repetir este menú. También puedes usar la tecla Enter para seleccionar la opción resaltada."

    const timer = setTimeout(() => {
      audioManager.speak(welcomeText)
      setShowModes(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [audioManager])

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      const key = event.key

      if (key >= "1" && key <= "3") {
        const optionIndex = Number.parseInt(key) - 1
        setSelectedOption(optionIndex)
        audioManager.playSound("select")

        const option = gameOptions[optionIndex]
        const description = `Has elegido la opción ${key}. ${option.title}. ${option.description} Si deseas jugar pulsa 1 o Enter, si deseas volver al menú principal pulsa 0.`
        audioManager.speak(description)
      } else if (key === "0") {
        // Repetir menú principal
        audioManager.playSound("back")
        const welcomeText =
          "Bienvenido a Katamaran. Selecciona una opción: pulsa 1 para Ritmo Auditivo, 2 para Precisión Auditiva, 3 para Memoria Auditiva, 4 para información general, o 0 para repetir este menú. También puedes usar Enter para seleccionar."
        audioManager.speak(welcomeText)
      } else if (key === "4") {
        // Información general
        audioManager.playSound("info")
        const infoText =
          "Katamaran es un juego inclusivo que utiliza únicamente audio para crear una experiencia de juego completa. Cada modo de juego entrena diferentes habilidades auditivas y de reacción. Usa las teclas numéricas para navegar y las flechas o teclas específicas durante el juego."
        audioManager.speak(infoText)
      } else if ((key === "1" || key === "Enter") && selectedOption >= 0) {
        // Confirmar selección
        audioManager.playSound("confirm")
        const selectedMode = gameOptions[selectedOption]
        const confirmText = `¡Perfecto! Has elegido jugar ${selectedMode.title}. ¿Estás listo? Presiona 1 o Enter para comenzar a jugar o 0 para volver al menú anterior`
        audioManager.speak(confirmText)

        setTimeout(() => {
          onModeSelect(selectedMode.id)
        }, 2000)
      }
    }

    window.addEventListener("keydown", handleKeyPress)
    return () => window.removeEventListener("keydown", handleKeyPress)
  }, [selectedOption, audioManager, onModeSelect])

  const handleOptionClick = (optionIndex: number) => {
    setSelectedOption(optionIndex)
    audioManager.playSound("select")

    const option = gameOptions[optionIndex]
    const description = `Has elegido ${option.title}. ${option.description} Si deseas jugar pulsa 1 o Enter, si deseas volver al menú principal pulsa 0.`
    audioManager.speak(description)
  }

  const handleStartGame = (mode: GameMode) => {
    audioManager.playSound("confirm")
    const selectedMode = gameOptions.find((opt) => opt.id === mode)
    const confirmText = `¡Perfecto! Has elegido jugar ${selectedMode?.title}. Comenzando juego...`
    audioManager.speak(confirmText)

    setTimeout(() => {
      onModeSelect(mode)
    }, 1500)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-amber-50 to-amber-100">
      {/* Logo y título */}
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
        <Button
          className="mt-4 bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-full"
          onClick={() => {
            audioManager.playSound("info")
            audioManager.speak(
              "Descubre cómo funciona Katamaran. Este juego utiliza únicamente audio para crear una experiencia completa. Navega con las teclas numéricas y disfruta de los diferentes modos de juego.",
            )
          }}
        >
          Descubre cómo funciona →
        </Button>
      </div>

      {/* Modos de juego */}
      {showModes && (
        <div className="grid md:grid-cols-3 gap-6 max-w-6xl w-full">
          {gameOptions.map((option, index) => {
            const Icon = option.icon
            const isSelected = selectedOption === index

            return (
              <div
                key={option.id}
                className={`bg-white rounded-lg p-6 shadow-lg border-2 transition-all cursor-pointer ${
                  isSelected ? "border-teal-500 bg-teal-50" : "border-gray-200 hover:border-teal-300"
                }`}
                onClick={() => handleOptionClick(index)}
                role="button"
                tabIndex={0}
                aria-label={`Opción ${index + 1}: ${option.title}`}
              >
                <div className="text-center mb-4">
                  <Icon className="w-12 h-12 mx-auto text-teal-600 mb-3" />
                  <h3 className="text-xl font-bold text-teal-700 mb-2">{option.title}</h3>
                </div>

                <p className="text-gray-700 text-sm leading-relaxed mb-4">{option.description}</p>

                {isSelected && (
                  <div className="mt-4 pt-4 border-t border-teal-200">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleStartGame(option.id)
                      }}
                      className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg font-medium"
                    >
                      Jugar {option.title}
                    </Button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Instrucciones de navegación */}
      <div className="mt-8 text-center max-w-4xl">
        <p className="text-teal-600 text-sm leading-relaxed">
          <strong>Asistente:</strong> Bienvenido a Katamaran, un juego inclusivo diseñado para personas con discapacidad
          visual o visión reducida. Por favor, selecciona una opción para continuar: pulsa 1 para escuchar información
          sobre el juego Ritmo Auditivo, 2 para conocer el modo Precisión Auditiva, 3 para descubrir cómo jugar Memoria
          Auditiva, 4 para recibir información general sobre Katamaran, o 0 para repetir este menú. También puedes usar
          la tecla Enter para seleccionar la opción resaltada.
        </p>
      </div>
    </div>
  )
}
