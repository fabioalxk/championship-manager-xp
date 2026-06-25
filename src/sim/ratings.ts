import type { Attrs, Player } from './types'
import { AI, CONTROL, DUEL, GK, MOVE, PHYS, SHOT } from './constants'

/** Normaliza um atributo 0..100 para 0..1. Fonte única de escala. */
export const nrm = (v: number): number => v / 100

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v))

// =====================================================================
// FÍSICO
// =====================================================================

/** Velocidade máxima (m/s) a partir do ritmo, reduzida pelo cansaço (pace). */
export const maxSpeed = (p: Player): number => {
  // aceleração soma à velocidade EFETIVA: nas distâncias curtas da partida quem
  // arranca melhor passa mais tempo no topo (não só na rampa inicial)
  const base = 5.4 + nrm(p.attrs.pace) * 4.3 + nrm(p.attrs.acceleration) * MOVE.accelTopEnd
  // baixa stamina aprofunda a queda de ritmo quando a energia cai (não só dreno)
  const fatigueDrop = 0.18 + (1 - nrm(p.attrs.stamina)) * 0.12
  const fatigue = 1 - fatigueDrop * (1 - p.energy)
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

/** Manter-se em pé sob desafio 0..1 — equilíbrio domina, pés ágeis ajudam (balance + agility). */
export const footing = (a: Attrs): number =>
  clamp01(nrm(a.balance) * 0.75 + nrm(a.agility) * 0.25)

/** Competência aérea 0..1 — disputa de bola alta (jumping + heading + balance no contato). */
export const aerialPower = (a: Attrs): number =>
  nrm(a.jumping) * 0.6 + nrm(a.heading) * 0.3 + nrm(a.balance) * 0.1 // impulsão/alcance, cabeceio, firmeza no choque

// =====================================================================
// DOMÍNIO DA BOLA SOLTA
// =====================================================================

/** Raio para dominar a bola solta — firstTouch; bola alta exige disputa aérea. */
export const controlReach = (a: Attrs, ballSpeed: number): number => {
  const base = PHYS.controlRadius * (0.7 + nrm(a.firstTouch) * 0.7) // 1º toque puxa mais a bola
  const aerial = ballSpeed > CONTROL.loftSpeed ? aerialPower(a) * CONTROL.aerialReach : 0
  return base + aerial
}

/**
 * Chance de errar o primeiro toque — pior cansado, em bola forte e sem
 * firstTouch/composure/concentração. Matar uma bola rápida exige mais técnica.
 */
export const miscontrol = (p: Player, ballSpeed: number): number => {
  const a = p.attrs
  const skill = nrm(a.firstTouch) * 0.6 + nrm(a.composure) * 0.4
  // concentração amortece o erro causado pelo CANSAÇO (lapso de fim de jogo)
  const tired = (1 - p.energy) * (1 - nrm(a.concentration) * 0.6)
  const hard = clamp01(ballSpeed / CONTROL.hardTouchSpeed) // bola forte é mais difícil
  return clamp01((1 - skill) * CONTROL.miscontrolScale * (0.6 + tired) * (0.7 + hard * 0.8))
}

// =====================================================================
// DUELO (chão)
// =====================================================================

/** Força do desarme 0..1 (tackling + strength). */
export const tacklePower = (a: Attrs): number =>
  nrm(a.tackling) * 0.55 + nrm(a.strength) * 0.3 + nrm(a.positioning) * 0.15 // posicionar/cronometrar o bote

/** Força de manter a bola no duelo 0..1 (dribbling + strength + balance + agility). */
export const carryPower = (a: Attrs): number =>
  nrm(a.dribbling) * 0.45 + nrm(a.strength) * 0.25 + nrm(a.balance) * 0.2 + nrm(a.agility) * 0.1

/** Distância para se atirar ao desarme (m) — a BRAVURA atira de mais longe e o
 *  EMPENHO (workRate) faz fechar/comprometer-se mais cedo no bote. */
export const tackleRange = (a: Attrs): number =>
  DUEL.range * (0.9 + nrm(a.bravery) * 0.45 + nrm(a.workRate) * 0.25)

/** Multiplicador de velocidade do conduto — controle próximo (dribbling). */
export const dribbleSpeedMul = (a: Attrs): number =>
  PHYS.dribbleSpeed * (0.78 + nrm(a.dribbling) * 0.5)

// =====================================================================
// PASSE / CHUTE (variância e velocidade)
// =====================================================================

/** Espalhamento-base reduzido por technique e consistency (fonte única de variância). */
const spread = (skill: number, a: Attrs, baseScale: number, floor = 0): number => {
  const tech = 1 - nrm(a.technique) * 0.5
  const cons = 1 + (1 - nrm(a.consistency)) * 0.4
  return (floor + (1 - skill) * baseScale) * tech * cons
}

export const passSpeed = (a: Attrs): number => 12 + nrm(a.passing) * 11
// passe ganha um piso de erro e faixa maior: passador ruim espalha bem mais e o
// craque erra quase nada — antes 0..0.2 era plano demais e não separava os perfis.
export const passSpread = (a: Attrs, pressured = false): number =>
  spread(nrm(a.passing), a, 0.28, 0.015) + (pressured ? (1 - nrm(a.composure)) * 0.12 : 0)

export const crossSpeed = (a: Attrs): number => 14 + nrm(a.crossing) * 8
export const crossSpread = (a: Attrs, pressured = false): number =>
  spread(nrm(a.crossing), a, 0.26) + (pressured ? (1 - nrm(a.composure)) * 0.12 : 0)

/** Velocidade do chute (m/s) — POTÊNCIA vem sobretudo da força; a finalização ajuda a bater firme. */
export const shotSpeed = (a: Attrs): number =>
  SHOT.speedBase + nrm(a.strength) * SHOT.speedStrength + nrm(a.finishing) * SHOT.speedFinishing

/**
 * Espalhamento do chute: mistura finishing (perto) e longShots (longe);
 * composure reduz o erro sob pressão (far = 0..1 conforme a distância).
 */
export const shotSpread = (a: Attrs, far: number, pressured: boolean, power = 0): number => {
  const acc = nrm(a.finishing) * (1 - far) + nrm(a.longShots) * far
  // composure aperta a mira SEMPRE (sangue-frio finaliza colocado), e dobra de
  // peso sob pressão (pânico abre o chute). Flair afia o chute decidido de perto.
  const calm = (1 - nrm(a.composure)) * (pressured ? 0.2 : 0.08)
  const flairTrim = nrm(a.flair) * (1 - far) * 0.1
  // bater FORTE custa mira; a TÉCNICA tempera (craque martela e acerta o ângulo)
  const powerCost = power * (1 - nrm(a.technique)) * SHOT.powerSpread
  return Math.max(0.02, spread(acc, a, 0.55, 0.06) - flairTrim + calm + powerCost)
}

/** Alcance de chute (m): finalizadores e chutadores de longe arriscam de mais longe. */
export const shootRangeOf = (a: Attrs, base: number): number =>
  // flair levanta a AMBIÇÃO: o ousado arrisca o petardo de longe que o sóbrio nem
  // cogita (a precisão de longe ainda vem de longShots no shotSpread).
  base * (0.7 + nrm(a.finishing) * 0.5 + nrm(a.longShots) * 0.5 + nrm(a.flair) * 0.2)

// =====================================================================
// MENTAL (posicionamento e decisão)
// =====================================================================

/** Antecipação (s) da trajetória da bola ao interceptar (anticipation). */
export const chaseLead = (a: Attrs): number =>
  AI.chaseLead * (0.6 + nrm(a.anticipation) * 0.8) * (0.85 + nrm(a.acceleration) * 0.3)

/** Quão colado fica ao adversário sem bola, 0..1 (marking). */
export const markPull = (a: Attrs): number =>
  clamp01(nrm(a.marking) * 0.8 + nrm(a.anticipation) * 0.2) // ler a corrida aperta a marcação

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
  // alinha o cansaço ao jogador de linha: baixa stamina aprofunda a queda
  const fatigueDrop = 0.18 + (1 - nrm(a.stamina)) * 0.12
  const fatigue = 1 - fatigueDrop * (1 - p.energy)
  return base * fatigue
}

