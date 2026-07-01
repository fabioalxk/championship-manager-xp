/**
 * Biblioteca compartilhada das simulações (attrsim.ts, confrontos.ts).
 * Reproduz VERBATIM as resoluções de engine.ts usando as funções/constantes
 * REAIS do motor. Fonte única — não duplicar fórmula em outro lugar.
 */
import {
  CARD, COLLIDE, DUEL, GK, GOAL, HEAD, SHOT,
} from '../src/sim/constants'
import {
  aerialPower, carryPower, gkSaveBase, miscontrol, nrm,
  shotSpeed, shotSpread, tacklePower,
} from '../src/sim/ratings'
import type { Attrs, Player, Role } from '../src/sim/types'

export const ATTR_KEYS = [
  'pace','acceleration','stamina','strength','agility','balance','jumping','naturalFitness',
  'tackling','marking','heading','firstTouch','passing','technique','dribbling','crossing','finishing','longShots','workRate',
  'vision','anticipation','positioning','offTheBall','decisions','composure','concentration','consistency','aggression','bravery','teamwork','flair',
  'goalkeeping','reflexes','handling','aerialReach','oneOnOne','kicking','throwing','communication',
]
export const A = (o: Partial<Attrs>): Attrs => ({
  ...(Object.fromEntries(ATTR_KEYS.map((k) => [k, 50])) as unknown as Attrs),
  ...o,
})
export const mkP = (attrs: Attrs, role: Role = 'FWD', energy = 1): Player => ({
  id: 0, number: 9, name: 'T', team: 'home', role, attrs,
  formationPos: { x: 0, y: 0 }, pos: { x: 0, y: 0 }, vel: { x: 0, y: 0 },
  prevPos: { x: 0, y: 0 }, smTarget: { x: 0, y: 0 }, settled: false,
  energy, stun: 0, burst: 0, knock: 0, downAmt: 0, ctrlAmt: 0, yellow: false, goals: 0,
})
export const rnd = () => Math.random()
export const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v))
export const pctMC = (n: number, trial: () => boolean) => {
  let c = 0
  for (let i = 0; i < n; i++) if (trial()) c++
  return (c / n) * 100
}

/** ruído angular do motor (ai.ts withNoise): erro uniforme ±spread rad. */
export const aimErr = (spread: number) => (rnd() - 0.5) * 2 * spread
/** passe/cruzamento "chega" se o desvio lateral no destino < tolerância. */
export const passLands = (spreadFn: number, distM: number, tol: number) =>
  Math.abs(distM * Math.tan(aimErr(spreadFn))) < tol

/** defesa do GK (engine.ts saveProbability) — posicionamento NEUTRO. cornerFrac 0..1. */
export const gkSaveProb = (gk: Attrs, speed: number, distM: number, cornerFrac: number) => {
  let p = GK.saveBase + gkSaveBase(gk) * GK.saveSkill
  p -= Math.max(0, speed - GK.saveSpeedFree) * GK.saveSpeedPen
  p -= clamp(cornerFrac, 0, 1.4) * GK.saveAnglePen
  p += 1 * GK.savePosBonus
  const near = clamp((GK.closeShot - distM) / GK.closeShot, 0, 1)
  p -= near * GK.saveClosePen
  p += near * nrm(gk.oneOnOne) * GK.oneOnOneBonus
  p += nrm(gk.communication) * GK.commandSave
  return clamp(p, GK.saveFloor, GK.saveCap)
}

/** chute → 'goal' | 'saved' | 'off'. Mira o CANTO (como aimShot+curva do motor). */
export const shotResult = (sh: Attrs, gk: Attrs, distM: number, pressured: boolean): 'goal' | 'saved' | 'off' => {
  const far = clamp((distM - 8) / 22, 0, 1)
  const spr = shotSpread(sh, far, pressured, 0.3)
  const aimOff = (GOAL.width / 2) * 0.8
  const lateral = aimOff + distM * Math.tan(aimErr(spr))
  if (Math.abs(lateral) > GOAL.width / 2) return 'off'
  const speed = shotSpeed(sh) + nrm(sh.longShots) * SHOT.speedLongShots * far
  const corner = Math.abs(lateral) / (GOAL.width / 2)
  if (rnd() < gkSaveProb(gk, speed, distM, corner)) return 'saved'
  if (rnd() < GK.secondChance * nrm(gk.reflexes)) return 'saved'
  return 'goal'
}

