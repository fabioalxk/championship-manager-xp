# Atributos do Jogador — o que cada um muda dentro de campo

Cada jogador tem ~40 atributos, todos na escala **0–100**, e **todos são consumidos**
pela simulação. Este documento explica, em linguagem simples, **como cada atributo
influencia o jogo** — o que muda de verdade quando a bola está rolando.

> **Escala única:** internamente cada atributo vira `nrm(v) = v / 100` (0..1). Onde este
> texto diz "de X% a Y%", é a faixa do multiplicador entre um jogador de atributo 0 e um de 100.
>
> **Onde vive a lógica:** `src/sim/ratings.ts` centraliza TODAS as fórmulas abaixo;
> `engine.ts` (física/lances) e `ai.ts` (decisões) as consomem. Se um número aqui não bate
> com o código, o código manda.

---

## Como os atributos viram a "nota" (overall)

A nota geral (`overallOf`, em `src/game/overall.ts`) é só uma **média ponderada** dos
atributos que mais importam para a posição — ela **descreve**, não **controla**. Quem decide
o que acontece em campo são os atributos individuais, não a nota:

| Posição | Atributos que puxam a nota (peso) |
|---|---|
| **Zagueiro/Lateral (DEF)** | desarme .20, marcação .20, posicionamento .16, força .12, cabeceio .12, pace .10, passe .10 |
| **Meia (MID)** | passe .20, visão .16, fôlego .14, drible .14, técnica .12, desarme .12, empenho .12 |
| **Atacante (FWD)** | finalização .26, pace .18, drible .18, mov. sem bola .14, técnica .12, chute de longe .12 |
| **Goleiro (GK)** | defesa .22, reflexo .20, mãos .14, posicionamento .14, 1v1 .10, saída aérea .08, frieza .06, chute .06 |

Por isso dois jogadores de **mesma nota** podem jogar de formas completamente diferentes: um
lateral com pace 90/cruzamento 90 e marcação 40 tem a mesma média de outro com números
invertidos, mas em campo eles fazem coisas opostas.

---

## Físico (9)

### 1. pace — Velocidade
Velocidade **máxima** de corrida (`maxSpeed`). É o teto de quão rápido o jogador se desloca
em campo em corrida longa.
- **No jogo:** define quem chega primeiro na bola dividida, quem persegue um contra-ataque e
  quem escapa do marcador em corrida reta. Um `pace` alto some com a defesa nas costas.
- **Detalhe:** a velocidade final ainda cai com o **cansaço** (energia baixa) e com **lesão**
  (`knock`, joga mancando).

### 2. acceleration — Aceleração / arranque
Rapidez para **chegar** à velocidade máxima (`outfieldAccel`, e soma na velocidade efetiva).
- **No jogo:** manda nas distâncias curtas — arrancadas, tabelas, sair na frente na dividida.
  Nas curtas distâncias de uma partida, quem arranca melhor passa mais tempo no topo, então
  aceleração pesa quase tanto quanto o `pace`.
- **Bônus:** melhora a antecipação da corrida ao interceptar (`chaseLead`) e a velocidade do
  goleiro dentro da área (`gkMaxSpeed`).

### 3. agility — Agilidade
Capacidade de **mudar de direção** sem frear tanto (`turnFloor` — piso da curva).
- **No jogo:** driblador ágil muda de direção mantendo velocidade; jogador travado precisa
  quase parar para virar. Também ajuda a se manter em pé no drible (`footing`) e é peça-chave
  na **velocidade do goleiro** (agilidade + arranque valem mais que corrida longa na área).

### 4. balance — Equilíbrio
Resistência a **cair/tropeçar** no contato (`knockResist`) e firmeza para **proteger a bola**.
- **No jogo:** um cara equilibrado aguenta o empurrão, não perde o controle no encosto e
  raramente vai ao chão numa dividida. Entra em `footing` (manter-se em pé sob desafio),
  `carryPower` (segurar a bola no duelo) e `aerialPower` (firmeza no choque aéreo).

