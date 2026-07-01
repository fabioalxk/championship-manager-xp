# Experimento de isolamento de atributo — `anticipation`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **anticipation = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive anticipation). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 20.7s (207ms/partida).

## Gols

| | Teste (anticipation=100) | Controle (anticipation=50) |
|---|---|---|
| Média de gols/partida | 0.960 | 0.780 |
| Desvio padrão | 0.994 | 0.871 |
| Total de gols (100 partidas) | 96 | 78 |

**Diferença média (teste − controle): 0.180 gols/partida** (desvio padrão da diferença: 1.258)

**Teste t pareado:** t = 1.43, p = 0.1526
→ NÃO estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 34 (34.0%) | 40 (40.0%) | 26 (26.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 2.290 | 2.040 |
| Finalizações no alvo | 1.800 | 1.410 |
| Ticks de posse | 3406 | 3288 |
| Faltas cometidas (placebo — não deveria variar com anticipation) | 0.800 | 0.860 |

## Conclusão

O atributo **anticipation** não mostrou impacto estatisticamente significativo nos gols em 100 partidas isoladas.
