# Experimento de isolamento de atributo — `longShots`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **longShots = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive longShots). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 20.3s (203ms/partida).

## Gols

| | Teste (longShots=100) | Controle (longShots=50) |
|---|---|---|
| Média de gols/partida | 1.080 | 0.830 |
| Desvio padrão | 0.992 | 0.888 |
| Total de gols (100 partidas) | 108 | 83 |

**Diferença média (teste − controle): 0.250 gols/partida** (desvio padrão da diferença: 1.493)

**Teste t pareado:** t = 1.67, p = 0.0941
→ NÃO estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 39 (39.0%) | 30 (30.0%) | 31 (31.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 2.670 | 1.900 |
| Finalizações no alvo | 2.070 | 1.550 |
| Ticks de posse | 3289 | 3288 |
| Faltas cometidas (placebo — não deveria variar com longShots) | 0.680 | 0.590 |

## Conclusão

O atributo **longShots** não mostrou impacto estatisticamente significativo nos gols em 100 partidas isoladas.