### 5. jumping — Impulsão
Salto para **disputar bola alta** (`aerialPower`, peso 0.6 — o maior).
- **No jogo:** decide quem ganha o cruzamento, o escanteio e a dividida pelo alto. Zagueiro e
  centroavante com impulsão dominam a área; sem ela, perdem toda bola aérea.

### 6. strength — Força
Potência física: **duelos, potência do chute e divididas no chão**.
- **No jogo:** empurra em `tacklePower` (roubar a bola), `carryPower` (segurar o duelo) e —
  importante — é o **principal componente da POTÊNCIA do chute** (`shotSpeed`): força alta =
  bola mais forte no gol. Também dá firmeza no contato aéreo.

### 7. stamina — Fôlego
Ritmo de **gasto de energia** ao longo do jogo.
- **No jogo:** quem tem pouco fôlego "apaga" no 2º tempo — perde velocidade mais cedo e mais
  fundo. `stamina` baixa **aprofunda a queda de ritmo** conforme a energia cai (não é só drenar
  mais rápido: o pico também despenca). Craques físicos mantêm intensidade os 90 minutos.

### 8. naturalFitness — Recuperação
Ritmo de **recuperar** energia (`recoverMul`, de 0.6× a 1.6×).
- **No jogo:** define quão rápido o jogador se recompõe entre as arrancadas. Dois jogadores
  com o mesmo fôlego, mas recuperação diferente, terminam a partida em estados bem distintos.

### 9. workRate — Empenho / intensidade sem bola
Intensidade de **pressão e marcação** quando não tem a bola.
- **No jogo:** empenho alto faz o jogador **fechar o bote mais cedo** e comprometer-se na
  marcação (`tackleRange`), pressionar mais e correr para ajudar. Empenho baixo = jogador que
  "não volta" (typo do ponta que só pensa em atacar).

---

## Técnico (10)

### 10. dribbling — Condução / drible
Manter a bola **colada no pé** no duelo e conduzir em velocidade.
- **No jogo:** principal fator de `carryPower` (peso 0.45 — segurar a bola no drible) e de
  `dribbleSpeedMul` (conduzir rápido sem perder o controle). Driblador passa pela marcação;
  quem tem drible baixo perde a bola ao tentar conduzir sob pressão.

### 11. firstTouch — Domínio / primeiro toque
Qualidade ao **matar a bola** que chega.
- **No jogo:** aumenta o **raio de controle** da bola solta (`controlReach` — domina de mais
  longe) e reduz a chance de **errar o domínio** (`miscontrol`). Matar uma bola forte exige
  primeiro toque; toque ruim faz a bola "espirrar" e o lance se perder.

### 12. technique — Técnica
Refino geral: **reduz o erro (spread)** de passes e chutes.
- **No jogo:** é o "afinador" da precisão. Não muda a decisão nem a velocidade, mas aperta a
  mira de tudo: passe (`passSpread`), cruzamento, e principalmente o chute — inclusive
  **tempera o custo de bater forte** (craque martela e ainda acerta o ângulo; `shotSpread`).

### 13. passing — Passe
**Velocidade e precisão** do passe (`passSpeed` 12→23 m/s, `passSpread`).
- **No jogo:** passador bom entrega mais rápido e com menos erro; passador ruim tem um **piso
  de erro** grande — espalha a bola mesmo sem pressão. É o atributo que separa o meia que
  "encaixa" o passe do que entrega no adversário.

### 14. crossing — Cruzamento
**Precisão da bola alçada** das pontas (`crossSpeed`/`crossSpread`).
- **No jogo:** manda no jogo aéreo ofensivo: cruzamento, escanteio e bola na área. Ponta com
  cruzamento alto acha a cabeça do atacante; com cruzamento baixo, joga fora ou na defesa.

