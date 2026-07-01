# Relatório de Experimentos de Isolamento de Atributo

Cada atributo listado em `atributos.md` foi testado isoladamente: 11×11, motor
físico real (`src/sim/engine.ts`), 100 partidas completas por atributo.
Todos os jogadores dos dois times começam com **todos os atributos em 50**. Em
cada partida, o time **Teste** tem o atributo em questão em **100** para os 11
jogadores; o time **Controle** mantém **tudo em 50** (inclusive esse atributo).
O mando de campo do time Teste alterna a cada partida para cancelar o viés do
pontapé inicial. Seeds determinísticas (reprodutível) — ver `src/game/experiments/attributeExperiment.ts`.

"Diferença" = gols/partida do Teste − gols/partida do Controle. Teste t pareado,
95% de confiança (|t| > 1.96 ⇒ significativo).

> **Nota sobre amostra e comparações múltiplas:** 100 partidas/atributo é uma
> amostra menor (rodada assim de propósito, para ser rápida — a versão com 1000
> partidas, mais precisa, foi testada para `pace` em `reports/experimento-pace.md`).
> Com 39 testes a 95% de confiança, espera-se por puro acaso ~2 "falsos positivos"
> (p entre 0.01 e 0.05). Resultados com p bem abaixo de 0.001 (firstTouch, pace,
> dribbling, acceleration) são robustos; os de p entre 0.01–0.05 (flair, reflexes,
> positioning) valem uma segunda rodada com mais partidas antes de tirar conclusão
> definitiva.

## Ranking geral — do maior para o menor impacto em gols

| # | Atributo | Categoria | Gols Teste | Gols Controle | Diferença | p-valor | Resultado |
|---|---|---|---|---|---|---|---|
| 1 | firstTouch | Técnico | 1.330 | 0.640 | +0.690 | < 0.0001 | POSITIVO |
| 2 | pace | Físico | 1.480 | 0.810 | +0.670 | < 0.0001 | POSITIVO |
| 3 | dribbling | Técnico | 1.200 | 0.620 | +0.580 | < 0.0001 | POSITIVO |
| 4 | flair | Mental | 1.100 | 0.650 | +0.450 | 0.0028 | POSITIVO |
| 5 | acceleration | Físico | 1.180 | 0.770 | +0.410 | 0.0007 | POSITIVO |
| 6 | reflexes | Goleiro | 1.060 | 0.730 | +0.330 | 0.0184 | POSITIVO |
| 7 | passing | Técnico | 1.140 | 0.850 | +0.290 | 0.0628 | sem efeito |
| 8 | stamina | Físico | 0.980 | 0.710 | +0.270 | 0.0511 | sem efeito |
| 9 | positioning | Mental | 0.680 | 0.950 | -0.270 | 0.0324 | NEGATIVO |
| 10 | longShots | Técnico | 1.080 | 0.830 | +0.250 | 0.0941 | sem efeito |
| 11 | jumping | Físico | 1.030 | 0.820 | +0.210 | 0.1460 | sem efeito |
| 12 | crossing | Técnico | 1.050 | 0.870 | +0.180 | 0.1828 | sem efeito |
| 13 | marking | Técnico | 0.920 | 0.740 | +0.180 | 0.1604 | sem efeito |
| 14 | anticipation | Mental | 0.960 | 0.780 | +0.180 | 0.1526 | sem efeito |
| 15 | concentration | Mental | 0.720 | 0.890 | -0.170 | 0.2150 | sem efeito |
| 16 | teamwork | Mental | 0.860 | 1.020 | -0.160 | 0.2267 | sem efeito |
| 17 | balance | Físico | 1.030 | 0.890 | +0.140 | 0.3646 | sem efeito |
| 18 | kicking | Goleiro | 0.830 | 0.970 | -0.140 | 0.3477 | sem efeito |
| 19 | strength | Físico | 1.030 | 0.900 | +0.130 | 0.3930 | sem efeito |
| 20 | finishing | Técnico | 1.030 | 0.900 | +0.130 | 0.3547 | sem efeito |
| 21 | oneOnOne | Goleiro | 0.800 | 0.930 | -0.130 | 0.3367 | sem efeito |
| 22 | vision | Mental | 0.800 | 0.910 | -0.110 | 0.4245 | sem efeito |
| 23 | goalkeeping | Goleiro | 0.750 | 0.860 | -0.110 | 0.4117 | sem efeito |
| 24 | offTheBall | Mental | 1.040 | 0.940 | +0.100 | 0.5127 | sem efeito |
| 25 | decisions | Mental | 0.890 | 0.790 | +0.100 | 0.4669 | sem efeito |
| 26 | communication | Goleiro | 0.810 | 0.720 | +0.090 | 0.4820 | sem efeito |
| 27 | tackling | Técnico | 0.840 | 0.920 | -0.080 | 0.5786 | sem efeito |
| 28 | consistency | Mental | 0.910 | 0.980 | -0.070 | 0.6360 | sem efeito |
| 29 | throwing | Goleiro | 0.810 | 0.880 | -0.070 | 0.5728 | sem efeito |
| 30 | technique | Técnico | 1.030 | 0.980 | +0.050 | 0.7114 | sem efeito |
| 31 | aggression | Mental | 0.840 | 0.790 | +0.050 | 0.6682 | sem efeito |
| 32 | handling | Goleiro | 0.770 | 0.820 | -0.050 | 0.7098 | sem efeito |
| 33 | workRate | Físico | 0.860 | 0.900 | -0.040 | 0.7738 | sem efeito |
| 34 | aerialReach | Goleiro | 0.800 | 0.840 | -0.040 | 0.7703 | sem efeito |
| 35 | agility | Físico | 0.900 | 0.870 | +0.030 | 0.8214 | sem efeito |
| 36 | heading | Técnico | 0.870 | 0.840 | +0.030 | 0.8224 | sem efeito |
| 37 | bravery | Mental | 0.870 | 0.900 | -0.030 | 0.8315 | sem efeito |
| 38 | naturalFitness | Físico | 0.940 | 0.920 | +0.020 | 0.8840 | sem efeito |
| 39 | composure | Mental | 0.910 | 0.930 | -0.020 | 0.8765 | sem efeito |

