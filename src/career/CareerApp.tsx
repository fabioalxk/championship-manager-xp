import { useCareer } from './useCareer'
import { hasSave } from '../game/save'
import NewGame from './NewGame'
import GameShell from './GameShell'
import './career.css'

/** Raiz do modo carreira: menu inicial quando não há jogo, senão o jogo. */
export default function CareerApp() {
  const api = useCareer()
  if (!api.state) {
    return (
      <NewGame
        onStart={api.start}
        hasSave={hasSave()}
        onContinue={() => window.location.reload()}
      />
    )
  }
  return <GameShell api={api} />
}
