# Experimento de isolamento de atributo — `finishing`

Metodologia: 500 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **finishing = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive finishing). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 130.2s (260ms/partida).

## Gols

| | Teste (finishing=100) | Controle (finishing=50) |
|---|---|---|
| Média de gols/partida | 1.110 | 0.640 |
| Desvio padrão | 0.934 | 0.782 |
| Total de gols (500 partidas) | 555 | 320 |

**Diferença média (teste − controle): 0.470 gols/partida** (desvio padrão da diferença: 1.262)

**Teste t pareado:** t = 8.33, p < 0.0001
→ Estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 245 (49.0%) | 147 (29.4%) | 108 (21.6%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 4.052 | 2.758 |
| Finalizações no alvo | 2.880 | 2.034 |
| Ticks de posse | 3314 | 3380 |
| Faltas cometidas (placebo — não deveria variar com finishing) | 1.126 | 1.124 |

## Conclusão

O atributo **finishing** teve impacto **positivo** e estatisticamente significativo: o time com finishing=100 marcou em média 0.470 gols/partida a mais que o controle (tudo 50).
