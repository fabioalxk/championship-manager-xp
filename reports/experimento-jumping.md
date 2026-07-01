# Experimento de isolamento de atributo — `jumping`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **jumping = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive jumping). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 17.8s (178ms/partida).

## Gols

| | Teste (jumping=100) | Controle (jumping=50) |
|---|---|---|
| Média de gols/partida | 1.030 | 0.820 |
| Desvio padrão | 1.029 | 0.857 |
| Total de gols (100 partidas) | 103 | 82 |

**Diferença média (teste − controle): 0.210 gols/partida** (desvio padrão da diferença: 1.445)

**Teste t pareado:** t = 1.45, p = 0.1460
→ NÃO estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 43 (43.0%) | 23 (23.0%) | 34 (34.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 2.020 | 1.930 |
| Finalizações no alvo | 1.760 | 1.590 |
| Ticks de posse | 3402 | 3335 |
| Faltas cometidas (placebo — não deveria variar com jumping) | 0.790 | 0.820 |

## Conclusão

O atributo **jumping** não mostrou impacto estatisticamente significativo nos gols em 100 partidas isoladas.
