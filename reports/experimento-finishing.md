# Experimento de isolamento de atributo — `finishing`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **finishing = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive finishing). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 20.6s (206ms/partida).

## Gols

| | Teste (finishing=100) | Controle (finishing=50) |
|---|---|---|
| Média de gols/partida | 1.030 | 0.900 |
| Desvio padrão | 1.010 | 0.893 |
| Total de gols (100 partidas) | 103 | 90 |

**Diferença média (teste − controle): 0.130 gols/partida** (desvio padrão da diferença: 1.405)

**Teste t pareado:** t = 0.93, p = 0.3547
→ NÃO estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 38 (38.0%) | 29 (29.0%) | 33 (33.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 2.580 | 2.070 |
| Finalizações no alvo | 1.750 | 1.700 |
| Ticks de posse | 3250 | 3338 |
| Faltas cometidas (placebo — não deveria variar com finishing) | 0.680 | 0.540 |

## Conclusão

O atributo **finishing** não mostrou impacto estatisticamente significativo nos gols em 100 partidas isoladas.