---

## Físico

| Atributo | Gols Teste | Gols Controle | Diferença | Finalizações T/C | Finaliz. no alvo T/C | Posse T/C | Faltas T/C | V / E / D (Teste) | p-valor | Resultado |
|---|---|---|---|---|---|---|---|---|---|---|
| **pace** | 1.480 | 0.810 | +0.670 | 2.83 / 2.32 | 2.45 / 1.62 | 3520 / 3164 | 0.78 / 1.13 | 63% / 14% / 23% | < 0.0001 | POSITIVO |
| **acceleration** | 1.180 | 0.770 | +0.410 | 2.68 / 2.04 | 2.25 / 1.50 | 3360 / 3316 | 0.71 / 0.96 | 49% / 28% / 23% | 0.0007 | POSITIVO |
| **agility** | 0.900 | 0.870 | +0.030 | 2.36 / 1.99 | 1.80 / 1.86 | 3362 / 3263 | 0.72 / 0.47 | 41% / 25% / 34% | 0.8214 | sem efeito |
| **balance** | 1.030 | 0.890 | +0.140 | 2.08 / 2.01 | 1.57 / 1.64 | 3377 / 3276 | 0.76 / 0.84 | 45% / 23% / 32% | 0.3646 | sem efeito |
| **jumping** | 1.030 | 0.820 | +0.210 | 2.02 / 1.93 | 1.76 / 1.59 | 3402 / 3335 | 0.79 / 0.82 | 43% / 23% / 34% | 0.1460 | sem efeito |
| **strength** | 1.030 | 0.900 | +0.130 | 2.05 / 2.16 | 1.33 / 1.58 | 3371 / 3281 | 0.49 / 0.67 | 40% / 30% / 30% | 0.3930 | sem efeito |
| **stamina** | 0.980 | 0.710 | +0.270 | 2.42 / 2.02 | 1.67 / 1.59 | 3373 / 3269 | 0.63 / 0.84 | 41% / 34% / 25% | 0.0511 | sem efeito |
| **naturalFitness** | 0.940 | 0.920 | +0.020 | 2.05 / 2.16 | 1.74 / 1.66 | 3273 / 3297 | 0.78 / 0.64 | 36% / 25% / 39% | 0.8840 | sem efeito |
| **workRate** | 0.860 | 0.900 | -0.040 | 2.17 / 1.95 | 1.74 / 1.63 | 3352 / 3315 | 0.91 / 0.82 | 37% / 26% / 37% | 0.7738 | sem efeito |

## Técnico

