import type { Vec2 } from './types'

/** Helpers de vetor 2D — funções puras, sem mutação. */

export const vec = (x: number, y: number): Vec2 => ({ x, y })

export const add = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y })

export const sub = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y })

export const scale = (a: Vec2, k: number): Vec2 => ({ x: a.x * k, y: a.y * k })

export const len = (a: Vec2): number => Math.hypot(a.x, a.y)

export const dist = (a: Vec2, b: Vec2): number => Math.hypot(a.x - b.x, a.y - b.y)

/** Vetor unitário (retorna (0,0) se o vetor for nulo). */
export const norm = (a: Vec2): Vec2 => {
  const l = len(a)
  return l > 1e-9 ? { x: a.x / l, y: a.y / l } : { x: 0, y: 0 }
}

/** Limita o comprimento de um vetor a `max`. */
export const limit = (a: Vec2, max: number): Vec2 => {
  const l = len(a)
  return l > max ? scale(a, max / l) : a
}

/** Direção unitária de `from` para `to`. */
export const dirTo = (from: Vec2, to: Vec2): Vec2 => norm(sub(to, from))

/** Interpolação linear escalar. */
export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

/** Interpolação linear entre dois pontos. */
export const lerpV = (a: Vec2, b: Vec2, t: number): Vec2 => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t),
})

/** Vetor perpendicular (girado 90° à esquerda). */
export const perp = (a: Vec2): Vec2 => ({ x: -a.y, y: a.x })
