# Experimento de isolamento de atributo — `workRate`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **workRate = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive workRate). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 22.6s (226ms/partida).

## Gols

| | Teste (workRate=100) | Controle (workRate=50) |
|---|---|---|
| Média de gols/partida | 0.860 | 0.900 |
| Desvio padrão | 0.841 | 0.927 |
| Total de gols (100 partidas) | 86 | 90 |

**Diferença média (teste − controle): -0.040 gols/partida** (desvio padrão da diferença: 1.392)

**Teste t pareado:** t = -0.29, p = 0.7738
→ NÃO estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 37 (37.0%) | 26 (26.0%) | 37 (37.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 2.170 | 1.950 |
| Finalizações no alvo | 1.740 | 1.630 |
| Ticks de posse | 3352 | 3315 |
| Faltas cometidas (placebo — não deveria variar com workRate) | 0.910 | 0.820 |

## Conclusão

O atributo **workRate** não mostrou impacto estatisticamente significativo nos gols em 100 partidas isoladas.
