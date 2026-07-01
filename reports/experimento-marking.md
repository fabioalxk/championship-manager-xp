# Experimento de isolamento de atributo — `marking`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **marking = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive marking). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 20.4s (204ms/partida).

## Gols

| | Teste (marking=100) | Controle (marking=50) |
|---|---|---|
| Média de gols/partida | 0.920 | 0.740 |
| Desvio padrão | 0.825 | 0.872 |
| Total de gols (100 partidas) | 92 | 74 |

**Diferença média (teste − controle): 0.180 gols/partida** (desvio padrão da diferença: 1.282)

**Teste t pareado:** t = 1.40, p = 0.1604
→ NÃO estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 43 (43.0%) | 26 (26.0%) | 31 (31.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 1.960 | 1.770 |
| Finalizações no alvo | 1.570 | 1.670 |
| Ticks de posse | 3297 | 3392 |
| Faltas cometidas (placebo — não deveria variar com marking) | 0.980 | 0.570 |

## Conclusão

O atributo **marking** não mostrou impacto estatisticamente significativo nos gols em 100 partidas isoladas.
