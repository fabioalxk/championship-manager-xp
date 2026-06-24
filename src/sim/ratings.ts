import type { Attrs, Player } from './types'
import { AI, CONTROL, DUEL, GK, MOVE, PHYS } from './constants'

/** Normaliza um atributo 0..100 para 0..1. Fonte única de escala. */
export const nrm = (v: number): number => v / 100

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v))

// =====================================================================
// FÍSICO
// =====================================================================

/** Velocidade máxima (m/s) a partir do ritmo, reduzida pelo cansaço (pace). */
export const maxSpeed = (p: Player): number => {
  const base = 5.6 + nrm(p.attrs.pace) * 3.6 // ~5.6 a 9.2 m/s
  const fatigue = 0.82 + 0.18 * p.energy // cansado fica mais lento
  return base * fatigue
}

/** Aceleração do jogador de linha (m/s²) — arranque (acceleration). */
export const outfieldAccel = (a: Attrs): number =>
  PHYS.playerAccel * (0.7 + nrm(a.acceleration) * 0.6)

/** Piso de curva efetivo: mais ágil vira sem frear tanto (agility). */
export const turnFloorOf = (a: Attrs): number =>
  clamp01(MOVE.turnFloor + nrm(a.agility) * 0.4)

/** Multiplicador da recuperação de energia (naturalFitness). */
export const recoverMul = (a: Attrs): number => 0.6 + nrm(a.naturalFitness) * 1.0

/** Resistência a cair/tropeçar no duelo, 0..1 (balance). */
export const knockResist = (a: Attrs): number => nrm(a.balance)

/** Competência aérea 0..1 — disputa de bola alta (jumping + heading). */
export const aerialPower = (a: Attrs): number =>
  nrm(a.jumping) * 0.5 + nrm(a.heading) * 0.5

// =====================================================================
// DOMÍNIO DA BOLA SOLTA
// =====================================================================

/** Raio para dominar a bola solta — firstTouch; bola alta exige disputa aérea. */
export const controlReach = (a: Attrs, ballSpeed: number): number => {
  const base = PHYS.controlRadius * (0.8 + nrm(a.firstTouch) * 0.5)
  const aerial = ballSpeed > CONTROL.loftSpeed ? aerialPower(a) * CONTROL.aerialReach : 0
  return base + aerial
}

/**
 * Chance de errar o primeiro toque — pior cansado, em bola forte e sem
 * firstTouch/composure/concentração. Matar uma bola rápida exige mais técnica.
 */
export const miscontrol = (p: Player, ballSpeed: number): number => {
  const a = p.attrs
  const skill = nrm(a.firstTouch) * 0.5 + nrm(a.composure) * 0.25 + nrm(a.concentration) * 0.25
  const tired = 1 - p.energy
  const hard = clamp01(ballSpeed / CONTROL.hardTouchSpeed) // bola forte é mais difícil
  return clamp01((1 - skill) * CONTROL.miscontrolScale * (0.6 + tired) * (0.7 + hard * 0.8))
}

// =====================================================================
// DUELO (chão)
// =====================================================================

/** Força do desarme 0..1 (tackling + strength). */
export const tacklePower = (a: Attrs): number =>
  nrm(a.tackling) * 0.6 + nrm(a.strength) * 0.4

/** Força de manter a bola no duelo 0..1 (dribbling + strength + balance). */
export const carryPower = (a: Attrs): number =>
  nrm(a.dribbling) * 0.55 + nrm(a.strength) * 0.3 + nrm(a.balance) * 0.15

/** Distância para se atirar ao desarme (m) — mais bravo, lunge de mais longe (bravery). */
export const tackleRange = (a: Attrs): number =>
  DUEL.range * (0.7 + nrm(a.bravery) * 0.6)

/** Multiplicador de velocidade do conduto — controle próximo (dribbling). */
export const dribbleSpeedMul = (a: Attrs): number =>
  PHYS.dribbleSpeed * (0.85 + nrm(a.dribbling) * 0.25)

// =====================================================================
// PASSE / CHUTE (variância e velocidade)
// =====================================================================

/** Espalhamento-base reduzido por technique e consistency (fonte única de variância). */
const spread = (skill: number, a: Attrs, baseScale: number, floor = 0): number => {
  const tech = 1 - nrm(a.technique) * 0.35
  const cons = 1 + (1 - nrm(a.consistency)) * 0.4
  return (floor + (1 - skill) * baseScale) * tech * cons
}

export const passSpeed = (a: Attrs): number => 13 + nrm(a.passing) * 8
export const passSpread = (a: Attrs): number => spread(nrm(a.passing), a, 0.2)

export const crossSpeed = (a: Attrs): number => 14 + nrm(a.crossing) * 8
export const crossSpread = (a: Attrs): number => spread(nrm(a.crossing), a, 0.26)

/** Velocidade do chute (m/s) — finalização + força. */
export const shotSpeed = (a: Attrs): number =>
  22 + nrm(a.finishing) * 7 + nrm(a.strength) * 4

/**
 * Espalhamento do chute: mistura finishing (perto) e longShots (longe);
 * composure reduz o erro sob pressão (far = 0..1 conforme a distância).
 */