| Atributo | Gols Teste | Gols Controle | Diferença | Finalizações T/C | Finaliz. no alvo T/C | Posse T/C | Faltas T/C | V / E / D (Teste) | p-valor | Resultado |
|---|---|---|---|---|---|---|---|---|---|---|
| **dribbling** | 1.200 | 0.620 | +0.580 | 2.54 / 1.67 | 2.03 / 1.32 | 3254 / 3318 | 0.46 / 0.66 | 51% / 29% / 20% | < 0.0001 | POSITIVO |
| **firstTouch** | 1.330 | 0.640 | +0.690 | 2.85 / 1.65 | 2.27 / 1.31 | 3467 / 3209 | 0.65 / 0.84 | 56% / 27% / 17% | < 0.0001 | POSITIVO |
| **technique** | 1.030 | 0.980 | +0.050 | 2.18 / 2.15 | 1.90 / 1.61 | 3298 / 3373 | 0.44 / 0.60 | 35% / 29% / 36% | 0.7114 | sem efeito |
| **passing** | 1.140 | 0.850 | +0.290 | 2.23 / 2.06 | 1.70 / 1.59 | 3012 / 3541 | 0.61 / 0.60 | 41% / 29% / 30% | 0.0628 | sem efeito |
| **crossing** | 1.050 | 0.870 | +0.180 | 2.23 / 2.00 | 1.76 / 1.49 | 3276 / 3252 | 0.62 / 0.77 | 37% / 35% / 28% | 0.1828 | sem efeito |
| **finishing** | 1.030 | 0.900 | +0.130 | 2.58 / 2.07 | 1.75 / 1.70 | 3250 / 3338 | 0.68 / 0.54 | 38% / 29% / 33% | 0.3547 | sem efeito |
| **longShots** | 1.080 | 0.830 | +0.250 | 2.67 / 1.90 | 2.07 / 1.55 | 3289 / 3288 | 0.68 / 0.59 | 39% / 30% / 31% | 0.0941 | sem efeito |
| **heading** | 0.870 | 0.840 | +0.030 | 2.05 / 1.95 | 1.65 / 1.65 | 3301 / 3346 | 0.53 / 0.85 | 34% / 29% / 37% | 0.8224 | sem efeito |
| **tackling** | 0.840 | 0.920 | -0.080 | 1.93 / 2.25 | 1.52 / 1.78 | 3299 / 3323 | 0.49 / 0.59 | 33% / 31% / 36% | 0.5786 | sem efeito |
| **marking** | 0.920 | 0.740 | +0.180 | 1.96 / 1.77 | 1.57 / 1.67 | 3297 / 3392 | 0.98 / 0.57 | 43% / 26% / 31% | 0.1604 | sem efeito |

## Mental

| Atributo | Gols Teste | Gols Controle | Diferença | Finalizações T/C | Finaliz. no alvo T/C | Posse T/C | Faltas T/C | V / E / D (Teste) | p-valor | Resultado |
|---|---|---|---|---|---|---|---|---|---|---|
| **vision** | 0.800 | 0.910 | -0.110 | 2.00 / 1.99 | 1.38 / 1.68 | 3309 / 3329 | 0.65 / 0.56 | 27% / 40% / 33% | 0.4245 | sem efeito |
| **anticipation** | 0.960 | 0.780 | +0.180 | 2.29 / 2.04 | 1.80 / 1.41 | 3406 / 3288 | 0.80 / 0.86 | 34% / 40% / 26% | 0.1526 | sem efeito |
| **positioning** | 0.680 | 0.950 | -0.270 | 1.84 / 2.26 | 1.40 / 1.77 | 3215 / 3425 | 0.73 / 0.80 | 31% / 26% / 43% | 0.0324 | NEGATIVO |
| **offTheBall** | 1.040 | 0.940 | +0.100 | 2.25 / 2.06 | 1.84 / 1.62 | 3277 / 3346 | 1.15 / 0.64 | 43% / 23% / 34% | 0.5127 | sem efeito |
| **decisions** | 0.890 | 0.790 | +0.100 | 2.05 / 2.00 | 1.66 / 1.58 | 3243 / 3258 | 0.79 / 1.08 | 38% / 34% / 28% | 0.4669 | sem efeito |
| **composure** | 0.910 | 0.930 | -0.020 | 2.07 / 2.12 | 1.79 / 1.85 | 3355 / 3264 | 0.48 / 0.63 | 33% / 35% / 32% | 0.8765 | sem efeito |
| **concentration** | 0.720 | 0.890 | -0.170 | 1.93 / 2.23 | 1.39 / 1.76 | 3252 / 3360 | 0.70 / 0.59 | 27% / 33% / 40% | 0.2150 | sem efeito |
| **consistency** | 0.910 | 0.980 | -0.070 | 2.17 / 2.26 | 1.70 / 1.69 | 3282 / 3318 | 0.77 / 0.58 | 33% / 27% / 40% | 0.6360 | sem efeito |
| **aggression** | 0.840 | 0.790 | +0.050 | 2.06 / 2.04 | 1.63 / 1.60 | 3313 / 3254 | 1.05 / 0.67 | 35% / 35% / 30% | 0.6682 | sem efeito |
| **bravery** | 0.870 | 0.900 | -0.030 | 2.19 / 2.07 | 1.51 / 1.66 | 3332 / 3267 | 0.67 / 0.62 | 37% / 26% / 37% | 0.8315 | sem efeito |
| **teamwork** | 0.860 | 1.020 | -0.160 | 2.13 / 1.70 | 1.73 / 1.74 | 3212 / 3392 | 0.96 / 0.69 | 32% / 31% / 37% | 0.2267 | sem efeito |
| **flair** | 1.100 | 0.650 | +0.450 | 2.64 / 1.88 | 2.16 / 1.38 | 3285 / 3304 | 0.79 / 0.72 | 46% / 28% / 26% | 0.0028 | POSITIVO |

