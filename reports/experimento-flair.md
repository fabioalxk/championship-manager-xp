# Experimento de isolamento de atributo — `flair`

Metodologia: 300 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **flair = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive flair). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 76.3s (254ms/partida).

## Gols

| | Teste (flair=100) | Controle (flair=50) |
|---|---|---|
| Média de gols/partida | 0.937 | 0.693 |
| Desvio padrão | 0.932 | 0.797 |
| Total de gols (300 partidas) | 281 | 208 |

**Diferença média (teste − controle): 0.243 gols/partida** (desvio padrão da diferença: 1.245)

**Teste t pareado:** t = 3.39, p = 0.0007
→ Estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 120 (40.0%) | 103 (34.3%) | 77 (25.7%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 4.000 | 2.923 |
| Finalizações no alvo | 2.723 | 2.340 |
| Ticks de posse | 3277 | 3266 |
| Faltas cometidas (placebo — não deveria variar com flair) | 0.947 | 1.160 |

## Conclusão

O atributo **flair** teve impacto **positivo** e estatisticamente significativo: o time com flair=100 marcou em média 0.243 gols/partida a mais que o controle (tudo 50).
