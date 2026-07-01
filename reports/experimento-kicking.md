# Experimento de isolamento de atributo — `kicking`

Metodologia: 100 partidas completas (11x11, motor físico real) simuladas.
Todos os atributos de todos os jogadores começam em 50. Em cada partida, o time
"teste" tem **kicking = 100** para os 11 jogadores; o time "controle" mantém
**tudo em 50** (inclusive kicking). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o viés estrutural do pontapé inicial.
Seed manual determinística (20260701 + i·104729) — reproduzível.

Tempo total: 20.2s (202ms/partida).

## Gols

| | Teste (kicking=100) | Controle (kicking=50) |
|---|---|---|
| Média de gols/partida | 0.830 | 0.970 |
| Desvio padrão | 0.865 | 1.020 |
| Total de gols (100 partidas) | 83 | 97 |

**Diferença média (teste − controle): -0.140 gols/partida** (desvio padrão da diferença: 1.491)

**Teste t pareado:** t = -0.94, p = 0.3477
→ NÃO estatisticamente significativo (95%).

## Resultado das partidas (do ponto de vista do time TESTE)

| Vitórias | Empates | Derrotas |
|---|---|---|
| 36 (36.0%) | 24 (24.0%) | 40 (40.0%) |

## Estatísticas complementares (médias por partida)

| Métrica | Teste | Controle |
|---|---|---|
| Finalizações | 2.100 | 2.150 |
| Finalizações no alvo | 1.510 | 1.920 |
| Ticks de posse | 3307 | 3370 |
| Faltas cometidas (placebo — não deveria variar com kicking) | 0.650 | 0.550 |

## Conclusão

O atributo **kicking** não mostrou impacto estatisticamente significativo nos gols em 100 partidas isoladas.
