import type { Dir, FreeKickKind, Player, Role, TeamId, Vec2 } from './types'
import { AREA, FIELD, FREEKICK } from './constants'
import { FORMATION_433, rosterFor, type SeedPlayer } from './teams'
import { dist, vec } from './vector'

// ----------------------------------------------------------------------------
// ESQUEMAS TÁTICOS — a formação é só a lista das 11 âncoras (`formationPos`);
// a FUNÇÃO de cada slot (DEF/MID/FWD) é derivada da posição da âncora, então
// arrastar um jogador de linha para outra faixa do campo muda sua função.
// ----------------------------------------------------------------------------

/** Função tática de um slot, derivada da faixa do campo onde a âncora está. */
export const roleForSlot = (index: number, slot: Vec2): Role =>
  index === 0 ? 'GK' : slot.x < 30 ? 'DEF' : slot.x < 58 ? 'MID' : 'FWD'

export const rolesFor = (slots: Vec2[]): Role[] => slots.map((s, i) => roleForSlot(i, s))

/** Nome do esquema ("4-3-3", "3-5-2"…) contado a partir das funções dos slots. */
export const formationName = (slots: Vec2[]): string => {
  const roles = rolesFor(slots)
  const count = (r: Role) => roles.filter((x) => x === r).length
  return `${count('DEF')}-${count('MID')}-${count('FWD')}`
}

/** Limites de arrasto de uma âncora: dentro do campo e fora da zona do goleiro. */
export const clampSlot = (p: Vec2): Vec2 => ({
  x: Math.max(10, Math.min(95, p.x)),
  y: Math.max(4, Math.min(64, p.y)),
})

/** Presets de formação (coordenadas "atacando para a DIREITA", em metros). */
export const FORMATION_PRESETS: Record<string, Vec2[]> = {
  '4-3-3': FORMATION_433,
  '4-4-2': [
    { x: 5, y: 34 }, // GK
    { x: 20, y: 12 }, // LD
    { x: 17, y: 27 }, // ZAG
    { x: 17, y: 41 }, // ZAG
    { x: 20, y: 56 }, // LE
    { x: 44, y: 13 }, // MD
    { x: 40, y: 27 }, // MC
    { x: 40, y: 41 }, // MC
    { x: 44, y: 55 }, // ME
    { x: 71, y: 27 }, // ATA
    { x: 71, y: 41 }, // ATA
  ],
  '3-5-2': [
    { x: 5, y: 34 }, // GK
    { x: 17, y: 19 }, // ZAG
    { x: 15, y: 34 }, // ZAG
    { x: 17, y: 49 }, // ZAG
    { x: 40, y: 9 }, // ALA D
    { x: 42, y: 25 }, // MC
    { x: 37, y: 34 }, // MC
    { x: 42, y: 43 }, // MC
    { x: 40, y: 59 }, // ALA E
    { x: 71, y: 27 }, // ATA
    { x: 71, y: 41 }, // ATA
  ],
  '3-4-3': [
    { x: 5, y: 34 }, // GK
    { x: 17, y: 19 }, // ZAG
    { x: 15, y: 34 }, // ZAG
    { x: 17, y: 49 }, // ZAG
    { x: 42, y: 13 }, // MD
    { x: 38, y: 26 }, // MC
    { x: 38, y: 42 }, // MC
    { x: 42, y: 55 }, // ME
    { x: 71, y: 15 }, // PD
    { x: 73, y: 34 }, // CA
    { x: 71, y: 53 }, // PE
  ],
}

/** Cópia mutável do esquema padrão (4-3-3) — âncoras iniciais de uma run. */
export const defaultFormation = (): Vec2[] => FORMATION_433.map((s) => ({ ...s }))

/**
 * Troca a tática DURANTE a partida: reaponta a âncora (e a função derivada) de
 * cada jogador em campo do time. O id do jogador codifica seu slot (offset do
 * time + índice, ver `buildTeam`), então o mapeamento sobrevive a expulsões.
 */
export const applyFormation = (players: Player[], team: TeamId, slots: Vec2[]): void => {
  if (slots.length !== 11) return
  for (const p of players) {
    if (p.team !== team) continue
    const i = p.id % 100
    p.formationPos = { ...slots[i] }
    p.role = roleForSlot(i, slots[i])
  }
}

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
