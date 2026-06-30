import { rand, seedRng } from '../sim/rng'

/**
 * Gerador determinístico portátil (envolve o mulberry32 do motor). Mesma seed
 * → mesma sequência: elencos, tabelas e resultados rápidos reproduzíveis.
 */
export interface Rng {
  /** float em [0,1) */
  next: () => number
  /** inteiro em [min, max] */
  int: (min: number, max: number) => number
  /** float em [min, max) */
  range: (min: number, max: number) => number
  /** escolhe um item do array */
  pick: <T>(arr: T[]) => T
  /** ~normal(0,1) (soma de uniformes), p/ ruído suave */
  gauss: () => number
}

export const makeRng = (seed: number): Rng => {
  const s = { rngState: seedRng(seed) }
  const next = () => rand(s)
  return {
    next,
    int: (min, max) => Math.floor(next() * (max - min + 1)) + min,
    range: (min, max) => min + next() * (max - min),
    pick: (arr) => arr[Math.floor(next() * arr.length)],
    gauss: () => (next() + next() + next() + next() - 2) / 2,
  }
}

/** Combina dois inteiros numa seed estável (hash simples). */
export const mixSeed = (a: number, b: number): number =>
  ((a * 73856093) ^ (b * 19349663)) >>> 0
