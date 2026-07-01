# Experimento de isolamento de atributo — `reflexes`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **reflexes = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive reflexes). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 23.6s (236ms/partida).

## Gols

| | Teste (reflexes=100) | Controle (reflexes=50) |
|---|---|---|
| Média de gols/partida | 1.060 | 0.730 |
| Desvio padrão | 0.993 | 0.874 |
| Total de gols (100 partidas) | 106 | 73 |

**Diferença média (teste − controle): 0.330 gols/partida** (desvio padrão da diferença: 1.400)

**Teste t pareado:** t = 2.36, p = 0.0184
→ Estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 42 (42.0%) | 34 (34.0%) | 24 (24.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 2.300 | 2.180 |
| Finalizações no alvo | 1.790 | 2.160 |
| Ticks de posse | 3392 | 3251 |
| Faltas cometidas (placebo — não deveria variar com reflexes) | 0.650 | 0.680 |

## Conclusão

O atributo **reflexes** teve impacto **positivo** e estatisticamente significativo: o time com reflexes=100 marcou em média 0.330 gols/partida a mais que o controle (tudo 50).
