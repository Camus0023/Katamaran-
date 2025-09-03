

# Proyecto: Katamaran
Este proyecto es desarrollado para la materia Proyecto Integrador 2 de EAFIT

## Descripción
Un juego web inclusivo, pensado para **personas ciegas o con baja visión**, que integra accesibilidad desde el diseño.  
La interacción se basa en **navegación por teclado** y **feedback auditivo**.

## Arquitectura
- **Cliente**: HTML, CSS, JavaScript
- **Accesibilidad**: ARIA, etiquetas semánticas, `aria-live`
- **Servidor**: Flask o FastAPI (Python)
- **DB**: SQLite para desarrollo / PostgreSQL para producción
- **Audio**: 
  - Web Speech API para lectura en tiempo real
  - `<audio>` + Web Audio API para efectos y sonidos
- **Infraestructura**: Contenedores Docker desplegados en Heroku / Render / AWS

## MVP Features
- Landing page accesible.
- Selector de juegos usando flechas y Enter.
- Audio que anuncia opciones y progreso.
- Minijuegos simples (ej. memoria auditiva, reflejos).
- Puntajes guardados en la base de datos.

