import type { Attrs, Role } from '../sim/types'
import { gkRating, nrm } from '../sim/ratings'

/**
 * Atributos que definem a nota geral por posição (pesos somam ~1). Reaproveita a
 * mesma escala 0..100 do motor — a nota reflete o que a simulação realmente usa.
 */
const WEIGHTS: Record<Exclude<Role, 'GK'>, Partial<Record<keyof Attrs, number>>> = {
  DEF: { tackling: 0.36, positioning: 0.24, strength: 0.2, pace: 0.1, passing: 0.1 },
  MID: { passing: 0.3, positioning: 0.2, tackling: 0.16, dribbling: 0.18, strength: 0.16 },
  FWD: { finishing: 0.38, pace: 0.2, dribbling: 0.2, positioning: 0.14, firstTouch: 0.08 },
}

/** Nota geral 0..100 de um jogador, isolando o goleiro (usa gkRating do motor). */
export const overallOf = (role: Role, attrs: Attrs): number => {
  if (role === 'GK') return gkRating(attrs)
  const w = WEIGHTS[role]
  let sum = 0
  let total = 0
  for (const k in w) {
    const weight = w[k as keyof Attrs]!
    sum += nrm(attrs[k as keyof Attrs]) * weight
    total += weight
  }
  return Math.round((sum / total) * 100)
}
