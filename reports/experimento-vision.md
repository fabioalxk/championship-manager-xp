# Experimento de isolamento de atributo — `vision`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **vision = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive vision). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 20.4s (204ms/partida).

## Gols

| | Teste (vision=100) | Controle (vision=50) |
|---|---|---|
| Média de gols/partida | 0.800 | 0.910 |
| Desvio padrão | 0.910 | 0.933 |
| Total de gols (100 partidas) | 80 | 91 |

**Diferença média (teste − controle): -0.110 gols/partida** (desvio padrão da diferença: 1.377)

**Teste t pareado:** t = -0.80, p = 0.4245
→ NÃO estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 27 (27.0%) | 40 (40.0%) | 33 (33.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 2.000 | 1.990 |
| Finalizações no alvo | 1.380 | 1.680 |
| Ticks de posse | 3309 | 3329 |
| Faltas cometidas (placebo — não deveria variar com vision) | 0.650 | 0.560 |

## Conclusão

O atributo **vision** não mostrou impacto estatisticamente significativo nos gols em 100 partidas isoladas.
