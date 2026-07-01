# Experimento de isolamento de atributo — `goalkeeping`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **goalkeeping = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive goalkeeping). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 20.5s (205ms/partida).

## Gols

| | Teste (goalkeeping=100) | Controle (goalkeeping=50) |
|---|---|---|
| Média de gols/partida | 0.750 | 0.860 |
| Desvio padrão | 0.892 | 0.921 |
| Total de gols (100 partidas) | 75 | 86 |

**Diferença média (teste − controle): -0.110 gols/partida** (desvio padrão da diferença: 1.340)

**Teste t pareado:** t = -0.82, p = 0.4117
→ NÃO estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 30 (30.0%) | 33 (33.0%) | 37 (37.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 1.870 | 2.230 |
| Finalizações no alvo | 1.360 | 1.760 |
| Ticks de posse | 3265 | 3350 |
| Faltas cometidas (placebo — não deveria variar com goalkeeping) | 0.690 | 0.540 |

## Conclusão

O atributo **goalkeeping** não mostrou impacto estatisticamente significativo nos gols em 100 partidas isoladas.
