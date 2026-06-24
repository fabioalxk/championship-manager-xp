import type { Dir, Player, TeamId, Vec2 } from './types'
import { FIELD } from './constants'
import { rosterFor } from './teams'

/**
 * Posição-âncora real do jogador conforme a direção de ataque do time.
 * `formationPos` é dado em coordenadas "atacando para a direita" (dir = +1).
 */
export const homePos = (p: Player, dir: Dir): Vec2 =>
  dir === 1
    ? { ...p.formationPos }
    : { x: FIELD.w - p.formationPos.x, y: FIELD.h - p.formationPos.y }

/** Gol que o time ATACA, conforme sua direção. */
export const attackingGoalX = (dir: Dir): number => (dir === 1 ? FIELD.w : 0)

/** Gol que o time DEFENDE, conforme sua direção. */
export const defendingGoalX = (dir: Dir): number => (dir === 1 ? 0 : FIELD.w)

const buildTeam = (team: TeamId, idOffset: number, dir: Dir): Player[] =>
  rosterFor(team).map((s, i) => {
    const p: Player = {
      id: idOffset + i,
      number: s.number,
      name: s.name,
      team,
      role: s.role,
      attrs: s.attrs,
      formationPos: s.formationPos,
      pos: { x: 0, y: 0 },
      vel: { x: 0, y: 0 },
      energy: 1,
      stun: 0,
      yellow: false,
    }
    p.pos = homePos(p, dir)
    return p
  })

/** Gera os 22 jogadores. No 1º tempo o Brasil (home) ataca para a direita. */
export const buildPlayers = (): Player[] => [
  ...buildTeam('home', 0, 1),
  ...buildTeam('away', 100, -1),
]
