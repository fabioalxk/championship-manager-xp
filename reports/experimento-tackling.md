# Experimento de isolamento de atributo — `tackling`

Metodologia: 500 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **tackling = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive tackling). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 130.1s (260ms/partida).

## Gols

| | Teste (tackling=100) | Controle (tackling=50) |
|---|---|---|
| Média de gols/partida | 0.784 | 0.422 |
| Desvio padrão | 0.819 | 0.630 |
| Total de gols (500 partidas) | 392 | 211 |

**Diferença média (teste − controle): 0.362 gols/partida** (desvio padrão da diferença: 1.026)

**Teste t pareado:** t = 7.89, p < 0.0001
→ Estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 210 (42.0%) | 201 (40.2%) | 89 (17.8%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 3.248 | 2.114 |
| Finalizações no alvo | 2.472 | 1.310 |
| Ticks de posse | 3379 | 3413 |
| Faltas cometidas (placebo — não deveria variar com tackling) | 0.066 | 0.860 |

## Conclusão

O atributo **tackling** teve impacto **positivo** e estatisticamente significativo: o time com tackling=100 marcou em média 0.362 gols/partida a mais que o controle (tudo 50).
