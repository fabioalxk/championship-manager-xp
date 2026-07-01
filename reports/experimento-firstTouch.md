# Experimento de isolamento de atributo — `firstTouch`

Metodologia: 500 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **firstTouch = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive firstTouch). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 129.8s (260ms/partida).

## Gols

| | Teste (firstTouch=100) | Controle (firstTouch=50) |
|---|---|---|
| Média de gols/partida | 0.984 | 0.374 |
| Desvio padrão | 0.954 | 0.582 |
| Total de gols (500 partidas) | 492 | 187 |

**Diferença média (teste − controle): 0.610 gols/partida** (desvio padrão da diferença: 1.173)

**Teste t pareado:** t = 11.63, p < 0.0001
→ Estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 266 (53.2%) | 142 (28.4%) | 92 (18.4%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 4.260 | 1.674 |
| Finalizações no alvo | 2.890 | 1.088 |
| Ticks de posse | 3518 | 3190 |
| Faltas cometidas (placebo — não deveria variar com firstTouch) | 1.084 | 1.422 |

## Conclusão

O atributo **firstTouch** teve impacto **positivo** e estatisticamente significativo: o time com firstTouch=100 marcou em média 0.610 gols/partida a mais que o controle (tudo 50).
