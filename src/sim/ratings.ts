import type { Attrs, Player } from './types'

/** Normaliza um atributo 1..20 para 0..1. */
export const n20 = (v: number): number => v / 20

/** Velocidade máxima (m/s) a partir do ritmo, reduzida pelo cansaço. */
export const maxSpeed = (p: Player): number => {
  const base = 5.6 + n20(p.attrs.pace) * 3.6 // ~6.5 a 9.2 m/s
  const fatigue = 0.82 + 0.18 * p.energy // cansado fica mais lento
  return base * fatigue
}

/** Velocidade de um passe (m/s) conforme a força/passe. */
export const passSpeed = (a: Attrs): number => 13 + n20(a.passing) * 8

/** Velocidade de um chute (m/s) conforme finalização e força. */
export const shotSpeed = (a: Attrs): number =>
  22 + n20(a.finishing) * 7 + n20(a.strength) * 4

/** Espalhamento angular de um passe (rad) — quanto melhor o passe, menor. */
export const passSpread = (a: Attrs): number => (1 - n20(a.passing)) * 0.32

/** Espalhamento angular de um chute (rad) — quanto melhor a finalização, menor. */
export const shotSpread = (a: Attrs): number =>
  0.06 + (1 - n20(a.finishing)) * 0.45

/** Alcance de chute (m): finalizadores arriscam de mais longe. */
export const shootRangeOf = (a: Attrs, base: number): number =>
  base * (0.7 + n20(a.finishing) * 0.7)
