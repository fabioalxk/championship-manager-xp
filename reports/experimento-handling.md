# Experimento de isolamento de atributo — `handling`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **handling = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive handling). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 20.9s (209ms/partida).

## Gols

| | Teste (handling=100) | Controle (handling=50) |
|---|---|---|
| Média de gols/partida | 0.770 | 0.820 |
| Desvio padrão | 0.952 | 0.925 |
| Total de gols (100 partidas) | 77 | 82 |

**Diferença média (teste − controle): -0.050 gols/partida** (desvio padrão da diferença: 1.344)

**Teste t pareado:** t = -0.37, p = 0.7098
→ NÃO estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 27 (27.0%) | 40 (40.0%) | 33 (33.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 1.920 | 2.120 |
| Finalizações no alvo | 1.400 | 1.770 |
| Ticks de posse | 3269 | 3360 |
| Faltas cometidas (placebo — não deveria variar com handling) | 0.700 | 0.580 |

## Conclusão

O atributo **handling** não mostrou impacto estatisticamente significativo nos gols em 100 partidas isoladas.
