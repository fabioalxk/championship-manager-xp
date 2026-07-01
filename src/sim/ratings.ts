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
  const base = 4.6 + nrm(p.attrs.pace) * 5.5 + nrm(p.attrs.acceleration) * MOVE.accelTopEnd
  // baixo FÍSICO (strength, cobre o fôlego) aprofunda a queda de ritmo com a energia
  const fatigueDrop = 0.1 + (1 - nrm(p.attrs.strength)) * 0.45
  const fatigue = 1 - fatigueDrop * (1 - p.energy)
  // lesão/pancada: um jogador machucado joga MANCANDO (perde ritmo) — `knock` já
  // vem limitado (nunca zera a velocidade), some devagar no correr da partida.
  return base * fatigue * (1 - p.knock)
}

/** Aceleração do jogador de linha (m/s²) — arranque (acceleration). */
export const outfieldAccel = (a: Attrs): number =>
  PHYS.playerAccel * (0.55 + nrm(a.acceleration) * 0.9)

/** Piso de curva efetivo: mais ágil vira sem frear tanto (acceleration cobre agilidade). */
export const turnFloorOf = (a: Attrs): number =>
  clamp01(MOVE.turnFloor + nrm(a.acceleration) * 0.55)

/** Multiplicador da recuperação de energia (strength cobre o antigo fôlego). */
export const recoverMul = (a: Attrs): number => 0.6 + nrm(a.strength) * 1.0

/** Resistência a cair/tropeçar no duelo, 0..1 (strength cobre o antigo balance). */
export const knockResist = (a: Attrs): number => nrm(a.strength)

/** Manter-se em pé sob desafio 0..1 — firmeza física (strength). */
export const footing = (a: Attrs): number => nrm(a.strength)

/** Competência aérea 0..1 — disputa de bola alta (strength cobre impulsão + cabeceio). */
export const aerialPower = (a: Attrs): number => nrm(a.strength)

// =====================================================================
// DOMÍNIO DA BOLA SOLTA
// =====================================================================

/** Raio para dominar a bola solta — firstTouch; bola alta exige disputa aérea. */
export const controlReach = (a: Attrs, ballSpeed: number): number => {
  const base = PHYS.controlRadius * (0.5 + nrm(a.firstTouch) * 1.1) // 1º toque puxa mais a bola
  const aerial = ballSpeed > CONTROL.loftSpeed ? aerialPower(a) * CONTROL.aerialReach : 0
  return base + aerial
}

/**
 * Chance de errar o primeiro toque — pior cansado, em bola forte e sem
 * firstTouch/composure (frieza cobre a decisão). O FÍSICO (strength, cobre o
 * fôlego) amortece o erro causado pelo cansaço.
 */
export const miscontrol = (p: Player, ballSpeed: number): number => {
  const a = p.attrs
  const skill = nrm(a.firstTouch) * 0.55 + nrm(a.positioning) * 0.45
  // físico alto amortece o erro causado pelo CANSAÇO (lapso de fim de jogo)
  const tired = (1 - p.energy) * (1 - nrm(a.strength) * 0.6)
  const hard = clamp01(ballSpeed / CONTROL.hardTouchSpeed) // bola forte é mais difícil
  return clamp01((1 - skill) * CONTROL.miscontrolScale * (0.6 + tired) * (0.7 + hard * 0.8))
}

// =====================================================================
// DUELO (chão)
// =====================================================================

/** Força do desarme 0..1 — a DEFESA (tackling, cobre a marcação) domina. */
export const tacklePower = (a: Attrs): number =>
  nrm(a.tackling) * 0.9 + nrm(a.strength) * 0.1

/** Força de manter a bola no duelo 0..1 (dribbling, que cobre o talento/flair, + físico). */
export const carryPower = (a: Attrs): number =>
  nrm(a.dribbling) * 0.7 + nrm(a.strength) * 0.3

/** Distância para se atirar ao desarme (m) — o bom DEFENSOR fecha o bote de mais longe. */
export const tackleRange = (a: Attrs): number =>
  DUEL.range * (0.85 + nrm(a.tackling) * 0.85)

/** Multiplicador de velocidade do conduto — controle próximo (dribbling). */
export const dribbleSpeedMul = (a: Attrs): number =>
  PHYS.dribbleSpeed * (0.63 + nrm(a.dribbling) * 0.8)

