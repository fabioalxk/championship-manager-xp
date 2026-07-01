import type { CareerState } from '../game/types'
import { fmtMoney, signPlayer, SQUAD_MAX } from '../game/career'
import { ROLE_LABEL, attrColor } from '../ui/attrDisplay'
import { PlayerAvatar } from '../ui/PlayerAvatar'
import type { CareerApi } from './useCareer'

/**
 * Mercado de transferências: jogadores disponíveis para contratar. Disponível
 * tanto na janela (entre temporadas) quanto durante a temporada.
 */
export default function MarketView({ state, act }: { state: CareerState; act: CareerApi['act'] }) {
  const club = state.clubs[state.clubId]
  const full = club.squad.length >= SQUAD_MAX
  const market = [...state.market].sort((a, b) => b.overall - a.overall)

  return (
    <div className="cm-market">
      <div className="cm-market-bar">
        <span>
          Verba: <strong>{fmtMoney(state.money)}</strong>
        </span>
        <span>
          Elenco: {club.squad.length}/{SQUAD_MAX}
        </span>
      </div>
      {market.length === 0 && <p className="cm-empty">Nenhum jogador disponível no momento.</p>}
      <ul className="cm-market-list">
        {market.map((m) => {
          const afford = state.money >= m.fee && !full
          return (
            <li key={m.id} className="cm-market-row">
              <span className="cm-squad-ovr" style={{ color: attrColor(m.overall) }}>
                {m.overall}
              </span>
              <PlayerAvatar teamId={undefined} name={m.name} />
              <span className="cm-market-name">
                <strong>{m.name}</strong>
                <small>
                  {ROLE_LABEL[m.role]} · {m.age} anos
                </small>
              </span>
              <span className="cm-market-fee">{fmtMoney(m.fee)}</span>
              <button
                className="cm-btn cm-btn-primary cm-btn-sm"
                disabled={!afford}
                onClick={() => act((s) => signPlayer(s, m.id))}
              >
                Contratar
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
