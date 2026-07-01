# Experimento de isolamento de atributo — `naturalFitness`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **naturalFitness = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive naturalFitness). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 22.7s (227ms/partida).

## Gols

| | Teste (naturalFitness=100) | Controle (naturalFitness=50) |
|---|---|---|
| Média de gols/partida | 0.940 | 0.920 |
| Desvio padrão | 0.862 | 0.929 |
| Total de gols (100 partidas) | 94 | 92 |

**Diferença média (teste − controle): 0.020 gols/partida** (desvio padrão da diferença: 1.371)

**Teste t pareado:** t = 0.15, p = 0.8840
→ NÃO estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 36 (36.0%) | 25 (25.0%) | 39 (39.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 2.050 | 2.160 |
| Finalizações no alvo | 1.740 | 1.660 |
| Ticks de posse | 3273 | 3297 |
| Faltas cometidas (placebo — não deveria variar com naturalFitness) | 0.780 | 0.640 |

## Conclusão

O atributo **naturalFitness** não mostrou impacto estatisticamente significativo nos gols em 100 partidas isoladas.
