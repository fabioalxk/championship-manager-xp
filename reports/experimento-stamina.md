# Experimento de isolamento de atributo — `stamina`

Metodologia: 300 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **stamina = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive stamina). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 76.6s (255ms/partida).

## Gols

| | Teste (stamina=100) | Controle (stamina=50) |
|---|---|---|
| Média de gols/partida | 1.070 | 0.757 |
| Desvio padrão | 0.942 | 0.837 |
| Total de gols (300 partidas) | 321 | 227 |

**Diferença média (teste − controle): 0.313 gols/partida** (desvio padrão da diferença: 1.294)

**Teste t pareado:** t = 4.19, p < 0.0001
→ Estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 127 (42.3%) | 97 (32.3%) | 76 (25.3%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 3.393 | 3.227 |
| Finalizações no alvo | 2.813 | 2.520 |
| Ticks de posse | 3344 | 3234 |
| Faltas cometidas (placebo — não deveria variar com stamina) | 0.817 | 0.913 |

## Conclusão

O atributo **stamina** teve impacto **positivo** e estatisticamente significativo: o time com stamina=100 marcou em média 0.313 gols/partida a mais que o controle (tudo 50).
