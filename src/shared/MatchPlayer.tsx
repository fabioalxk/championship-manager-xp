import { useEffect, useMemo, useRef } from 'react'
import { canvasSize, setLabelsUpright } from '../render/renderer'
import { useMatchLoop, type MatchSetup } from '../useMatchLoop'
import { primeAudio } from '../sfx/crowd'
import type { GenPlayer } from '../game/types'
import { lineupFor } from '../game/lineup'
import { resolveKits } from '../game/kits'
import { ClubBadge, type BadgeClub } from '../ui/ClubBadge'
import { EventBanner } from '../ui/EventBanner'

const SCALE = 7

/** Velocidades nomeadas — mais claras que "3× 9× 18×". */
const SPEEDS: [string, number][] = [
  ['Normal', 1.5],
  ['Rápido', 4],
  ['Turbo', 6],
]

const fmtClock = (sec: number) => {
  const m = Math.floor(sec / 60)
  return `${String(m).padStart(2, '0')}:${String(Math.floor(sec % 60)).padStart(2, '0')}`
}

/** Um lado da partida: identidade visual (escudo/cores) + elenco gerado. */
export interface MatchSide extends BadgeClub {
  name: string
  squad: GenPlayer[]
}

/**
 * Tela de partida ANIMADA reutilizável: dado o mandante e o visitante (identidade
 * + elenco), monta a escalação, resolve o conflito de uniformes e roda o motor
 * de simulação de verdade num <canvas>. Usada tanto pela liga (`career/MatchView`)
 * quanto pela corrida roguelike (`run/RunMatchView`) — o desfecho (placar final)
 * é devolvido via `onDone`; quem chama decide o que fazer com o resultado.
 */
export default function MatchPlayer({
  home,
  away,
  onDone,
  onSkip,
}: {
  home: MatchSide
  away: MatchSide
  onDone: (homeGoals: number, awayGoals: number) => void
  /** se fornecido, mostra um botão "pular" que resolve a partida sem animação. */
  onSkip?: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // uniformes resolvidos: visitante troca p/ reserva se houver conflito de cor
  const kits = useMemo(
    () => resolveKits({ shirt: home.shirt, text: home.text }, { shirt: away.shirt, text: away.text }),
    [home, away],
  )

  // elencos e cores reais — memoizados p/ não recriar a partida a cada render
  const setup = useMemo<MatchSetup>(
    () => ({ rosters: { home: lineupFor(home.squad), away: lineupFor(away.squad) }, kits }),
    [home, away, kits],
  )

  // Em retrato (celular) o campo gira 90° no CSS; avisa o renderer p/ manter os
  // rótulos (número e nome) na vertical. Acompanha a rotação do aparelho.
  useEffect(() => {
    const mq = window.matchMedia('(orientation: portrait)')
    const sync = () => setLabelsUpright(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => {
      mq.removeEventListener('change', sync)
      setLabelsUpright(false)
    }
  }, [])

  const { hud, running, setRunning, speed, setSpeed } = useMatchLoop(canvasRef, SCALE, setup)
  const size = canvasSize(SCALE)
  const over = hud.status === 'over'

  return (
    <div className="cm-match">
      <div className="cm-scoreboard">
        <span className="cm-sb-team">
          <ClubBadge club={home} size={30} />
          <span className="cm-sb-name">{home.name}</span>
        </span>
        <span className="cm-sb-score">
          {hud.home}
          <small>×</small>
          {hud.away}
        </span>
        <span className="cm-sb-team cm-sb-team-away">
          <span className="cm-sb-name">{away.name}</span>
          <ClubBadge club={away} size={30} />
        </span>
        <span className="cm-sb-clock">{over ? 'FIM' : fmtClock(hud.time)}</span>
      </div>

      <div className="cm-pitch">
        <canvas
          ref={canvasRef}
          className="cm-pitch-canvas"
          width={size.width}
          height={size.height}
          onClick={primeAudio}
          style={{ ['--pw' as string]: `${size.width}px` }}
        />
        {!over && (
          <EventBanner
            b={hud.banner}
            resolveTeam={(t) => ({ shirt: t === 'home' ? home.shirt : away.shirt })}
          />
        )}
        {over && (
          <div className="cm-match-over">
            <div>
              <div className="cm-over-emoji">🏁</div>
              <h2>Fim de jogo</h2>
              <p>
                {home.name} <strong>{hud.home} × {hud.away}</strong> {away.name}
              </p>
              <button
                className="cm-btn cm-btn-go cm-btn-lg cm-btn-block"
                onClick={() => onDone(hud.home, hud.away)}
              >
                Continuar →
              </button>
            </div>
          </div>
        )}
      </div>

      {!over && (
        <div className="cm-match-controls">
          <button className="cm-btn cm-btn-play-pause" onClick={() => setRunning(!running)}>
            {running ? '⏸' : '▶'}
          </button>
          <div className="cm-speed">
            {SPEEDS.map(([label, s]) => (
              <button
                key={s}
                className={`cm-btn cm-btn-sm ${speed === s ? 'active' : ''}`}
                onClick={() => setSpeed(s)}
              >
                {label}
              </button>
            ))}
          </div>
          {onSkip && (
            <button className="cm-btn cm-btn-ghost cm-btn-sm" onClick={onSkip}>
              Pular ⏭
            </button>
          )}
        </div>
      )}
    </div>
  )
}
