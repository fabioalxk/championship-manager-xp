import type { CareerState } from '../game/types'
import { computeStandings } from '../game/schedule'
import { zoneOf } from './format'
import { ClubBadge } from '../ui/ClubBadge'

const COLS: [string, string][] = [
  ['P', 'Pontos'],
  ['J', 'Jogos'],
  ['V', 'Vitórias'],
  ['E', 'Empates'],
  ['D', 'Derrotas'],
  ['SG', 'Saldo de gols'],
]

/** Tabela de classificação da liga atual, destacando o clube do jogador. */
export default function Standings({ state }: { state: CareerState }) {
  const { league, clubs, clubId } = state
  const standings = computeStandings(league.clubIds, league.fixtures)
  const total = league.clubIds.length

  return (
    <>
      <table className="cm-table">
        <thead>
          <tr>
            <th>#</th>
            <th className="cm-table-club">Clube</th>
            {COLS.map(([abbr, full]) => (
              <th key={abbr} title={full}>
                {abbr}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {standings.map((s, i) => {
            const club = clubs[s.clubId]
            const pos = i + 1
            const zone = zoneOf(pos, total, league.division)
            const mine = s.clubId === clubId
            return (
              <tr key={s.clubId} className={`${zone ? `zone-${zone}` : ''} ${mine ? 'mine' : ''}`}>
                <td className="cm-pos">{pos}</td>
                <td className="cm-table-club">
                  <ClubBadge club={club} size={20} />
                  {club.name}
                  {mine && <span className="cm-you-tag">você</span>}
                </td>
                <td className="cm-pts">{s.pts}</td>
                <td>{s.played}</td>
                <td>{s.won}</td>
                <td>{s.drawn}</td>
                <td>{s.lost}</td>
                <td>{s.gf - s.ga}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <StandingsLegend division={league.division} />
    </>
  )
}

function StandingsLegend({ division }: { division: CareerState['league']['division'] }) {
  return (
    <div className="cm-legend">
      <span>
        <i className="cm-legend-dot title" /> Campeão
      </span>
      {division !== 'A' && (
        <span>
          <i className="cm-legend-dot promo" /> Sobe de divisão
        </span>
      )}
      {division !== 'D' && (
        <span>
          <i className="cm-legend-dot releg" /> Cai de divisão
        </span>
      )}
    </div>
  )
}
