import { useRef, useState } from 'react'
import { canvasSize } from './render/renderer'
import { TEAMS } from './sim/teams'
import type { Celebration, TeamStats } from './sim/types'
import { useMatchLoop, type Hud } from './useMatchLoop'
import { primeAudio } from './sfx/crowd'
import { EventBanner } from './ui/EventBanner'
import PlayerStats from './PlayerStats'
import './App.css'

const SCALE = 8

/** Esquema tático exibido no placar — ambos os elencos jogam no 4-3-3 (ROLES_433). */
const FORMATION = '4-3-3'

const fmt = (sec: number) => {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const halfLabel = (hud: Hud) =>
  hud.status === 'over' ? 'FIM DE JOGO' : hud.half === 1 ? '1º TEMPO' : '2º TEMPO'

/** Acréscimos do tempo atual ("+2") quando o relógio entra no tempo extra. */
const stoppageLabel = (hud: Hud): string => {
  if (hud.status === 'over' || hud.stoppage <= 0) return ''
  const base = hud.half === 1 ? 45 * 60 : 90 * 60
  return hud.time > base ? `+${Math.ceil(hud.stoppage / 60)}` : ''
}

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
  const headline = c.golaco ? 'GOLAÇO!' : 'GOOOL!'
  return (
    <div className="goal-overlay" style={{ '--accent': info.shirt } as React.CSSProperties}>
      <div className="goal-flash" />
      <div className="goal-card">
        {c.context && <div className="goal-context">{c.context}</div>}
        <div className="goal-big">
          {headline.split('').map((ch, i) => (
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
            {c.milestone && <span className="goal-badge">{c.milestone}</span>}
          </div>
        )}
        {c.assistName && (
          <div className="goal-assist">
            <span className="lbl">assistência</span> {c.assistName}
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

/**
 * Tela de FIM DE JOGO: aparece sobre o campo quando a partida acaba, com o
 * placar final, o resultado (vitória/empate) e um resumo das estatísticas —
 * o "fechamento" que faltava à transmissão. Botão para começar outra partida.
 */
function FullTime({
  hud,
  h,
  a,
  posHome,
  onRestart,
}: {
  hud: Hud
  h: TeamStats
  a: TeamStats
  posHome: number
  onRestart: () => void
}) {
  const winner = hud.home > hud.away ? 'home' : hud.away > hud.home ? 'away' : null
  const verdict = winner
    ? `VITÓRIA ${TEAMS[winner].of.toUpperCase()}`
    : 'EMPATE'
  const rows: { label: string; home: number; away: number }[] = [
    { label: 'Posse', home: posHome, away: 100 - posHome },
    { label: 'Finalizações', home: h.shots, away: a.shots },
    { label: 'No gol', home: h.shotsOnTarget, away: a.shotsOnTarget },
    { label: 'Defesas', home: h.saves, away: a.saves },
  ]
  return (
    <div className="ft-overlay">
      <div className="ft-card">
        <div className="ft-kicker">FIM DE JOGO</div>
        <div className="ft-score">
          <div className={`ft-team home ${winner === 'home' ? 'win' : ''}`}>
            <img src={TEAMS.home.flag} alt={TEAMS.home.name} />
            <span>{TEAMS.home.name}</span>
          </div>
          <div className="ft-nums">
            <span className="sc home">{hud.home}</span>
            <small>×</small>
            <span className="sc away">{hud.away}</span>
          </div>
          <div className={`ft-team away ${winner === 'away' ? 'win' : ''}`}>
            <img src={TEAMS.away.flag} alt={TEAMS.away.name} />
            <span>{TEAMS.away.name}</span>
          </div>
        </div>
        <div className="ft-verdict">{verdict}</div>
        <div className="ft-stats">
          {rows.map((r) => (
            <div key={r.label} className="ft-stat">
              <span className="v home">{r.home}{r.label === 'Posse' ? '%' : ''}</span>
              <span className="l">{r.label}</span>
              <span className="v away">{r.away}{r.label === 'Posse' ? '%' : ''}</span>
            </div>
          ))}
        </div>
        <button className="ft-btn" onClick={onRestart}>
          ↺ Nova partida
        </button>
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
  const [showStats, setShowStats] = useState(false)
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
          <div className="team-info">
            <span className="name">{TEAMS.home.name}</span>
            <span className="formation">{FORMATION}</span>
          </div>
        </div>
        <div className="center">
          <div className="clock-pill">
            <span
              className={`live-dot ${hud.status === 'over' ? 'off' : running ? '' : 'paused'}`}
            />
            <span className="clock">{fmt(hud.time)}</span>
            {stoppageLabel(hud) && <span className="stoppage">{stoppageLabel(hud)}</span>}
          </div>
          <div className={hud.celebration ? 'score flash' : 'score'}>
            <span className="sc home">{hud.home}</span>
            <small>×</small>
            <span className="sc away">{hud.away}</span>
          </div>
          <div className="half">{halfLabel(hud)}</div>
        </div>
        <div className="team away">
          <div className="team-info">
            <span className="name">{TEAMS.away.name}</span>
            <span className="formation">{FORMATION}</span>
          </div>
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
          {!hud.celebration && (
            <EventBanner
              b={hud.banner}
              resolveTeam={(t) => ({ shirt: TEAMS[t].shirt, flag: TEAMS[t].flag })}
            />
          )}
          {hud.celebration && <GoalOverlay c={hud.celebration} />}
          {hud.status === 'over' && (
            <FullTime hud={hud} h={h} a={a} posHome={posHome} onRestart={reset} />
          )}
        </div>

        <aside className="sidebar">
          <div className="stats">
            <h3>Estatísticas</h3>
            <div className="stats-teams">
              <span className="st-side home">
                <img className="st-flag" src={TEAMS.home.flag} alt={TEAMS.home.name} />
                {TEAMS.home.name}
              </span>
              <span className="st-side away">
                {TEAMS.away.name}
                <img className="st-flag" src={TEAMS.away.flag} alt={TEAMS.away.name} />
              </span>
            </div>
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
            <StatRow label="Vermelhos" home={h.reds} away={a.reds} />
            <StatRow label="Escanteios" home={h.corners} away={a.corners} />
            <StatRow label="Laterais" home={h.throwIns} away={a.throwIns} />
            <StatRow label="Tiros de meta" home={h.goalKicks} away={a.goalKicks} />
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
        <button
          onClick={() => {
            primeAudio() // destrava o áudio dentro do gesto do usuário
            setRunning((r) => !r)
          }}
          disabled={hud.status === 'over'}
        >
          {running ? '⏸ Pausar' : '▶ Jogar'}
        </button>
        <button
          onClick={() => {
            primeAudio()
            reset()
          }}
        >
          ↺ Nova partida
        </button>
        <button onClick={() => setShowStats(true)}>📊 Atributos</button>
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

      {showStats && <PlayerStats onClose={() => setShowStats(false)} />}
    </div>
  )
}
