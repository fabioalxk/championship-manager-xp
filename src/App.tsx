import { useRef } from 'react'
import { canvasSize } from './render/renderer'
import { TEAMS } from './sim/teams'
import type { Celebration, TeamStats } from './sim/types'
import { useMatchLoop, type Hud } from './useMatchLoop'
import './App.css'

const SCALE = 8

const fmt = (sec: number) => {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const halfLabel = (hud: Hud) =>
  hud.status === 'over' ? 'FIM DE JOGO' : hud.half === 1 ? '1º TEMPO' : '2º TEMPO'

const pct = (a: number, b: number) => {
  const t = a + b
  return t === 0 ? 50 : Math.round((a / t) * 100)
}

/**
 * Banner central da comemoração: anuncia em sequência animada o GOL, de qual
 * time (bandeira + artigo), QUEM marcou (nº + nome) e o placar resultante.
 * A animação é puramente CSS; o React só monta/desmonta conforme a jogada.
 */
function GoalOverlay({ c }: { c: Celebration }) {
  const info = TEAMS[c.team]
  return (
    <div className="goal-overlay" style={{ '--accent': info.shirt } as React.CSSProperties}>
      <div className="goal-flash" />
      <div className="goal-card">
        <div className="goal-big">
          {'GOOOL!'.split('').map((ch, i) => (
            <span key={i} style={{ animationDelay: `${i * 0.05}s` }}>
              {ch}
            </span>
          ))}
        </div>
        <div className="goal-team">
          <img className="goal-flag" src={info.flag} alt={info.name} />
          <span>GOL {info.of}</span>
        </div>
        {c.scorerName && (
          <div className="goal-scorer">
            {c.scorerNumber != null && <b>{c.scorerNumber}</b>}
            {c.scorerName}
          </div>
        )}
        <div className="goal-scoreline">
          <span className="gs home">
            {TEAMS.home.name} {c.homeScore}
          </span>
          <small>×</small>
          <span className="gs away">
            {c.awayScore} {TEAMS.away.name}
          </span>
        </div>
        <div className="goal-min">{c.minute}&apos;</div>
      </div>
    </div>
  )
}

function StatRow({
  label,
  home,
  away,
}: {
  label: string
  home: number
  away: number
}) {
  return (
    <div className="stat-row">
      <span className="sv home">{home}</span>
      <span className="sl">{label}</span>
      <span className="sv away">{away}</span>
    </div>
  )
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { hud, running, setRunning, speed, setSpeed, reset } = useMatchLoop(
    canvasRef,
    SCALE,
  )
  const size = canvasSize(SCALE)
  const h: TeamStats = hud.stats.home
  const a: TeamStats = hud.stats.away
  const posHome = pct(h.possessionTicks, a.possessionTicks)

  return (
    <div className="app">
      <header className="scoreboard">
        <div className="team home">
          <img className="flag" src={TEAMS.home.flag} alt={TEAMS.home.name} />
          <span className="name">{TEAMS.home.name}</span>
        </div>
        <div className="center">
          <div className="score">
            {hud.home} <small>×</small> {hud.away}
          </div>
          <div className="clock">{fmt(hud.time)}</div>
          <div className="half">{halfLabel(hud)}</div>
        </div>
        <div className="team away">
          <span className="name">{TEAMS.away.name}</span>
          <img className="flag" src={TEAMS.away.flag} alt={TEAMS.away.name} />
        </div>
      </header>

      <div className="main">
        <div className="pitch-wrap">
          <canvas
            ref={canvasRef}
            width={size.width}
            height={size.height}
            className="pitch"
          />
          {hud.celebration && <GoalOverlay c={hud.celebration} />}
        </div>

        <aside className="sidebar">
          <div className="stats">
            <h3>Estatísticas</h3>
            <div className="stat-row possession">
              <span className="sv home">{posHome}%</span>
              <span className="sl">Posse</span>
              <span className="sv away">{100 - posHome}%</span>
            </div>
            <div className="posbar">
              <div className="posbar-home" style={{ width: `${posHome}%` }} />
            </div>
            <StatRow label="Finalizações" home={h.shots} away={a.shots} />
            <StatRow label="No gol" home={h.shotsOnTarget} away={a.shotsOnTarget} />
            <StatRow label="Defesas" home={h.saves} away={a.saves} />
            <StatRow label="Rebotes" home={h.rebounds} away={a.rebounds} />
            <StatRow label="Desarmes" home={h.tackles} away={a.tackles} />
            <StatRow label="Faltas" home={h.fouls} away={a.fouls} />
            <StatRow label="Amarelos" home={h.yellows} away={a.yellows} />
          </div>

          <div className="feed">
            <h3>Lances</h3>
            <ul>
              {hud.events.map((e, i) => (
                <li key={i} className={`ev ${e.type}`}>
                  <span className="min">{e.minute}&apos;</span> {e.text}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      <div className="controls">
        <button onClick={() => setRunning((r) => !r)} disabled={hud.status === 'over'}>
          {running ? '⏸ Pausar' : '▶ Jogar'}
        </button>
        <button onClick={reset}>↺ Nova partida</button>
        <label className="speed">
          Velocidade: {speed}×
          <input
            type="range"
            min={1}
            max={8}
            step={1}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
          />
        </label>
      </div>
    </div>
  )
}
