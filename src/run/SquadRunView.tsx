import { Fragment, useEffect, useRef, useState } from 'react'
import type { RunState } from '../game/runTypes'
import { optimizeStartingXI, swapStarter } from '../game/run'
import { ROLE_LABEL, attrColor, AttrGroups } from '../ui/attrDisplay'
import type { GenPlayer } from '../game/types'
import type { Role } from '../sim/types'
import type { RunApi } from './useRun'

const ROLE_ORDER = { GK: 0, DEF: 1, MID: 2, FWD: 3 }
const byRole = (a: GenPlayer, b: GenPlayer) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role] || b.overall - a.overall

type Side = 'starter' | 'bench'
type Armed = { side: Side; id: number } | null

/** Agrupa uma lista já ordenada por posição em blocos consecutivos da mesma posição. */
const groupByRole = (list: GenPlayer[]): { role: Role; players: GenPlayer[] }[] => {
  const groups: { role: Role; players: GenPlayer[] }[] = []
  for (const p of list) {
    const last = groups[groups.length - 1]
    if (last && last.role === p.role) last.players.push(p)
    else groups.push({ role: p.role, players: [p] })
  }
  return groups
}

/**
 * Escalação da corrida: titulares × banco, com substituição em 2 passos bem
 * explícitos — (1) "arma" um jogador de qualquer lado clicando no botão da
 * linha dele, (2) o app destaca quem ele pode substituir, mostra o ganho/perda
 * de nota do time e avisa se a troca deixa o time sem goleiro de verdade em
 * campo. A área principal da linha só MOSTRA detalhes — nunca troca sozinha.
 */
