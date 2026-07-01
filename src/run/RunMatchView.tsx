import type { RunState } from '../game/runTypes'
import { finishMatch, quickPlayNode, startingXI } from '../game/run'
import { ALL_CLUBS } from '../game/worldcup'
import MatchPlayer from '../shared/MatchPlayer'
import type { RunApi } from './useRun'

/** Partida animada de um nó da corrida — fininho sobre `MatchPlayer` (compartilhado com a liga). */
export default function RunMatchView({ state, act }: { state: RunState; act: RunApi['act'] }) {
  const node = state.nodes.find((n) => n.id === state.currentNodeId)
  if (!node || !node.opponent) return null

  const home = { ...ALL_CLUBS[state.clubId], squad: startingXI(state) }
  const away = { ...ALL_CLUBS[node.opponent.clubId], squad: node.opponent.squad }

  return (
    <MatchPlayer
      home={home}
      away={away}
      onDone={(homeGoals, awayGoals) => act((s) => finishMatch(s, homeGoals, awayGoals))}
      onSkip={() => act((s) => quickPlayNode(s))}
    />
  )
}
