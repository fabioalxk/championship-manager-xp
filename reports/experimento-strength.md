# Experimento de isolamento de atributo — `strength`

Metodologia: 500 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **strength = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive strength). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 131.0s (262ms/partida).

## Gols

| | Teste (strength=100) | Controle (strength=50) |
|---|---|---|
| Média de gols/partida | 1.226 | 0.448 |
| Desvio padrão | 1.100 | 0.675 |
| Total de gols (500 partidas) | 613 | 224 |

**Diferença média (teste − controle): 0.778 gols/partida** (desvio padrão da diferença: 1.376)

**Teste t pareado:** t = 12.65, p < 0.0001
→ Estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 287 (57.4%) | 132 (26.4%) | 81 (16.2%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 3.744 | 2.094 |
| Finalizações no alvo | 2.050 | 1.496 |
| Ticks de posse | 3542 | 3137 |
| Faltas cometidas (placebo — não deveria variar com strength) | 0.784 | 1.624 |

## Conclusão

O atributo **strength** teve impacto **positivo** e estatisticamente significativo: o time com strength=100 marcou em média 0.778 gols/partida a mais que o controle (tudo 50).
