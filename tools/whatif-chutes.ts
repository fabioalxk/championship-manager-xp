/**
 * WHAT-IF: VOLUME DE CHUTE × FORÇA DO GK. Mostra que o placar realista pode vir de
 * "muitos chutes + GK normal" OU de "poucos chutes + GK fraco" — e que a rota
 * realista é a primeira. Mede a conversão por chute (GK atual) e simula um GK
 * normal, cruzando com volumes de chute pra estimar gols/jogo.
 */
import { GK, GOAL, SHOT } from '../src/sim/constants'
import { gkSaveBase, nrm, shotSpeed, shotSpread } from '../src/sim/ratings'
import { A, aimErr, clamp, pctMC, rnd } from './_simlib'

// conversão por chute da ÁREA (~11m) para um GK, variando o "poder" do save.
const conv = (saveBase: number, saveSkill: number) => pctMC(300_000, () => {
  const sh = A({ finishing: 55 }), gk = A({ goalkeeping: 55, reflexes: 55, oneOnOne: 55 })
  const d = 8 + Math.floor(rnd() * 8) // 8..16m (grosso dos chutes)
  const far = clamp((d - 8) / 22, 0, 1)
  const spr = shotSpread(sh, far, false, 0.3)
  const aimOff = (GOAL.width / 2) * 0.8
  const lat = aimOff + d * Math.tan(aimErr(spr))
  if (Math.abs(lat) > GOAL.width / 2) return false
  const speed = shotSpeed(sh) + nrm(sh.longShots) * SHOT.speedLongShots * far
  const corner = Math.abs(lat) / (GOAL.width / 2)
  let p = saveBase + gkSaveBase(gk) * saveSkill
  p -= Math.max(0, speed - GK.saveSpeedFree) * GK.saveSpeedPen
  p -= corner * GK.saveAnglePen
  p += 1 * GK.savePosBonus
  const near = clamp((GK.closeShot - d) / GK.closeShot, 0, 1)
  p -= near * GK.saveClosePen
  p += near * nrm(gk.oneOnOne) * GK.oneOnOneBonus
  return rnd() >= clamp(p, GK.saveFloor, GK.saveCap)
})

const cAtual = conv(GK.saveBase, GK.saveSkill) / 100 // GK atual (fraco)
const cNormal = conv(0.30, 0.45) / 100 // GK "normal" (valores antigos)

console.log('================================================================')
console.log(' WHAT-IF: chutes × GK — quantos gols/jogo? (alvo ~2.6)')
console.log('================================================================')
console.log(`\n  Conversão por chute da área (finalizador 55):`)
console.log(`   GK ATUAL (saveBase ${GK.saveBase}/skill ${GK.saveSkill}): ${(cAtual * 100).toFixed(0)}%`)
console.log(`   GK NORMAL (0.30/0.45):                    ${(cNormal * 100).toFixed(0)}%`)
console.log('\n  Gols/jogo estimados (chutes × conversão · ~85% dos chutes vão à área):')
console.log('   chutes/jogo    GK atual    GK normal')
for (const shots of [5, 10, 15, 20, 25]) {
  const eff = shots * 0.85
  console.log(`   ${String(shots).padStart(6)}       ${(eff * cAtual).toFixed(1).padStart(6)}      ${(eff * cNormal).toFixed(1).padStart(6)}`)
}
console.log('\n  ➤ hoje: ~5.5 chutes × GK fraco = ~2.6 gols (rota frágil).')
console.log('    alvo: ~25 chutes × GK normal ≈ 2.6 gols (rota realista: muitos chutes, GK forte, GK importa).')
