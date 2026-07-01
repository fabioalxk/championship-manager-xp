# Experimento de isolamento de atributo — `tackling`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **tackling = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive tackling). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 20.4s (204ms/partida).

## Gols

| | Teste (tackling=100) | Controle (tackling=50) |
|---|---|---|
| Média de gols/partida | 0.840 | 0.920 |
| Desvio padrão | 0.929 | 0.971 |
| Total de gols (100 partidas) | 84 | 92 |

**Diferença média (teste − controle): -0.080 gols/partida** (desvio padrão da diferença: 1.440)

**Teste t pareado:** t = -0.56, p = 0.5786
→ NÃO estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 33 (33.0%) | 31 (31.0%) | 36 (36.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 1.930 | 2.250 |
| Finalizações no alvo | 1.520 | 1.780 |
| Ticks de posse | 3299 | 3323 |
| Faltas cometidas (placebo — não deveria variar com tackling) | 0.490 | 0.590 |

## Conclusão

O atributo **tackling** não mostrou impacto estatisticamente significativo nos gols em 100 partidas isoladas.
