# Experimento de isolamento de atributo — `decisions`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **decisions = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive decisions). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 20.9s (209ms/partida).

## Gols

| | Teste (decisions=100) | Controle (decisions=50) |
|---|---|---|
| Média de gols/partida | 0.890 | 0.790 |
| Desvio padrão | 0.886 | 0.913 |
| Total de gols (100 partidas) | 89 | 79 |

**Diferença média (teste − controle): 0.100 gols/partida** (desvio padrão da diferença: 1.374)

**Teste t pareado:** t = 0.73, p = 0.4669
→ NÃO estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 38 (38.0%) | 34 (34.0%) | 28 (28.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 2.050 | 2.000 |
| Finalizações no alvo | 1.660 | 1.580 |
| Ticks de posse | 3243 | 3258 |
| Faltas cometidas (placebo — não deveria variar com decisions) | 0.790 | 1.080 |

## Conclusão

O atributo **decisions** não mostrou impacto estatisticamente significativo nos gols em 100 partidas isoladas.
