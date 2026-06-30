/**
 * CONFRONTOS 2-lados: varia atacante E defensor pra responder às perguntas de
 * intuição de futebol — "é mais difícil driblar um zagueiro melhor?", "o chute
 * do mais forte é mais rápido?", "% de gol de longe do mais forte vs GK 50?".
 * Usa _simlib.ts (mesmas fórmulas reais do motor).
 */
import { shotSpeed } from '../src/sim/ratings'
import { SHOT } from '../src/sim/constants'
import { nrm } from '../src/sim/ratings'
import type { Attrs } from '../src/sim/types'
import { A, pctMC, shotResult, tackleEncounter, aerialWin } from './_simlib'

const N = 80_000
const pct = (x: number) => x.toFixed(0).padStart(5)

/** imprime uma matriz: linhas = atacante, colunas = defensor. cell() devolve nº. */
const matrix = (
  title: string, sub: string, rowLbl: string, rows: number[], colLbl: string, cols: number[],
  cell: (r: number, c: number) => number, suffix = '%',
) => {
  console.log(`\n### ${title}`)
  console.log(`   ${sub}`)
  console.log(`   ${rowLbl} ↓  ${colLbl} →`)
  console.log('        ' + cols.map((c) => String(c).padStart(6)).join(''))
  for (const r of rows) {
    const line = cols.map((c) => pct(cell(r, c)) + suffix.padEnd(1)).join('')
    console.log(`   ${String(r).padStart(4)}  ${line}`)
  }
}

console.log('================================================================')
console.log(' CONFRONTOS — atacante × defensor (N=' + N + ', fórmulas reais)')
console.log('================================================================')

// "defesa" = pacote defensivo (tackling/positioning/anticipation/marking/strength)
const DEF = (lvl: number): Attrs => A({ tackling: lvl, positioning: lvl, anticipation: lvl, marking: lvl, strength: lvl })
// "ataque/drible" = drible + agilidade (a habilidade de passar pelo homem)
const ATT = (lvl: number): Attrs => A({ dribbling: lvl, agility: Math.min(95, lvl + 5) })

// 1) DRIBLE: é mais difícil passar por um zagueiro melhor? (deve cair → direita)
matrix(
  '1. DRIBLE — % que PASSA e segue com a bola',
  'sobe ↓ (atacante melhor) · cai → (zagueiro melhor). Esperado: craque vs perna-de-pau alto; some vs zagueirão.',
  'drible', [40, 60, 80, 100], 'defesa', [30, 50, 70, 90],
  (r, c) => pctMC(N, () => tackleEncounter(ATT(r), DEF(c)) === 'through'),
)

// 1b) e quanto o atacante PERDE A BOLA (desarmado) no mesmo confronto
matrix(
  '1b. DRIBLE — % que PERDE a bola (desarmado)',
  'deve SUBIR → (zagueiro melhor) e cair ↓ (atacante melhor).',
  'drible', [40, 60, 80, 100], 'defesa', [30, 50, 70, 90],
  (r, c) => pctMC(N, () => tackleEncounter(ATT(r), DEF(c)) === 'lost'),
)

// 2) CHUTE: o mais forte chuta mais rápido? (velocidade pura, m/s)
console.log('\n### 2. VELOCIDADE DO CHUTE (m/s) por FORÇA')
console.log('   força:    30     50     70     90    100')
const fLevels = [30, 50, 70, 90, 100]
console.log('   m/s:  ' + fLevels.map((f) => shotSpeed(A({ strength: f })).toFixed(1).padStart(6)).join('') )
console.log('   (+longe) ' + fLevels.map((f) => (shotSpeed(A({ strength: f })) + nrm(100) * SHOT.speedLongShots).toFixed(1).padStart(6)).join('') + '  (com longShots 100, chute de longe)')

// 3) FINALIZAÇÃO × GOLEIRO: % de gol por chute (da ÁREA, ~11 m)
matrix(
  '3. FINALIZAÇÃO (área ~11m) — % de GOL por chute',
  'finalizador ↓ × goleiro →. Esperado: artilheiro fura GK fraco; trava no GK bom.',
  'finish', [40, 60, 80, 100], 'GK', [30, 50, 70, 90],
  (r, c) => pctMC(N, () => shotResult(A({ finishing: r }), A({ goalkeeping: c, reflexes: c, oneOnOne: c }), 11, false) === 'goal'),
)

// 4) CHUTE DE LONGE: jogador FORÇA MÁXIMA vs GK 50 — o que você pediu.
console.log('\n### 4. CHUTE DE LONGE — força 100 (+longShots) vs GOLEIRO 50')
console.log('   % de GOL por chute, por distância:')
const gk50 = A({ goalkeeping: 50, reflexes: 50, oneOnOne: 50 })
const shooterPower = (ls: number) => A({ strength: 100, finishing: 70, longShots: ls })
console.log('   dist:        18m    22m    26m    30m')
for (const ls of [50, 70, 90, 100]) {
  const cells = [18, 22, 26, 30].map((d) =>
    pctMC(N, () => shotResult(shooterPower(ls), gk50, d, false) === 'goal').toFixed(1).padStart(6) + '%')
  console.log(`   longShots ${String(ls).padStart(3)} ${cells.join(' ')}`)
}
console.log('   (força 100 dá potência; longShots dá MIRA de longe — sem mira, força sozinha erra o gol)')

// 5) DUELO AÉREO: impulsão A × impulsão B (% A ganha)
matrix(
  '5. DUELO AÉREO — % que o atacante GANHA o salto',
  'impulsão atacante ↓ × impulsão defensor →.',
  'jump', [40, 60, 80, 100], 'jump', [30, 50, 70, 90],
  (r, c) => pctMC(N, () => aerialWin(A({ jumping: r }), A({ jumping: c }))),
)

// 6) TAXA DE DEFESA do GK em chutes NO ALVO — localiza a conversão alta.
//    Real: goleiro segura ~65-75% dos chutes ENQUADRADOS. Mistura de distâncias.
console.log('\n### 6. TAXA DE DEFESA do GK (% dos chutes NO ALVO que ele PEGA)')
console.log('   finalizador 50 · distâncias 8-24m sorteadas · real ~65-75%')
console.log('   GK:        30     50     70     90')
const shooter = A({ finishing: 50, longShots: 50, strength: 70 })
const saveRates = [30, 50, 70, 90].map((gk) => {
  let onTarget = 0, saved = 0
  const G = A({ goalkeeping: gk, reflexes: gk, handling: gk, oneOnOne: gk, positioning: gk })
  for (let i = 0; i < N; i++) {
    const d = 8 + Math.floor(Math.random() * 17) // 8..24m
    const r = shotResult(shooter, G, d, false)
    if (r === 'off') continue
    onTarget++
    if (r === 'saved') saved++
  }
  return (saved / onTarget) * 100
})
console.log('   defesa%: ' + saveRates.map((v) => v.toFixed(1).padStart(6) + '%').join(' '))
console.log('   (se um GK 50 segura bem menos que ~65%, a fórmula de defesa está fraca → conversão alta)')

console.log('\n✅ Lê assim: cada célula é a % do confronto direto. Veja se cai/sobe na direção certa.')
