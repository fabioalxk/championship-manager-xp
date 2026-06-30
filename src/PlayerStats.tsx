import { useMemo, useState } from 'react'
import { rosterFor, TEAMS } from './sim/teams'
import type { TeamId } from './sim/types'
import { AttrGroups, ROLE_LABEL, overallOfAll as overall } from './ui/attrDisplay'

export default function PlayerStats({ onClose }: { onClose: () => void }) {
  const [team, setTeam] = useState<TeamId>('home')
  const roster = useMemo(() => rosterFor(team), [team])
  const [selected, setSelected] = useState(0)

  const player = roster[Math.min(selected, roster.length - 1)]

  const pickTeam = (id: TeamId) => {
    setTeam(id)
    setSelected(0)
  }

  return (
    <div className="ps-backdrop" onClick={onClose}>
      <div className="ps-modal" onClick={(e) => e.stopPropagation()}>
        <header className="ps-head">
          <h2>Atributos dos jogadores</h2>
          <button className="ps-close" onClick={onClose} aria-label="Fechar">
            ✕
          </button>
        </header>

        <div className="ps-tabs">
          {(['home', 'away'] as TeamId[]).map((id) => (
            <button
              key={id}
              className={`ps-tab ${team === id ? 'active' : ''}`}
              onClick={() => pickTeam(id)}
            >
              <img className="ps-tab-flag" src={TEAMS[id].flag} alt="" />
              {TEAMS[id].name}
            </button>
          ))}
        </div>

        <div className="ps-body">
          <ul className="ps-list">
            {roster.map((p, i) => (
              <li key={p.number}>
                <button
                  className={`ps-list-item ${i === selected ? 'active' : ''}`}
                  onClick={() => setSelected(i)}
                >
                  <span className="ps-num">{p.number}</span>
                  <span className="ps-pname">{p.name}</span>
                  <span className="ps-role">{ROLE_LABEL[p.role]}</span>
                  <span className="ps-ovr">{overall(p.attrs)}</span>
                </button>
              </li>
            ))}
          </ul>

          <div className="ps-detail">
            <div className="ps-detail-head">
              <span className="ps-detail-num">{player.number}</span>
              <span className="ps-detail-name">{player.name}</span>
              <span className="ps-detail-role">{ROLE_LABEL[player.role]}</span>
              <span className="ps-detail-ovr">
                Geral <b>{overall(player.attrs)}</b>
              </span>
            </div>
            <AttrGroups role={player.role} attrs={player.attrs} />
          </div>
        </div>
      </div>
    </div>
  )
}
