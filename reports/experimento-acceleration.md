# Experimento de isolamento de atributo — `acceleration`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **acceleration = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive acceleration). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 17.9s (179ms/partida).

## Gols

| | Teste (acceleration=100) | Controle (acceleration=50) |
|---|---|---|
| Média de gols/partida | 1.180 | 0.770 |
| Desvio padrão | 0.936 | 0.802 |
| Total de gols (100 partidas) | 118 | 77 |

**Diferença média (teste − controle): 0.410 gols/partida** (desvio padrão da diferença: 1.207)

**Teste t pareado:** t = 3.40, p = 0.0007
→ Estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 49 (49.0%) | 28 (28.0%) | 23 (23.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 2.680 | 2.040 |
| Finalizações no alvo | 2.250 | 1.500 |
| Ticks de posse | 3360 | 3316 |
| Faltas cometidas (placebo — não deveria variar com acceleration) | 0.710 | 0.960 |

## Conclusão

O atributo **acceleration** teve impacto **positivo** e estatisticamente significativo: o time com acceleration=100 marcou em média 0.410 gols/partida a mais que o controle (tudo 50).
