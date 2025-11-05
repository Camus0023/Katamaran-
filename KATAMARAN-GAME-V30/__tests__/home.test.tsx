import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import Home from "@/app/page"

describe("Home Page", () => {
  describe("Renderizado inicial", () => {
    it("debe mostrar la pantalla de carga inicialmente", () => {
      render(<Home />)
      expect(screen.getByText(/Cargando Katamaran/i)).toBeInTheDocument()
    })

    it("debe mostrar el logo de Katamaran después de cargar", async () => {
      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText("Katamaran")).toBeInTheDocument()
      })
    })

    it("debe mostrar el eslogan del juego", async () => {
      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText(/"Navega el sonido sin límites"/i)).toBeInTheDocument()
      })
    })
  })

  describe("Navegación", () => {
    it("debe mostrar el botón de comenzar juego", async () => {
      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText(/Comenzar Juego/i)).toBeInTheDocument()
      })
    })

    it("debe iniciar el juego al hacer clic en el botón", async () => {
      render(<Home />)

      await waitFor(() => {
        const startButton = screen.getByText(/Comenzar Juego/i)
        fireEvent.click(startButton)
      })

      await waitFor(
        () => {
          expect(screen.getByText(/Ritmo Auditivo/i)).toBeInTheDocument()
        },
        { timeout: 3000 },
      )
    })

    it("debe iniciar el juego al presionar Enter", async () => {
      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText("Katamaran")).toBeInTheDocument()
      })

      fireEvent.keyDown(window, { key: "Enter" })

      await waitFor(
        () => {
          expect(screen.getByText(/SCORE/i)).toBeInTheDocument()
        },
        { timeout: 3000 },
      )
    })
  })

  describe("Accesibilidad", () => {
    it("debe tener texto alternativo para el logo", async () => {
      render(<Home />)

      await waitFor(() => {
        const logo = screen.getByAltText(/Logo de Katamaran/i)
        expect(logo).toBeInTheDocument()
      })
    })

    it("debe mostrar instrucciones del asistente", async () => {
      render(<Home />)

      await waitFor(() => {
        expect(screen.getByText(/Asistente:/i)).toBeInTheDocument()
      })
    })
  })
})
