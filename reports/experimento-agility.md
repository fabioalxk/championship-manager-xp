# Experimento de isolamento de atributo — `agility`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **agility = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive agility). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 17.6s (176ms/partida).

## Gols

| | Teste (agility=100) | Controle (agility=50) |
|---|---|---|
| Média de gols/partida | 0.900 | 0.870 |
| Desvio padrão | 0.798 | 0.981 |
| Total de gols (100 partidas) | 90 | 87 |

**Diferença média (teste − controle): 0.030 gols/partida** (desvio padrão da diferença: 1.329)

**Teste t pareado:** t = 0.23, p = 0.8214
→ NÃO estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 41 (41.0%) | 25 (25.0%) | 34 (34.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 2.360 | 1.990 |
| Finalizações no alvo | 1.800 | 1.860 |
| Ticks de posse | 3362 | 3263 |
| Faltas cometidas (placebo — não deveria variar com agility) | 0.720 | 0.470 |

## Conclusão

O atributo **agility** não mostrou impacto estatisticamente significativo nos gols em 100 partidas isoladas.
