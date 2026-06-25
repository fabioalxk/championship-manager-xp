import { useMemo, useState } from 'react'
import { rosterFor, TEAMS } from './sim/teams'
import type { Attrs, Role, TeamId } from './sim/types'

/** Rótulos em PT-BR e ordem de exibição dos atributos, agrupados como em atributos.md. */
const ATTR_GROUPS: { title: string; keys: { key: keyof Attrs; label: string }[] }[] = [
  {
    title: 'Físico',
    keys: [
      { key: 'pace', label: 'Velocidade' },
      { key: 'acceleration', label: 'Aceleração' },
      { key: 'agility', label: 'Agilidade' },
      { key: 'balance', label: 'Equilíbrio' },
      { key: 'jumping', label: 'Impulsão' },
      { key: 'strength', label: 'Força' },
      { key: 'stamina', label: 'Fôlego' },
      { key: 'naturalFitness', label: 'Forma física' },
      { key: 'workRate', label: 'Intensidade' },
    ],
  },
  {
    title: 'Técnico',
    keys: [
      { key: 'dribbling', label: 'Drible' },
      { key: 'firstTouch', label: 'Domínio' },
      { key: 'technique', label: 'Técnica' },
      { key: 'passing', label: 'Passe' },
      { key: 'crossing', label: 'Cruzamento' },
      { key: 'finishing', label: 'Finalização' },
      { key: 'longShots', label: 'Chute de longe' },
      { key: 'heading', label: 'Cabeceio' },
      { key: 'tackling', label: 'Desarme' },
      { key: 'marking', label: 'Marcação' },
    ],
  },
  {
    title: 'Mental',
    keys: [
      { key: 'vision', label: 'Visão de jogo' },
      { key: 'anticipation', label: 'Antecipação' },
      { key: 'positioning', label: 'Posicionamento' },
      { key: 'offTheBall', label: 'Movimentação' },
      { key: 'decisions', label: 'Decisões' },
      { key: 'composure', label: 'Frieza' },
      { key: 'concentration', label: 'Concentração' },
      { key: 'consistency', label: 'Consistência' },
      { key: 'aggression', label: 'Agressividade' },
      { key: 'bravery', label: 'Bravura' },
      { key: 'teamwork', label: 'Trabalho em equipe' },
      { key: 'flair', label: 'Imprevisibilidade' },
    ],
  },
  {
    title: 'Goleiro',
    keys: [
      { key: 'goalkeeping', label: 'Defesa' },
      { key: 'reflexes', label: 'Reflexos' },
      { key: 'handling', label: 'Mãos' },
      { key: 'aerialReach', label: 'Saída aérea' },
      { key: 'oneOnOne', label: 'Um contra um' },
      { key: 'kicking', label: 'Tiro de meta' },
      { key: 'throwing', label: 'Reposição' },
      { key: 'communication', label: 'Comunicação' },
    ],
  },
]

const ROLE_LABEL: Record<Role, string> = {
  GK: 'Goleiro',
  DEF: 'Defesa',
  MID: 'Meio-campo',
  FWD: 'Ataque',
}

/** Cor da barra conforme a faixa do atributo (0..100). */
const attrColor = (v: number) =>
  v >= 85 ? '#22c55e' : v >= 70 ? '#84cc16' : v >= 50 ? '#facc15' : '#f97316'

/** Média geral do jogador (todos os atributos) — só um número resumo. */
const overall = (a: Attrs) => {
  const vals = Object.values(a)
  return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length)
}

function AttrBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="ps-attr">
      <span className="ps-attr-label">{label}</span>
      <span className="ps-attr-bar">
        <span
          className="ps-attr-fill"
          style={{ width: `${value}%`, background: attrColor(value) }}
        />
      </span>
      <span className="ps-attr-val" style={{ color: attrColor(value) }}>
        {value}
      </span>
    </div>
  )
}

export default function PlayerStats({ onClose }: { onClose: () => void }) {
  const [team, setTeam] = useState<TeamId>('home')
  const roster = useMemo(() => rosterFor(team), [team])
  const [selected, setSelected] = useState(0)

  const player = roster[Math.min(selected, roster.length - 1)]
  // o grupo "Goleiro" só interessa para o GK; jogadores de linha não o exibem
  const groups = ATTR_GROUPS.filter((g) => g.title !== 'Goleiro' || player.role === 'GK')

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
            <div className="ps-groups">
              {groups.map((g) => (
                <div key={g.title} className="ps-group">
                  <h4>{g.title}</h4>
                  {g.keys.map((k) => (
                    <AttrBar key={k.key} label={k.label} value={player.attrs[k.key]} />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
