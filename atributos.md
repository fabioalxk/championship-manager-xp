# Atributos do Jogador — o que cada um muda dentro de campo

Cada jogador tem **10 atributos** (era 39, depois 20, depois 11 — enxugado até
sobrar só o que comprovadamente decide jogos), todos na escala **0–100**, e
**todos são consumidos** pela simulação. A régua do corte: cada atributo,
isolado a 100 num time onde tudo mais é 50, precisa valer da ordem de **+0.5
gol/partida** contra um time todo-50. O que não alcançava foi fundido num
vizinho (somando as alavancas) ou removido.

> **Escala única:** internamente cada atributo vira `nrm(v) = v / 100` (0..1).
>
> **Onde vive a lógica:** `src/sim/ratings.ts` centraliza TODAS as fórmulas;
> `engine.ts` (física/lances) e `ai.ts` (decisões) as consomem. Se um número aqui não bate
> com o código, o código manda.

---

## Como os atributos viram a "nota" (overall)

A nota geral (`overallOf`, em `src/game/overall.ts`) é só uma **média ponderada** dos
atributos que mais importam para a posição — ela **descreve**, não **controla**:

| Posição | Atributos que puxam a nota (peso) |
|---|---|
| **Zagueiro/Lateral (DEF)** | defesa .36, posicionamento .24, físico .20, pace .10, passe .10 |
| **Meia (MID)** | passe .30, QI de jogo .20, drible .18, defesa .16, físico .16 |
| **Atacante (FWD)** | finalização .38, pace .20, drible .20, posicionamento .14, domínio .08 |
| **Goleiro (GK)** | goleiro .62, QI de jogo .20, físico .10, aceleração .08 |

---

## Físico (3)

### 1. pace — Velocidade
Velocidade **máxima** de corrida (`maxSpeed`).
- **No jogo:** define quem chega primeiro na bola dividida, quem persegue um contra-ataque e
  quem escapa do marcador em corrida reta. Um `pace` alto some com a defesa nas costas.

### 2. acceleration — Aceleração
Rapidez para **chegar** à velocidade máxima E **mudar de direção** sem frear (absorveu a
antiga agilidade) — `outfieldAccel`, `turnFloorOf`, parcela grande da velocidade efetiva.
- **No jogo:** manda nas distâncias curtas — arrancadas, tabelas, sair na frente na dividida,
  driblar mudando de direção. Também é metade da velocidade do goleiro na área.

### 3. strength — Físico
O pacote físico completo: **duelos de corpo, potência do chute, bola alta e fôlego**
(absorveu impulsão/cabeceio, equilíbrio e stamina/recuperação).
- **No jogo:** principal componente da **POTÊNCIA do chute** (`shotSpeed`); vence a dividida
  ombro a ombro (`carryPower`, `footing`); domina o jogo aéreo — quem ganha E direciona o
  cabeceio (`aerialPower`, mira da cabeçada); e decide quem **não apaga no 2º tempo**
  (dreno/recuperação de energia e profundidade da queda de ritmo).

---

## Técnico (5)

### 4. dribbling — Drible / talento
Manter a bola **colada no pé** no duelo, conduzir em velocidade E o **talento/ousadia**
(absorveu o flair: efeito no chute, arriscar o petardo).
- **No jogo:** principal fator de `carryPower` e `dribbleSpeedMul`; decide o drible 1v1
  (`beat`); dá **curva** ao chute (`flairSpin`), afia o chute decidido de perto e levanta a
  ambição de arriscar de longe (`shootRangeOf`).

### 5. firstTouch — Domínio / primeiro toque
Qualidade ao **matar a bola** que chega.
- **No jogo:** aumenta o **raio de controle** da bola solta (`controlReach`) e reduz a chance
  de **errar o domínio** (`miscontrol`). Toque ruim faz a bola espirrar e o lance se perder.

### 6. passing — Passe / técnica
**Velocidade e precisão** do passe rasteiro E alçado (cruzamento/escanteio), mais o refino
técnico geral (absorveu technique e o antigo crossing).
- **No jogo:** passador bom entrega mais rápido e com muito menos erro (`passSpread` com faixa
  larga); acha a cabeça do atacante no cruzamento; dá qualidade à reposição do goleiro.

### 7. finishing — Finalização
Precisão do chute em **qualquer distância** (absorveu o chute de longe) e o alcance de onde
o jogador topa arriscar — `shotSpread`, `shootRangeOf`.
- **No jogo:** é O fator da mira do chute: artilheiro converte a chance que o resto
  desperdiça, de perto ou de fora da área, e ainda tempera o custo de bater forte.