export default function SquadRunView({ state, act }: { state: RunState; act: RunApi['act'] }) {
  const starters = state.squad.filter((p) => state.startingIds.includes(p.id)).sort(byRole)
  const bench = state.squad.filter((p) => !state.startingIds.includes(p.id)).sort(byRole)
  const all = [...starters, ...bench]
  const gkStartersCount = starters.filter((p) => p.role === 'GK').length

  const [selId, setSelId] = useState<number | null>(null)
  const [armed, setArmed] = useState<Armed>(null)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current) }, [])

  const detail = all.find((p) => p.id === selId)
  const armedPlayer = armed ? all.find((p) => p.id === armed.id) ?? null : null

  const fireToast = (msg: string) => {
    setToast(msg)
    if (toastTimer.current) clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => setToast(null), 2800)
  }

  const armToggle = (side: Side, id: number) => {
    setArmed((prev) => (prev && prev.side === side && prev.id === id ? null : { side, id }))
    setSelId(id)
  }

  const cancel = () => setArmed(null)

  const confirmSwap = (side: Side, target: GenPlayer) => {
    if (!armed || !armedPlayer) return
    const benchP = side === 'bench' ? target : armedPlayer
    const starterP = side === 'starter' ? target : armedPlayer
    act((s) => swapStarter(s, benchP.id, starterP.id))
    fireToast(`${benchP.name} entra no lugar de ${starterP.name}`)
    setSelId(benchP.id)
    setArmed(null)
  }

  const renderRow = (p: GenPlayer, side: Side) => {
    const isArmedRow = armed?.side === side && armed.id === p.id
    const isTarget = !!armed && armed.side !== side
    const benchP = side === 'bench' ? p : armedPlayer
    const starterP = side === 'starter' ? p : armedPlayer
    const delta = isTarget && benchP && starterP ? benchP.overall - starterP.overall : null
    const samePosition = isTarget && benchP && starterP && benchP.role === starterP.role
    const warnLoneGk =
      isTarget && !!benchP && !!starterP && starterP.role === 'GK' && benchP.role !== 'GK' && gkStartersCount === 1
    const dim = !!armed && !isArmedRow && !isTarget

    const btnLabel = isTarget ? '✓ Colocar aqui' : isArmedRow ? '✕ Cancelar' : side === 'bench' ? '▲ Escalar' : '▼ Banco'
    const btnClass = `rq-act ${isTarget ? 'rq-act-place' : isArmedRow ? 'rq-act-cancel' : ''}`
    const btnTitle = isTarget
      ? `Colocar ${benchP?.name} no lugar de ${starterP?.name}`
      : isArmedRow
        ? 'Cancelar substituição'
        : side === 'bench'
          ? 'Escalar como titular'
          : 'Mandar para o banco'

    return (
      <li
        key={p.id}
        className={`rq-row ${isArmedRow ? 'is-armed' : ''} ${isTarget ? 'is-target' : ''} ${warnLoneGk ? 'is-warn' : ''} ${dim ? 'is-dim' : ''}`}
      >
        <div className="rq-row-main">
          <button
            className={`cm-squad-row ${side === 'starter' ? 'rq-starter' : 'rq-bench'} ${p.id === selId ? 'active' : ''}`}
            onClick={() => setSelId(p.id)}
          >
            <span className={`rq-tag ${side === 'starter' ? 'rq-tag-starter' : 'rq-tag-bench'}`}>
              {side === 'starter' ? 'Titular' : 'Reserva'}
            </span>
            <span className="cm-squad-num">{p.number}</span>
            <span className="cm-squad-name">{p.name}</span>
            <span className="cm-squad-role">{ROLE_LABEL[p.role]}</span>
            <span className={`rq-delta ${delta === null ? '' : delta > 0 ? 'up' : delta < 0 ? 'down' : ''}`}>
              {delta === null ? '' : delta > 0 ? `+${delta}` : delta}
            </span>
            <span className="cm-squad-ovr" style={{ color: attrColor(p.overall) }}>
              {p.overall}
            </span>
          </button>
          <button className={btnClass} title={btnTitle} onClick={() => (isTarget ? confirmSwap(side, p) : armToggle(side, p.id))}>
            {btnLabel}
          </button>
        </div>
        {isTarget && (warnLoneGk || samePosition) && (
          <div className={`rq-hint-tag ${warnLoneGk ? 'warn' : 'ok'}`}>
            {warnLoneGk ? '⚠ o time fica sem um goleiro de verdade em campo' : '★ mesma posição — encaixe direto'}
          </div>
        )}
      </li>
    )
  }

  const detailAction = (p: GenPlayer) => {
    const side: Side = state.startingIds.includes(p.id) ? 'starter' : 'bench'
    const isArmedRow = armed?.side === side && armed.id === p.id
    const isTarget = !!armed && armed.side !== side

    if (isTarget && armedPlayer) {
      const benchP = side === 'bench' ? p : armedPlayer
      const starterP = side === 'starter' ? p : armedPlayer
      const delta = benchP.overall - starterP.overall
      const kicksOutOnlyGk = starterP.role === 'GK' && benchP.role !== 'GK' && gkStartersCount === 1
      return (
        <div className="rq-detail-action">
          <p className="rq-detail-delta">
            {benchP.name} entra no lugar de {starterP.name} ·{' '}
            <strong className={delta > 0 ? 'up' : delta < 0 ? 'down' : ''}>
              {delta > 0 ? `+${delta}` : delta} de nota no time
            </strong>
          </p>
          {kicksOutOnlyGk && (
            <p className="rq-warn">
              ⚠ {starterP.name} é seu único goleiro titular — colocando {benchP.name} no lugar, o time joga sem
              goleiro de verdade.
            </p>
          )}
          <button className="cm-btn cm-btn-primary cm-btn-block" onClick={() => confirmSwap(side, p)}>
            ✓ Confirmar troca
          </button>
        </div>
      )
    }
    if (isArmedRow) {
      return (
        <button className="cm-btn cm-btn-ghost cm-btn-block" onClick={cancel}>
          ✕ Cancelar substituição
        </button>
      )
    }
    return (
      <button className="cm-btn cm-btn-primary cm-btn-block" onClick={() => armToggle(side, p.id)}>
        {side === 'bench' ? '▲ Escalar como titular' : '▼ Mandar para o banco'}
      </button>
    )
  }

  return (
    <div className="cm-squad rq-squad">
      <div className="cm-squad-list">
        {armed && armedPlayer && (
          <div className="rq-swapbar">
            <span className="rq-swapbar-num">{armedPlayer.number}</span>
            <span className="rq-swapbar-text">
              {armed.side === 'bench' ? (
                <>
                  Escalando <strong>{armedPlayer.name}</strong> — clique em <em>“✓ Colocar aqui”</em> no titular que
                  vai pro banco.
                </>
              ) : (
                <>
                  Tirando <strong>{armedPlayer.name}</strong> do time — clique em <em>“✓ Colocar aqui”</em> no reserva
                  que entra.
                </>
              )}
            </span>
            <button className="cm-btn cm-btn-ghost cm-btn-sm" onClick={cancel}>
              Cancelar
            </button>
          </div>
        )}

        <div className="cm-squad-head">
          <span>Titulares — {starters.length}/11</span>
          <button className="cm-btn cm-btn-ghost cm-btn-sm" onClick={() => act((s) => optimizeStartingXI(s))}>
            Melhor time
          </button>
        </div>
        <ul>
          {groupByRole(starters).map((g) => (
            <Fragment key={`s-${g.role}`}>
              <li className="rq-role-head">
                {ROLE_LABEL[g.role]} · {g.players.length}
              </li>
              {g.players.map((p) => renderRow(p, 'starter'))}
            </Fragment>
          ))}
        </ul>

        <div className="cm-squad-head">
          <span>Banco — {bench.length}</span>
        </div>
        {bench.length === 0 ? (
          <p className="rq-empty">Ninguém no banco agora — vença partidas ou compre no mercado pra ganhar reforços.</p>
        ) : (
          <ul>
            {groupByRole(bench).map((g) => (
              <Fragment key={`b-${g.role}`}>
                <li className="rq-role-head">
                  {ROLE_LABEL[g.role]} · {g.players.length}
                </li>
                {g.players.map((p) => renderRow(p, 'bench'))}
              </Fragment>
            ))}
          </ul>
        )}
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
          {detailAction(detail)}
          <AttrGroups role={detail.role} attrs={detail.attrs} />
        </div>
      )}

      {toast && <div className="rq-toast">✅ {toast}</div>}
    </div>
  )
}
