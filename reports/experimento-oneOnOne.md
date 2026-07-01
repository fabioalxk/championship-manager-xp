# Experimento de isolamento de atributo — `oneOnOne`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **oneOnOne = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive oneOnOne). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 20.2s (202ms/partida).

## Gols

| | Teste (oneOnOne=100) | Controle (oneOnOne=50) |
|---|---|---|
| Média de gols/partida | 0.800 | 0.930 |
| Desvio padrão | 0.829 | 0.902 |
| Total de gols (100 partidas) | 80 | 93 |

**Diferença média (teste − controle): -0.130 gols/partida** (desvio padrão da diferença: 1.353)

**Teste t pareado:** t = -0.96, p = 0.3367
→ NÃO estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 32 (32.0%) | 32 (32.0%) | 36 (36.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 1.740 | 2.300 |
| Finalizações no alvo | 1.410 | 2.130 |
| Ticks de posse | 3250 | 3366 |
| Faltas cometidas (placebo — não deveria variar com oneOnOne) | 0.710 | 0.750 |

## Conclusão

O atributo **oneOnOne** não mostrou impacto estatisticamente significativo nos gols em 100 partidas isoladas.
