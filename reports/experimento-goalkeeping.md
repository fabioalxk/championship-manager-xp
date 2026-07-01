# Experimento de isolamento de atributo — `goalkeeping`

Metodologia: 500 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **goalkeeping = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive goalkeeping). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 130.2s (260ms/partida).

## Gols

| | Teste (goalkeeping=100) | Controle (goalkeeping=50) |
|---|---|---|
| Média de gols/partida | 0.602 | 0.246 |
| Desvio padrão | 0.759 | 0.500 |
| Total de gols (500 partidas) | 301 | 123 |

**Diferença média (teste − controle): 0.356 gols/partida** (desvio padrão da diferença: 0.929)

**Teste t pareado:** t = 8.57, p < 0.0001
→ Estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 201 (40.2%) | 231 (46.2%) | 68 (13.6%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 2.642 | 2.654 |
| Finalizações no alvo | 1.844 | 2.700 |
| Ticks de posse | 3466 | 3350 |
| Faltas cometidas (placebo — não deveria variar com goalkeeping) | 1.100 | 1.080 |

## Conclusão

O atributo **goalkeeping** teve impacto **positivo** e estatisticamente significativo: o time com goalkeeping=100 marcou em média 0.356 gols/partida a mais que o controle (tudo 50).
