# Experimento de isolamento de atributo — `throwing`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **throwing = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive throwing). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 20.1s (201ms/partida).

## Gols

| | Teste (throwing=100) | Controle (throwing=50) |
|---|---|---|
| Média de gols/partida | 0.810 | 0.880 |
| Desvio padrão | 0.775 | 0.967 |
| Total de gols (100 partidas) | 81 | 88 |

**Diferença média (teste − controle): -0.070 gols/partida** (desvio padrão da diferença: 1.241)

**Teste t pareado:** t = -0.56, p = 0.5728
→ NÃO estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 32 (32.0%) | 34 (34.0%) | 34 (34.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 1.780 | 2.200 |
| Finalizações no alvo | 1.400 | 1.720 |
| Ticks de posse | 3292 | 3336 |
| Faltas cometidas (placebo — não deveria variar com throwing) | 0.680 | 0.600 |

## Conclusão

O atributo **throwing** não mostrou impacto estatisticamente significativo nos gols em 100 partidas isoladas.
