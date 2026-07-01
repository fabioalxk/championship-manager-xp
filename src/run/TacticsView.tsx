import type { RunState } from '../game/runTypes'
import { formationName } from '../sim/formation'
import { moveFormationSlot, setFormation, startingXI } from '../game/run'
import { lineupFor } from '../game/lineup'
import FormationEditor from '../ui/FormationEditor'
import type { RunApi } from './useRun'

/**
 * Aba Tática: o campinho compartilhado (`FormationEditor`) gravando direto no
 * estado da run. Os presets são atalhos para esquemas clássicos; quem ocupa
 * cada slot é decidido por `lineupFor` (o mesmo da partida), então o que se vê
 * aqui é exatamente o que entra em campo.
 */
export default function TacticsView({ state, act }: { state: RunState; act: RunApi['act'] }) {
  const slots = state.formationSlots
  const xi = lineupFor(startingXI(state), slots)

  return (
    <div className="tv">
      <div className="rq-simple-top">
        <p className="rq-simple-hint">
          Arraste os jogadores de linha pra remodelar o esquema — a posição vale de verdade na partida.
        </p>
        <span className="tv-name">{formationName(slots)}</span>
      </div>

      <FormationEditor
        slots={slots}
        xi={xi}
        onPreset={(presetSlots) => act((s) => setFormation(s, presetSlots))}
        onMove={(index, pos) => act((s) => moveFormationSlot(s, index, pos))}
      />
    </div>
  )
}
