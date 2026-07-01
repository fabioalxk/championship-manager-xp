# Experimento de isolamento de atributo — `strength`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **strength = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive strength). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 22.7s (227ms/partida).

## Gols

| | Teste (strength=100) | Controle (strength=50) |
|---|---|---|
| Média de gols/partida | 1.030 | 0.900 |
| Desvio padrão | 1.010 | 1.000 |
| Total de gols (100 partidas) | 103 | 90 |

**Diferença média (teste − controle): 0.130 gols/partida** (desvio padrão da diferença: 1.522)

**Teste t pareado:** t = 0.85, p = 0.3930
→ NÃO estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 40 (40.0%) | 30 (30.0%) | 30 (30.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 2.050 | 2.160 |
| Finalizações no alvo | 1.330 | 1.580 |
| Ticks de posse | 3371 | 3281 |
| Faltas cometidas (placebo — não deveria variar com strength) | 0.490 | 0.670 |

## Conclusão

O atributo **strength** não mostrou impacto estatisticamente significativo nos gols em 100 partidas isoladas.
