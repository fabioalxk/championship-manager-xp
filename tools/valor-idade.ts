/**
 * VALOR DE MERCADO por idade/overall (modelo econômico da carreira). Reproduz
 * valueOf (generate.ts): base = ((OVR-40)/10)^2.4 * 120k ; ageMul por faixa.
 * Valida se o valor sobe forte com overall e cai com a idade (realista).
 */
const valueOf = (overall: number, age: number): number => {
  const base = Math.pow(Math.max(0, overall - 40) / 10, 2.4) * 120_000
  const ageMul = age <= 24 ? 1.15 : age <= 28 ? 1 : age <= 31 ? 0.7 : 0.4
  return Math.round((base * ageMul) / 10_000) * 10_000
}
const M = (x: number) => 'R$ ' + (x / 1e6).toFixed(2) + 'M'

console.log('================================================================')
console.log(' VALOR DE MERCADO — modelo econômico da carreira')
console.log('================================================================')

console.log('\n  Valor por OVERALL (idade 24, pico):')
for (const o of [50, 60, 70, 80, 90, 95]) console.log(`   OVR ${o}: ${M(valueOf(o, 24))}`)

console.log('\n  Valor por IDADE (OVR 80 fixo):')
for (const a of [20, 24, 26, 29, 31, 33, 36]) console.log(`   ${a} anos: ${M(valueOf(80, a))}`)

console.log('\n  ➤ realista: valor cresce FORTE com overall (craque vale múltiplos) e cai da casa dos 29+.')
console.log('    ⚠️ nota: ageMul cai 1.15→1.0 já aos 25 (24yo vale mais que 26yo de mesmo OVR) — pico jovem.')