### 8. tackling — Defesa
**Desarme + marcação + intensidade da pressão** (absorveu marking e a parte "boa" da
agressividade/bravura).
- **No jogo:** domina `tacklePower` (roubar a bola no bote), `markPull` (colar no adversário),
  `tackleRange` (fechar o bote de mais longe) e a intensidade da pressão sem bola
  (`engagement`). O bom defensor pressiona, gruda e rouba.

---

## Mental (1)

### 9. positioning — QI de jogo
**Leitura espacial + frieza + decisão** (absorveu antecipação, movimentação, teamwork,
composure e decisions): o atributo mental único.
- **No jogo:** intercepta antes (`chaseLead`), evita ser driblado, aparece livre na área
  (`offBallAdvance`), mantém o bloco (`shapeMul`), erra menos sob pressão (mira do chute,
  domínio pressionado), **solta a bola na hora certa** (`holdMax`) e escolhe o melhor passe.
  O QI de jogo é o segundo atributo mais valioso do motor.

---

## Goleiro (1)

### 10. goalkeeping — Goleiro
O posto inteiro num atributo (absorveu reflexos, mãos/handling, saída aérea e 1v1): defesa,
alcance, rebote, saída no alto e mano a mano.
- **No jogo:** `gkSaveBase` (defender o chute), `gkReach`/mergulho (chegar no canto),
  `gkHoldChance` (segurar vs. dar rebote — o "frango" mora aqui), abafar cruzamento no alto,
  fechar o ângulo no 1v1 (`oneOnOneBonus`, sweeper) e a segunda tentativa no rebote.
- Jogador de linha tem `goalkeeping` baixo e quase não o usa.

---

## Mecânicas que atravessam vários atributos

- **Energia / cansaço:** cai ao longo do jogo. Reduz a velocidade e aumenta erros de domínio;
  o FÍSICO (`strength`) governa o dreno, a recuperação e a profundidade da queda.
- **Lesão / pancada (`knock`):** após falta dura, o jogador joga **mancando** (perde uma fração
  da velocidade), some devagar durante a partida.
- **Spread (variância):** quase toda ação (passe, cruzamento, chute) tem um erro aleatório.
  `passing` reduz o do passe, `finishing` o do chute; o QI de jogo (`positioning`) reduz ambos sob pressão.
- **Pressão:** ter um adversário perto piora domínio, passe, chute e a distribuição do
  goleiro — é onde o QI de jogo (`positioning`) faz diferença.
- **Faltas e cartões:** saem de botes esticados/errados (overreach) numa taxa fixa média — o
  antigo atributo de agressividade foi REMOVIDO (o ganho de bola que ele dava era anulado
  pelas faltas/cartões que causava; efeito líquido ~zero).

---

## O que virou o quê (histórico dos cortes: 39 → 20 → 10)

| Removido | Vive em | Removido | Vive em |
|---|---|---|---|
| agility | acceleration | vision, decisions, composure | positioning |
| balance, jumping, heading | strength | anticipation, offTheBall, teamwork | positioning |
| stamina, naturalFitness | strength | concentration | strength (cansaço) |
| workRate, bravery | tackling | consistency, technique | passing |
| crossing | passing | flair | dribbling |
| longShots | finishing | reflexes, handling, aerialReach, oneOnOne, kicking, throwing, communication | goalkeeping (e físico/passe na distribuição) |
| marking | tackling | **aggression** | **removido de vez** |

Nenhuma mecânica (cruzamento, cabeceio, rebote, 1v1, cartões...) sumiu do jogo — cada uma
só passou a ler o atributo que a absorveu.

---

### Resumo de uma linha por atributo

| Atributo | O que muda no jogo |
|---|---|
| pace | velocidade máxima de corrida |
| acceleration | arranque e mudança de direção; velocidade do GK |
| strength | físico completo: duelos, potência do chute, bola alta, fôlego |
| dribbling | drible, condução e talento (efeito/ousadia no chute) |
| firstTouch | dominar a bola sem erro |
| passing | passe raso e alçado + refino técnico |
| finishing | mira do chute em qualquer distância |
| tackling | defesa completa: desarme, marcação e pressão |
| positioning | QI de jogo: leitura, antecipação, movimentação e frieza/decisão |
| goalkeeping | goleiro completo: defesa, reflexo, rebote, saída e 1v1 |
