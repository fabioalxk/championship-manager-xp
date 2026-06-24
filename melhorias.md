# 50 melhorias do jogo — com nota de importância (0–100)

Lista de melhorias **além do goleiro** (esse já tem o `goleiro.md`). A nota é a
**importância** para um simulador de futebol crível e divertido: quanto mais alta,
mais o jogo "ganha" ao implementar. Cada item aponta onde mexeria.

> Critério da nota: realismo + impacto na jogabilidade + frequência com que aparece
> numa partida. Esforço NÃO entra na nota (alguns itens caros valem muito).

---

## 🏆 Top prioridades (nota ≥ 80)

| Nota | # | Melhoria |
|----:|---|----------|
| 95 | 1 | Colisão bola ↔ jogador de linha (hoje a bola atravessa todos) |
| 92 | 2 | Pênalti (falta/mão na área → cobrança) |
| 90 | 3 | Cartão vermelho e jogar com 10 |
| 90 | 4 | Marcação individual na defesa (atacante não fica livre) |
| 88 | 5 | Interceptação de passes pela defesa |
| 87 | 6 | Escanteio de verdade |
| 86 | 7 | Eixo Z / altura da bola (chão vs. ar) |
| 84 | 8 | Cabeceio e jogo aéreo |
| 83 | 9 | Pressing coordenado (1 pressiona, resto cobre) |
| 82 | 10 | Tiro de meta vs. escanteio (distinguir saída pela linha de fundo) |
| 80 | 11 | Contra-ataque / transição rápida ao recuperar a bola |
| 80 | 12 | Cruzamentos (bola da linha de fundo/lateral para a área) |

---

## A. Regras e fluxo da partida

1. **Pênalti** — falta dentro da área vira cobrança 1v1 com o goleiro. Hoje toda
   falta é cobrança normal. `engine.ts tryTackle/scoreGoal`. **Nota: 92**
2. **Cartão vermelho + jogar com 10** — só existe amarelo; falta dura/2º amarelo
   deveria expulsar e remover o jogador do `players`. `engine.ts tryTackle`. **Nota: 90**
3. **Escanteio de verdade** — bola na linha de fundo (fora do gol) tocada por último
   pela defesa → escanteio, não quique de volta. `engine.ts resolveBounds`. **Nota: 87**
4. **Tiro de meta vs. escanteio** — distinguir quem tocou por último na linha de fundo
   (ataque → tiro de meta; defesa → escanteio). `resolveBounds`. **Nota: 82**
5. **Acréscimos (stoppage time)** — somar tempo perdido com faltas/gols/cartões ao
   fim de cada tempo. `engine.ts step` (transições de tempo). **Nota: 70**
6. **Prorrogação + pênaltis** — para modo mata-mata em empate. `engine.ts`. **Nota: 45**
7. **Lei da vantagem** — não parar a falta se o time que sofreu segue com a bola em
   vantagem. `tryTackle`. **Nota: 48**
8. **Regra do recuo (back-pass)** — goleiro não pode pegar com a mão recuo de pé do
   companheiro; hoje ele sempre domina. `engine.ts tryGainLoose`. **Nota: 40**
9. **Bola ao chão / disputa no reinício** após cabeçada perigosa, etc. **Nota: 25**
10. **Quem toca por último** rastreado de forma confiável (`lastTouchId`) — base para
    laterais, escanteios e impedimento corretos. `engine.ts`. **Nota: 66**

## B. Física e bola

11. **Colisão bola ↔ jogador de linha** — hoje só o GK e a trave interagem; a bola
    atravessa os 20 jogadores de linha (passes/chutes passam por corpos). Maior furo
    de realismo do motor. `engine.ts` física da bola/`separate`. **Nota: 95**
12. **Eixo Z (altura da bola)** — bola só existe no plano 2D; sem isso não há lob,
    cabeçada, voleio nem cruzamento alto reais. `types.ts Ball`, física. **Nota: 86**
13. **Cabeceio / jogo aéreo** — disputa de bola alta por altura + `aerialReach`.
    Depende do eixo Z. **Nota: 84**
14. **Deflexão/desvio** — chutes/passes que batem em pernas mudam de direção (cria
    gols de sorte, bola viva). Depende do item 11. **Nota: 60**
15. **Atrito da grama variável** — bola corre diferente conforme a velocidade (já há
    `ballDamping`; refinar curva). `constants.PHYS`. **Nota: 35**
16. **Quique vertical / restituição no gramado** — junto do eixo Z. **Nota: 40**

## C. IA tática (sem a bola)

17. **Marcação individual** — defensores grudam em adversários atribuídos, não só no
    bloco zonal; hoje o atacante fica livre na área. `ai.ts defendTarget`. **Nota: 90**
18. **Interceptação de passe** — defensor lê a linha de passe (já há `laneClearance`)
    e corta a bola no caminho. `ai.ts`/`engine.ts`. **Nota: 88**
19. **Pressing coordenado** — 1 pressiona a bola enquanto os outros cobrem sombras,
    não vários correndo ao mesmo ponto. `ai.ts desiredTarget`. **Nota: 83**
20. **Contra-ataque / transição** — ao recuperar a bola, lançar rápido para frente
    em vez de só recompor o bloco. `ai.ts/decideAction`. **Nota: 80**