/** Alcance-base do GK (m) — reflexo + agilidade. */
export const gkReach = (a: Attrs): number =>
  GK.reachBase + nrm(a.reflexes) * GK.reachReflex + nrm(a.agility) * GK.reachAgility

/** Habilidade-base de defesa do GK 0..1 (goalkeeping + reflexes + positioning). */
export const gkSaveBase = (a: Attrs): number =>
  nrm(a.goalkeeping) * 0.36 + nrm(a.reflexes) * 0.36 + nrm(a.handling) * 0.1 + nrm(a.positioning) * 0.18

/**
 * Chance de SEGURAR (vs. espalmar): as MÃOS (handling) seguram e os REFLEXOS
 * (pulso firme) ajudam a encaixar mesmo o chute forte; a bola forte dificulta.
 */
export const gkHoldChance = (a: Attrs, speed: number): number =>
  clamp01(
    GK.holdBase +
      (nrm(a.handling) * GK.holdSkill + nrm(a.reflexes) * GK.holdReflex) -
      speed * GK.holdSpeedPen * (1 - nrm(a.handling) * GK.holdSpeedHands),
  )

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

/** Alcance (m) do chutão de alívio — kicking manda longe (da área ao meio-campo). */
export const gkKickReach = (a: Attrs): number =>
  GK.goalKickReach * (GK.kickReachFloor + nrm(a.kicking) * GK.kickReachSkill)

/**
 * Quão bem o GK lê e confia na direção mais livre ao distribuir, 0..1. Goleiro
 * decidido/frio enxerga o leque limpo e foge do atacante; o fraco chuta reto.
 */
export const gkDistroQuality = (a: Attrs): number =>
  clamp01(0.2 + nrm(a.decisions) * 0.4 + nrm(a.composure) * 0.2 + nrm(a.vision) * 0.2)

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
