# Experimento de isolamento de atributo — `offTheBall`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **offTheBall = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive offTheBall). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 20.8s (208ms/partida).

## Gols

| | Teste (offTheBall=100) | Controle (offTheBall=50) |
|---|---|---|
| Média de gols/partida | 1.040 | 0.940 |
| Desvio padrão | 0.984 | 0.973 |
| Total de gols (100 partidas) | 104 | 94 |

**Diferença média (teste − controle): 0.100 gols/partida** (desvio padrão da diferença: 1.528)

**Teste t pareado:** t = 0.65, p = 0.5127
→ NÃO estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 43 (43.0%) | 23 (23.0%) | 34 (34.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 2.250 | 2.060 |
| Finalizações no alvo | 1.840 | 1.620 |
| Ticks de posse | 3277 | 3346 |
| Faltas cometidas (placebo — não deveria variar com offTheBall) | 1.150 | 0.640 |

## Conclusão

O atributo **offTheBall** não mostrou impacto estatisticamente significativo nos gols em 100 partidas isoladas.
