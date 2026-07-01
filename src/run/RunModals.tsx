import type { RunState } from '../game/runTypes'
import { ALL_CLUBS } from '../game/worldcup'

function Backdrop({ children }: { children: React.ReactNode }) {
  return <div className="cm-backdrop">{children}</div>
}

/** Tela de ELIMINAÇÃO: perdeu uma partida, a corrida acaba — só reinicia do zero. */
export function GameOverModal({ state, onNewRun }: { state: RunState; onNewRun: () => void }) {
  return (
    <Backdrop>
      <div className="cm-modal cm-modal-over">
        <div className="rq-over-emoji">☠️</div>
        <h2>ELIMINADO</h2>
        <p className="cm-modal-sub">
          {state.lastMatch && (
            <>
              Derrota para o {state.lastMatch.oppName} ({state.lastMatch.homeGoals}×
              {state.lastMatch.awayGoals}) na fase {state.lastMatch.stage}.
            </>
          )}
        </p>
        <p className="cm-modal-sub">Fim de jornada. Comece uma corrida nova do zero.</p>
        <button className="cm-btn cm-btn-primary cm-btn-lg cm-btn-block" onClick={onNewRun}>
          ↺ Nova corrida
        </button>
      </div>
    </Backdrop>
  )
}

/** Tela de VITÓRIA: venceu o chefão final. */
export function VictoryModal({ state, onNewRun }: { state: RunState; onNewRun: () => void }) {
  const club = ALL_CLUBS[state.clubId]
  return (
    <Backdrop>
      <div className="cm-modal cm-modal-won">
        <div className="cm-won-trophy">🏆</div>
        <h2>VOCÊ VENCEU O CHEFÃO!</h2>
        <p className="cm-modal-sub">
          {state.managerName} levou o {club?.name ?? state.clubId} do primeiro quadradinho até o topo do
          mapa — jornada completa!
        </p>
        <div className="cm-won-stats">
          <span>{state.squad.length} jogadores no elenco final</span>
          <span>{state.coins} moedas guardadas</span>
        </div>
        <button className="cm-btn cm-btn-primary cm-btn-lg cm-btn-block" onClick={onNewRun}>
          Nova corrida
        </button>
      </div>
    </Backdrop>
  )
}
