/** Lê reports/json/<attr>.json (gerados por attribute-experiment-entry.ts) e monta
 *  o relatorioAtributos.md consolidado, com tabela geral + seções por categoria. */
import { readFileSync, writeFileSync, readdirSync } from 'node:fs'

const CATEGORIES = [
  {
    name: 'Físico',
    attrs: ['pace', 'acceleration', 'agility', 'balance', 'jumping', 'strength', 'stamina', 'naturalFitness', 'workRate'],
  },
  {
    name: 'Técnico',
    attrs: ['dribbling', 'firstTouch', 'technique', 'passing', 'crossing', 'finishing', 'longShots', 'heading', 'tackling', 'marking'],
  },
  {
    name: 'Mental',
    attrs: ['vision', 'anticipation', 'positioning', 'offTheBall', 'decisions', 'composure', 'concentration', 'consistency', 'aggression', 'bravery', 'teamwork', 'flair'],
  },
  {
    name: 'Goleiro',
    attrs: ['goalkeeping', 'reflexes', 'handling', 'aerialReach', 'oneOnOne', 'kicking', 'throwing', 'communication'],
  },
]

const ALL_ATTRS = CATEGORIES.flatMap((c) => c.attrs)

const files = readdirSync('reports/json')
const data = {}
for (const attr of ALL_ATTRS) {
  const path = `reports/json/${attr}.json`
  if (!files.includes(`${attr}.json`)) {
    console.error(`FALTANDO: ${path}`)
    continue
  }
  data[attr] = JSON.parse(readFileSync(path, 'utf-8'))
}

const missing = ALL_ATTRS.filter((a) => !data[a])
if (missing.length > 0) {
  console.error(`Atributos sem resultado: ${missing.join(', ')}`)
}

const fmt = (n, d = 3) => n.toFixed(d)
const categoryOf = (attr) => CATEGORIES.find((c) => c.attrs.includes(attr))?.name ?? '?'

const verdict = (d) => {
  if (!d.significant) return 'sem efeito'
  return d.diffMean > 0 ? 'POSITIVO' : 'NEGATIVO'
}

const present = ALL_ATTRS.filter((a) => data[a])
const ranked = [...present].sort((a, b) => Math.abs(data[b].diffMean) - Math.abs(data[a].diffMean))

let md = `# Relatório de Experimentos de Isolamento de Atributo

Cada atributo listado em \`atributos.md\` foi testado isoladamente: 11×11, motor
físico real (\`src/sim/engine.ts\`), 1000 partidas completas por atributo.
Todos os jogadores dos dois times começam com **todos os atributos em 50**. Em
cada partida, o time **Teste** tem o atributo em questão em **100** para os 11
jogadores; o time **Controle** mantém **tudo em 50** (inclusive esse atributo).
O mando de campo do time Teste alterna a cada partida para cancelar o viés do
pontapé inicial. Seeds determinísticas (reprodutível) — ver \`src/game/experiments/attributeExperiment.ts\`.

"Diferença" = gols/partida do Teste − gols/partida do Controle. Teste t pareado,
95% de confiança (|t| > 1.96 ⇒ significativo).

## Ranking geral — do maior para o menor impacto em gols

| # | Atributo | Categoria | Gols Teste | Gols Controle | Diferença | p-valor | Resultado |
|---|---|---|---|---|---|---|---|
${ranked
  .map((a, i) => {
    const d = data[a]
    const p = d.pValue < 0.0001 ? '< 0.0001' : fmt(d.pValue, 4)
    return `| ${i + 1} | ${a} | ${categoryOf(a)} | ${fmt(d.testGoalsMean)} | ${fmt(d.controlGoalsMean)} | ${d.diffMean >= 0 ? '+' : ''}${fmt(d.diffMean)} | ${p} | ${verdict(d)} |`
  })
  .join('\n')}

---

`

for (const cat of CATEGORIES) {
  md += `## ${cat.name}\n\n`
  md += `| Atributo | Gols Teste | Gols Controle | Diferença | Finalizações T/C | Finaliz. no alvo T/C | Posse T/C | Faltas T/C | V / E / D (Teste) | p-valor | Resultado |\n`
  md += `|---|---|---|---|---|---|---|---|---|---|---|\n`
  for (const attr of cat.attrs) {
    const d = data[attr]
    if (!d) {
      md += `| ${attr} | (sem dados) | | | | | | | | | |\n`
      continue
    }
    const p = d.pValue < 0.0001 ? '< 0.0001' : fmt(d.pValue, 4)
    const wdl = `${((d.wins / d.trials) * 100).toFixed(0)}% / ${((d.draws / d.trials) * 100).toFixed(0)}% / ${((d.losses / d.trials) * 100).toFixed(0)}%`
    md += `| **${attr}** | ${fmt(d.testGoalsMean)} | ${fmt(d.controlGoalsMean)} | ${d.diffMean >= 0 ? '+' : ''}${fmt(d.diffMean)} | ${fmt(d.testShotsMean, 2)} / ${fmt(d.controlShotsMean, 2)} | ${fmt(d.testSOTMean, 2)} / ${fmt(d.controlSOTMean, 2)} | ${fmt(d.testPossMean, 0)} / ${fmt(d.controlPossMean, 0)} | ${fmt(d.testFoulsMean, 2)} / ${fmt(d.controlFoulsMean, 2)} | ${wdl} | ${p} | ${verdict(d)} |\n`
  }
  md += '\n'
}

const significant = present.filter((a) => data[a].significant)
const notSignificant = present.filter((a) => !data[a].significant)
const positive = significant.filter((a) => data[a].diffMean > 0).sort((a, b) => data[b].diffMean - data[a].diffMean)
const negative = significant.filter((a) => data[a].diffMean < 0).sort((a, b) => data[a].diffMean - data[b].diffMean)

md += `## Conclusão

- **${significant.length}/${present.length} atributos** tiveram impacto estatisticamente significativo (95%) nos gols quando isolados.
- **${notSignificant.length}/${present.length} atributos** não mostraram efeito detectável nesta metodologia (isolar 1 atributo, 1000 partidas): ${notSignificant.length > 0 ? notSignificant.join(', ') : 'nenhum'}.

### Maior impacto POSITIVO (mais gols)
${positive.slice(0, 8).map((a, i) => `${i + 1}. **${a}**: ${data[a].diffMean >= 0 ? '+' : ''}${fmt(data[a].diffMean)} gols/partida`).join('\n')}

${negative.length > 0 ? `### Impacto NEGATIVO (menos gols que o controle)\n${negative.map((a) => `- **${a}**: ${fmt(data[a].diffMean)} gols/partida`).join('\n')}\n` : ''}

Relatórios individuais completos (com estatísticas de placebo e detalhes) em \`reports/experimento-<atributo>.md\`.
`

writeFileSync('relatorioAtributos.md', md, 'utf-8')
console.log(`relatorioAtributos.md gerado com ${present.length}/${ALL_ATTRS.length} atributos.`)
if (missing.length > 0) console.log(`Faltando: ${missing.join(', ')}`)
