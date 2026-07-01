import { useState } from 'react'
import type { Attrs } from '../sim/types'
import type { RunState } from '../game/runTypes'
import { boostAttribute, leaveNode } from '../game/run'
import { ATTR_GROUPS, ROLE_LABEL, attrColor } from '../ui/attrDisplay'
import type { RunApi } from './useRun'

const ROLE_ORDER = { GK: 0, DEF: 1, MID: 2, FWD: 3 }

/**
 * Evento de ACADEMIA no mapa: escolhe 1 jogador e 1 atributo, bufa +20 (teto 100).
 * Uso único por nó — depois é só seguir viagem.
 */
export default function GymNodeView({ state, act }: { state: RunState; act: RunApi['act'] }) {
  const squad = [...state.squad].sort(
    (a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role] || b.overall - a.overall,
  )
  const [playerId, setPlayerId] = useState<number>(squad[0]?.id ?? 0)
  const [attr, setAttr] = useState<keyof Attrs>('pace')
  const [done, setDone] = useState(false)
  const player = state.squad.find((p) => p.id === playerId)
  const groups = ATTR_GROUPS.filter((g) => g.title !== 'Goleiro' || player?.role === 'GK')

  const train = () => {
    act((s) => boostAttribute(s, playerId, attr))
    setDone(true)
  }

  return (
    <div className="cm-backdrop">
      <div className="cm-modal rq-gym">
        <h2>🏋️ Academia</h2>
        <p className="cm-modal-sub">
          Escolha um jogador e um atributo — ele treina PESADO e ganha +20 pontos (teto 100).
        </p>

        <div className="rq-gym-cols">
          <ul className="cm-market-list rq-gym-players">
            {squad.map((p) => (
              <li key={p.id}>
                <button
                  className={`cm-squad-row ${p.id === playerId ? 'active' : ''}`}
                  disabled={done}
                  onClick={() => setPlayerId(p.id)}
                >
                  <span className="cm-squad-num">{p.number}</span>
                  <span className="cm-squad-name">{p.name}</span>
                  <span className="cm-squad-role">{ROLE_LABEL[p.role]}</span>
                  <span className="cm-squad-ovr" style={{ color: attrColor(p.overall) }}>
                    {p.overall}
                  </span>
                </button>
              </li>
            ))}
          </ul>

          {player && (
            <div className="rq-gym-attrs">
              {groups.map((g) => (
                <div key={g.title} className="rq-gym-group">
                  <h4>{g.title}</h4>
                  <div className="rq-gym-chip-row">
                    {g.keys.map((k) => (
                      <button
                        key={k.key}
                        className={`rq-chip ${attr === k.key ? 'active' : ''}`}
                        disabled={done}
                        onClick={() => setAttr(k.key)}
                        title={k.desc}
                      >
                        {k.label} <b>{player.attrs[k.key]}</b>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {player && !done && (
          <p className="rq-gym-preview">
            {player.name}: {ATTR_LABEL(attr)} {player.attrs[attr]} → <strong>{Math.min(100, player.attrs[attr] + 20)}</strong>
          </p>
        )}

        {!done ? (
          <button className="cm-btn cm-btn-primary cm-btn-lg cm-btn-block" onClick={train} disabled={!player}>
            Treinar!
          </button>
        ) : (
          <button className="cm-btn cm-btn-go cm-btn-lg cm-btn-block" onClick={() => act((s) => leaveNode(s))}>
            Seguir viagem →
          </button>
        )}
      </div>
    </div>
  )
}

const ATTR_LABEL = (key: keyof Attrs): string =>
  ATTR_GROUPS.flatMap((g) => g.keys).find((k) => k.key === key)?.label ?? key
