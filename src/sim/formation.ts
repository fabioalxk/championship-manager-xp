import type { Dir, FreeKickKind, Player, TeamId, Vec2 } from './types'
import { AREA, FIELD, FREEKICK } from './constants'
import { rosterFor, type SeedPlayer } from './teams'
import { dist, vec } from './vector'

/** Elencos customizados (modo carreira). Ausente → usa Brasil×Argentina da demo. */
export interface Rosters {
  home: SeedPlayer[]
  away: SeedPlayer[]
}

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

/**
 * Classifica um TIRO LIVRE pelo LOCAL da falta (Lei 13) — a REGRA única que decide
 * o que se faz com a bola parada, para o motor e a IA nunca divergirem:
 *  • `direct` — perto e DENTRO do cone central (a zona clássica do "D"): bate-se
 *    DIRETO ao gol, por cima da barreira;
 *  • `cross`  — avançado o bastante para ameaçar, mas FORA do cone (de lado) ou um
 *    pouco além do alcance do chute: ALÇA-SE na área para o cabeceio (cruzamento);
 *  • `far`    — longe do gol: RECOMPÕE-SE a jogada com um passe (cobrança rápida).
 * `atkGx` é o gol atacado pelo time que cobra (`attackingGoalX`).
 */
export const freeKickKind = (spot: Vec2, atkGx: number): FreeKickKind => {
  const dGoal = dist(spot, vec(atkGx, FIELD.cy))
  const lateral = Math.abs(spot.y - FIELD.cy)
  if (lateral < FREEKICK.directCone && dGoal < FREEKICK.directMaxDist) return 'direct'
  if (dGoal < FREEKICK.launchDist) return 'cross'
  return 'far'
}

/** O ponto está dentro da grande área cujo gol fica em `goalX` (0 ou FIELD.w)? */
export const inPenaltyArea = (pos: Vec2, goalX: number): boolean => {
  const inX =
    goalX === 0
      ? pos.x <= AREA.penaltyDepth
      : pos.x >= FIELD.w - AREA.penaltyDepth
  return inX && Math.abs(pos.y - FIELD.cy) <= AREA.penaltyHalfWidth
}

const buildTeam = (
  team: TeamId,
  idOffset: number,
  dir: Dir,
  roster: SeedPlayer[] = rosterFor(team),
): Player[] =>
  roster.map((s, i) => {
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
      prevPos: { x: 0, y: 0 },
      smTarget: { x: 0, y: 0 },
      settled: false,
      energy: 1,
      stun: 0,
      burst: 0,
      knock: 0,
      downAmt: 0,
      ctrlAmt: 0,
      yellow: false,
      goals: 0,
    }
    p.pos = homePos(p, dir)
    p.prevPos = { ...p.pos }
    p.smTarget = { ...p.pos }
    return p
  })

/** Gera os 22 jogadores. No 1º tempo o time da casa ataca para a direita. */
export const buildPlayers = (rosters?: Rosters): Player[] => [
  ...buildTeam('home', 0, 1, rosters?.home),
  ...buildTeam('away', 100, -1, rosters?.away),
]
