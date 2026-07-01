# Experimento de isolamento de atributo — `pace`

Metodologia: 1000 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **pace = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive pace). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 157.2s (157ms/partida).

## Gols

| | Teste (pace=100) | Controle (pace=50) |
|---|---|---|
| Média de gols/partida | 1.417 | 0.931 |
| Desvio padrão | 1.111 | 0.948 |
| Total de gols (1000 partidas) | 1417 | 931 |

**Diferença média (teste − controle): 0.486 gols/partida** (desvio padrão da diferença: 1.576)

**Teste t pareado:** t = 9.75, p < 0.0001
→ Estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 492 (49.2%) | 253 (25.3%) | 255 (25.5%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 2.815 | 2.304 |
| Finalizações no alvo | 2.362 | 1.777 |
| Ticks de posse | 3506 | 3177 |
| Faltas cometidas (placebo — não deveria variar com pace) | 0.755 | 0.997 |

## Conclusão

O atributo **pace** teve impacto **positivo** e estatisticamente significativo: o time com pace=100 marcou em média 0.486 gols/partida a mais que o controle (tudo 50).
