import type { RunState } from './runTypes'
import { ensureIdAbove } from './generate'

const KEY = 'cm-run-save-v1'

/** Há uma corrida salva no navegador? */
export const hasRunSave = (): boolean => {
  try {
    return localStorage.getItem(KEY) !== null
  } catch {
    return false
  }
}

/** Persiste a corrida no localStorage. */
export const saveRun = (state: RunState): void => {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* armazenamento indisponível — ignora silenciosamente */
  }
}

/** Carrega a corrida salva (ou null). Reajusta o contador de ids gerados. */
export const loadRun = (): RunState | null => {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const state = JSON.parse(raw) as RunState
    let maxId = 0
    for (const p of state.squad) maxId = Math.max(maxId, p.id)
    for (const n of state.nodes) for (const p of n.opponent?.squad ?? []) maxId = Math.max(maxId, p.id)
    for (const p of state.pendingReward ?? []) maxId = Math.max(maxId, p.id)
    ensureIdAbove(maxId)
    return state
  } catch {
    return null
  }
}

/** Apaga a corrida salva (game over / vitória / nova corrida). */
export const clearRunSave = (): void => {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignora */
  }
}
