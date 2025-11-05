import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import RhythmGame from "@/components/rhythm-game"
import { AudioManager } from "@/lib/audio-manager"
import { jest } from "@jest/globals"

describe("RhythmGame", () => {
  let audioManager: AudioManager
  let mockOnBack: jest.Mock

  beforeEach(() => {
    audioManager = new AudioManager()
    mockOnBack = jest.fn()
  })

  afterEach(() => {
    audioManager.cleanup()
  })

  describe("Renderizado inicial", () => {
    it("debe renderizar la pantalla de introducción", () => {
      render(<RhythmGame onBack={mockOnBack} audioManager={audioManager} />)
      expect(screen.getByText(/Ritmo Auditivo/i)).toBeInTheDocument()
    })

    it("debe mostrar el botón START", () => {
      render(<RhythmGame onBack={mockOnBack} audioManager={audioManager} />)
      expect(screen.getByText("START")).toBeInTheDocument()
    })
  })

  describe("Inicio del juego", () => {
    it("debe iniciar el juego al presionar el botón START", async () => {
      render(<RhythmGame onBack={mockOnBack} audioManager={audioManager} />)
      const startButton = screen.getByText("START")

      fireEvent.click(startButton)

      await waitFor(
        () => {
          expect(screen.queryByText("START")).not.toBeInTheDocument()
        },
        { timeout: 5000 },
      )
    })

    it("debe iniciar el juego al presionar Enter", async () => {
      render(<RhythmGame onBack={mockOnBack} audioManager={audioManager} />)

      fireEvent.keyDown(window, { key: "Enter" })

      await waitFor(
        () => {
          expect(screen.queryByText("START")).not.toBeInTheDocument()
        },
        { timeout: 5000 },
      )
    })
  })

  describe("Mecánicas del juego", () => {
    it("debe mostrar el score inicial como 0", async () => {
      render(<RhythmGame onBack={mockOnBack} audioManager={audioManager} />)

      fireEvent.keyDown(window, { key: "Enter" })

      await waitFor(
        () => {
          expect(screen.getByText(/SCORE: 0/i)).toBeInTheDocument()
        },
        { timeout: 5000 },
      )
    })

    it("debe mostrar el temporizador", async () => {
      render(<RhythmGame onBack={mockOnBack} audioManager={audioManager} />)

      fireEvent.keyDown(window, { key: "Enter" })

      await waitFor(
        () => {
          expect(screen.getByText(/1:00/i)).toBeInTheDocument()
        },
        { timeout: 5000 },
      )
    })
  })

  describe("Navegación", () => {
    it("debe volver al menú al presionar 0", () => {
      render(<RhythmGame onBack={mockOnBack} audioManager={audioManager} />)

      fireEvent.keyDown(window, { key: "0" })

      expect(mockOnBack).toHaveBeenCalled()
    })
  })
})
