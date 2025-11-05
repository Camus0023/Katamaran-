// Learn more: https://github.com/testing-library/jest-dom
import { jest } from "@jest/globals"
import "@testing-library/jest-dom"

// Mock Web Audio API
global.AudioContext = jest.fn().mockImplementation(() => ({
  createOscillator: jest.fn().mockReturnValue({
    connect: jest.fn(),
    start: jest.fn(),
    stop: jest.fn(),
    frequency: { value: 0 },
    type: "sine",
  }),
  createGain: jest.fn().mockReturnValue({
    connect: jest.fn(),
    gain: { value: 1, setValueAtTime: jest.fn(), exponentialRampToValueAtTime: jest.fn() },
  }),
  createStereoPanner: jest.fn().mockReturnValue({
    connect: jest.fn(),
    pan: { value: 0 },
  }),
  destination: {},
  currentTime: 0,
}))

// Mock Speech Synthesis API
global.speechSynthesis = {
  speak: jest.fn(),
  cancel: jest.fn(),
  pause: jest.fn(),
  resume: jest.fn(),
  getVoices: jest.fn().mockReturnValue([
    {
      name: "Test Voice",
      lang: "es-ES",
      default: true,
      localService: true,
      voiceURI: "test-voice",
    },
  ]),
}

global.SpeechSynthesisUtterance = jest.fn().mockImplementation((text) => ({
  text,
  lang: "es-ES",
  rate: 1,
  pitch: 1,
  volume: 1,
  onend: null,
  onerror: null,
}))

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})
