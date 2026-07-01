# Experimento de isolamento de atributo — `aerialReach`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **aerialReach = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive aerialReach). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 20.7s (207ms/partida).

## Gols

| | Teste (aerialReach=100) | Controle (aerialReach=50) |
|---|---|---|
| Média de gols/partida | 0.800 | 0.840 |
| Desvio padrão | 0.932 | 0.896 |
| Total de gols (100 partidas) | 80 | 84 |

**Diferença média (teste − controle): -0.040 gols/partida** (desvio padrão da diferença: 1.370)

**Teste t pareado:** t = -0.29, p = 0.7703
→ NÃO estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 33 (33.0%) | 30 (30.0%) | 37 (37.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 1.900 | 2.130 |
| Finalizações no alvo | 1.500 | 1.800 |
| Ticks de posse | 3275 | 3352 |
| Faltas cometidas (placebo — não deveria variar com aerialReach) | 0.680 | 0.590 |

## Conclusão

O atributo **aerialReach** não mostrou impacto estatisticamente significativo nos gols em 100 partidas isoladas.
