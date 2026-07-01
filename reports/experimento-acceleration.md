# Experimento de isolamento de atributo — `acceleration`

Metodologia: 500 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **acceleration = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive acceleration). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 128.3s (257ms/partida).

## Gols

| | Teste (acceleration=100) | Controle (acceleration=50) |
|---|---|---|
| Média de gols/partida | 0.952 | 0.418 |
| Desvio padrão | 0.988 | 0.620 |
| Total de gols (500 partidas) | 476 | 209 |

**Diferença média (teste − controle): 0.534 gols/partida** (desvio padrão da diferença: 1.246)

**Teste t pareado:** t = 9.58, p < 0.0001
→ Estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 244 (48.8%) | 162 (32.4%) | 94 (18.8%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 3.630 | 2.140 |
| Finalizações no alvo | 2.840 | 1.320 |
| Ticks de posse | 3428 | 3264 |
| Faltas cometidas (placebo — não deveria variar com acceleration) | 1.232 | 0.826 |

## Conclusão

O atributo **acceleration** teve impacto **positivo** e estatisticamente significativo: o time com acceleration=100 marcou em média 0.534 gols/partida a mais que o controle (tudo 50).
