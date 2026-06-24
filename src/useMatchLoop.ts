import { useEffect, useRef, useState } from 'react'
import type { MatchEvent, MatchState, MatchStatus, TeamStats } from './sim/types'
import { MATCH, PHYS } from './sim/constants'
import { createMatch, step } from './sim/engine'
import { drawMatch } from './render/renderer'

export interface Hud {
  home: number
  away: number
  /** segundos de jogo */
  time: number
  half: 1 | 2
  status: MatchStatus
  events: MatchEvent[]
  stats: { home: TeamStats; away: TeamStats }
}

const snapshot = (m: MatchState): Hud => ({
  home: m.score.home,
  away: m.score.away,
  time: m.time,
  half: m.half,
  status: m.status,
  events: m.events.slice(-8).reverse(),
  stats: { home: m.stats.home, away: m.stats.away },
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

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      const dtReal = Math.min(0.05, (now - last) / 1000)
      last = now

      const m = matchRef.current
      if (runningRef.current && m.status === 'play') {
        acc += dtReal * speedRef.current
        let steps = 0
        while (acc >= PHYS.dt && steps < 16) {
          step(m, PHYS.dt)
          acc -= PHYS.dt
          steps++
        }
      }

      drawMatch(ctx, m, scale)

      // HUD atualiza ao mudar o segundo de jogo, surgir evento ou acabar
      const sec = Math.floor(m.time / MATCH.clockRate)
      if (sec !== lastSec || m.events.length !== lastEvents || m.status !== lastStatus) {
        lastSec = sec
        lastEvents = m.events.length
        lastStatus = m.status
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