### 15. finishing — Finalização
Precisão do **chute de perto** e potência (`shotSpeed`/`shotSpread`).
- **No jogo:** é o principal fator de precisão do chute quando **perto** do gol (peso decai com
  a distância). Também ajuda a bater firme e a **arriscar de mais longe** (`shootRangeOf`).
  Artilheiro converte a chance que o resto do time desperdiça.

### 16. longShots — Chute de longe
Precisão e alcance do chute **de fora da área**.
- **No jogo:** substitui a finalização como fator de mira conforme a **distância** cresce
  (`shotSpread` mistura os dois via `far` 0..1). Também estica o **alcance** de onde o jogador
  topa chutar (`shootRangeOf`). Sem isso, chutes de longe vão para a arquibancada.

### 17. heading — Cabeceio
Qualidade na **disputa aérea** (`aerialPower`, peso 0.3).
- **No jogo:** somado à impulsão, define quem ganha e quem **direciona** a bola de cabeça —
  em cruzamentos, escanteios e defesas pelo alto. Zagueiro cabeçudo alivia; centroavante
  cabeçudo finaliza cruzamento.

### 18. tackling — Desarme
Eficácia em **ganhar a bola no bote** (`tacklePower`, peso 0.55 — o maior).
- **No jogo:** determina se o carrinho/bote **rouba a bola** ou não no duelo de chão. Volante
  e zagueiro com desarme alto recuperam posse; desarme baixo faz falta ou passa batido.

### 19. marking — Marcação
Quão **colado** fica no adversário sem a bola (`markPull`, peso 0.8).
- **No jogo:** marcador bom gruda no atacante e fecha o espaço; marcação baixa deixa o homem
  livre. Combinada com antecipação (ler a corrida), aperta o espaço no ataque adversário.

---

## Mental (12)

### 20. vision — Visão
Enxergar e **escolher a melhor opção** de passe.
- **No jogo:** melhora a decisão de para quem passar (acha o companheiro melhor posicionado) e
  ajuda o **goleiro a distribuir** para o lado livre (`gkDistroQuality`). Visão alta = passes
  que quebram linhas; baixa = sempre o passe óbvio/lateral.

### 21. anticipation — Antecipação
**Ler a jogada** e chegar antes na bola (`chaseLead`).
- **No jogo:** antecipa a trajetória para interceptar passes e cortar cruzamentos antes do
  adversário. Também aperta a marcação (ler a corrida, em `markPull`). É o "faro" defensivo.

### 22. positioning — Posicionamento
**Posicionamento defensivo** e timing de antecipar a bola.
- **No jogo:** ajuda a se colocar no lugar certo para interceptar/desarmar (entra em
  `tacklePower`) e é **base da defesa do goleiro** (`gkSaveBase`, `gkRating`): goleiro bem
  posicionado já está no ângulo certo antes do chute.

### 23. offTheBall — Movimentação sem bola
Qualidade das **corridas de ataque** (`offBallAdvance`).
- **No jogo:** atacante com boa movimentação **avança e se oferece** — busca o espaço nas
  costas da defesa, dá opção de passe. Sem isso, o ataque fica estático e previsível.

### 24. decisions — Decisão
**Quando** conduzir, passar ou chutar (`holdMax`).
- **No jogo:** define quanto tempo o jogador **segura a bola** antes de agir. Boa decisão =
  solta na hora certa; decisão ruim = ou apressa e erra, ou enrola e é desarmado. Também
  melhora a distribuição do goleiro.

### 25. composure — Frieza / sangue-frio
Erra menos **sob pressão** (domínio, finalização, distribuição do GK).
- **No jogo:** aperta a mira do chute **sempre**, e **dobra de peso sob pressão** — o frio
  finaliza colocado com o marcador em cima; o nervoso "abre" o chute e erra o domínio quando
  pressionado (`miscontrol`, `passSpread`/`crossSpread` sob pressão, `shotSpread`).

