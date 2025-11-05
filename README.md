# Katamaran - Juego Accesible de Ritmo Auditivo

Katamaran es un juego inclusivo diseñado específicamente para personas con discapacidad visual o visión reducida. Utiliza únicamente audio para crear una experiencia de juego completa y entretenida.

## Características

- **100% Accesible**: Diseñado desde cero para ser jugado sin necesidad de ver la pantalla
- **Audio Espacial**: Sonidos direccionales que indican de dónde vienen los estímulos
- **Narración Completa**: Asistente de voz que guía al jugador en todo momento
- **Controles Simples**: Navegación intuitiva usando solo el teclado
- **PWA**: Instalable como aplicación en dispositivos móviles y escritorio

## Modo de Juego: Ritmo Auditivo

Escucha sonidos que vienen de diferentes direcciones (izquierda, centro, derecha) y presiona las teclas correspondientes al ritmo de la música:

- **Flecha Izquierda**: Sonido desde la izquierda
- **Flecha Arriba**: Sonido desde el centro
- **Flecha Derecha**: Sonido desde la derecha

Acumula puntos por cada acierto y construye combos para multiplicar tu puntuación.

## Instalación y Ejecución

### Requisitos

- Node.js 18.0 o superior
- npm o yarn

### Instalación

\`\`\`bash
# Clonar el repositorio
git clone [URL_DEL_REPOSITORIO]

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev
\`\`\`

La aplicación estará disponible en `http://localhost:3000`

### Compilación para Producción

\`\`\`bash
npm run build
npm start
\`\`\`

## Pruebas Automáticas

El proyecto incluye pruebas automáticas completas. Para más información, consulta [TESTING.md](./TESTING.md).

\`\`\`bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch
npm run test:watch

# Generar reporte de cobertura
npm run test:coverage
\`\`\`

## Estructura del Proyecto

\`\`\`
katamaran/
├── app/                    # Páginas de Next.js
│   ├── page.tsx           # Página principal
│   └── globals.css        # Estilos globales
├── components/            # Componentes React
│   ├── rhythm-game.tsx   # Componente del juego
│   └── ui/               # Componentes de UI reutilizables
├── lib/                   # Utilidades y lógica
│   └── audio-manager.ts  # Gestor de audio y voz
├── __tests__/            # Pruebas automáticas
│   ├── audio-manager.test.ts
│   ├── rhythm-game.test.tsx
│   └── home.test.tsx
├── public/               # Archivos estáticos
│   └── images/          # Imágenes del juego
└── jest.config.js       # Configuración de Jest
\`\`\`

## Tecnologías Utilizadas

- **Next.js 14**: Framework de React para aplicaciones web
- **TypeScript**: Tipado estático para JavaScript
- **Tailwind CSS**: Framework de CSS utility-first
- **Web Audio API**: Para generación de sonidos espaciales
- **Speech Synthesis API**: Para narración de voz
- **Jest + React Testing Library**: Para pruebas automáticas

## Controles del Juego

### En el Menú Principal

- **1 o Enter**: Comenzar juego
- **0**: Repetir instrucciones

### Durante el Juego

- **Flecha Izquierda**: Responder a sonido izquierdo
- **Flecha Arriba**: Responder a sonido central
- **Flecha Derecha**: Responder a sonido derecho
- **P o Barra Espaciadora**: Pausar/Reanudar
- **0**: Volver al menú principal

## Accesibilidad

Katamaran sigue las mejores prácticas de accesibilidad:

- Navegación completa por teclado
- Narración de todas las acciones y estados
- Audio espacial para orientación
- Sin dependencia de elementos visuales
- Compatible con lectores de pantalla

## Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Haz fork del repositorio
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Contacto

Para preguntas, sugerencias o reportar problemas, por favor abre un issue en el repositorio.

## Agradecimientos

Gracias a todas las personas que han contribuido a hacer de Katamaran un juego verdaderamente inclusivo y accesible.
