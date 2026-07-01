# Experimento de isolamento de atributo — `passing`

Metodologia: 500 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **passing = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive passing). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 127.2s (254ms/partida).

## Gols

| | Teste (passing=100) | Controle (passing=50) |
|---|---|---|
| Média de gols/partida | 0.878 | 0.570 |
| Desvio padrão | 0.928 | 0.717 |
| Total de gols (500 partidas) | 439 | 285 |

**Diferença média (teste − controle): 0.308 gols/partida** (desvio padrão da diferença: 1.192)

**Teste t pareado:** t = 5.78, p < 0.0001
→ Estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 192 (38.4%) | 193 (38.6%) | 115 (23.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 3.688 | 2.446 |
| Finalizações no alvo | 2.752 | 1.730 |
| Ticks de posse | 2915 | 3512 |
| Faltas cometidas (placebo — não deveria variar com passing) | 0.868 | 1.030 |

## Conclusão

O atributo **passing** teve impacto **positivo** e estatisticamente significativo: o time com passing=100 marcou em média 0.308 gols/partida a mais que o controle (tudo 50).
