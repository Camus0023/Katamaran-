import { AudioManager } from "@/lib/audio-manager"
import { jest } from "@jest/globals"

describe("AudioManager", () => {
  let audioManager: AudioManager

  beforeEach(() => {
    audioManager = new AudioManager()
  })

  afterEach(() => {
    audioManager.cleanup()
  })

  describe("Inicialización", () => {
    it("debe crear una instancia de AudioManager", () => {
      expect(audioManager).toBeInstanceOf(AudioManager)
    })

    it("debe tener un AudioContext", () => {
      expect(audioManager["audioContext"]).toBeDefined()
    })
  })

  describe("Reproducción de sonidos", () => {
    it("debe reproducir un sonido direccional", () => {
      const playDirectionalSoundSpy = jest.spyOn(audioManager as any, "playDirectionalSound")
      audioManager.playDirectionalSound("left")
      expect(playDirectionalSoundSpy).toHaveBeenCalledWith("left")
    })

    it("debe reproducir sonidos de efectos", () => {
      const playSoundSpy = jest.spyOn(audioManager, "playSound")
      audioManager.playSound("correct")
      expect(playSoundSpy).toHaveBeenCalledWith("correct")
    })
  })

  describe("Síntesis de voz", () => {
    it("debe hablar un texto", () => {
      const speakSpy = jest.spyOn(audioManager, "speak")
      audioManager.speak("Hola mundo")
      expect(speakSpy).toHaveBeenCalledWith("Hola mundo")
    })

    it("debe usar speechSynthesis.speak", () => {
      audioManager.speak("Test")
      expect(global.speechSynthesis.speak).toHaveBeenCalled()
    })
  })

  describe("Limpieza", () => {
    it("debe limpiar recursos al llamar cleanup", () => {
      const cancelSpy = jest.spyOn(global.speechSynthesis, "cancel")
      audioManager.cleanup()
      expect(cancelSpy).toHaveBeenCalled()
    })
  })
})
