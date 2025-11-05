# Guía de Pruebas Automáticas - Katamaran

Este documento describe cómo ejecutar y entender las pruebas automáticas del juego Katamaran.

## Instalación de Dependencias

Antes de ejecutar las pruebas, asegúrate de tener todas las dependencias instaladas:

\`\`\`bash
npm install
\`\`\`

## Ejecutar Pruebas

### Ejecutar todas las pruebas una vez

\`\`\`bash
npm test
\`\`\`

### Ejecutar pruebas en modo watch (se re-ejecutan automáticamente al hacer cambios)

\`\`\`bash
npm run test:watch
\`\`\`

### Ejecutar pruebas con reporte de cobertura

\`\`\`bash
npm run test:coverage
\`\`\`

Este comando generará un reporte de cobertura en la carpeta `coverage/` mostrando qué porcentaje del código está cubierto por las pruebas.

## Estructura de Pruebas

Las pruebas están organizadas en la carpeta `__tests__/`:

\`\`\`
__tests__/
├── audio-manager.test.ts    # Pruebas del gestor de audio
├── rhythm-game.test.tsx     # Pruebas del componente de juego
└── home.test.tsx            # Pruebas de la página principal
\`\`\`

## Tipos de Pruebas

### 1. Pruebas Unitarias (audio-manager.test.ts)

Prueban la funcionalidad individual del gestor de audio:
- Inicialización del AudioContext
- Reproducción de sonidos direccionales
- Síntesis de voz
- Limpieza de recursos

### 2. Pruebas de Componentes (rhythm-game.test.tsx, home.test.tsx)

Prueban el comportamiento de los componentes React:
- Renderizado correcto de elementos
- Interacción con el usuario (clicks, teclas)
- Cambios de estado
- Navegación entre pantallas

### 3. Pruebas de Accesibilidad

Verifican que el juego sea accesible:
- Textos alternativos en imágenes
- Instrucciones del asistente
- Navegación por teclado

## Configuración

### jest.config.js

Configuración principal de Jest que define:
- Entorno de pruebas (jsdom para simular el navegador)
- Mapeo de módulos (@/ apunta a la raíz del proyecto)
- Archivos a incluir en el reporte de cobertura

### jest.setup.js

Configuración inicial que se ejecuta antes de cada prueba:
- Mocks de Web Audio API
- Mocks de Speech Synthesis API
- Configuración de testing-library/jest-dom

## Mocks

Las pruebas utilizan mocks para simular APIs del navegador que no están disponibles en el entorno de testing:

- **AudioContext**: Simula la API de audio del navegador
- **SpeechSynthesis**: Simula la síntesis de voz
- **matchMedia**: Simula consultas de medios CSS

## Interpretación de Resultados

Después de ejecutar las pruebas, verás un resumen como este:

\`\`\`
PASS  __tests__/audio-manager.test.ts
PASS  __tests__/rhythm-game.test.tsx
PASS  __tests__/home.test.tsx

Test Suites: 3 passed, 3 total
Tests:       15 passed, 15 total
Snapshots:   0 total
Time:        2.5s
\`\`\`

- **PASS**: Todas las pruebas en ese archivo pasaron
- **FAIL**: Al menos una prueba falló
- **Test Suites**: Número de archivos de prueba
- **Tests**: Número total de pruebas individuales

## Cobertura de Código

El reporte de cobertura muestra:

- **Statements**: Porcentaje de líneas de código ejecutadas
- **Branches**: Porcentaje de ramas condicionales probadas
- **Functions**: Porcentaje de funciones llamadas
- **Lines**: Porcentaje de líneas ejecutadas

Objetivo: Mantener al menos 80% de cobertura en todos los aspectos.

## Solución de Problemas

### Error: "Cannot find module"

Ejecuta `npm install` para asegurarte de que todas las dependencias estén instaladas.

### Error: "ReferenceError: AudioContext is not defined"

Verifica que `jest.setup.js` esté correctamente configurado y que `setupFilesAfterEnv` en `jest.config.js` apunte a él.

### Las pruebas pasan localmente pero fallan en CI/CD

Asegúrate de que el entorno de CI tenga Node.js versión 18 o superior instalado.

## Agregar Nuevas Pruebas

Para agregar nuevas pruebas:

1. Crea un archivo con extensión `.test.ts` o `.test.tsx` en la carpeta `__tests__/`
2. Importa las utilidades necesarias de `@testing-library/react`
3. Escribe tus pruebas usando `describe()` e `it()`
4. Ejecuta `npm test` para verificar que pasen

Ejemplo:

\`\`\`typescript
import { render, screen } from '@testing-library/react'
import MiComponente from '@/components/mi-componente'

describe('MiComponente', () => {
  it('debe renderizar correctamente', () => {
    render(<MiComponente />)
    expect(screen.getByText('Hola Mundo')).toBeInTheDocument()
  })
})
\`\`\`

## Recursos Adicionales

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
