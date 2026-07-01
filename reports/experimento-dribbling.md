# Experimento de isolamento de atributo — `dribbling`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **dribbling = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive dribbling). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 25.8s (258ms/partida).

## Gols

| | Teste (dribbling=100) | Controle (dribbling=50) |
|---|---|---|
| Média de gols/partida | 1.200 | 0.620 |
| Desvio padrão | 1.119 | 0.801 |
| Total de gols (100 partidas) | 120 | 62 |

**Diferença média (teste − controle): 0.580 gols/partida** (desvio padrão da diferença: 1.415)

**Teste t pareado:** t = 4.10, p < 0.0001
→ Estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 51 (51.0%) | 29 (29.0%) | 20 (20.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 2.540 | 1.670 |
| Finalizações no alvo | 2.030 | 1.320 |
| Ticks de posse | 3254 | 3318 |
| Faltas cometidas (placebo — não deveria variar com dribbling) | 0.460 | 0.660 |

## Conclusão

O atributo **dribbling** teve impacto **positivo** e estatisticamente significativo: o time com dribbling=100 marcou em média 0.580 gols/partida a mais que o controle (tudo 50).
