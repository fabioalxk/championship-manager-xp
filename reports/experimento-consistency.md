# Experimento de isolamento de atributo — `consistency`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **consistency = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive consistency). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 21.0s (210ms/partida).

## Gols

| | Teste (consistency=100) | Controle (consistency=50) |
|---|---|---|
| Média de gols/partida | 0.910 | 0.980 |
| Desvio padrão | 0.900 | 0.932 |
| Total de gols (100 partidas) | 91 | 98 |

**Diferença média (teste − controle): -0.070 gols/partida** (desvio padrão da diferença: 1.479)

**Teste t pareado:** t = -0.47, p = 0.6360
→ NÃO estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 33 (33.0%) | 27 (27.0%) | 40 (40.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 2.170 | 2.260 |
| Finalizações no alvo | 1.700 | 1.690 |
| Ticks de posse | 3282 | 3318 |
| Faltas cometidas (placebo — não deveria variar com consistency) | 0.770 | 0.580 |

## Conclusão

O atributo **consistency** não mostrou impacto estatisticamente significativo nos gols em 100 partidas isoladas.
