# Experimento de isolamento de atributo — `technique`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **technique = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive technique). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 20.4s (204ms/partida).

## Gols

| | Teste (technique=100) | Controle (technique=50) |
|---|---|---|
| Média de gols/partida | 1.030 | 0.980 |
| Desvio padrão | 0.937 | 0.864 |
| Total de gols (100 partidas) | 103 | 98 |

**Diferença média (teste − controle): 0.050 gols/partida** (desvio padrão da diferença: 1.351)

**Teste t pareado:** t = 0.37, p = 0.7114
→ NÃO estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 35 (35.0%) | 29 (29.0%) | 36 (36.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 2.180 | 2.150 |
| Finalizações no alvo | 1.900 | 1.610 |
| Ticks de posse | 3298 | 3373 |
| Faltas cometidas (placebo — não deveria variar com technique) | 0.440 | 0.600 |

## Conclusão

O atributo **technique** não mostrou impacto estatisticamente significativo nos gols em 100 partidas isoladas.
