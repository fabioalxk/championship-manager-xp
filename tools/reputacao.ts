/**
 * REPUTAÇÃO DO TÉCNICO (feature nova, career.ts) — começa em 25; +14 campeão,
 * +9 promovido, -8 rebaixado, +2 top-8, -3 pior; gate de OFERTAS em 45. Valida a
 * progressão: sucesso destrava ofertas, fracasso derruba, ritmo faz sentido.
 */
const START = 25, GATE = 45
const delta = (o: string) => o === 'champ' ? 14 : o === 'promo' ? 9 : o === 'releg' ? -8 : o === 'top8' ? 2 : -3
const trajectory = (path: string[]) => {
  let r = START; const out: number[] = []
  for (const o of path) { r = Math.max(0, Math.min(100, r + delta(o))); out.push(r) }
  return out
}

const paths: [string, string[]][] = [
  ['Ascensão (promove D→C→B→A, depois campeão)', ['promo', 'promo', 'promo', 'champ', 'champ']],
  ['Consolidado (top-8 estável na elite)', ['top8', 'top8', 'top8', 'top8', 'top8', 'top8']],
  ['Medíocre (meio de tabela ruim)', ['flop', 'flop', 'flop', 'flop', 'flop']],
  ['Fracasso (rebaixado seguido)', ['releg', 'releg', 'releg', 'flop']],
  ['Montanha-russa (sobe, cai, sobe)', ['promo', 'releg', 'promo', 'top8', 'champ']],
]

console.log('================================================================')
console.log(` REPUTAÇÃO DO TÉCNICO — começa ${START}, gate de ofertas ${GATE}`)
console.log('================================================================')
for (const [name, path] of paths) {
  const t = trajectory(path)
  const gateAt = t.findIndex((v) => v >= GATE)
  console.log(`\n  ${name}`)
  console.log(`   ${START} → ${t.join(' → ')}`)
  console.log(`   ${gateAt >= 0 ? `✅ destrava ofertas na temporada ${gateAt + 1}` : '— nunca chega no gate de ofertas'}`)
}
console.log('\n  ➤ ascensão/consolidado devem passar de 45 (ofertas); fracasso deve despencar. Ritmo ~2-3 temporadas p/ ofertas.')
