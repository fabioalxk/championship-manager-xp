# Experimento de isolamento de atributo — `positioning`

Metodologia: 500 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **positioning = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive positioning). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 130.8s (262ms/partida).

## Gols

| | Teste (positioning=100) | Controle (positioning=50) |
|---|---|---|
| Média de gols/partida | 1.114 | 0.348 |
| Desvio padrão | 0.975 | 0.606 |
| Total de gols (500 partidas) | 557 | 174 |

**Diferença média (teste − controle): 0.766 gols/partida** (desvio padrão da diferença: 1.123)

**Teste t pareado:** t = 15.25, p < 0.0001
→ Estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 294 (58.8%) | 151 (30.2%) | 55 (11.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 3.724 | 2.066 |
| Finalizações no alvo | 3.144 | 1.306 |
| Ticks de posse | 3365 | 3375 |
| Faltas cometidas (placebo — não deveria variar com positioning) | 0.958 | 0.560 |

## Conclusão

O atributo **positioning** teve impacto **positivo** e estatisticamente significativo: o time com positioning=100 marcou em média 0.766 gols/partida a mais que o controle (tudo 50).
