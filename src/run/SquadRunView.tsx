import { useState } from 'react'
import type { RunState } from '../game/runTypes'
import { optimizeStartingXI, swapStarter } from '../game/run'
import { ROLE_LABEL, attrColor, AttrGroups } from '../ui/attrDisplay'
import type { GenPlayer } from '../game/types'
import type { RunApi } from './useRun'

const ROLE_ORDER = { GK: 0, DEF: 1, MID: 2, FWD: 3 }
const byRole = (a: GenPlayer, b: GenPlayer) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role] || b.overall - a.overall

/**
 * Escalação da corrida: titulares × banco, com pista visual clara (selo "Titular")
 * e substituição por clique (seleciona um do banco, depois clica em quem ele
 * substitui). "Melhor time" escala automaticamente os 11 de maior nota.
 */
export default function SquadRunView({ state, act }: { state: RunState; act: RunApi['act'] }) {
  const starters = state.squad.filter((p) => state.startingIds.includes(p.id)).sort(byRole)
  const bench = state.squad.filter((p) => !state.startingIds.includes(p.id)).sort(byRole)
  const [selId, setSelId] = useState<number | null>(null)
  const [pendingBenchId, setPendingBenchId] = useState<number | null>(null)
  const all = [...starters, ...bench]
  const detail = all.find((p) => p.id === selId)

  const clickStarter = (p: GenPlayer) => {
    if (pendingBenchId !== null) {
      act((s) => swapStarter(s, pendingBenchId, p.id))
      setPendingBenchId(null)
      setSelId(pendingBenchId)
    } else {
      setSelId(p.id)
    }
  }
  const clickBench = (p: GenPlayer) => {
    setPendingBenchId(p.id === pendingBenchId ? null : p.id)
    setSelId(p.id)
  }

  return (
    <div className="cm-squad rq-squad">
      <div className="cm-squad-list">
        <div className="cm-squad-head">
          <span>Titulares — {starters.length}/11</span>
          <button className="cm-btn cm-btn-ghost cm-btn-sm" onClick={() => act((s) => optimizeStartingXI(s))}>
            Melhor time
          </button>
        </div>
        {pendingBenchId !== null && (
          <p className="rq-swap-hint">Escolha quem sai do time titular para entrar.</p>
        )}
        <ul>
          {starters.map((p) => (
            <li key={p.id}>
              <button
                className={`cm-squad-row rq-starter ${p.id === selId ? 'active' : ''}`}
                onClick={() => clickStarter(p)}
              >
                <span className="rq-tag rq-tag-starter">Titular</span>
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
        <div className="cm-squad-head">
          <span>Banco — {bench.length}</span>
        </div>
        <ul>
          {bench.map((p) => (
            <li key={p.id}>
              <button
                className={`cm-squad-row rq-bench ${p.id === selId ? 'active' : ''} ${p.id === pendingBenchId ? 'picked' : ''}`}
                onClick={() => clickBench(p)}
              >
                <span className="rq-tag rq-tag-bench">Reserva</span>
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
      </div>

      {detail && (
        <div className="cm-squad-detail">
          <div className="cm-squad-detail-head">
            <span className="cm-squad-detail-num">{detail.number}</span>
            <div className="cm-squad-detail-id">
              <strong>{detail.name}</strong>
              <span>
                {ROLE_LABEL[detail.role]} · {detail.age} anos ·{' '}
                {state.startingIds.includes(detail.id) ? 'Titular' : 'Reserva'}
              </span>
            </div>
            <span className="cm-squad-detail-ovr" style={{ color: attrColor(detail.overall) }}>
              {detail.overall}
            </span>
          </div>
          <AttrGroups role={detail.role} attrs={detail.attrs} />
        </div>
      )}
    </div>
  )
}
