# Experimento de isolamento de atributo — `pace`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **pace = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive pace). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 17.9s (179ms/partida).

## Gols

| | Teste (pace=100) | Controle (pace=50) |
|---|---|---|
| Média de gols/partida | 1.480 | 0.810 |
| Desvio padrão | 0.979 | 0.895 |
| Total de gols (100 partidas) | 148 | 81 |

**Diferença média (teste − controle): 0.670 gols/partida** (desvio padrão da diferença: 1.484)

**Teste t pareado:** t = 4.51, p < 0.0001
→ Estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 63 (63.0%) | 14 (14.0%) | 23 (23.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 2.830 | 2.320 |
| Finalizações no alvo | 2.450 | 1.620 |
| Ticks de posse | 3520 | 3164 |
| Faltas cometidas (placebo — não deveria variar com pace) | 0.780 | 1.130 |

## Conclusão

O atributo **pace** teve impacto **positivo** e estatisticamente significativo: o time com pace=100 marcou em média 0.670 gols/partida a mais que o controle (tudo 50).
