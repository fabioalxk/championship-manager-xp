/**
 * Smoke test de renderização: monta as telas React em string (sem DOM) para
 * garantir que não há erro de runtime/hook nos componentes principais.
 */
import { renderToStaticMarkup } from 'react-dom/server'
import NewGame from './NewGame'
import GameShell from './GameShell'
import { SeasonEndModal, OffersModal, WonModal } from './Modals'
import { newCareer, simulateSeason, openTransferWindow } from '../game/career'
import type { CareerApi } from './useCareer'
import type { CareerState } from '../game/types'

const assert = (cond: boolean, msg: string) => {
  if (!cond) throw new Error('FALHA: ' + msg)
}

const apiFor = (state: CareerState): CareerApi => ({
  state,
  act: () => {},
  start: () => {},
  reset: () => {},
})

// 1) tela inicial
const newGameHtml = renderToStaticMarkup(
  <NewGame onStart={() => {}} hasSave={false} onContinue={() => {}} />,
)
assert(newGameHtml.includes('Brasileirão Manager'), 'NewGame deve renderizar o título')

// 2) shell em temporada (dashboard + tabela + elenco)
const inSeason = newCareer('SSR', 'abc', 777)
const shellHtml = renderToStaticMarkup(<GameShell api={apiFor(inSeason)} />)
assert(shellHtml.includes('Jogar partida'), 'Dashboard deve renderizar a ação de jogar')
assert(shellHtml.includes('Série'), 'deve mostrar a liga')

// 3) fim de temporada + transferências + modal
const ended = newCareer('SSR2', 'abc', 888)
simulateSeason(ended)
assert(ended.status === 'season_end', 'deveria estar em season_end')
renderToStaticMarkup(<SeasonEndModal state={ended} act={() => {}} />)
openTransferWindow(ended)
renderToStaticMarkup(<GameShell api={apiFor(ended)} />)

// 4) modais de ofertas e vitória (estados forçados)
const offersState: CareerState = {
  ...ended,
  status: 'offers',
  offers: [{ clubId: 'flamengo', division: 'A', clubName: 'Flamengo' }],
}
renderToStaticMarkup(<OffersModal state={offersState} act={() => {}} />)
renderToStaticMarkup(<WonModal state={ended} onNewGame={() => {}} />)

console.log('OK: todas as telas renderizam sem erro.')
