# Experimento de isolamento de atributo — `jumping`

Metodologia: 300 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **jumping = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive jumping). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 77.5s (258ms/partida).

## Gols

| | Teste (jumping=100) | Controle (jumping=50) |
|---|---|---|
| Média de gols/partida | 0.870 | 0.710 |
| Desvio padrão | 0.854 | 0.846 |
| Total de gols (300 partidas) | 261 | 213 |

**Diferença média (teste − controle): 0.160 gols/partida** (desvio padrão da diferença: 1.301)

**Teste t pareado:** t = 2.13, p = 0.0332
→ Estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 113 (37.7%) | 103 (34.3%) | 84 (28.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 3.387 | 2.847 |
| Finalizações no alvo | 2.520 | 2.250 |
| Ticks de posse | 3401 | 3243 |
| Faltas cometidas (placebo — não deveria variar com jumping) | 0.893 | 0.877 |

## Conclusão

O atributo **jumping** teve impacto **positivo** e estatisticamente significativo: o time com jumping=100 marcou em média 0.160 gols/partida a mais que o controle (tudo 50).
