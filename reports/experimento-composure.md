# Experimento de isolamento de atributo — `composure`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **composure = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive composure). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 20.7s (207ms/partida).

## Gols

| | Teste (composure=100) | Controle (composure=50) |
|---|---|---|
| Média de gols/partida | 0.910 | 0.930 |
| Desvio padrão | 0.889 | 0.924 |
| Total de gols (100 partidas) | 91 | 93 |

**Diferença média (teste − controle): -0.020 gols/partida** (desvio padrão da diferença: 1.287)

**Teste t pareado:** t = -0.16, p = 0.8765
→ NÃO estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 33 (33.0%) | 35 (35.0%) | 32 (32.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 2.070 | 2.120 |
| Finalizações no alvo | 1.790 | 1.850 |
| Ticks de posse | 3355 | 3264 |
| Faltas cometidas (placebo — não deveria variar com composure) | 0.480 | 0.630 |

## Conclusão

O atributo **composure** não mostrou impacto estatisticamente significativo nos gols em 100 partidas isoladas.
