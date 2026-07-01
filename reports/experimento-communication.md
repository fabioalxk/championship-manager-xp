# Experimento de isolamento de atributo — `communication`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **communication = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive communication). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 20.1s (201ms/partida).

## Gols

| | Teste (communication=100) | Controle (communication=50) |
|---|---|---|
| Média de gols/partida | 0.810 | 0.720 |
| Desvio padrão | 0.929 | 0.740 |
| Total de gols (100 partidas) | 81 | 72 |

**Diferença média (teste − controle): 0.090 gols/partida** (desvio padrão da diferença: 1.280)

**Teste t pareado:** t = 0.70, p = 0.4820
→ NÃO estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 35 (35.0%) | 32 (32.0%) | 33 (33.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 1.870 | 2.180 |
| Finalizações no alvo | 1.530 | 1.490 |
| Ticks de posse | 3338 | 3367 |
| Faltas cometidas (placebo — não deveria variar com communication) | 0.730 | 0.640 |

## Conclusão

O atributo **communication** não mostrou impacto estatisticamente significativo nos gols em 100 partidas isoladas.
