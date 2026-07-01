# Experimento de isolamento de atributo — `firstTouch`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **firstTouch = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive firstTouch). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 20.8s (208ms/partida).

## Gols

| | Teste (firstTouch=100) | Controle (firstTouch=50) |
|---|---|---|
| Média de gols/partida | 1.330 | 0.640 |
| Desvio padrão | 1.006 | 0.847 |
| Total de gols (100 partidas) | 133 | 64 |

**Diferença média (teste − controle): 0.690 gols/partida** (desvio padrão da diferença: 1.447)

**Teste t pareado:** t = 4.77, p < 0.0001
→ Estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 56 (56.0%) | 27 (27.0%) | 17 (17.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 2.850 | 1.650 |
| Finalizações no alvo | 2.270 | 1.310 |
| Ticks de posse | 3467 | 3209 |
| Faltas cometidas (placebo — não deveria variar com firstTouch) | 0.650 | 0.840 |

## Conclusão

O atributo **firstTouch** teve impacto **positivo** e estatisticamente significativo: o time com firstTouch=100 marcou em média 0.690 gols/partida a mais que o controle (tudo 50).
