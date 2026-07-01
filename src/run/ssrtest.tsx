/**
 * Smoke test de renderização do modo roguelike: monta as telas React em string
 * (sem DOM) para garantir que não há erro de runtime/hook nos componentes.
 */
import { renderToStaticMarkup } from 'react-dom/server'
import NewRun from './NewRun'
import RunShell from './RunShell'
import { GameOverModal, VictoryModal } from './RunModals'
import { newRun, enterNode, quickPlayNode, leaveNode } from '../game/run'
import { ALL_CLUBS } from '../game/worldcup'
import type { RunApi } from './useRun'
import type { RunState } from '../game/runTypes'

const assert = (cond: boolean, msg: string) => {
  if (!cond) throw new Error('FALHA: ' + msg)
}

const apiFor = (state: RunState): RunApi => ({
  state,
  act: () => {},
  start: () => {},
  reset: () => {},
})

// 1) tela inicial
const newRunHtml = renderToStaticMarkup(<NewRun onStart={() => {}} hasSave={false} onContinue={() => {}} />)
assert(newRunHtml.includes('Slay of the CM'), 'NewRun deve renderizar o título')

// 2) shell no mapa (mapa + escudo do clube + moedas)
const clubId = Object.keys(ALL_CLUBS)[0]
const state = newRun('SSR', clubId, 4242)
const mapHtml = renderToStaticMarkup(<RunShell api={apiFor(state)} />)
assert(mapHtml.includes('💰'), 'Shell deve mostrar as moedas')
assert(mapHtml.includes('Slay of the CM'), 'Shell deve identificar o modo')

// 3) entra num nó de partida (o próprio RunShell troca pra RunMatchView em tela cheia)
const matchNode = state.nodes.find((n) => state.availableNodeIds.includes(n.id) && n.kind === 'match')
if (matchNode) {
  enterNode(state, matchNode.id)
  renderToStaticMarkup(<RunShell api={apiFor(state)} />)
  assert(state.status === 'match', 'deveria estar em partida')
}

// 4) joga até ganhar alguma partida e cair no pop-up de recompensa (3 cartas)
let guard = 0
while (state.status !== 'reward' && state.status !== 'gameover' && guard++ < 20) {
  const next = state.nodes.find((n) => state.availableNodeIds.includes(n.id) && !n.cleared)
  if (!next) break
  enterNode(state, next.id)
  if (state.status === 'match') quickPlayNode(state)
  else if (state.status === 'market' || state.status === 'gym') leaveNode(state)
}
if (state.status === 'reward') {
  renderToStaticMarkup(<RunShell api={apiFor(state)} />)
  assert((state.pendingReward?.length ?? 0) === 3, 'pop-up de recompensa deve ter 3 cartas')
}

// 5) modais de fim de jornada
renderToStaticMarkup(<GameOverModal state={{ ...state, status: 'gameover' }} onNewRun={() => {}} />)
renderToStaticMarkup(<VictoryModal state={{ ...state, status: 'victory' }} onNewRun={() => {}} />)

console.log('OK: todas as telas do modo roguelike renderizam sem erro.')
