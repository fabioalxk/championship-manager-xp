# Experimento de isolamento de atributo — `balance`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **balance = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive balance). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 17.7s (177ms/partida).

## Gols

| | Teste (balance=100) | Controle (balance=50) |
|---|---|---|
| Média de gols/partida | 1.030 | 0.890 |
| Desvio padrão | 0.989 | 0.984 |
| Total de gols (100 partidas) | 103 | 89 |

**Diferença média (teste − controle): 0.140 gols/partida** (desvio padrão da diferença: 1.544)

**Teste t pareado:** t = 0.91, p = 0.3646
→ NÃO estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 45 (45.0%) | 23 (23.0%) | 32 (32.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 2.080 | 2.010 |
| Finalizações no alvo | 1.570 | 1.640 |
| Ticks de posse | 3377 | 3276 |
| Faltas cometidas (placebo — não deveria variar com balance) | 0.760 | 0.840 |

## Conclusão

O atributo **balance** não mostrou impacto estatisticamente significativo nos gols em 100 partidas isoladas.