// =====================================================================
// PASSE / CHUTE (variância e velocidade)
// =====================================================================

/** Espalhamento-base do passe — o PASSE (cobre a antiga técnica) manda em tudo;
 *  a frieza (composure, cobre a decisão) tira o resto do erro. */
const spread = (a: Attrs, baseScale: number, floor = 0): number => {
  const dec = 1 - nrm(a.positioning) * 0.25
  return (floor + (1 - nrm(a.passing)) * baseScale) * dec
}

export const passSpeed = (a: Attrs): number => 9 + nrm(a.passing) * 17
// passe ganha um piso de erro e faixa maior: passador ruim espalha bem mais e o
// craque erra quase nada — é o que separa o meia que "encaixa" do que entrega.
export const passSpread = (a: Attrs, pressured = false): number =>
  spread(a, 0.55, 0.01) + (pressured ? (1 - nrm(a.positioning)) * 0.14 : 0)

// cruzamento é "passe alçado" — reaproveita passing.
export const crossSpeed = (a: Attrs): number => 14 + nrm(a.passing) * 8
export const crossSpread = (a: Attrs, pressured = false): number =>
  spread(a, 0.45) + (pressured ? (1 - nrm(a.positioning)) * 0.14 : 0)

/** Velocidade do chute (m/s) — POTÊNCIA vem sobretudo do físico; a finalização ajuda a bater firme. */
export const shotSpeed = (a: Attrs): number =>
  SHOT.speedBase + nrm(a.strength) * SHOT.speedStrength + nrm(a.finishing) * SHOT.speedFinishing

/**
 * Espalhamento do chute: a FINALIZAÇÃO domina a mira em qualquer distância;
 * composure reduz o erro sob pressão; o drible/talento (flair) afia o chute
 * decidido de perto (far = 0..1 conforme a distância).
 */
export const shotSpread = (a: Attrs, far: number, pressured: boolean, power = 0): number => {
  const acc = nrm(a.finishing)
  // composure aperta a mira SEMPRE (sangue-frio finaliza colocado), e dobra de
  // peso sob pressão (pânico abre o chute).
  const calm = (1 - nrm(a.positioning)) * (pressured ? 0.3 : 0.18)
  const flairTrim = nrm(a.dribbling) * (1 - far) * 0.35
  // bater FORTE custa mira; o bom finalizador tempera (martela e acerta o ângulo)
  const powerCost = power * (1 - nrm(a.finishing)) * SHOT.powerSpread
  // dispersão própria do chute (tunável em SHOT) — NÃO usa o spread() de passe,
  // para poder calibrar a conversão de gol sem mexer no passe/cruzamento.
  const base = SHOT.spreadFloor + (1 - acc) * SHOT.spreadScale
  return Math.max(0.02, base - flairTrim + calm + powerCost)
}

/** Alcance de chute (m): finalizadores arriscam de mais longe; o talento (dribbling) ousa o petardo. */
export const shootRangeOf = (a: Attrs, base: number): number =>
  base * (0.7 + nrm(a.finishing) * 1.0 + nrm(a.dribbling) * 0.4)

// =====================================================================
// MENTAL (posicionamento e decisão)
// =====================================================================

/** Antecipação (s) da trajetória da bola ao interceptar (positioning cobre anticipation). */
export const chaseLead = (a: Attrs): number =>
  AI.chaseLead * (0.5 + nrm(a.positioning) * 1.0) * (0.8 + nrm(a.acceleration) * 0.4)

/** Quão colado fica ao adversário sem bola, 0..1 — a DEFESA (tackling cobre a marcação). */
export const markPull = (a: Attrs): number =>
  clamp01(nrm(a.tackling) * 0.8 + nrm(a.positioning) * 0.2) // ler a corrida aperta a marcação

/** Multiplicador de manutenção do bloco/apoio (positioning cobre a antiga teamwork). */
export const shapeMul = (a: Attrs): number => 0.6 + nrm(a.positioning) * 0.8

/** Avanço das corridas no ataque (positioning cobre a antiga offTheBall). */
export const offBallAdvance = (a: Attrs): number => 0.5 + nrm(a.positioning) * 1.0

/**
 * Tempo máximo segurando a bola antes de decidir (s) — o AFOBADO/indeciso enrola
 * e demora a soltar (mais tempo pro marcador chegar); o FRIO (composure, cobre a
 * decisão e o reflexo de linha) solta na hora certa, quase de primeira.
 */
