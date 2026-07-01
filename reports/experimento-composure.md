# Experimento de isolamento de atributo — `composure`

Metodologia: 300 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **composure = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive composure). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 57.2s (191ms/partida).

## Gols

| | Teste (composure=100) | Controle (composure=50) |
|---|---|---|
| Média de gols/partida | 0.580 | 0.480 |
| Desvio padrão | 0.765 | 0.657 |
| Total de gols (300 partidas) | 174 | 144 |

**Diferença média (teste − controle): 0.100 gols/partida** (desvio padrão da diferença: 1.058)

**Teste t pareado:** t = 1.64, p = 0.1018
→ NÃO estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 89 (29.7%) | 130 (43.3%) | 81 (27.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 2.903 | 2.587 |
| Finalizações no alvo | 2.197 | 1.647 |
| Ticks de posse | 3402 | 3302 |
| Faltas cometidas (placebo — não deveria variar com composure) | 0.950 | 0.727 |

## Conclusão

O atributo **composure** não mostrou impacto estatisticamente significativo nos gols em 300 partidas isoladas.
