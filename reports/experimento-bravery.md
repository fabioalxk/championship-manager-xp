# Experimento de isolamento de atributo — `bravery`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **bravery = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive bravery). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 20.8s (208ms/partida).

## Gols

| | Teste (bravery=100) | Controle (bravery=50) |
|---|---|---|
| Média de gols/partida | 0.870 | 0.900 |
| Desvio padrão | 0.939 | 0.882 |
| Total de gols (100 partidas) | 87 | 90 |

**Diferença média (teste − controle): -0.030 gols/partida** (desvio padrão da diferença: 1.410)

**Teste t pareado:** t = -0.21, p = 0.8315
→ NÃO estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 37 (37.0%) | 26 (26.0%) | 37 (37.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 2.190 | 2.070 |
| Finalizações no alvo | 1.510 | 1.660 |
| Ticks de posse | 3332 | 3267 |
| Faltas cometidas (placebo — não deveria variar com bravery) | 0.670 | 0.620 |

## Conclusão

O atributo **bravery** não mostrou impacto estatisticamente significativo nos gols em 100 partidas isoladas.
