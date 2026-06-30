import type { Rng } from './random'

/** Vantagem de jogar em casa, somada à força do mandante. */
const HOME_ADVANTAGE = 4

/** Amostra de Poisson (algoritmo de Knuth) usando o rng determinístico. */
const poisson = (lambda: number, rng: Rng): number => {
  const L = Math.exp(-lambda)
  let k = 0
  let p = 1
  do {
    k++
    p *= rng.next()
  } while (p > L)
  return k - 1
}

/**
 * Gols esperados (λ) de um time conforme sua força de ataque vs. a do rival.
 * Quanto maior a diferença, mais gols o mais forte tende a fazer.
 */
const expectedGoals = (attack: number, defense: number): number => {
  const diff = (attack - defense) / 12
  return Math.max(0.18, 1.35 + diff)
}

export interface QuickResult {
  homeGoals: number
  awayGoals: number
}

/**
 * Resultado rápido por força (usado em todas as partidas que o jogador não
 * assiste). Coerente com os mesmos ratings do motor, mas instantâneo.
 */
export const quickResult = (
  homeStrength: number,
  awayStrength: number,
  rng: Rng,
): QuickResult => {
  const h = homeStrength + HOME_ADVANTAGE
  const a = awayStrength
  return {
    homeGoals: poisson(expectedGoals(h, a), rng),
    awayGoals: poisson(expectedGoals(a, h), rng),
  }
}
