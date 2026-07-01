# Experimento de isolamento de atributo — `aggression`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **aggression = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive aggression). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 20.4s (205ms/partida).

## Gols

| | Teste (aggression=100) | Controle (aggression=50) |
|---|---|---|
| Média de gols/partida | 0.840 | 0.790 |
| Desvio padrão | 0.788 | 0.820 |
| Total de gols (100 partidas) | 84 | 79 |

**Diferença média (teste − controle): 0.050 gols/partida** (desvio padrão da diferença: 1.167)

**Teste t pareado:** t = 0.43, p = 0.6682
→ NÃO estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 35 (35.0%) | 35 (35.0%) | 30 (30.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 2.060 | 2.040 |
| Finalizações no alvo | 1.630 | 1.600 |
| Ticks de posse | 3313 | 3254 |
| Faltas cometidas (placebo — não deveria variar com aggression) | 1.050 | 0.670 |

## Conclusão

O atributo **aggression** não mostrou impacto estatisticamente significativo nos gols em 100 partidas isoladas.
