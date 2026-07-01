# Experimento de isolamento de atributo — `reflexes`

Metodologia: 300 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **reflexes = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive reflexes). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 77.3s (258ms/partida).

## Gols

| | Teste (reflexes=100) | Controle (reflexes=50) |
|---|---|---|
| Média de gols/partida | 0.727 | 0.530 |
| Desvio padrão | 0.821 | 0.710 |
| Total de gols (300 partidas) | 218 | 159 |

**Diferença média (teste − controle): 0.197 gols/partida** (desvio padrão da diferença: 1.102)

**Teste t pareado:** t = 3.09, p = 0.0020
→ Estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 103 (34.3%) | 130 (43.3%) | 67 (22.3%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 3.147 | 3.237 |
| Finalizações no alvo | 2.353 | 3.380 |
| Ticks de posse | 3362 | 3240 |
| Faltas cometidas (placebo — não deveria variar com reflexes) | 0.833 | 0.710 |

## Conclusão

O atributo **reflexes** teve impacto **positivo** e estatisticamente significativo: o time com reflexes=100 marcou em média 0.197 gols/partida a mais que o controle (tudo 50).
