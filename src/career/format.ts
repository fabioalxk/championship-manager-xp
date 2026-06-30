import type { Division } from '../game/types'

export const divisionName = (d: Division): string => `Série ${d}`

/** Faixas de classificação para colorir a tabela conforme a divisão. */
export const zoneOf = (
  position: number,
  total: number,
  division: Division,
): 'promo' | 'releg' | 'title' | null => {
  if (position === 1) return 'title'
  if (division !== 'A' && position <= 4) return 'promo'
  if (division !== 'D' && position > total - 4) return 'releg'
  return null
}
