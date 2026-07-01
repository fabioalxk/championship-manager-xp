import type { MatchEvent } from '../sim/types'

/**
 * Histórico de lances da partida: quem marcou, em qual minuto, faltas, cartões
 * etc. Reaproveita o mesmo `MatchState.events` que alimenta a faixa efêmera
 * (`EventBanner`), aqui como lista persistente para o jogador conferir o que
 * já aconteceu no jogo — inclusive depois do apito final.
 */
export function MatchHistory({ events }: { events: MatchEvent[] }) {
  if (events.length === 0) return null
  return (
    <div className="cm-history">
      <h3 className="cm-history-title">Histórico da partida</h3>
      <ul className="cm-history-list">
        {events.map((e, i) => (
          <li key={i} className={`cm-history-ev cm-ev-${e.type}`}>
            <span className="cm-history-min">{e.minute}&apos;</span>
            <span className="cm-history-text">{e.text}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
