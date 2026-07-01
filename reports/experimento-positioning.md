# Experimento de isolamento de atributo — `positioning`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **positioning = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive positioning). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 20.9s (209ms/partida).

## Gols

| | Teste (positioning=100) | Controle (positioning=50) |
|---|---|---|
| Média de gols/partida | 0.680 | 0.950 |
| Desvio padrão | 0.750 | 0.957 |
| Total de gols (100 partidas) | 68 | 95 |

**Diferença média (teste − controle): -0.270 gols/partida** (desvio padrão da diferença: 1.262)

**Teste t pareado:** t = -2.14, p = 0.0324
→ Estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 31 (31.0%) | 26 (26.0%) | 43 (43.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 1.840 | 2.260 |
| Finalizações no alvo | 1.400 | 1.770 |
| Ticks de posse | 3215 | 3425 |
| Faltas cometidas (placebo — não deveria variar com positioning) | 0.730 | 0.800 |

## Conclusão

O atributo **positioning** teve impacto **negativo** e estatisticamente significativo: o time com positioning=100 marcou em média 0.270 gols/partida a MENOS que o controle — investigar possível bug na fórmula/consumo deste atributo.
