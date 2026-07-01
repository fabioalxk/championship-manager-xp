# Experimento de isolamento de atributo — `dribbling`

Metodologia: 500 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **dribbling = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive dribbling). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 130.0s (260ms/partida).

## Gols

| | Teste (dribbling=100) | Controle (dribbling=50) |
|---|---|---|
| Média de gols/partida | 0.988 | 0.588 |
| Desvio padrão | 0.920 | 0.748 |
| Total de gols (500 partidas) | 494 | 294 |

**Diferença média (teste − controle): 0.400 gols/partida** (desvio padrão da diferença: 1.244)

**Teste t pareado:** t = 7.19, p < 0.0001
→ Estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 226 (45.2%) | 170 (34.0%) | 104 (20.8%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 2.916 | 2.308 |
| Finalizações no alvo | 2.456 | 1.704 |
| Ticks de posse | 3300 | 3377 |
| Faltas cometidas (placebo — não deveria variar com dribbling) | 1.024 | 0.852 |

## Conclusão

O atributo **dribbling** teve impacto **positivo** e estatisticamente significativo: o time com dribbling=100 marcou em média 0.400 gols/partida a mais que o controle (tudo 50).
