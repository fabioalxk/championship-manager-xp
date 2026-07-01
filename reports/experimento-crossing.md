# Experimento de isolamento de atributo — `crossing`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **crossing = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive crossing). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 20.6s (206ms/partida).

## Gols

| | Teste (crossing=100) | Controle (crossing=50) |
|---|---|---|
| Média de gols/partida | 1.050 | 0.870 |
| Desvio padrão | 0.914 | 0.950 |
| Total de gols (100 partidas) | 105 | 87 |

**Diferença média (teste − controle): 0.180 gols/partida** (desvio padrão da diferença: 1.351)

**Teste t pareado:** t = 1.33, p = 0.1828
→ NÃO estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 37 (37.0%) | 35 (35.0%) | 28 (28.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 2.230 | 2.000 |
| Finalizações no alvo | 1.760 | 1.490 |
| Ticks de posse | 3276 | 3252 |
| Faltas cometidas (placebo — não deveria variar com crossing) | 0.620 | 0.770 |

## Conclusão

O atributo **crossing** não mostrou impacto estatisticamente significativo nos gols em 100 partidas isoladas.