### 26. concentration — Concentração
Menos **lapsos quando cansado**.
- **No jogo:** amortece o erro de domínio causado pelo **cansaço** de fim de jogo
  (`miscontrol`). Jogador concentrado mantém o nível no 2º tempo; distraído começa a falhar
  bobeira quando a energia cai.

### 27. consistency — Regularidade
Reduz a **variância aleatória** das ações (`spread`).
- **No jogo:** o irregular alterna lances geniais com erros absurdos (spread maior em passe e
  chute); o regular entrega perto do seu nível **toda vez**. É o que separa o craque confiável
  do talento imprevisível.

### 28. aggression — Agressividade
Propensão a **faltas e cartões**.
- **No jogo:** agressivo entra mais duro e comete mais faltas (e leva mais cartões). Bom para
  intimidar/roubar bola, ruim pelo risco de amarelo/vermelho e de dar falta em posição
  perigosa.

### 29. bravery — Bravura
Entrar em **botes mais arriscados** (`tackleRange`).
- **No jogo:** o bravo se **atira ao desarme de mais longe** — alcança botes que o cauteloso
  nem tenta (mas se erra, fica para trás). Coragem para o carrinho e para a dividida dura.

### 30. teamwork — Entrosamento
Manter o **bloco compacto** e dar apoio (`shapeMul`).
- **No jogo:** time entrosado mantém as linhas juntas e oferece opções de passe; entrosamento
  baixo estica o bloco e deixa buracos. É um atributo "de conjunto" mais que individual.

### 31. flair — Imprevisibilidade / talento
Criatividade e **efeito (curva) no chute** (`flairSpin`), e ousadia.
- **No jogo:** dá **curva/efeito** ao chute (`flairSpin` 0.4→1.0) e **afia o chute decidido de
  perto** (`shotSpread`); levanta a **ambição** de arriscar o petardo de longe que o sóbrio
  nem cogita (`shootRangeOf`). É a assinatura do jogador diferenciado.

---

## Goleiro (8)

*Jogador de linha tem estes atributos baixos e quase não os usa. Todos entram só quando o
jogador é GK.*

### 32. goalkeeping — Defesa-base
**Shot stopping** puro (`gkSaveBase`, peso 0.36 — junto com reflexo, o principal).
- **No jogo:** é a habilidade central de **defender o chute**. Goleiro com defesa alta pega o
  que é dele; baixa, toma gol de chute defensável.

### 33. reflexes — Reflexo
Reação curta: **alcance + rebote + reação**.
- **No jogo:** peso 0.36 em `gkSaveBase` e base do **alcance** (`gkReach`) — voa mais longe
  numa defesa de reação. Reflexo alto também faz o goleiro **soltar a bola mais rápido** ao
  distribuir (`gkHoldTime`), sem dar tempo de ser pressionado.
- **Curiosidade:** todo jogador tem `reflexes` — para jogadores de linha ele afeta o quão de
  **primeira** eles tocam/chutam/passam (`holdMax`).

### 34. handling — Mãos
**Segurar vs. espalmar**; evitar frango (`gkHoldChance`).
- **No jogo:** decide se o goleiro **encaixa** a bola ou dá **rebote**. Mãos boas seguram mesmo
  o chute forte (a bola forte dificulta, mas mãos firmes compensam); mãos ruins soltam sobra
  para o atacante — o "frango".

### 35. aerialReach — Saída aérea
**Alcance no alto** em bolas altas e cruzamentos.
- **No jogo:** goleiro que **sai bem** corta cruzamento e escanteio na área; alcance aéreo
  baixo fica preso na linha e sofre com bola alçada.

### 36. oneOnOne — Saída de frente / 1v1
Sair de frente para o atacante (**sweeper** e mano a mano).
- **No jogo:** define quão bem o goleiro **fecha o ângulo no 1v1** e antecipa a bola lançada
  nas costas da defesa. Alto = fecha o gol no frente a frente; baixo = é driblado ou vazado.

