# Experimento de isolamento de atributo — `marking`

Metodologia: 300 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **marking = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive marking). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 76.7s (256ms/partida).

## Gols

| | Teste (marking=100) | Controle (marking=50) |
|---|---|---|
| Média de gols/partida | 0.737 | 0.463 |
| Desvio padrão | 0.834 | 0.691 |
| Total de gols (300 partidas) | 221 | 139 |

**Diferença média (teste − controle): 0.273 gols/partida** (desvio padrão da diferença: 1.136)

**Teste t pareado:** t = 4.17, p < 0.0001
→ Estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 127 (42.3%) | 109 (36.3%) | 64 (21.3%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 3.447 | 2.433 |
| Finalizações no alvo | 2.533 | 1.460 |
| Ticks de posse | 3320 | 3398 |
| Faltas cometidas (placebo — não deveria variar com marking) | 0.957 | 0.793 |

## Conclusão

O atributo **marking** teve impacto **positivo** e estatisticamente significativo: o time com marking=100 marcou em média 0.273 gols/partida a mais que o controle (tudo 50).