/** duelo 1v1: take-on (reproduz tryTackle). Encontro sustentado → desfecho. */
export const tackleEncounter = (att: Attrs, def: Attrs): 'through' | 'lost' | 'foul' => {
  for (let i = 0; i < 12; i++) {
    const beat = nrm(att.dribbling) * 0.6 + nrm(att.agility) * 0.4
    const read = nrm(def.anticipation) * 0.5 + nrm(def.positioning) * 0.5
    if (rnd() < clamp(DUEL.beatBase + (beat - read) * DUEL.beatSwing, 0, DUEL.beatCap)) return 'through'
    const commit = 1 + nrm(def.bravery) * DUEL.braveryCommit
    const winP = clamp(DUEL.baseWin + (tacklePower(def) - carryPower(att)) * DUEL.duelSwing * commit, 0.12, 0.92)
    if (rnd() < winP) return 'lost'
    const reachOut = rnd()
    const cleanCut = nrm(def.positioning) * 0.5 + nrm(def.anticipation) * 0.5
    const foulP = DUEL.foulBase + nrm(def.aggression) * DUEL.foulAggr +
      reachOut * (DUEL.foulOverreach + nrm(def.bravery) * DUEL.foulBravery) * (1 - cleanCut * DUEL.foulClean)
    if (rnd() < foulP) return 'foul'
  }
  return 'through'
}

/** dividida aérea (engine.ts ballCandidate): vence menor distância EFETIVA. */
export const aerialWin = (a: Attrs, b: Attrs) => {
  const da = 1 + rnd() * 2, db = 1 + rnd() * 2
  return da - aerialPower(a) * 1.4 < db - aerialPower(b) * 1.4 // CONTROL.aerialDuelEdge
}

/** amortecer bola solta forte (engine.ts ballPlayerCollisions): controla? */
export const cushions = (p: Attrs, lofted: boolean, speed: number) => {
  const skill = (lofted ? nrm(p.heading) * 0.7 + nrm(p.jumping) * 0.3
    : nrm(p.firstTouch) * 0.6 + nrm(p.anticipation) * 0.4) + nrm(p.strength) * COLLIDE.cushionStrength
  const brave = nrm(p.bravery) * clamp((speed - COLLIDE.minSpeed) / COLLIDE.minSpeed, 0, 1) * COLLIDE.cushionBravery
  return rnd() < COLLIDE.cushionBase + skill * COLLIDE.cushionSkill + brave
}

/** cabeçada a gol (engine.ts): enquadrou no gol? */
export const headerOnGoal = (p: Attrs, distM: number) => {
  const ah = aerialPower(p)
  if (rnd() >= clamp(HEAD.base + ah * HEAD.skill + nrm(p.composure) * HEAD.composure, HEAD.floor, HEAD.cap)) return false
  const scat = HEAD.scatter * (1 - nrm(p.heading) * HEAD.scatterAim)
  return Math.abs(distM * Math.tan(aimErr(scat))) < GOAL.width / 2
}

/** falta+cartão num bote falhado (engine.ts). */
export const foulCard = (def: Attrs): 'foul' | 'card' | 'red' | 'ok' => {
  const reachOut = rnd()
  const cleanCut = nrm(def.positioning) * 0.5 + nrm(def.anticipation) * 0.5
  const foulP = DUEL.foulBase + nrm(def.aggression) * DUEL.foulAggr +
    reachOut * (DUEL.foulOverreach + nrm(def.bravery) * DUEL.foulBravery) * (1 - cleanCut * DUEL.foulClean)
  if (rnd() >= foulP) return 'ok'
  const cardP = CARD.base + nrm(def.aggression) * CARD.aggressionWeight
  if (rnd() >= cardP) return 'foul'
  const redFrac = CARD.straightRedFrac * (1 + nrm(def.aggression) * CARD.straightRedAggr)
  return rnd() < redFrac ? 'red' : 'card'
}

/** miscontrol → % de domínio limpo de bola forte. */
export const cleanControlPct = (a: Attrs, ballSpeed: number) => 100 * (1 - miscontrol(mkP(a), ballSpeed))
