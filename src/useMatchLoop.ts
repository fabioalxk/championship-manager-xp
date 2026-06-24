import { useEffect, useRef, useState } from 'react'
import type {
  Celebration,
  MatchEvent,
  MatchState,
  MatchStatus,
  TeamStats,
} from './sim/types'
import { MATCH, PHYS } from './sim/constants'
import { createMatch, step, stepCelebration } from './sim/engine'
import { drawMatch } from './render/renderer'
import { goalRoar } from './sfx/crowd'

export interface Hud {
  home: number
  away: number
  /** segundos de jogo */
  time: number
  half: 1 | 2
  status: MatchStatus
  events: MatchEvent[]
  stats: { home: TeamStats; away: TeamStats }
  /** comemoração de gol em andamento (alimenta o banner central) */
  celebration: Celebration | null
}

const snapshot = (m: MatchState): Hud => ({
  home: m.score.home,
  away: m.score.away,
  time: m.time,
  half: m.half,
  status: m.status,
  events: m.events.slice(-8).reverse(),
  stats: { home: m.stats.home, away: m.stats.away },
  celebration: m.celebration,
})

/**
 * Conecta o motor de simulação a um <canvas> com loop de passo fixo.
 * Devolve controles e um snapshot reativo do estado para a HUD.
 */
export const useMatchLoop = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  scale: number,
) => {
  const matchRef = useRef<MatchState>(createMatch())
  const runningRef = useRef(true)
  const speedRef = useRef(3)

  const [running, setRunning] = useState(true)
  const [speed, setSpeed] = useState(3)
  const [hud, setHud] = useState<Hud>(() => snapshot(matchRef.current))

  useEffect(() => void (runningRef.current = running), [running])
  useEffect(() => void (speedRef.current = speed), [speed])

  useEffect(() => {
    const ctx = canvasRef.current?.getContext('2d')
    if (!ctx) return

    let raf = 0
    let last = performance.now()
    let acc = 0
    let lastSec = -1
    let lastEvents = -1
    let lastStatus: MatchStatus | '' = ''
    let lastCeleb = false

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dtReal = Math.min(0.05, (now - last) / 1000)
      last = now

      const m = matchRef.current
      // a comemoração roda em tempo REAL (legível em qualquer velocidade); a
      // jogada normal corre acelerada conforme o controle de velocidade.
      const celebrating = m.celebration !== null
      const stepping = runningRef.current && m.status === 'play' && !celebrating
      if (celebrating && runningRef.current) {
        acc = 0 // sem dívida de passos pendentes ao voltar do congelamento
        stepCelebration(m, dtReal)
      } else if (stepping) {
        acc += dtReal * speedRef.current
        let steps = 0
        while (acc >= PHYS.dt && steps < 16) {
          step(m, PHYS.dt)
          acc -= PHYS.dt
          steps++
        }
        // descarta a dívida acumulada se estourou o teto (anti "spiral of death")
        if (acc > PHYS.dt) acc = PHYS.dt
      }

      // alpha = fração do passo já decorrida → render interpola prev→pos (suave)
      const alpha = stepping ? Math.min(1, acc / PHYS.dt) : 1
      drawMatch(ctx, m, scale, alpha)

      // HUD atualiza ao mudar o segundo, surgir evento, acabar ou (des)comemorar
      const sec = Math.floor(m.time / MATCH.clockRate)
      const celeb = m.celebration !== null
      // dispara o rugido da torcida exatamente no início da comemoração
      if (celeb && !lastCeleb) goalRoar()
      if (
        sec !== lastSec ||
        m.events.length !== lastEvents ||
        m.status !== lastStatus ||
        celeb !== lastCeleb
      ) {
        lastSec = sec
        lastEvents = m.events.length
        lastStatus = m.status
        lastCeleb = celeb
        setHud(snapshot(m))
      }
    }

    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [canvasRef, scale])

  const reset = () => {
    matchRef.current = createMatch()
    setHud(snapshot(matchRef.current))
  }

  return { hud, running, setRunning, speed, setSpeed, reset }
}
