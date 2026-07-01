# Experimento de isolamento de atributo — `stamina`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **stamina = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive stamina). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 22.7s (227ms/partida).

## Gols

| | Teste (stamina=100) | Controle (stamina=50) |
|---|---|---|
| Média de gols/partida | 0.980 | 0.710 |
| Desvio padrão | 0.953 | 0.856 |
| Total de gols (100 partidas) | 98 | 71 |

**Diferença média (teste − controle): 0.270 gols/partida** (desvio padrão da diferença: 1.384)

**Teste t pareado:** t = 1.95, p = 0.0511
→ NÃO estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 41 (41.0%) | 34 (34.0%) | 25 (25.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 2.420 | 2.020 |
| Finalizações no alvo | 1.670 | 1.590 |
| Ticks de posse | 3373 | 3269 |
| Faltas cometidas (placebo — não deveria variar com stamina) | 0.630 | 0.840 |

## Conclusão

O atributo **stamina** não mostrou impacto estatisticamente significativo nos gols em 100 partidas isoladas.
