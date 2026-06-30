import { useMemo, useRef } from 'react'
import { canvasSize } from '../render/renderer'
import { useMatchLoop, type MatchSetup } from '../useMatchLoop'
import { primeAudio } from '../sfx/crowd'
import type { CareerState } from '../game/types'
import { advanceRound, advanceRoundWithPlayerResult, nextPlayerFixture } from '../game/career'
import { lineupFor } from '../game/lineup'
import { resolveKits } from '../game/kits'
import type { CareerApi } from './useCareer'
import { ClubBadge } from '../ui/ClubBadge'

const SCALE = 7

/** Velocidades nomeadas — mais claras que "3× 9× 18×". */
const SPEEDS: [string, number][] = [
  ['Normal', 4],
  ['Rápido', 9],
  ['Turbo', 18],
]

const fmtClock = (sec: number) => {
  const m = Math.floor(sec / 60)
  return `${String(m).padStart(2, '0')}:${String(Math.floor(sec % 60)).padStart(2, '0')}`
}

/**
 * Assiste à partida do jogador com a simulação animada (elenco e cores reais).
 * Ao terminar, grava o placar e simula o resto da rodada. "Pular" usa resultado
 * rápido sem assistir. O campo gira para vertical em telas retrato (celular).
 */
export default function MatchView({
  state,
  act,
  onDone,
}: {
  state: CareerState
  act: CareerApi['act']
  onDone: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fixture = nextPlayerFixture(state)
  const homeClub = fixture ? state.clubs[fixture.homeId] : state.clubs[state.clubId]
  const awayClub = fixture ? state.clubs[fixture.awayId] : state.clubs[state.clubId]

  // uniformes resolvidos: visitante troca p/ reserva se houver conflito de cor
  const kits = useMemo(
    () =>
      resolveKits(
        { shirt: homeClub.shirt, text: homeClub.text },
        { shirt: awayClub.shirt, text: awayClub.text },
      ),
    [homeClub, awayClub],
  )

  // elencos e cores reais — memoizados p/ não recriar a partida a cada render
  const setup = useMemo<MatchSetup>(
    () => ({
      rosters: { home: lineupFor(homeClub.squad), away: lineupFor(awayClub.squad) },
      kits,
    }),
    [homeClub, awayClub, kits],
  )

  const { hud, running, setRunning, speed, setSpeed } = useMatchLoop(canvasRef, SCALE, setup)
  const size = canvasSize(SCALE)
  const over = hud.status === 'over'

  const commitWatched = () => {
    act((s) => advanceRoundWithPlayerResult(s, hud.home, hud.away))
    onDone()
  }
  const skip = () => {
    act((s) => advanceRound(s))
    onDone()
  }

  return (
    <div className="cm-match">
      <div className="cm-scoreboard">
        <span className="cm-sb-team">
          <ClubBadge club={homeClub} size={30} />
          <span className="cm-sb-name">{homeClub.name}</span>
        </span>
        <span className="cm-sb-score">
          {hud.home}<small>×</small>{hud.away}
        </span>
        <span className="cm-sb-team cm-sb-team-away">
          <span className="cm-sb-name">{awayClub.name}</span>
          <ClubBadge club={awayClub} size={30} />
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
        {over && (
          <div className="cm-match-over">
            <div>
              <div className="cm-over-emoji">🏁</div>
              <h2>Fim de jogo</h2>
              <p>
                {homeClub.name} <strong>{hud.home} × {hud.away}</strong> {awayClub.name}
              </p>
              <button className="cm-btn cm-btn-go cm-btn-lg cm-btn-block" onClick={commitWatched}>
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
          <button className="cm-btn cm-btn-ghost cm-btn-sm" onClick={skip}>
            Pular ⏭
          </button>
        </div>
      )}
    </div>
  )
}