export const shotSpread = (a: Attrs, far: number, pressured: boolean): number => {
  const acc = nrm(a.finishing) * (1 - far) + nrm(a.longShots) * far
  const panic = pressured ? (1 - nrm(a.composure)) * 0.12 : 0
  return spread(acc, a, 0.45, 0.06) + panic
}

/** Alcance de chute (m): finalizadores e chutadores de longe arriscam de mais longe. */
export const shootRangeOf = (a: Attrs, base: number): number =>
  base * (0.7 + nrm(a.finishing) * 0.5 + nrm(a.longShots) * 0.5)

// =====================================================================
// MENTAL (posicionamento e decisão)
// =====================================================================

/** Antecipação (s) da trajetória da bola ao interceptar (anticipation). */
export const chaseLead = (a: Attrs): number =>
  AI.chaseLead * (0.6 + nrm(a.anticipation) * 0.8)

/** Quão colado fica ao adversário sem bola, 0..1 (marking). */
export const markPull = (a: Attrs): number => nrm(a.marking)

/** Multiplicador de manutenção do bloco/apoio (teamwork). */
export const shapeMul = (a: Attrs): number => 0.7 + nrm(a.teamwork) * 0.6

/** Avanço das corridas no ataque (offTheBall). */
export const offBallAdvance = (a: Attrs): number => 0.6 + nrm(a.offTheBall) * 0.8

/**
 * Tempo máximo segurando a bola antes de decidir (s) — decisão escolhe o momento,
 * mas o REFLEXO (reação rápida) faz soltar mais cedo: quem tem reflexo alto toca,
 * chuta ou passa quase de primeira, sem dar tempo de ser roubado.
 */
export const holdMax = (a: Attrs): number =>
  AI.maxHold * (0.7 + nrm(a.decisions) * 0.6) * (1 - nrm(a.reflexes) * 0.4)

/** Magnitude do efeito (curva) dado ao chute (flair). */
export const flairSpin = (a: Attrs): number => 0.4 + nrm(a.flair) * 0.6

// =====================================================================
// GOLEIRO
// =====================================================================

/**
 * Velocidade do GK (m/s): dentro da área valem agilidade e arranque, não o
 * ritmo de corrida longa.
 */
export const gkMaxSpeed = (p: Player): number => {
  const a = p.attrs
  const base = 5.2 + nrm(a.agility) * 2.2 + nrm(a.acceleration) * 1.8
  const fatigue = 0.82 + 0.18 * p.energy
  return base * fatigue
}

/** Alcance-base do GK (m) — reflexo + agilidade. */
export const gkReach = (a: Attrs): number =>
  GK.reachBase + nrm(a.reflexes) * GK.reachReflex + nrm(a.agility) * GK.reachAgility

/** Habilidade-base de defesa do GK 0..1 (goalkeeping + reflexes + positioning). */
export const gkSaveBase = (a: Attrs): number =>
  nrm(a.goalkeeping) * 0.4 + nrm(a.reflexes) * 0.4 + nrm(a.positioning) * 0.2

/** Chance de SEGURAR (vs. espalmar) conforme handling e a força do chute. */
export const gkHoldChance = (a: Attrs, speed: number): number =>
  clamp01(GK.holdBase + nrm(a.handling) * GK.holdSkill - speed * GK.holdSpeedPen)

/**
 * Tempo (s) que o GK segura antes de distribuir — o REFLEXO manda: goleiro de
 * reflexo alto não fica dominando, solta rápido (toque ou chutão) e não dá tempo
 * de pressionarem. Reflexo baixo demora mais a se decidir.
 */
export const gkHoldTime = (a: Attrs): number =>
  GK.holdTime * (1 - nrm(a.reflexes) * 0.6)

/** Velocidade do tiro de meta longo (m/s) — kicking. */
export const gkKickSpeed = (a: Attrs): number =>
  GK.kickSpeedBase + nrm(a.kicking) * GK.kickSpeedSkill

/** Velocidade do lançamento/saída curta (m/s) — throwing. */
export const gkThrowSpeed = (a: Attrs): number =>
  GK.throwSpeedBase + nrm(a.throwing) * GK.throwSpeedSkill

/** Espalhamento (rad) da distribuição do GK — kicking/throwing e composure sob pressão. */
export const gkDistroSpread = (a: Attrs, long: boolean, pressured: boolean): number => {
  const skill = long ? a.kicking : a.throwing
  const base = (1 - nrm(skill)) * (long ? GK.longSpread : GK.shortSpread)
  const panic = pressured ? (1 - nrm(a.composure)) * GK.panicSpread : 0
  return base + panic
}

/** Nota geral do goleiro (0..100) para a UI, isolada do jogador de linha. */
export const gkRating = (a: Attrs): number => {
  const r =
    nrm(a.goalkeeping) * 0.22 +
    nrm(a.reflexes) * 0.2 +
    nrm(a.handling) * 0.14 +
    nrm(a.positioning) * 0.14 +
    nrm(a.oneOnOne) * 0.1 +
    nrm(a.aerialReach) * 0.08 +
    nrm(a.composure) * 0.06 +
    nrm(a.kicking) * 0.06
  return Math.round(r * 100)
}
