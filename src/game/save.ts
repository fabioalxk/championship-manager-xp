import type { CareerState } from './types'
import { ensureIdAbove } from './generate'

const KEY = 'cm-career-save-v1'

/** Há uma carreira salva no navegador? */
export const hasSave = (): boolean => {
  try {
    return localStorage.getItem(KEY) !== null
  } catch {
    return false
  }
}

/** Persiste a carreira no localStorage. */
export const saveCareer = (state: CareerState): void => {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    /* armazenamento indisponível — ignora silenciosamente */
  }
}

/** Carrega a carreira salva (ou null). Reajusta o contador de ids gerados. */
export const loadCareer = (): CareerState | null => {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const state = JSON.parse(raw) as CareerState
    let maxId = 0
    for (const club of Object.values(state.clubs)) {
      for (const p of club.squad) maxId = Math.max(maxId, p.id)
    }
    for (const m of state.market) maxId = Math.max(maxId, m.id)
    ensureIdAbove(maxId)
    return state
  } catch {
    return null
  }
}

/** Apaga a carreira salva. */
export const clearSave = (): void => {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignora */
  }
}
