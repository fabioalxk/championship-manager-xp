# Experimento de isolamento de atributo — `teamwork`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **teamwork = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive teamwork). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 20.6s (206ms/partida).

## Gols

| | Teste (teamwork=100) | Controle (teamwork=50) |
|---|---|---|
| Média de gols/partida | 0.860 | 1.020 |
| Desvio padrão | 0.865 | 0.921 |
| Total de gols (100 partidas) | 86 | 102 |

**Diferença média (teste − controle): -0.160 gols/partida** (desvio padrão da diferença: 1.324)

**Teste t pareado:** t = -1.21, p = 0.2267
→ NÃO estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 32 (32.0%) | 31 (31.0%) | 37 (37.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 2.130 | 1.700 |
| Finalizações no alvo | 1.730 | 1.740 |
| Ticks de posse | 3212 | 3392 |
| Faltas cometidas (placebo — não deveria variar com teamwork) | 0.960 | 0.690 |

## Conclusão

O atributo **teamwork** não mostrou impacto estatisticamente significativo nos gols em 100 partidas isoladas.
