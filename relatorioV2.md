# Relatório V2 — Experimentos de Isolamento de Atributo

Cada um dos **10 atributos** de `atributos.md` (enxugados de 39 → 20 → 10 — ver
o mapa "o que virou o quê" lá) foi testado isoladamente: 11×11, motor físico real
(`src/sim/engine.ts`), 500 partidas completas por atributo.
Todos os jogadores dos dois times começam com **todos os atributos em 50**. Em
cada partida, o time **Teste** tem o atributo em questão em **100** para os 11
jogadores; o time **Controle** mantém **tudo em 50** (inclusive esse atributo).
O mando de campo do time Teste alterna a cada partida para cancelar o viés do
pontapé inicial. Seeds determinísticas (reprodutível) — ver `src/game/experiments/attributeExperiment.ts`.

"Diferença" = gols/partida do Teste − gols/partida do Controle. Teste t pareado,
95% de confiança (|t| > 1.96 ⇒ significativo).

> **Meta desta rodada:** todo atributo isolado valendo da ordem de **+0.5
> gol/partida**. Atributos que não alcançavam sozinhos foram FUNDIDOS num
> vizinho (somando as alavancas — ex.: reflexo+1v1+defesa → goleiro) ou
> removidos (agressividade). Ver `atributos.md`.

## Ranking geral — do maior para o menor impacto em gols

| # | Atributo | Categoria | Gols Teste | Gols Controle | Diferença | p-valor | Resultado |
|---|---|---|---|---|---|---|---|
| 1 | strength | Físico | 1.226 | 0.448 | +0.778 | < 0.0001 | POSITIVO |
| 2 | positioning | Mental | 1.114 | 0.348 | +0.766 | < 0.0001 | POSITIVO |
| 3 | firstTouch | Técnico | 0.984 | 0.374 | +0.610 | < 0.0001 | POSITIVO |
| 4 | acceleration | Físico | 0.952 | 0.418 | +0.534 | < 0.0001 | POSITIVO |
| 5 | finishing | Técnico | 1.110 | 0.640 | +0.470 | < 0.0001 | POSITIVO |
| 6 | pace | Físico | 1.026 | 0.560 | +0.466 | < 0.0001 | POSITIVO |
| 7 | dribbling | Técnico | 0.988 | 0.588 | +0.400 | < 0.0001 | POSITIVO |
| 8 | tackling | Técnico | 0.784 | 0.422 | +0.362 | < 0.0001 | POSITIVO |
| 9 | goalkeeping | Goleiro | 0.602 | 0.246 | +0.356 | < 0.0001 | POSITIVO |
| 10 | passing | Técnico | 0.878 | 0.570 | +0.308 | < 0.0001 | POSITIVO |

---

## Físico

| Atributo | Gols Teste | Gols Controle | Diferença | Finalizações T/C | Finaliz. no alvo T/C | Posse T/C | Faltas T/C | V / E / D (Teste) | p-valor | Resultado |
|---|---|---|---|---|---|---|---|---|---|---|
| **pace** | 1.026 | 0.560 | +0.466 | 3.53 / 2.81 | 2.47 / 1.97 | 3424 / 3294 | 0.96 / 1.26 | 48% / 32% / 20% | < 0.0001 | POSITIVO |
| **acceleration** | 0.952 | 0.418 | +0.534 | 3.63 / 2.14 | 2.84 / 1.32 | 3428 / 3264 | 1.23 / 0.83 | 49% / 32% / 19% | < 0.0001 | POSITIVO |
| **strength** | 1.226 | 0.448 | +0.778 | 3.74 / 2.09 | 2.05 / 1.50 | 3542 / 3137 | 0.78 / 1.62 | 57% / 26% / 16% | < 0.0001 | POSITIVO |

## Técnico

| Atributo | Gols Teste | Gols Controle | Diferença | Finalizações T/C | Finaliz. no alvo T/C | Posse T/C | Faltas T/C | V / E / D (Teste) | p-valor | Resultado |
|---|---|---|---|---|---|---|---|---|---|---|
| **dribbling** | 0.988 | 0.588 | +0.400 | 2.92 / 2.31 | 2.46 / 1.70 | 3300 / 3377 | 1.02 / 0.85 | 45% / 34% / 21% | < 0.0001 | POSITIVO |
| **firstTouch** | 0.984 | 0.374 | +0.610 | 4.26 / 1.67 | 2.89 / 1.09 | 3518 / 3190 | 1.08 / 1.42 | 53% / 28% / 18% | < 0.0001 | POSITIVO |
| **passing** | 0.878 | 0.570 | +0.308 | 3.69 / 2.45 | 2.75 / 1.73 | 2915 / 3512 | 0.87 / 1.03 | 38% / 39% / 23% | < 0.0001 | POSITIVO |
| **finishing** | 1.110 | 0.640 | +0.470 | 4.05 / 2.76 | 2.88 / 2.03 | 3314 / 3380 | 1.13 / 1.12 | 49% / 29% / 22% | < 0.0001 | POSITIVO |
| **tackling** | 0.784 | 0.422 | +0.362 | 3.25 / 2.11 | 2.47 / 1.31 | 3379 / 3413 | 0.07 / 0.86 | 42% / 40% / 18% | < 0.0001 | POSITIVO |

## Mental

| Atributo | Gols Teste | Gols Controle | Diferença | Finalizações T/C | Finaliz. no alvo T/C | Posse T/C | Faltas T/C | V / E / D (Teste) | p-valor | Resultado |
|---|---|---|---|---|---|---|---|---|---|---|
| **positioning** | 1.114 | 0.348 | +0.766 | 3.72 / 2.07 | 3.14 / 1.31 | 3365 / 3375 | 0.96 / 0.56 | 59% / 30% / 11% | < 0.0001 | POSITIVO |

## Goleiro

| Atributo | Gols Teste | Gols Controle | Diferença | Finalizações T/C | Finaliz. no alvo T/C | Posse T/C | Faltas T/C | V / E / D (Teste) | p-valor | Resultado |
|---|---|---|---|---|---|---|---|---|---|---|
| **goalkeeping** | 0.602 | 0.246 | +0.356 | 2.64 / 2.65 | 1.84 / 2.70 | 3466 / 3350 | 1.10 / 1.08 | 40% / 46% / 14% | < 0.0001 | POSITIVO |

## Conclusão

- **10/10 atributos** tiveram impacto estatisticamente significativo (95%) nos gols quando isolados.
- **0/10 atributos** não mostraram efeito detectável nesta metodologia (isolar 1 atributo, 500 partidas): nenhum.

### Maior impacto POSITIVO (mais gols)
1. **strength**: +0.778 gols/partida
2. **positioning**: +0.766 gols/partida
3. **firstTouch**: +0.610 gols/partida
4. **acceleration**: +0.534 gols/partida
5. **finishing**: +0.470 gols/partida
6. **pace**: +0.466 gols/partida
7. **dribbling**: +0.400 gols/partida
8. **tackling**: +0.362 gols/partida



Relatórios individuais completos (com estatísticas de placebo e detalhes) em `reports/experimento-<atributo>.md`.
