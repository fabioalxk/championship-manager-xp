# Experimento de isolamento de atributo — `concentration`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **concentration = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive concentration). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 20.3s (203ms/partida).

## Gols

| | Teste (concentration=100) | Controle (concentration=50) |
|---|---|---|
| Média de gols/partida | 0.720 | 0.890 |
| Desvio padrão | 0.842 | 0.963 |
| Total de gols (100 partidas) | 72 | 89 |

**Diferença média (teste − controle): -0.170 gols/partida** (desvio padrão da diferença: 1.371)

**Teste t pareado:** t = -1.24, p = 0.2150
→ NÃO estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 27 (27.0%) | 33 (33.0%) | 40 (40.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 1.930 | 2.230 |
| Finalizações no alvo | 1.390 | 1.760 |
| Ticks de posse | 3252 | 3360 |
| Faltas cometidas (placebo — não deveria variar com concentration) | 0.700 | 0.590 |

## Conclusão

O atributo **concentration** não mostrou impacto estatisticamente significativo nos gols em 100 partidas isoladas.
