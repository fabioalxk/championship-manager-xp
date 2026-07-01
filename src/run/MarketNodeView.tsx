import type { RunState } from '../game/runTypes'
import { SQUAD_MIN, buyPlayer, coinValueOf, leaveNode, sellPlayer, shopOffers } from '../game/run'
import { ROLE_LABEL, attrColor } from '../ui/attrDisplay'
import type { RunApi } from './useRun'

const ROLE_ORDER = { GK: 0, DEF: 1, MID: 2, FWD: 3 }

/** Evento de MERCADO no mapa: só aqui dá pra comprar/vender — nunca fora de um nó. */
export default function MarketNodeView({ state, act }: { state: RunState; act: RunApi['act'] }) {
  const offers = shopOffers(state).sort((a, b) => b.player.overall - a.player.overall)
  const squad = [...state.squad].sort(
    (a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role] || b.overall - a.overall,
  )

  return (
    <div className="cm-backdrop">
      <div className="cm-modal rq-market">
        <h2>🛒 Mercador de jogadores</h2>
        <p className="cm-modal-sub">
          Moedas: <strong>{state.coins}</strong> · Elenco: {state.squad.length} (mínimo {SQUAD_MIN})
        </p>

        <div className="rq-market-cols">
          <div className="rq-market-col">
            <h4>Contratar</h4>
            <ul className="cm-market-list">
              {offers.map((o) => {
                const afford = state.coins >= o.fee
                return (
                  <li key={o.player.id} className="cm-market-row">
                    <span className="cm-squad-ovr" style={{ color: attrColor(o.player.overall) }}>
                      {o.player.overall}
                    </span>
                    <span className="cm-market-name">
                      <strong>{o.player.name}</strong>
                      <small>
                        {ROLE_LABEL[o.player.role]} · {o.player.age} anos
                      </small>
                    </span>
                    <span className="cm-market-fee">{o.fee} moedas</span>
                    <button
                      className="cm-btn cm-btn-primary cm-btn-sm"
                      disabled={!afford}
                      onClick={() => act((s) => buyPlayer(s, o))}
                    >
                      Contratar
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>

          <div className="rq-market-col">
            <h4>Vender do elenco</h4>
            <ul className="cm-market-list">
              {squad.map((p) => {
                const fee = Math.round(coinValueOf(p.overall, p.age) * 0.85)
                const locked = state.squad.length <= SQUAD_MIN
                return (
                  <li key={p.id} className="cm-market-row">
                    <span className="cm-squad-ovr" style={{ color: attrColor(p.overall) }}>
                      {p.overall}
                    </span>
                    <span className="cm-market-name">
                      <strong>{p.name}</strong>
                      <small>
                        {ROLE_LABEL[p.role]} · {p.age} anos
                      </small>
                    </span>
                    <span className="cm-market-fee">{fee} moedas</span>
                    <button
                      className="cm-btn cm-btn-danger cm-btn-sm"
                      disabled={locked}
                      title={locked ? `Não pode ficar com menos de ${SQUAD_MIN} jogadores` : ''}
                      onClick={() => act((s) => sellPlayer(s, p.id))}
                    >
                      Vender
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        <button className="cm-btn cm-btn-go cm-btn-lg cm-btn-block" onClick={() => act((s) => leaveNode(s))}>
          Seguir viagem →
        </button>
      </div>
    </div>
  )
}
