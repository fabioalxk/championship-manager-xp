# Experimento de isolamento de atributo — `heading`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **heading = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive heading). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 20.6s (206ms/partida).

## Gols

| | Teste (heading=100) | Controle (heading=50) |
|---|---|---|
| Média de gols/partida | 0.870 | 0.840 |
| Desvio padrão | 0.884 | 0.838 |
| Total de gols (100 partidas) | 87 | 84 |

**Diferença média (teste − controle): 0.030 gols/partida** (desvio padrão da diferença: 1.337)

**Teste t pareado:** t = 0.22, p = 0.8224
→ NÃO estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 34 (34.0%) | 29 (29.0%) | 37 (37.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 2.050 | 1.950 |
| Finalizações no alvo | 1.650 | 1.650 |
| Ticks de posse | 3301 | 3346 |
| Faltas cometidas (placebo — não deveria variar com heading) | 0.530 | 0.850 |

## Conclusão

O atributo **heading** não mostrou impacto estatisticamente significativo nos gols em 100 partidas isoladas.
