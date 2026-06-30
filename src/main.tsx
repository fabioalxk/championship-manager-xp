import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import CareerApp from './career/CareerApp'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CareerApp />
  </StrictMode>,
)