export const holdMax = (a: Attrs): number =>
  AI.maxHold * (1.6 - nrm(a.positioning) * 1.2)

/** Magnitude do efeito (curva) dado ao chute — o talento é o drible (cobre o flair). */
export const flairSpin = (a: Attrs): number => 0.4 + nrm(a.dribbling) * 0.6

// =====================================================================
// GOLEIRO — UM atributo (goalkeeping) concentra todos os canais
// =====================================================================

/**
 * Velocidade do GK (m/s): dentro da área valem o arranque e a reação
 * (goalkeeping), não o ritmo de corrida longa.
 */
export const gkMaxSpeed = (p: Player): number => {
  const a = p.attrs
  const base = 5.2 + nrm(a.acceleration) * 2.5 + nrm(a.goalkeeping) * 1.5
  const fatigueDrop = 0.1 + (1 - nrm(a.strength)) * 0.45
  const fatigue = 1 - fatigueDrop * (1 - p.energy)
  return base * fatigue
}

/** Alcance-base do GK (m) — goalkeeping cobre o antigo reflexo/agilidade. */
export const gkReach = (a: Attrs): number =>
  GK.reachBase + nrm(a.goalkeeping) * (GK.reachReflex + GK.reachAgility)

/** Habilidade-base de defesa do GK 0..1 — goalkeeping é o atributo único do posto. */
export const gkSaveBase = (a: Attrs): number =>
  nrm(a.goalkeeping) * 0.85 + nrm(a.positioning) * 0.15

/**
 * Chance de SEGURAR (vs. espalmar): goalkeeping cobre as antigas mãos e o
 * reflexo; a bola forte dificulta, mas o goleiraço encaixa mesmo o petardo.
 */
export const gkHoldChance = (a: Attrs, speed: number): number =>
  clamp01(
    GK.holdBase +
      nrm(a.goalkeeping) * (GK.holdSkill + GK.holdReflex) -
      speed * GK.holdSpeedPen * (1.4 - nrm(a.goalkeeping) * GK.holdSpeedHands),
  )

/** Tempo (s) que o GK segura antes de distribuir — goleiro melhor solta mais rápido. */
export const gkHoldTime = (a: Attrs): number =>
  GK.holdTime * (1 - nrm(a.goalkeeping) * 0.6)

/** Velocidade do tiro de meta longo (m/s) — físico manda na potência. */
export const gkKickSpeed = (a: Attrs): number =>
  GK.kickSpeedBase + nrm(a.strength) * GK.kickSpeedSkill

/** Alcance (m) do chutão de alívio — físico manda longe (da área ao meio-campo). */
export const gkKickReach = (a: Attrs): number =>
  GK.goalKickReach * (GK.kickReachFloor + nrm(a.strength) * GK.kickReachSkill)

/**
 * Quão bem o GK lê e confia na direção mais livre ao distribuir, 0..1. Goleiro
 * frio/decidido enxerga o leque limpo e foge do atacante; o fraco chuta reto.
 */
export const gkDistroQuality = (a: Attrs): number =>
  clamp01(0.15 + nrm(a.positioning) * 0.85)

/** Velocidade do lançamento/saída curta (m/s) — passing cobre a antiga throwing. */
export const gkThrowSpeed = (a: Attrs): number =>
  GK.throwSpeedBase + nrm(a.passing) * GK.throwSpeedSkill

/** Espalhamento (rad) da distribuição do GK — físico/passe e composure sob pressão. */
export const gkDistroSpread = (a: Attrs, long: boolean, pressured: boolean): number => {
  const skill = long ? a.strength : a.passing
  const base = (1 - nrm(skill)) * (long ? GK.longSpread : GK.shortSpread)
  const panic = pressured ? (1 - nrm(a.positioning)) * GK.panicSpread : 0
  return base + panic
}

/** Nota geral do goleiro (0..100) para a UI, isolada do jogador de linha. */
export const gkRating = (a: Attrs): number => {
  const r =
    nrm(a.goalkeeping) * 0.62 +
    nrm(a.positioning) * 0.2 +
    nrm(a.strength) * 0.1 +
    nrm(a.acceleration) * 0.08
  return Math.round(r * 100)
}
