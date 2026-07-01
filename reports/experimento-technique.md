# Experimento de isolamento de atributo — `technique`

Metodologia: 300 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **technique = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive technique). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 77.5s (258ms/partida).

## Gols

| | Teste (technique=100) | Controle (technique=50) |
|---|---|---|
| Média de gols/partida | 1.083 | 0.747 |
| Desvio padrão | 0.886 | 0.807 |
| Total de gols (300 partidas) | 325 | 224 |

**Diferença média (teste − controle): 0.337 gols/partida** (desvio padrão da diferença: 1.255)

**Teste t pareado:** t = 4.65, p < 0.0001
→ Estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 138 (46.0%) | 88 (29.3%) | 74 (24.7%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 3.563 | 2.937 |
| Finalizações no alvo | 3.223 | 2.260 |
| Ticks de posse | 3307 | 3302 |
| Faltas cometidas (placebo — não deveria variar com technique) | 0.857 | 0.847 |

## Conclusão

O atributo **technique** teve impacto **positivo** e estatisticamente significativo: o time com technique=100 marcou em média 0.337 gols/partida a mais que o controle (tudo 50).