21. **Linha de impedimento ofensiva ativa** — defesa SOBE em conjunto para deixar o
    atacante em impedimento (armadilha). Hoje o impedimento é só passivo. **Nota: 62**
22. **Ultrapassagens (overlaps)** — lateral/volante apoiando por fora do conduto.
    `ai.ts attackTarget`. **Nota: 50**
23. **Coberturas e dobras** — segundo defensor cobre o que foi driblado. **Nota: 58**
24. **Basculação por setor** — bloco desloca conforme o lado da bola (já parcial via
    `blockShiftY`; refinar por faixas). **Nota: 40**
25. **Triangulação / tabela** — passe e segue para abrir o passe seguinte. **Nota: 42**
26. **Gestão de espaço do recebedor** — atacante se desmarca para a linha de passe
    livre, não só fica na formação. `ai.ts`. **Nota: 55**

## D. IA com a bola

27. **Finalização mirando o canto longe do GK** — escolher o lado conforme a posição
    do goleiro, não ruído puro. `ai.ts decideAction`. **Nota: 65**
28. **Drible / finta no 1v1** — conduto tenta passar pelo marcador conforme dribbling,
    hoje a posse é resolvida só por probabilidade. `engine.ts tryTackle`. **Nota: 60**
29. **Passe de primeira (one-touch)** — bater sem dominar quando sob pressão. **Nota: 38**
30. **Decisão sob pressão pela frieza** — `composure` afeta erro de passe/domínio de
    todos, não só do GK. `ratings.ts`. **Nota: 45**
31. **Aproveitar o rebote / segunda bola** — atacante ataca rebote do GK (agora que o
    goleiro espalma). `ai.ts desiredTarget`. **Nota: 58**
32. **Cruzamento da linha de fundo/lateral para a área** — buscar cabeceador.
    Depende do eixo Z. **Nota: 80**

## E. Bola parada

33. **Rotina de escanteio** — atacantes sobem para a área, GK e defesa marcam.
    Depende do item 3. `ai.ts` (estado de bola parada). **Nota: 60**
34. **Barreira em falta + chute direto** — montar barreira e cobrar no ângulo perto
    da área. `engine.ts deadball`. **Nota: 58**
35. **Cobrança de pênalti** dedicada (mira vs. defesa do GK). Depende do item 1. **Nota: 55**
36. **Lateral cobrado para um companheiro livre** (já existe básico; melhorar a
    escolha do alvo e curtas/longas). **Nota: 30**

## F. Jogadores, dados e meta-jogo

37. **Mais times / banco de jogadores** — hoje só Brasil × Argentina fixos.
    `teams.ts`. **Nota: 78**
38. **Escolha de formação/tática** (4-4-2, 4-2-3-1...) na UI. `formation.ts`. **Nota: 60**
39. **Substituições** — banco de reservas e trocas (cansaço/lesão/tática). **Nota: 55**
40. **Liga / temporada / tabela de classificação** — dá propósito ("cm" =
    Championship/Career Manager?). `App.tsx` + novo módulo. **Nota: 70**
41. **Save/Load de partida e da temporada** (seed + estado serializado). **Nota: 52**
42. **Lesões** — chance em carrinhos/sprints; tira o jogador. **Nota: 45**
43. **Moral / forma / confiança** — modificadores de desempenho ao longo do jogo. **Nota: 38**
44. **Química/entrosamento de time** afeta passe/posicionamento. **Nota: 30**
45. **Força relativa / nível de dificuldade** configurável. **Nota: 42**

## G. Apresentação, UX e arquitetura

46. **Replay do gol** (buffer das últimas posições, re-render em câmera fechada). **Nota: 50**
47. **Estatísticas avançadas (xG, passes certos/errados, posse real por toque)** +
    `lastTouch`. `App.tsx`. **Nota: 55**
48. **Câmera que segue a bola / zoom** em vez de campo inteiro fixo. `renderer.ts`. **Nota: 40**
49. **Testes automatizados da simulação** (partida determinística por seed: invariantes
    de placar, sem NaN, sem jogador fora do campo). **Nota: 60**
50. **Performance: spatial hashing** para `separate`/colisões (hoje O(n²) por par; ok
    com 22, mas trava com replays/múltiplas partidas). `engine.ts`. **Nota: 35**

---

## Resumo por faixa de importância

- **90–95 (faça primeiro):** 11 colisão bola↔jogador · 1 pênalti · 2 vermelho ·
  17 marcação individual · 5 interceptação.
- **80–88 (alto impacto):** 7 escanteio · 12 eixo Z · 13 cabeceio · 19 pressing ·
  4 tiro de meta/escanteio · 20 contra-ataque · 32 cruzamento.
- **60–78 (enriquece muito):** mais times, liga, acréscimos, deflexão, finalização no
  canto, drible, testes, rebote, rotinas de bola parada.
- **30–58 (polimento):** formações, substituições, lesões, replay, câmera, xG,
  vantagem, performance, moral.

**Sugestão de ordem:** 11 → 1/2 → 17/18 → 7/4 → 12/13 → 19/20. A colisão bola↔jogador
(11) é o maior salto de realismo por destravar deflexões, interceptações físicas e
disputas, e é pré-requisito de vários outros.
