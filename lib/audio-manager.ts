export class AudioManager {
  private synth: SpeechSynthesis | null = null
  private audioContext: AudioContext | null = null
  private sounds: { [key: string]: AudioBuffer } = {}
  private selectedVoice: SpeechSynthesisVoice | null = null

  constructor() {
    if (typeof window !== "undefined") {
      this.synth = window.speechSynthesis
      this.initAudioContext()
      this.preloadSounds()
      this.initVoice()
    }
  }

  private async initAudioContext() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch (error) {
      console.error("Error initializing audio context:", error)
    }
  }

  private async preloadSounds() {
    const soundFiles = {
      select: this.generateTone(800, 0.1),
      confirm: this.generateTone(1000, 0.2),
      back: this.generateTone(400, 0.15),
      info: this.generateTone(600, 0.25),
      start: this.generateTone(1200, 0.3),
      pause: this.generateTone(300, 0.2),
      resume: this.generateTone(900, 0.2),
      correct: this.generateTone(1500, 0.1),
      wrong: this.generateTone(200, 0.3),
      left: this.generateTone(500, 0.15),
      center: this.generateTone(750, 0.15),
      right: this.generateTone(1000, 0.15),
      highFreq: this.generateTone(1800, 0.4), // Sonido agudo para flecha izquierda
      lowFreq: this.generateTone(300, 0.4), // Sonido grave para flecha derecha
      drum: this.generateDrumSound(), // Tambor - flecha izquierda
      trumpet: this.generateTrumpetSound(), // Trompeta - flecha arriba
      guitar: this.generateGuitarSound(), // Guitarra - flecha derecha
      piano: this.generatePianoSound(), // Piano - flecha abajo
    }

    for (const [name, buffer] of Object.entries(soundFiles)) {
      this.sounds[name] = await buffer
    }
  }

  private async generateTone(frequency: number, duration: number): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error("Audio context not initialized")
    }

    const sampleRate = this.audioContext.sampleRate
    const numSamples = sampleRate * duration
    const buffer = this.audioContext.createBuffer(2, numSamples, sampleRate)

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel)
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate
        channelData[i] = Math.sin(2 * Math.PI * frequency * t) * 0.3 * Math.exp(-t * 3)
      }
    }

    return buffer
  }

  private async generateDrumSound(): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error("Audio context not initialized")
    }

    const sampleRate = this.audioContext.sampleRate
    const duration = 0.4
    const numSamples = sampleRate * duration
    const buffer = this.audioContext.createBuffer(2, numSamples, sampleRate)

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel)
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate
        // Sonido más percusivo con más ruido y frecuencia muy baja
        const noise = (Math.random() - 0.5) * 0.8
        const kick = Math.sin(2 * Math.PI * 60 * t) * 0.9
        const snap = Math.sin(2 * Math.PI * 200 * t) * 0.3
        channelData[i] = (kick + snap + noise) * Math.exp(-t * 12)
      }
    }

    return buffer
  }

  private async generateTrumpetSound(): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error("Audio context not initialized")
    }

    const sampleRate = this.audioContext.sampleRate
    const duration = 0.5
    const numSamples = sampleRate * duration
    const buffer = this.audioContext.createBuffer(2, numSamples, sampleRate)

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel)
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate
        // Sonido más brillante y metálico
        const fundamental = Math.sin(2 * Math.PI * 523 * t) * 0.7 // Do5
        const harmonic2 = Math.sin(2 * Math.PI * 1046 * t) * 0.4 // Do6
        const harmonic3 = Math.sin(2 * Math.PI * 1569 * t) * 0.2 // Sol6
        const envelope = Math.exp(-t * 1.5)
        channelData[i] = (fundamental + harmonic2 + harmonic3) * envelope
      }
    }

    return buffer
  }

  private async generateGuitarSound(): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error("Audio context not initialized")
    }

    const sampleRate = this.audioContext.sampleRate
    const duration = 0.8
    const numSamples = sampleRate * duration
    const buffer = this.audioContext.createBuffer(2, numSamples, sampleRate)

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel)
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate
        // Sonido de guitarra con ataque rápido y sustain
        const fundamental = Math.sin(2 * Math.PI * 392 * t) * 0.6 // Sol4
        const harmonic2 = Math.sin(2 * Math.PI * 784 * t) * 0.3 // Sol5
        const harmonic3 = Math.sin(2 * Math.PI * 1176 * t) * 0.15 // Re6
        const pluck = t < 0.01 ? Math.sin(2 * Math.PI * 2000 * t) * 0.3 : 0
        const envelope = Math.exp(-t * 0.8)
        channelData[i] = (fundamental + harmonic2 + harmonic3 + pluck) * envelope
      }
    }

    return buffer
  }

  private async generatePianoSound(): Promise<AudioBuffer> {
    if (!this.audioContext) {
      throw new Error("Audio context not initialized")
    }

    const sampleRate = this.audioContext.sampleRate
    const duration = 1.0
    const numSamples = sampleRate * duration
    const buffer = this.audioContext.createBuffer(2, numSamples, sampleRate)

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const channelData = buffer.getChannelData(channel)
      for (let i = 0; i < numSamples; i++) {
        const t = i / sampleRate
        // Sonido de piano más rico en armónicos
        const fundamental = Math.sin(2 * Math.PI * 261.63 * t) * 0.8 // Do4
        const harmonic2 = Math.sin(2 * Math.PI * 523.25 * t) * 0.4 // Do5
        const harmonic3 = Math.sin(2 * Math.PI * 784.88 * t) * 0.2 // Sol5
        const harmonic4 = Math.sin(2 * Math.PI * 1046.5 * t) * 0.1 // Do6
        const attack = t < 0.1 ? 1 - Math.exp(-t * 50) : 1
        const envelope = Math.exp(-t * 0.5) * attack
        channelData[i] = (fundamental + harmonic2 + harmonic3 + harmonic4) * envelope
      }
    }

    return buffer
  }

  private initVoice() {
    if (!this.synth) return

    // Esperar a que las voces estén disponibles
    const setVoice = () => {
      const voices = this.synth!.getVoices()

      console.log(
        "[v0] Voces disponibles:",
        voices.map((v) => `${v.name} (${v.lang})`),
      )

      const spanishVoices = voices.filter((voice) => voice.lang.startsWith("es") || voice.lang.startsWith("es-"))

      const femaleKeywords = [
        "Female",
        "Mujer",
        "Femenina",
        "Woman",
        "Paulina",
        "Monica",
        "Lucia",
        "Mónica",
        "Lucía",
        "female",
        "Helena",
        "Sabina",
        "Paloma",
        "Zira",
        "Dalia",
        "Francisca",
      ]

      const maleKeywords = [
        "Male",
        "Hombre",
        "Masculino",
        "Man",
        "male",
        "Raul",
        "Jorge",
        "Diego",
        "Juan",
        "Carlos",
        "Pablo",
        "Miguel",
      ]

      // Palabras clave para identificar voces de alta calidad
      const qualityKeywords = ["Google", "Microsoft", "Premium", "Enhanced", "Neural", "Natural"]

      const getVoiceScore = (voice: SpeechSynthesisVoice) => {
        let score = 0

        if (maleKeywords.some((keyword) => voice.name.toLowerCase().includes(keyword.toLowerCase()))) {
          score -= 1000
        }

        // Puntos por ser femenina
        if (femaleKeywords.some((keyword) => voice.name.toLowerCase().includes(keyword.toLowerCase()))) {
          score += 200
        }

        // Puntos por calidad del proveedor
        if (qualityKeywords.some((keyword) => voice.name.includes(keyword))) {
          score += 50
        }

        // Puntos extra por combinación de calidad y género
        const isFemale = femaleKeywords.some((keyword) => voice.name.toLowerCase().includes(keyword.toLowerCase()))
        const isQuality = qualityKeywords.some((keyword) => voice.name.includes(keyword))
        if (isFemale && isQuality) {
          score += 100
        }

        // Puntos por ser local (mejor rendimiento)
        if (voice.localService) {
          score += 10
        }

        return score
      }

      // Ordenar voces por puntuación y seleccionar la mejor
      const sortedVoices = spanishVoices.sort((a, b) => getVoiceScore(b) - getVoiceScore(a))

      console.log(
        "[v0] Top 3 voces:",
        sortedVoices.slice(0, 3).map((v) => `${v.name} (score: ${getVoiceScore(v)})`),
      )

      this.selectedVoice = sortedVoices[0] || null

      // Log para debug
      if (this.selectedVoice) {
        console.log("[v0] Voz seleccionada:", this.selectedVoice.name)
      }
    }

    // Las voces pueden no estar disponibles inmediatamente
    if (this.synth.getVoices().length > 0) {
      setVoice()
    } else {
      this.synth.addEventListener("voiceschanged", setVoice)
    }
  }

  speak(text: string, rate = 0.95, pitch = 1.15) {
    if (!this.synth) return

    this.synth.cancel()

    const utterance = new SpeechSynthesisUtterance(text)

    // Usar la voz seleccionada si está disponible
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice
    }

    utterance.rate = rate // Velocidad ligeramente más lenta para mayor naturalidad
    utterance.pitch = pitch // Tono más alto para voz femenina
    utterance.volume = 1.0 // Volumen máximo para claridad
    utterance.lang = "es-ES"

    this.synth.speak(utterance)
  }

  playSound(soundName: string) {
    if (!this.audioContext || !this.sounds[soundName]) return

    try {
      const source = this.audioContext.createBufferSource()
      const gainNode = this.audioContext.createGain()

      source.buffer = this.sounds[soundName]
      source.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime)
      source.start()
    } catch (error) {
      console.error("Error playing sound:", error)
    }
  }

  playDirectionalSound(direction: "left" | "center" | "right") {
    if (!this.audioContext) return

    try {
      const source = this.audioContext.createBufferSource()
      const panner = this.audioContext.createStereoPanner()
      const gainNode = this.audioContext.createGain()

      switch (direction) {
        case "left":
          panner.pan.setValueAtTime(-1, this.audioContext.currentTime)
          source.buffer = this.sounds.left
          break
        case "center":
          panner.pan.setValueAtTime(0, this.audioContext.currentTime)
          source.buffer = this.sounds.center
          break
        case "right":
          panner.pan.setValueAtTime(1, this.audioContext.currentTime)
          source.buffer = this.sounds.right
          break
      }

      source.connect(panner)
      panner.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      gainNode.gain.setValueAtTime(0.7, this.audioContext.currentTime)
      source.start()
    } catch (error) {
      console.error("Error playing directional sound:", error)
    }
  }

  playFrequencySound(frequency: "high" | "low") {
    if (!this.audioContext) return

    try {
      const source = this.audioContext.createBufferSource()
      const gainNode = this.audioContext.createGain()

      switch (frequency) {
        case "high":
          source.buffer = this.sounds.highFreq
          break
        case "low":
          source.buffer = this.sounds.lowFreq
          break
      }

      source.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      gainNode.gain.setValueAtTime(0.6, this.audioContext.currentTime)
      source.start()
    } catch (error) {
      console.error("Error playing frequency sound:", error)
    }
  }

  playInstrumentSound(instrument: "drum" | "trumpet" | "guitar" | "piano") {
    if (!this.audioContext || !this.sounds[instrument]) return

    try {
      const source = this.audioContext.createBufferSource()
      const gainNode = this.audioContext.createGain()

      source.buffer = this.sounds[instrument]
      source.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      gainNode.gain.setValueAtTime(0.7, this.audioContext.currentTime)
      source.start()
    } catch (error) {
      console.error("Error playing instrument sound:", error)
    }
  }

  cleanup() {
    if (this.synth) {
      this.synth.cancel()
    }
    if (this.audioContext) {
      this.audioContext.close()
    }
  }
}
