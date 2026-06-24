/**
 * PRNG determinístico (mulberry32) preso ao estado da partida.
 * Trocar `Math.random()` por isto torna a partida reprodutível a partir de
 * uma seed — habilita replays, depuração de movimento e interpolação consistente.
 */

/** Normaliza uma seed para um inteiro de 32 bits sem sinal. */
export const seedRng = (seed: number): number => seed >>> 0

/** Próximo float em [0,1), avançando (e mutando) o estado do gerador. */
export const rand = (s: { rngState: number }): number => {
  s.rngState = (s.rngState + 0x6d2b79f5) >>> 0
  let t = s.rngState
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
