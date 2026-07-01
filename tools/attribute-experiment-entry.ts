import { writeFileSync } from 'node:fs'
import { runExperiment, type MatchOutcome } from '../src/game/experiments/attributeExperiment'
import type { Attrs } from '../src/sim/types'

const attr = (process.argv[2] ?? 'pace') as keyof Attrs
const trials = Number(process.argv[3] ?? 1000)
const baseSeed = Number(process.argv[4] ?? 20260701)

const mean = (xs: number[]): number => xs.reduce((a, b) => a + b, 0) / xs.length
const std = (xs: number[]): number => {
  const m = mean(xs)
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1))
}
/** Aproximação de Abramowitz-Stegun p/ a função erro (CDF normal), sem libs externas. */
const erf = (x: number): number => {
  const sign = x < 0 ? -1 : 1
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911
  const t = 1 / (1 + p * Math.abs(x))
  const y = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x)
  return sign * y
}
/** p-valor bicaudal de um teste t com n grande (~normal). */
const pValueTwoTailed = (t: number): number => {
  const z = Math.abs(t)
  return 1 - erf(z / Math.sqrt(2))
}

const t0 = Date.now()
const results: MatchOutcome[] = runExperiment(attr, trials, baseSeed)
const ms = Date.now() - t0

const testGoals = results.map((r) => r.testGoals)
const controlGoals = results.map((r) => r.controlGoals)
const diffGoals = results.map((r) => r.testGoals - r.controlGoals)
const testShots = results.map((r) => r.testShots)
const controlShots = results.map((r) => r.controlShots)
const testSOT = results.map((r) => r.testShotsOnTarget)
const controlSOT = results.map((r) => r.controlShotsOnTarget)
const testPoss = results.map((r) => r.testPossessionTicks)
const controlPoss = results.map((r) => r.controlPossessionTicks)
const testFouls = results.map((r) => r.testFouls)
const controlFouls = results.map((r) => r.controlFouls)

const wins = results.filter((r) => r.testGoals > r.controlGoals).length
const draws = results.filter((r) => r.testGoals === r.controlGoals).length
const losses = results.filter((r) => r.testGoals < r.controlGoals).length

const dMean = mean(diffGoals)
const dStd = std(diffGoals)
const tStat = dMean / (dStd / Math.sqrt(trials))
const pValue = pValueTwoTailed(tStat)

const fmt = (n: number, d = 3): string => n.toFixed(d)

const report = `# Experimento de isolamento de atributo — \`${attr}\`

Metodologia: ${trials} partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **${attr} = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive ${attr}). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (${baseSeed} + i·104729) — reproduzível.

Tempo total: ${(ms / 1000).toFixed(1)}s (${(ms / trials).toFixed(0)}ms/partida).

## Gols

| | Teste (${attr}=100) | Controle (${attr}=50) |
|---|---|---|
| Média de gols/partida | ${fmt(mean(testGoals))} | ${fmt(mean(controlGoals))} |
| Desvio padrão | ${fmt(std(testGoals))} | ${fmt(std(controlGoals))} |
| Total de gols (${trials} partidas) | ${testGoals.reduce((a, b) => a + b, 0)} | ${controlGoals.reduce((a, b) => a + b, 0)} |

**Diferença média (teste − controle): ${fmt(dMean)} gols/partida** (desvio padrão da diferença: ${fmt(dStd)})

**Teste t pareado:** t = ${fmt(tStat, 2)}, p ${pValue < 0.0001 ? '< 0.0001' : `= ${fmt(pValue, 4)}`}
${Math.abs(tStat) > 1.96 ? '→ Estatisticamente significativo (95%).' : '→ NÃO estatisticamente significativo (95%).'}

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| ${wins} (${fmt((wins / trials) * 100, 1)}%) | ${draws} (${fmt((draws / trials) * 100, 1)}%) | ${losses} (${fmt((losses / trials) * 100, 1)}%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | ${fmt(mean(testShots))} | ${fmt(mean(controlShots))} |
| Finalizações no alvo | ${fmt(mean(testSOT))} | ${fmt(mean(controlSOT))} |
| Ticks de posse | ${fmt(mean(testPoss), 0)} | ${fmt(mean(controlPoss), 0)} |
| Faltas cometidas (placebo — não deveria variar com ${attr}) | ${fmt(mean(testFouls))} | ${fmt(mean(controlFouls))} |

## Conclusão

${
  Math.abs(tStat) <= 1.96
    ? `O atributo **${attr}** não mostrou impacto estatisticamente significativo nos gols em ${trials} partidas isoladas.`
    : dMean > 0
      ? `O atributo **${attr}** teve impacto **positivo** e estatisticamente significativo: o time com ${attr}=100 marcou em média ${fmt(dMean)} gols/partida a mais que o controle (tudo 50).`
      : `O atributo **${attr}** teve impacto **negativo** e estatisticamente significativo: o time com ${attr}=100 marcou em média ${fmt(Math.abs(dMean))} gols/partida a MENOS que o controle — investigar possível bug na fórmula/consumo deste atributo.`
}
`

const outPath = `reports/experimento-${String(attr)}.md`
writeFileSync(outPath, report, 'utf-8')

const jsonOut = {
  attr: String(attr),
  trials,
  baseSeed,
  ms,
  testGoalsMean: mean(testGoals),
  controlGoalsMean: mean(controlGoals),
  testGoalsStd: std(testGoals),
  controlGoalsStd: std(controlGoals),
  diffMean: dMean,
  diffStd: dStd,
  tStat,
  pValue,
  significant: Math.abs(tStat) > 1.96,
  wins,
  draws,
  losses,
  testShotsMean: mean(testShots),
  controlShotsMean: mean(controlShots),
  testSOTMean: mean(testSOT),
  controlSOTMean: mean(controlSOT),
  testPossMean: mean(testPoss),
  controlPossMean: mean(controlPoss),
  testFoulsMean: mean(testFouls),
  controlFoulsMean: mean(controlFouls),
}
writeFileSync(`reports/json/${String(attr)}.json`, JSON.stringify(jsonOut, null, 2), 'utf-8')

console.log(report)
console.log(`\nRelatório salvo em ${outPath}`)
