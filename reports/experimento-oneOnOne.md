# Experimento de isolamento de atributo — `oneOnOne`

Metodologia: 300 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **oneOnOne = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive oneOnOne). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 76.2s (254ms/partida).

## Gols

| | Teste (oneOnOne=100) | Controle (oneOnOne=50) |
|---|---|---|
| Média de gols/partida | 0.783 | 0.563 |
| Desvio padrão | 0.898 | 0.767 |
| Total de gols (300 partidas) | 235 | 169 |

**Diferença média (teste − controle): 0.220 gols/partida** (desvio padrão da diferença: 1.253)

**Teste t pareado:** t = 3.04, p = 0.0024
→ Estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 123 (41.0%) | 95 (31.7%) | 82 (27.3%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 3.103 | 3.017 |
| Finalizações no alvo | 2.303 | 2.527 |
| Ticks de posse | 3319 | 3278 |
| Faltas cometidas (placebo — não deveria variar com oneOnOne) | 0.817 | 0.987 |

## Conclusão

O atributo **oneOnOne** teve impacto **positivo** e estatisticamente significativo: o time com oneOnOne=100 marcou em média 0.220 gols/partida a mais que o controle (tudo 50).