### 37. kicking — Tiro de meta / chutão
**Distância e potência** do chute longo (`gkKickSpeed`/`gkKickReach`).
- **No jogo:** manda longe no tiro de meta e no chutão de alívio — da área ao meio-campo.
  Kicking alto inicia contra-ataque com um lançamento; baixo entrega a bola no campo de defesa.

### 38. throwing — Reposição curta
**Lançamento de mão** / saída curta (`gkThrowSpeed`).
- **No jogo:** velocidade e qualidade da reposição rápida com a mão para começar a jogada
  jogando pelo chão, em vez de chutar.

### 39. communication — Comando de área
**Organizar e compactar** a linha de defesa (`commandShift`).
- **No jogo:** goleiro comunicativo "arruma" a defesa — mantém a linha compacta e bem
  posicionada. É um atributo que melhora o time à frente dele, não só o goleiro.

---

## Mecânicas que atravessam vários atributos

Alguns efeitos não são de um atributo só — vale entender o pano de fundo:

- **Energia / cansaço:** cai ao longo do jogo. Reduz a velocidade (mais fundo com `stamina`
  baixa) e aumenta erros de domínio (amortecido por `concentration`). `naturalFitness` recupera.
- **Lesão / pancada (`knock`):** após falta dura, o jogador joga **mancando** (perde uma fração
  da velocidade), some devagar durante a partida.
- **Spread (variância):** quase toda ação (passe, cruzamento, chute) tem um erro aleatório.
  `technique` e `consistency` **reduzem** esse erro; `composure` reduz sob pressão. É por isso
  que o mesmo jogador não acerta o mesmo passe toda vez — e o craque erra bem menos.
- **Pressão:** ter um adversário perto piora domínio, passe, cruzamento, chute e a distribuição
  do goleiro — e é justamente aí que `composure` (frieza) faz diferença.
- **Bola parada:** cruzamento (escanteio/lateral/tiro livre) usa `crossing`; a disputa na área
  usa impulsão + cabeceio; a barreira e o chute direto usam força + técnica + finalização.

---

### Resumo de uma linha por atributo

| Atributo | O que muda no jogo |
|---|---|
| pace | velocidade máxima de corrida |
| acceleration | arranque nas distâncias curtas |
| agility | mudar de direção sem frear; velocidade do GK |
| balance | não cair/tropeçar; proteger a bola |
| jumping | ganhar bola alta |
| strength | duelos + **potência do chute** |
| stamina | não apagar no 2º tempo |
| naturalFitness | recuperar energia |
| workRate | pressionar/marcar sem bola |
| dribbling | segurar e conduzir a bola no drible |
| firstTouch | dominar a bola sem erro |
| technique | precisão geral (reduz erro) |
| passing | velocidade e precisão do passe |
| crossing | precisão do cruzamento |
| finishing | precisão do chute de perto |
| longShots | precisão/alcance do chute de longe |
| heading | cabeceio na disputa aérea |
| tackling | roubar a bola no bote |
| marking | colar no adversário sem bola |
| vision | achar o melhor passe |
| anticipation | ler a jogada e interceptar |
| positioning | posicionamento defensivo; base do GK |
| offTheBall | corridas e movimentação no ataque |
| decisions | quando passar/chutar/conduzir |
| composure | frieza sob pressão (erra menos) |
| concentration | não falhar cansado |
| consistency | regularidade (menos altos e baixos) |
| aggression | faltas e cartões |
| bravery | botes mais arriscados |
| teamwork | manter o bloco compacto |
| flair | efeito no chute + ousadia |
| goalkeeping | defesa-base do goleiro |
| reflexes | reação/alcance do GK; tocar de primeira |
| handling | segurar vs. dar rebote |
| aerialReach | sair no alto/cruzamentos |
| oneOnOne | fechar o 1v1 / sweeper |
| kicking | tiro de meta/chutão longo |
| throwing | reposição curta de mão |
| communication | organizar a defesa |
