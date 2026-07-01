# Experimento de isolamento de atributo — `pace`

Metodologia: 500 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **pace = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive pace). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 130.4s (261ms/partida).

## Gols

| | Teste (pace=100) | Controle (pace=50) |
|---|---|---|
| Média de gols/partida | 1.026 | 0.560 |
| Desvio padrão | 0.944 | 0.737 |
| Total de gols (500 partidas) | 513 | 280 |

**Diferença média (teste − controle): 0.466 gols/partida** (desvio padrão da diferença: 1.231)

**Teste t pareado:** t = 8.46, p < 0.0001
→ Estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 240 (48.0%) | 161 (32.2%) | 99 (19.8%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 3.530 | 2.814 |
| Finalizações no alvo | 2.474 | 1.972 |
| Ticks de posse | 3424 | 3294 |
| Faltas cometidas (placebo — não deveria variar com pace) | 0.956 | 1.262 |

## Conclusão

O atributo **pace** teve impacto **positivo** e estatisticamente significativo: o time com pace=100 marcou em média 0.466 gols/partida a mais que o controle (tudo 50).
