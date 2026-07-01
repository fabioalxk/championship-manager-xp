# Experimento de isolamento de atributo — `decisions`

Metodologia: 300 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **decisions = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive decisions). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 77.1s (257ms/partida).

## Gols

| | Teste (decisions=100) | Controle (decisions=50) |
|---|---|---|
| Média de gols/partida | 0.830 | 0.803 |
| Desvio padrão | 0.874 | 0.942 |
| Total de gols (300 partidas) | 249 | 241 |

**Diferença média (teste − controle): 0.027 gols/partida** (desvio padrão da diferença: 1.351)

**Teste t pareado:** t = 0.34, p = 0.7325
→ NÃO estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 109 (36.3%) | 87 (29.0%) | 104 (34.7%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 2.857 | 3.167 |
| Finalizações no alvo | 2.387 | 2.457 |
| Ticks de posse | 3310 | 3362 |
| Faltas cometidas (placebo — não deveria variar com decisions) | 0.853 | 0.507 |

## Conclusão

O atributo **decisions** não mostrou impacto estatisticamente significativo nos gols em 300 partidas isoladas.