## Goleiro

| Atributo | Gols Teste | Gols Controle | Diferença | Finalizações T/C | Finaliz. no alvo T/C | Posse T/C | Faltas T/C | V / E / D (Teste) | p-valor | Resultado |
|---|---|---|---|---|---|---|---|---|---|---|
| **goalkeeping** | 0.750 | 0.860 | -0.110 | 1.87 / 2.23 | 1.36 / 1.76 | 3265 / 3350 | 0.69 / 0.54 | 30% / 33% / 37% | 0.4117 | sem efeito |
| **reflexes** | 1.060 | 0.730 | +0.330 | 2.30 / 2.18 | 1.79 / 2.16 | 3392 / 3251 | 0.65 / 0.68 | 42% / 34% / 24% | 0.0184 | POSITIVO |
| **handling** | 0.770 | 0.820 | -0.050 | 1.92 / 2.12 | 1.40 / 1.77 | 3269 / 3360 | 0.70 / 0.58 | 27% / 40% / 33% | 0.7098 | sem efeito |
| **aerialReach** | 0.800 | 0.840 | -0.040 | 1.90 / 2.13 | 1.50 / 1.80 | 3275 / 3352 | 0.68 / 0.59 | 33% / 30% / 37% | 0.7703 | sem efeito |
| **oneOnOne** | 0.800 | 0.930 | -0.130 | 1.74 / 2.30 | 1.41 / 2.13 | 3250 / 3366 | 0.71 / 0.75 | 32% / 32% / 36% | 0.3367 | sem efeito |
| **kicking** | 0.830 | 0.970 | -0.140 | 2.10 / 2.15 | 1.51 / 1.92 | 3307 / 3370 | 0.65 / 0.55 | 36% / 24% / 40% | 0.3477 | sem efeito |
| **throwing** | 0.810 | 0.880 | -0.070 | 1.78 / 2.20 | 1.40 / 1.72 | 3292 / 3336 | 0.68 / 0.60 | 32% / 34% / 34% | 0.5728 | sem efeito |
| **communication** | 0.810 | 0.720 | +0.090 | 1.87 / 2.18 | 1.53 / 1.49 | 3338 / 3367 | 0.73 / 0.64 | 35% / 32% / 33% | 0.4820 | sem efeito |

## Conclusão

- **7/39 atributos** tiveram impacto estatisticamente significativo (95%) nos gols quando isolados.
- **32/39 atributos** não mostraram efeito detectável nesta metodologia (isolar 1 atributo, 100 partidas): agility, balance, jumping, strength, stamina, naturalFitness, workRate, technique, passing, crossing, finishing, longShots, heading, tackling, marking, vision, anticipation, offTheBall, decisions, composure, concentration, consistency, aggression, bravery, teamwork, goalkeeping, handling, aerialReach, oneOnOne, kicking, throwing, communication.

### Maior impacto POSITIVO (mais gols)
1. **firstTouch**: +0.690 gols/partida
2. **pace**: +0.670 gols/partida
3. **dribbling**: +0.580 gols/partida
4. **flair**: +0.450 gols/partida
5. **acceleration**: +0.410 gols/partida
6. **reflexes**: +0.330 gols/partida

### Impacto NEGATIVO (menos gols que o controle)
- **positioning**: -0.270 gols/partida


Relatórios individuais completos (com estatísticas de placebo e detalhes) em `reports/experimento-<atributo>.md`.
