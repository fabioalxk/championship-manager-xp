import { useState } from 'react'
import { ALL_CLUBS } from '../game/worldcup'
import { benchHasUpgrade, continueAfterDefeat, START_LIVES } from '../game/run'
import { ClubBadge } from '../ui/ClubBadge'
import MapView from './MapView'
import SquadRunView from './SquadRunView'
import RunMatchView from './RunMatchView'
import RewardCards from './RewardCards'
import MarketNodeView from './MarketNodeView'
import GymNodeView from './GymNodeView'
import { GameOverModal, LifeLostModal, VictoryModal } from './RunModals'
import type { RunApi } from './useRun'

type Tab = 'map' | 'squad'

/** Casca do modo roguelike: cabeçalho + abas (mapa/elenco) + o que o status da corrida exigir. */
export default function RunShell({ api }: { api: RunApi }) {
  const state = api.state!
  const { act } = api
  const [tab, setTab] = useState<Tab>('map')

  if (state.status === 'match') return <RunMatchView state={state} act={act} />

  const club = ALL_CLUBS[state.clubId]

  return (
    <div className="cm-shell">
      <header className="cm-header">
        <div className="cm-header-club">
          {club && <ClubBadge club={club} size={32} />}
          <div>
            <strong>{club?.name ?? state.clubId}</strong>
            <span className="cm-header-sub">Téc. {state.managerName} · Slay of the CM</span>
          </div>
        </div>
        <div className="cm-header-stats">
          <span className="cm-coin-chip" title="Vidas — dá para perder 1 partida; a 2ª derrota elimina">
            {'❤️'.repeat(state.lives)}
            {'🖤'.repeat(Math.max(0, START_LIVES - state.lives))}
          </span>
          <span className="cm-coin-chip" title="Moedas">💰 {state.coins}</span>
          <button className="cm-btn cm-btn-ghost cm-btn-sm" onClick={api.reset} title="Recomeçar do zero">
            ⟳
          </button>
        </div>
      </header>

      <nav className="cm-nav">
        <button className={`cm-nav-btn ${tab === 'map' ? 'active' : ''}`} onClick={() => setTab('map')}>
          <span className="cm-nav-ico">🗺️</span>
          <span>Mapa</span>
        </button>
        <button className={`cm-nav-btn ${tab === 'squad' ? 'active' : ''}`} onClick={() => setTab('squad')}>
          <span className="cm-nav-ico">
            👕
            {benchHasUpgrade(state) && (
              <span className="cm-nav-dot" title="Você tem reservas melhores que titulares" />
            )}
          </span>
          <span>Meu Time</span>
        </button>
      </nav>

      <main className="cm-main">
        {tab === 'map' && <MapView state={state} act={act} />}
        {tab === 'squad' && <SquadRunView state={state} act={act} />}
      </main>

      {state.status === 'reward' && <RewardCards state={state} act={act} />}
      {state.status === 'market' && <MarketNodeView state={state} act={act} />}
      {state.status === 'gym' && <GymNodeView state={state} act={act} />}
      {state.status === 'lifelost' && (
        <LifeLostModal state={state} onContinue={() => act(continueAfterDefeat)} />
      )}
      {state.status === 'gameover' && <GameOverModal state={state} onNewRun={api.reset} />}
      {state.status === 'victory' && <VictoryModal state={state} onNewRun={api.reset} />}
    </div>
  )
}
