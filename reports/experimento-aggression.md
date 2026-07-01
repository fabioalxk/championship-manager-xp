# Experimento de isolamento de atributo — `aggression`

Metodologia: 300 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **aggression = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive aggression). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 76.5s (255ms/partida).

## Gols

| | Teste (aggression=100) | Controle (aggression=50) |
|---|---|---|
| Média de gols/partida | 0.773 | 0.727 |
| Desvio padrão | 0.815 | 0.829 |
| Total de gols (300 partidas) | 232 | 218 |

**Diferença média (teste − controle): 0.047 gols/partida** (desvio padrão da diferença: 1.187)

**Teste t pareado:** t = 0.68, p = 0.4959
→ NÃO estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 102 (34.0%) | 108 (36.0%) | 90 (30.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 3.197 | 3.000 |
| Finalizações no alvo | 2.287 | 2.317 |
| Ticks de posse | 3270 | 3278 |
| Faltas cometidas (placebo — não deveria variar com aggression) | 1.147 | 0.873 |

## Conclusão

O atributo **aggression** não mostrou impacto estatisticamente significativo nos gols em 300 partidas isoladas.
