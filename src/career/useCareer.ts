import { useCallback, useRef, useState } from 'react'
import type { CareerState } from '../game/types'
import { newCareer } from '../game/career'
import { clearSave, loadCareer, saveCareer } from '../game/save'

/**
 * Estado da carreira. As funções do motor mutam o estado IN PLACE; o hook guarda
 * o objeto num ref e força o re-render por versão (evita clonar elencos inteiros
 * a cada ação e dispensar o problema de updaters impuros do StrictMode).
 */
export interface CareerApi {
  state: CareerState | null
  /** aplica uma mutação no estado, salva e re-renderiza */
  act: (fn: (s: CareerState) => void) => void
  /** começa nova carreira */
  start: (managerName: string, clubId: string) => void
  /** apaga o save e volta ao menu inicial */
  reset: () => void
}

export const useCareer = (): CareerApi => {
  const ref = useRef<CareerState | null>(null)
  if (ref.current === null) ref.current = loadCareer()
  const [, setVersion] = useState(0)
  const render = useCallback(() => setVersion((v) => v + 1), [])

  const act = useCallback(
    (fn: (s: CareerState) => void) => {
      if (!ref.current) return
      fn(ref.current)
      saveCareer(ref.current)
      render()
    },
    [render],
  )

  const start = useCallback(
    (managerName: string, clubId: string) => {
      const seed = (Date.now() ^ (Math.floor(Math.random() * 0xffffffff))) >>> 0
      ref.current = newCareer(managerName, clubId, seed)
      saveCareer(ref.current)
      render()
    },
    [render],
  )

  const reset = useCallback(() => {
    clearSave()
    ref.current = null
    render()
  }, [render])

  return { state: ref.current, act, start, reset }
}
