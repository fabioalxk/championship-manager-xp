# Experimento de isolamento de atributo — `passing`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **passing = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive passing). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 20.5s (205ms/partida).

## Gols

| | Teste (passing=100) | Controle (passing=50) |
|---|---|---|
| Média de gols/partida | 1.140 | 0.850 |
| Desvio padrão | 1.083 | 0.957 |
| Total de gols (100 partidas) | 114 | 85 |

**Diferença média (teste − controle): 0.290 gols/partida** (desvio padrão da diferença: 1.559)

**Teste t pareado:** t = 1.86, p = 0.0628
→ NÃO estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 41 (41.0%) | 29 (29.0%) | 30 (30.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 2.230 | 2.060 |
| Finalizações no alvo | 1.700 | 1.590 |
| Ticks de posse | 3012 | 3541 |
| Faltas cometidas (placebo — não deveria variar com passing) | 0.610 | 0.600 |

## Conclusão

O atributo **passing** não mostrou impacto estatisticamente significativo nos gols em 100 partidas isoladas.
