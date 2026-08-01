import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// NOTE: StrictMode removed intentionally — MapLibre GL is an imperative library
// that creates a WebGL canvas. React StrictMode's double-mount/unmount behavior
// in development destroys the canvas on the first cleanup, preventing layers
// from ever being registered. This is standard practice for map integrations.
createRoot(document.getElementById('root')!).render(<App />)
