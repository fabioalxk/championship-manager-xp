import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import RunApp from './run/RunApp'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RunApp />
  </StrictMode>,
)
