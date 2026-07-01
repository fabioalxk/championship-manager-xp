# Experimento de isolamento de atributo — `flair`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **flair = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive flair). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 20.4s (204ms/partida).

## Gols

| | Teste (flair=100) | Controle (flair=50) |
|---|---|---|
| Média de gols/partida | 1.100 | 0.650 |
| Desvio padrão | 1.078 | 0.744 |
| Total de gols (100 partidas) | 110 | 65 |

**Diferença média (teste − controle): 0.450 gols/partida** (desvio padrão da diferença: 1.507)

**Teste t pareado:** t = 2.99, p = 0.0028
→ Estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 46 (46.0%) | 28 (28.0%) | 26 (26.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 2.640 | 1.880 |
| Finalizações no alvo | 2.160 | 1.380 |
| Ticks de posse | 3285 | 3304 |
| Faltas cometidas (placebo — não deveria variar com flair) | 0.790 | 0.720 |

## Conclusão

O atributo **flair** teve impacto **positivo** e estatisticamente significativo: o time com flair=100 marcou em média 0.450 gols/partida a mais que o controle (tudo 50).
