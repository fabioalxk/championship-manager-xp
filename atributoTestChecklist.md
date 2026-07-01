# 🧪 Checklist de Simulações por Atributo

Para **cada atributo** existe uma simulação isolada que prova que ele **muda o
comportamento** do motor na direção certa — variando o atributo em **30/50/70/90**
(resto em 50) e medindo uma métrica real.

## Como rodar

Harnesses: **`tools/percentuais.ts`** (✅ **% de sucesso para TODOS os 39 atributos**),
**`tools/attrsim.ts`** (39 atributos isolados, unidades nativas), **`tools/confrontos.ts`**
(matrizes 2-lados: atacante × defensor, força→chute, gol de longe vs GK, taxa de defesa do GK),
**`tools/partida.ts`** (partidas completas reais) e **`tools/dribbletest.ts`** (drible 1v1).
A lógica compartilhada vive em **`tools/_simlib.ts`** (fonte única). Importam as funções/constantes **reais**
(`src/sim/ratings.ts`, `src/sim/constants.ts`) e reproduzem as resoluções do
`engine.ts` verbatim, rodando N amostras com `Math.random()`.

```bash
node -e "import('esbuild').then(async({build})=>{const{pathToFileURL}=await import('node:url');\
const o='.test-build/t.mjs';await build({entryPoints:['tools/attrsim.ts'],bundle:true,\
platform:'node',format:'esm',packages:'external',outfile:o,logLevel:'error'});\
await import(pathToFileURL(o).href)})" && rm -rf .test-build
```

**Critérios de aprovação:** (1) **monotônico** — mais atributo → melhor métrica;
(2) **faixa plausível** — não saturado em ~0%/~100%; (3) **perfis distintos** —
elite/mediano/ruim dão números diferentes.

Legenda: ✅ validado (monotônico) · ⬜ a fazer

---

## ⚽ FÍSICO

- [x] ✅ **pace** — `maxSpeed` · velocidade de topo **7.1→9.7 m/s** (30→90). Sim dedicada `tools/velocidade.ts`:
  topo **26 km/h** (zagueirão lento) → **37.5 km/h** (foguete); spread **11.5 km/h** (real ~30→36).
  Em PARTIDA real (rápido 88 × lento 35): **gols 9:1, chutes 4:1, 100% vitórias** com posse só 54% —
  o rápido ROMPE e cria chance (não domina posse). ✅ velocidade pesa muito em jogo.
- [x] ✅ **acceleration** — `outfieldAccel`+kinemática · tempo p/ 10 m **1.46→1.32 s**. 30m: **4.43s** (lento) → **3.17s** (elite).
- [x] ✅ **agility** — `turnFloorOf` · retenção de ritmo na curva **0.47→0.71**.
- [x] ✅ **balance** — `footing`/stagger · fica em pé ao ser desarmado **64.5→76.6%**.
- [x] ✅ **jumping** — duelo aéreo (`aerialDuelEdge`) · ganha o salto **42→65%**.
- [x] ✅ **strength** — `shotSpeed` **22.8→32.4 m/s** · mantém a bola no duelo **43→58%**.
- [x] ✅ **stamina** — drena `STAMINA` · minutos até exaustão sprintando **1.1→1.9**.
- [x] ✅ **naturalFitness** — `recoverMul` · resiste à exaustão **1.2→1.3** (forte mesmo é na recuperação).
- [x] ✅ **workRate** — `tackleRange` · alcance/antecipação do bote **2.40→2.70 m**.

## 🎯 TÉCNICO

- [x] ✅ **dribbling** — take-on 1v1 (`engine.ts:490`) · passa e segue **24→60%** (vs def50). Detalhe em `dribbletest.ts`.
- [x] ✅ **firstTouch** — `miscontrol` · domínio limpo de bola forte **88.8→95.3%**.
- [x] ✅ **technique** — `spread` · passe certo (24 m, tol 1.2 m) **31.6→48.5%**.
- [x] ✅ **passing** — `passSpread` · passe certo **26→100%**.
- [x] ✅ **crossing** — `crossSpread` · cruzamento na zona-alvo **51→100%**.
- [x] ✅ **finishing** — `shotSpread`/`shotSpeed` + GK · conversão na área (mira o canto) **22.8→33.1%**.
- [x] ✅ **longShots** — `shotSpread` far + GK · conversão de 28 m **11→24%**.
- [x] ✅ **heading** — `HEAD`+`aerialPower` · cabeçada no gol **49→58%**.
- [x] ✅ **tackling** — `tacklePower` · desarme do conduto **40→71%**.
- [x] ✅ **marking** — `markPull` · quão colado fica **0.34→0.82**.

## 🧠 MENTAL

- [x] ✅ **anticipation** — `chaseLead` · antecipação p/ interceptar **0.29→0.45 s**.
- [x] ✅ **positioning** — `cleanCut` · bote SEM falta **51.5→55.3%**.
- [x] ✅ **offTheBall** — `offBallAdvance` · avanço da corrida **0.84→1.32**.
- [x] ✅ **decisions** — `holdMax` · tempo certo segurando a bola **0.56→0.79 s**.
- [x] ✅ **composure** — `passSpread` pressured · **queda** sob pressão **24→5 pts** (menos = melhor).
- [x] ✅ **concentration** — `miscontrol` fadiga · **queda** cansado **7.1→4.0 pts** (menos = melhor).
- [x] ✅ **consistency** — `spread` variância · σ do erro **0.87→0.70 m** (menos = melhor).
- [x] ✅ **aggression** — `CARD` · cartões por 100 botes **6→19**.
- [x] ✅ **bravery** — `cushionBravery` · ganha a bola 50/50 forte **44.5→53.7%**.
- [x] ✅ **teamwork** — `shapeMul` · compactação do bloco **0.88→1.24**.
- [x] ✅ **flair** — `flairSpin` · efeito (curva) no chute **0.58→0.94**.
- [x] ✅ **vision** — score de `bestPass` (`ai.ts:558`) · escolhe o passe PROGRESSIVO
  (vs o seguro de lado) **1.2→18.9%**: quem enxerga pouco quase nunca enfia, o craque tenta.

## 🧤 GOLEIRO

- [x] ✅ **goalkeeping** — `gkSaveBase`/`saveProbability` · defende chute de fora **33→38%**.
- [x] ✅ **reflexes** — defesa de perto **33→44%** · alcance `gkReach` **3.05→3.65 m**.
- [x] ✅ **handling** — `gkHoldChance` · segura (vs espalma) chute forte **49→77%**.
- [x] ✅ **aerialReach** — `reachHeightOf` · altura de alcance na área **2.71→3.22 m**.
- [x] ✅ **oneOnOne** — `oneOnOneBonus` · defesa no 1v1 de perto **37.6→39.7%** (bônus sutil de propósito).
- [x] ✅ **kicking** — `gkKickReach` · alcance do tiro de meta **37→59 m**.
- [x] ✅ **throwing** — `gkThrowSpeed` · velocidade da reposição **14.4→19.2 m/s**.
- [x] ✅ **communication** — `commandSave` · defesa (comanda a área) **34.7→36.5%** (bônus sutil de propósito).

---

## 🔗 Simulações de INTEGRAÇÃO (partida completa, `tools/partida.ts`)

- [x] ✅ **Posse 1v1 sustentada** — drible × defesa: matriz em `confrontos.ts` (craque passa 78% vs def30, 28% vs def90).
- [x] ✅ **Confronto força/finalização/aéreo** — `confrontos.ts`: chute 22.8→34 m/s por força; finalização × GK; duelo aéreo.
- [x] ✅ **Placar / domínio** — forte (70) × fraco (40): time forte vence **100%**, posse **61%** ✅ (relação correta).
- [x] ✅ **Disciplina** — faltas geram cartão; ~25% das faltas viram cartão (alto, mas escala com aggression).
- [x] ⚠️ **Finalização vs goleiro (partida real)** — **CONVERSÃO ~31%** (equilíbrio 60×60), robusta nos 2 clockRates
  (32.7% comprimido / 31.1% tempo real). **~3× alto** vs real (~10%): GK/defesa deixam passar demais.
  **Re-medido it.59 (`conversao-atual.ts`) após o "chute por cima"**: chute → gol 46% / defesa 14% / bloqueio 13% /
  fora 24%. **GK salva só 24% dos chutes que enfrenta** (real ~68%) — o #1 PERSISTE. O sky ajudou (24% fora) mas
  não tocou na taxa de defesa. MASCARADO no placar shipado por poucos chutes (5.4/jogo) × alta conversão ≈ gols
  certos — mas se subir o volume de chute, a conversão explode. Lever real segue `GK.saveBase`/`saveSkill`.
  **REFINADO it.60 (`defesa-distancia.ts`)**: o GK salva OK de longe (18m+ 43%, entrada 33%) mas COLAPSA de perto:
  **1v1 <8m só 3%** (real ~30%), **área 8-13m só 10%** (real ~40%) — e é aí que está o grosso dos chutes. O lever
  exato é a defesa de PERTO: `GK.saveClosePen` (alto demais) e `oneOnOneBonus` (fraco), não o saveBase geral.
  **⚠️ NOVO it.62**: o usuário reduziu `saveBase 0.3→0.07` E `saveSkill 0.45→0.09` (pra Série D converter). Efeito:
  GK salva **15-22% por nível** (GK90 só 22%, real ~75%) — fraco demais; e a diferença GK30→90 caiu de **32→7 pts**
  = **o atributo do goleiro parou de importar** (goleiro craque ≈ perna-de-pau). Enfraquecer o GK pra compensar
  poucos chutes quebra o realismo E a diferenciação. Correção certa = +volume de chute, não GK quebrado.
  **WHAT-IF it.64 (`whatif-chutes.ts`)**: conversão por chute da área — GK atual **59%**, GK "normal" (0.30/0.45)
  ainda **36%** (isolado best-case; em jogo cairia p/ ~15-20%). Hoje ~5.5 chutes × 59% = 2.6 gols (frágil). Rota
  realista = +chutes × GK MAIS forte que os defaults antigos (nem o 0.30/0.45 basta) — os dois juntos, não um só.
- [x] ⚠️ **Curva de 90 min** — `tools/curva.ts`: fatigado (stamina 30) × resistente (85). Resistente
  termina com energia **0.99 vs 0.86**, vence **258×191 gols**, marca **48%** no último terço (vs 21% no 1º) ✅.
  PORÉM o surto de fim é **global** (o fatigado também marca 49% no fim) — energia mal cai (só até 0.86 em 90'),
  então a vantagem do "fôlego" é **modesta**. Possível alvo: aprofundar o dreno de stamina.
- [x] 🚨 **Bola parada — SUPER-CORREÇÃO** — `tools/bolaparada.ts`. ANTES (it.6): 43% cravados / 14% fora / **5.8% gol**.
  AGORA (após `GK.claimBase 0.34→0.1` e `HEAD.scatter 0.42→0.16`): 19% cravados / **3.6% fora** / **31% gol** 🚨.
  A redução do cravar foi BOA (43→19%, realista). Mas o scatter foi longe demais: cabeçada quase nunca erra (real
  erra 50%+) e o GK salva só 5.7% (fraqueza de perto do #1). Cross→gol **5.8%→31%** (real ~3%) = cruzamento OP.
  Levers: subir `HEAD.scatter` de volta (~0.28-0.32, não 0.16) + a defesa de perto do GK (#1).
  **IMPACTO REAL it.67 (`gols-aereos.ts`)**: em partida, **24% dos gols são aéreos** (cruzamento/cabeça) — real
  ~15-20%. Levemente alto, NÃO dominante (o cruz. é fonte real de gol com a IA cruzando mais). Ajuste fino, não urgente.
- [x] ⚠️ **Pressão vs saída de bola** — `tools/pressao.ts`: pressing (workRate 90) recupera **7.5%** das
  bolas no campo de ataque (16/jogo) vs passivo (workRate 25) **6.1%** (13/jogo). Direção ✅, mas efeito
  **FRACO**: swing 25→90 move só 6.1→7.5% (real ~15-25%). **Pressing subdimensionado** (workRate pesa pouco).
- [x] ✅ **Bloqueio de chute** — `tools/bloqueios.ts`: **27.3% dos chutes bloqueados por defensor** (real ~25-30%) ✅.
  Zagueiros bloqueiam BEM — sistema saudável. (Corrige a hipótese do escanteio abaixo.)
- [x] ⚠️ **Escanteios (frequência)** — `tools/escanteios.ts`: só **3.4/jogo** (real ~10). NÃO é falta de bloqueio
  (27% ✅). A causa: os chutes **bloqueados/desviados ricocheteiam pra DENTRO** em vez de sair pra linha de fundo —
  é a **direção do desvio** (`COLLIDE.scatter`/restituição), não o bloqueio. Conversão escanteio→gol inconclusiva
  (contaminada pelo clockRate=2).
- [x] ✅ **Apito no intervalo natural (WHISTLE)** — `tools/apito.ts`: feature nova validada. No apito final,
  **100% com a bola no terço central** (jogada morta) e **0% perto de uma área** — o árbitro espera a jogada
  morrer em vez de cortar no meio de um ataque. Funciona perfeitamente.
- [x] ✅ **Impedimento (Lei 11)** — `tools/impedimento.ts` + `tools/offside-correto.ts`: feature nova validada em
  FREQUÊNCIA e CORREÇÃO. Frequência ~**2-3/jogo** (9.9 no clockRate=2 inflado). Correção: atacante marcado que
  pega a bola **apita** ✅, onside/não-marcado **não apita** ✅, e a linha fica no **último defensor** (x=85/89
  onside, 91/95 impedido) ✅. Só pune quem está mesmo em impedimento — regra correta.
- [x] ✅ **Atacantes na área no cruzamento** — `tools/atacantes-area.ts`: feature nova validada. Cruzamento no ar
  sobre a área tem **0.77 atacante em média**, **49% dos momentos com ≥1** (antes: ~0, "todo cruz. abafado"). ✅
  **Re-medido it.65** após a IA "cruzar mais" (ai.ts): subiu p/ **1.03 média / 60% com ≥1** ✅. PORÉM amplifica o
  cruzamento OP (31% conversão, it.61) — mais cruzamento × conversão alta = gol de cabeça pesa demais. Corrigir a
  conversão aérea (`HEAD.scatter` de volta + GK de perto) ficou mais urgente com a IA cruzando mais.
- [x] ❔ **Gestão de jogo (gameUrgency)** — `tools/gestao-jogo.ts`: INCONCLUSIVO. O efeito de tempo aparece
  (min20 43m→min88 63m, empurra no fim), mas o componente de PLACAR é só ±2m e some no ruído da dinâmica da bola
  (não dá pra isolar sem congelar a sim). ⚠️ Achado colateral: `engine.ts:24` importa `GAMESTATE` sem usar
  (TS6133) — import morto/mecânica talvez não 100% ligada no engine.
- [x] ✅ **Tiro livre indireto (Lei 13)** — `tools/indireto.ts`: feature nova validada. Batido DIRETO (só o
  cobrador) = **0% gol** (anulado → tiro de meta); com 2º TOQUE = **100% gol** (vale). 500 tentativas cada, zero erro.
- [x] ✅ **Lesões (INJURY)** — `tools/lesoes.ts`: feature nova validada. **10.1% das faltas machucam** (config
  6%×(1+agr) ≈ 9-11% ✅), 3.0/jogo, 16.7% graves. Impacto no ritmo confirmado: sadio 33.7 → leve 30.3 (-10%)
  → grave **24.9 km/h (-26%)** via `knock`. (Corrigi `_simlib.mkP` que faltava o novo campo `knock`.)
- [x] ✅ **Regressão (suíte do projeto)** — `node tools/run-tests.mjs` passa limpo após as edições (indireto FK,
  elencos, faltas): carreira 20/20 zera, fluxo+motor ok, telas renderizam. Nada quebrou.
- [x] ✅ **Invariantes / robustez** — `tools/invariantes.ts`: 0% NaN/Infinity, 0% escapa do campo, 0% energia
  fora dos limites, 0% deadlock, todas terminam em 96 min. **Física/estado SÓLIDOS** — os problemas são de
  balanceamento/IA, não de motor quebrado.
- [x] ✅ **Valor de mercado (economia)** — `tools/valor-idade.ts`: valor cresce forte com overall (OVR 60→90 = 9×:
  R$0.7M→6.6M) e cai com a idade após 24 (OVR 80: 24a R$3.8M → 33a R$1.3M). Realista ✅. Menor: curva stepwise
  (patamares + quedas bruscas nas trocas de faixa etária), não suave.
- [x] ✅ **Mercado de transferências** — `tools/mercado.ts`: dá pra evoluir comprando. **72% dos jogadores à venda
  são upgrade** sobre o nível da divisão (OVR até +12 acima), e o **preço escala forte** (OVR 60→R$0.7M, 70→1.7M,
  80→3.3M, 90→5.2M). Bem-desenhado ✅. Nota menor: 72% upgrades é generoso (reforça a "carreira fácil" do #-3).
- [x] ✅ **teamStrength (agregação)** — `src/game/strength.ts`: média do MELHOR XI (melhor GK + 10 melhores de
  linha). Estruturalmente sólido (não pune banco fraco). ⚠️ herda o #-4 (escolhe XI por `overallOf`, então não
  escala arquétipo mal-avaliado e é inflado pelo GK); `bestEleven` sem restrição de formação (benigno pois
  elencos são balanceados por posição). Sem bug próprio.
- [x] ✅ **Determinismo (replay)** — `tools/determinismo.ts`: mesma seed → MESMO placar (12-14 nas 2 vezes);
  seeds diferentes → jogos diferentes. PRNG (mulberry32) reprodutível ✅ — replays/debug viáveis.
- [x] ✅ **Distribuição do GK** — `tools/gk-distribuicao.ts`: **72.5%** das reposições chegam a um companheiro
  (saudável; joga seguro no curto). Um dos sistemas BEM calibrados.
- [x] ✅ **Distância de chute/gol** — `tools/distancia-chute.ts`: **86% dos gols de dentro da área** (real ~85%),
  só 1% dos chutes de 25m+ e 0% de gol de longe. Seleção de chute por distância BEM calibrada — a conversão alta
  (#1) NÃO é golaço irreal, é o GK fraco nas finalizações de área.
- [x] ✅ **Sensibilidade do quick-sim à força** — `tools/quicksim-forca.ts`: `quickResult` responde BEM (gap 0→53%,
  5→72%, 10→88%, 20→94%, 30→97%) — até deterministico demais. O problema da tabela NÃO é ele (ver #-2). + spread de
  força intra-divisão medido: amplitude só **1.5 pt** (clubes quase iguais) — a verdadeira causa da tabela aleatória.
- [x] 🚨 **Tiro livre direto — REGRESSÃO (era baixo, virou OP)** — `tools/freekick-sim.ts`. It.34: conversão **2.7%**
  (baixo). Após mudanças na bola parada: **27.4%** (central 31.7%, real ~5-8%) 🚨 — **10× alto**. Mudou: (a) o cobrador
  agora **SEMPRE chuta** (0% cruza, era 37%); (b) conversão **plana por distância** — falta de **35m converte 29%**
  (deveria despencar). Falta virou arma imbatível. Levers: reduzir potência/precisão do chute de falta longo
  (curva por distância), reequilibrar barreira/GK, e voltar a permitir o cruzamento como opção.
  **Impacto real BAIXO** (`tools/gols-por-jogada.ts`): só **1.1 chutes de falta/jogo** → contribuem **<0.5% dos
  gols** da partida. É problema de FEEL (quando rola uma falta boa, entra fácil demais), não de placar.
- [x] ✅ **Pênaltis** — `tools/penaltis.ts`: frequência **0.1/jogo** (raro, plausível). Cobrança ISOLADA (fiel:
  chute no canto de 11m, GK centrado): **craque converte 74%** (real ~75-78% ✅), vs GK top 63%. ⚠️ cobrador
  **médio só 37%** (real ~65%) — baixo, pois depende da precisão (finishing) e o motor não dá a "vantagem do
  batedor" (GK reage como num chute normal). Fraqueza menor; elite está perfeito.
- [x] ✅ **Impedimento (Lei 11) — AGORA APITADO** — além do posicional (corridas limitadas na linha do penúltimo
  zagueiro via `offsideLineFwd`+`offsideSlack`), o motor marca offside: no instante do passe em jogo, os atacantes
  além da linha (+`OFFSIDE.margin`), além da bola e no campo de ataque ficam pendentes (`offsidePend`); se um deles
  toca a bola primeiro → tiro livre indireto p/ a defesa (`callOffside`). Isento na 1ª entrega de bola parada
  (`fromRestart`). Calibrado p/ **~0.25 impedimentos/jogo no clockRate 24** (raro, enviesado a NÃO marcar lance
  apertado); restart sempre p/ o adversário correto, 0 NaN em 80 partidas.
- [x] ✅ **DOGSO (Lei 12) — negar chance clara de gol** — `isClearChance` (`engine.ts`): falta no atacante que
  conduzia rumo ao gol, dentro de `DOGSO.maxDist` (34 m), com o faltoso como ÚLTIMO obstáculo (nenhum defensor de
  linha na rota `DOGSO.lane`) → **vermelho direto** fora da área; **amarelo** no pênalti (dupla punição reduzida).
  Calibrado raro: **0.12 vermelhos-DOGSO/jogo** (de 0.18 vermelhos totais no clockRate 24, real ~0.25) — não
  estoura a contagem de vermelhos. 100/100 partidas completas, 0 NaN.
- [x] ✅ **Mão na bola (Lei 12)** — `handballOffence`+hook em `ballPlayerCollisions` (`engine.ts`): a bola FORTE
  (`HANDBALL.minSpeed` 9 m/s) batendo no corpo de um jogador de linha pode ser marcada mão (`HANDBALL.chance` 0.02,
  ×2 com a bola alta) → **pênalti** na própria área, **tiro livre direto** fora. Raro: **~0.15 marcações/jogo** (a
  maioria tiros livres) e **~0.017 pênaltis de mão/jogo** no clockRate 40, 120/120 partidas completas, 0 NaN. GK
  isento dentro da própria área; o último tocador é blindado (não marca mão no próprio chute).
- [x] ✅ **Tiro livre INDIRETO (Lei 13)** — `indirectFK`/`indirectTakerId` + `scoreOrDisallow` (`engine.ts`) e o
  desvio de `freeKickAction` (`ai.ts`): o cobrador **toca curto** para um companheiro em vez de bater ao gol, e um
  gol batido DIRETO (sem 2º toque) é **anulado** → tiro de meta. Some quando um 2º jogador toca. O **impedimento**
  passou a ser indireto (antes podia, em tese, ser batido direto). 100/100 partidas, 0 NaN; teste de estresse
  (todo recuo mal resolvido) completa limpo, 0 gols indevidos.
- [x] ✅ **Recuo ao goleiro (recycle na saída de bola)** — `gkRecycleTarget` (`ai.ts`): um jogador FUNDO (próprio
  terço), pressionado e SEM saída progressiva à frente, devolve ao GK LIVRE atrás (linha limpa, passe dominável
  `AI.recycleSpeed`) em vez do chutão às cegas. Ativa a **regra do recuo** (feet-play) e, sob afobamento, o
  **`backPassHandle`** (indireto na área). Verificado: **0.14 recuos/jogo**, gols **2.8** e posse **48%** INALTERADOS,
  100/100 partidas, 0 NaN. RARO por design: a saída de bola lenta quase não existe neste motor picado (fraqueza #8);
  escancarar os gates infla o placar (4.6 gols) e vira irreal — a raridade é honesta, não bug.
- [x] ✅ **Lesões/pancadas na falta (durante o jogo)** — `maybeInjure` (`engine.ts`) + `Player.knock` + `maxSpeed`:
  uma falta marcada pode MACHUCAR o faltado (`INJURY.foulChance` 0.06 × 1+agressão do infrator); ele passa a jogar
  MANCANDO (perde ritmo até `INJURY.maxImpair` 0.36) e fica mais tempo caído; a dor CORRE devagar (`recoverRate`).
  ~22% das lesões são graves. Verificado: **0.16 lesões/jogo** (~9% das faltas, realista por falta), gols **2.8
  INALTERADOS**, `knock` sempre em [0, 0.36], 100/100 partidas, 0 NaN. GK isento; sem substituições (ninguém sai).
- [x] ✅ **Chute por cima + travessão (altura do chute)** — antes TODO chute era rasteiro (`vz=0`): nunca ia por
  cima nem carimbava a trave. Agora `SHOT.sky*` (`engine.ts`) faz ~10-16% dos chutes SUBIREM demais e irem por
  cima (mais no afobado/tosco e sob pressão — escala com finalização/frieza), e `crossbarBounce` trata a bola na
  altura da trave superior (rebote vivo, "no travessão!"). Verificado: gols **2.48→2.42** (queda mínima, ajuda a
  conversão ~3× alta), 120/120 partidas, 0 NaN, suíte `run-tests.mjs` limpa. Travessão em si é raro (~0.025/jogo,
  honesto — os postes verticais já cobrem a madeira rasteira); o ganho é a VARIEDADE de altura do chute (por cima,
  ângulo, carimbo na trave), antes inexistente.
- [x] ✅ **Lesão sem contato + BOLA AO CHÃO (Lei 8)** — no laço de stamina (`engine.ts`) um SPRINT pode causar
  estirão muscular (`INJURY.strain*`, mais provável CANSADO): leve → joga mancando e o jogo segue; grave → o
  árbitro PARA o jogo e reinicia com **bola ao chão** (`dropBall`, sem disputa, p/ o time que tinha a posse — Lei 8
  atual). Preenche o único tipo de reinício que faltava (parada que não é falta/saída). Verificado: **0.32
  estirões/jogo**, **0.033 bolas ao chão/jogo** (raro e realista), gols **2.56 inalterados**, `knock` em [0,0.36],
  120/120 partidas, 0 NaN, `run-tests.mjs` limpo.
- [x] 🔬 **Diagnóstico da posse/passe (achado p/ o #8)** — instrumentei o desfecho dos passes em partida real:
  **~34 passes/jogo, 50% completos, 40% INTERCEPTADOS, 9% pra fora**. Reduzir `passSpread` (0.28→0.21) NÃO moveu a
  completude (50→50%) e ainda SUBIU os gols (2.48→2.92, direção errada) → a interceptação é **posicional** (o
  zagueiro fecha a linha de passe), não imprecisão. Revertido. **Lever real do #8 = interceptação defensiva**
  (`chaseLead`/alcance/posicionamento) — multi-lever da calibração do mantenedor, não um ajuste único seguro.
- [x] ✅ **Gestão de jogo (placar + relógio)** — `gameUrgency` (`ai.ts`): no TERÇO FINAL, o time que VENCE recua o
  bloco e compromete menos gente à frente (`attackTarget`×urg<1 + `defendTarget` drop); o que PERDE se lança
  (urg>1). Só atua tarde e com placar (=1 em 0×0/neutro → NÃO afeta as validações de atributo). `GAMESTATE.swing`
  0.3. Verificado (150 jogos, com vs sem): comportamento visível, **empates 21%→28.7%** (mais realista), quem
  faz 1º **perde MENOS** (9.2%→8.5%, protege a vantagem) e vence 67-70% (real ~70% ✅), gols **2.86→2.77** (queda
  mínima), 0 NaN, `run-tests.mjs` limpo. (A fraqueza antiga "1º gol vence só 53%" já fora sanada pela recalibração
  externa — hoje o baseline já é ~70%; esta feature acrescenta o COMPORTAMENTO real, não conserta métrica quebrada.)
- [x] ✅ **Cera / matar o relógio (bola parada)** — `leadProtect`+`placeDeadBall` (`engine.ts`): o time que PROTEGE
  a vantagem no fim ALONGA suas cobranças (goleiro cozinha o tiro de meta, cobrador demora no lateral/tiro livre,
  `GAMESTATE.timeWaste` 0.6). O tempo perdido volta como ACRÉSCIMO (o árbitro compensa) → **balanço neutro**:
  gols **2.57→2.53** inalterados, mas os **acréscimos crescem** num jogo decidido (84.6s→**102s**). 150/150 jogos,
  0 NaN, `run-tests.mjs` limpo. (Resolve de quebra o **TS6133** do achado da gestão de jogo: `GAMESTATE` agora É
  usado no engine — a mecânica de placar/relógio está ligada ao motor via este consumo real.)
- [x] ✅ **Elencos REAIS (Brasil×Argentina, clockRate real)** — `tools/elenco-real.ts`. ANTES (#0): **84% 0×0**,
  0.16 gols/jogo. DEPOIS dos fixes do usuário (re-medido it.66): **2.52 gols/jogo, só 6% de 0×0**, distribuição
  de placares variada e realista (1×0, 1×1, 1×2, 0×2, 1×3, 2×2, 3×0...), jogos competitivos. **#0 RESOLVIDO — o
  jogo que o jogador assiste está ÓTIMO** ✅. Residual (realismo interno, não afeta o placar): 4.9 chutes (baixo) ×
  51% conversão (alta) × GK fraco se compensam pra dar gols realistas. Output excelente; "mais correto" internamente
  = +chutes/−conversão/+GK.
- [x] ✅ **Caos por divisão** — `tools/caos-divisao.ts`: feature nova validada. Irregularidade intra-jogador escala
  A→D: σ interno **9.4→21.1**, amplitude **34→70**, % com spike **42%→99%**, % com buraco **39%→100%**. Série D =
  elencos crus (pace 90/força 20) ✅. Nota: D bem extrema (100% com buraco) — suavizar via `tankDrop`/`jitter` da config D se quiser.
- [x] ✅ **Dados dos elencos** — `tools/elenco-dados.ts`: **5/5 testes de coerência posicional passam** (FWD+rápido
  que DEF, FWD finaliza melhor, DEF desarma melhor, GK 93×15 linha, MID+fôlego). Após dar fraquezas reais aos
  jogadores: spread AUMENTOU (dribbling 36–99, passing 42–97, pace 50–97). **Dados NÃO são a causa do 0×0.**
- [x] ✅ **Equilíbrio do confronto** — `tools/equilibrio.ts`: após a diversidade, Brasil×Argentina segue
  competitivo — Brasil V **57%** / D 43%, posse **51%**, chutes 57×54. A edição dos elencos NÃO quebrou o balanço.
- [x] ⚠️ **Margem de vitória (competitividade)** — `tools/margem.ts`: **37% dos jogos são goleada (4+ gols)**
  vs real ~8%; só 13% de empate (real ~25%). Jogos pouco competitivos — sintoma do scoring inflado (#0/#1,
  10.57 gols/jogo aqui). Cai junto quando o placar for calibrado.
- [x] ⚠️ **Momentum (1º gol → resultado)** — `tools/primeiro-gol.ts`: quem marca primeiro vence só **53%**
  (real ~70%) e **perde 27%** (real ~10%). Vantagem mal protegida, jogo vai-e-vem demais — sintoma da alta
  variância (#0) + turnover (#8). Cai junto quando o placar/posse forem corrigidos.
- [x] ⚠️ **Força → resultado (zebra/carreira)** — `tools/forca-resultado.ts`: melhor time vence mais (gap 0→56%,
  5→63%, 10→94%), com zebra em gaps pequenos ✅. MAS **determinístico demais a partir do gap 15 (100%, 0 zebra)**
  e saldos absurdos (+24 a +34). E **0% de empates** (clockRate=2 = jogo de 8+ gols). Cai junto com o #0: placar
  realista (~2.6 gols) traria variância, zebras e empates. Importante p/ o realismo da CARREIRA.
- [x] ✅ **Arquétipos viram comportamento** — `tools/arquetipos.ts`: cada craque nos duelos do motor (%).
  Vini corrida **100%** mas ombro 40%; Messi gol 37% e drible 47% mas ombro **26%** (frágil) e corrida só 71%;
  Otamendi drible **0%**, corrida **10%**, mas ombro **76%**/aéreo 55%. ✅ a diversidade dos atributos
  se manifesta: cada um brilha na força e afunda na fraqueza. (Nota: força pesa pouco em duelo de CHÃO no
  motor — manda no aéreo e na potência do chute; por isso a coluna "ombro" é modelo explícito de força+equilíbrio.)

### ⚠️ ACHADOS da integração (a investigar)

1. **Conversão ~3× alta** (~31% vs ~10% real) — robusto, independe do clockRate. **LOCALIZADO**
   (`confrontos.ts` §6): taxa de defesa do GK em chutes no alvo é **44.7 / 56.8 / 67.5 / 76.3%**
   (níveis 30/50/70/90). Real ~65-75%. **GK médio (50) só segura 56.8% mesmo no melhor caso de
   posicionamento** → fórmula de defesa ~11pp fraca. Lever: `GK.saveBase 0.3`/`saveSkill 0.45`.
   **Causa-raiz da conversão alta.**
2. **Estatísticas inconsistentes** — `shotsOnTarget` às vezes > `shots`, e `goals` > `shotsOnTarget`
   (>100%). Gols/finalizações são contados em pontos diferentes do engine e não fecham. **Bug de bookkeeping.**
3. **`clockRate=24` comprime a partida** — os 90' do relógio cabem em ~225 s de jogo real, então as
   contagens por jogo (chutes/faltas) ficam ~24× menores. Para medir contagem real, usar `clockRate=1`.

---

## 📊 % de sucesso por atributo (`tools/percentuais.ts`) — 30/50/70/90

Todos os 39 expressos como **"quanto % deu certo"** (exato = fórmula do motor; modelo = cenário):

| Atributo | 30 | 50 | 70 | 90 | mede |
|---|---|---|---|---|---|
| pace | 8 | 50 | 89 | 100 | vence corrida 15m |
| acceleration | 50 | 63 | 73 | 82 | vence arranque 6m |
| agility | 10 | 50 | 85 | 99 | vence o slalom |
| balance | 64 | 69 | 73 | 77 | fica em pé no bote |
| jumping | 42 | 50 | 58 | 65 | ganha o salto |
| strength | 43 | 48 | 53 | 58 | mantém a bola |
| stamina | 85 | 87 | 88 | 89 | ritmo mantido min80 |
| naturalFitness | 50 | 65 | 81 | 97 | recupera em 90s |
| workRate | 30 | 50 | 70 | 84 | chega 1º na bola |
| dribbling | 24 | 36 | 48 | 59 | passa e segue |
| firstTouch | 89 | 91 | 93 | 95 | domínio limpo |
| technique | 32 | 36 | 41 | 49 | passe certo 24m |
| passing | 26 | 36 | 56 | 100 | passe certo 24m |
| crossing | 19 | 21 | 24 | 29 | cruz. na área |
| finishing | 23 | 24 | 27 | 33 | gol da área |
| longShots | 12 | 15 | 20 | 24 | gol de 28m |
| heading | 49 | 52 | 55 | 58 | cabeçada no gol |
| tackling | 41 | 52 | 62 | 71 | desarma o conduto |
| marking | 24 | 35 | 46 | 57 | intercepta o marcado |
| vision | 1 | 5 | 11 | 19 | acha o passe progressivo |
| anticipation | 28 | 39 | 50 | 62 | intercepta o passe |
| positioning | 51 | 53 | 54 | 55 | bote sem falta |
| offTheBall | 20 | 43 | 66 | 89 | alcança o espaço |
| decisions | 73 | 84 | 97 | 100 | escolhe a ação certa |
| composure | 41 | 45 | 52 | 60 | passe certo SOB pressão |
| concentration | 83 | 84 | 86 | 87 | domínio limpo cansado |
| consistency | 37 | 40 | 43 | 46 | passe dentro do alvo |
| aggression | 6 | 10 | 14 | 19 | falta vira cartão |
| bravery | 45 | 48 | 51 | 54 | ganha o 50/50 forte |
| teamwork | 68 | 77 | 86 | 95 | mantém o bloco |
| flair | 34 | 50 | 66 | 82 | chute com curva |
| goalkeeping | 49 | 60 | 70 | 79 | defende (no alvo) |
| reflexes | 48 | 60 | 70 | 79 | defende (no alvo) |
| handling | 48 | 59 | 70 | 79 | defende (no alvo) |
| aerialReach | 33 | 43 | 53 | 63 | crava o cruzamento |
| oneOnOne | 47 | 59 | 70 | 79 | defende o 1v1 |
| kicking | 0 | 64 | 100 | 100 | tiro de meta no alcance |
| throwing | 36 | 50 | 84 | 100 | reposição certa |
| communication | 62 | 63 | 64 | 65 | organiza (defende+) |

**39/39 monotônicos** ✅ (mais atributo → maior %).

## 📋 Resumo

**SUÍTE DE SIMULAÇÃO COMPLETA** ✅ — 39/39 atributos (unidades nativas em `attrsim.ts` E
% de sucesso em `percentuais.ts`), confrontos 2-lados (`confrontos.ts`), partidas completas
(`partida.ts`) e TODAS as integrações (curva de 90', bola parada, pressão). Observações:

- **naturalFitness, oneOnOne, communication** têm efeito **pequeno mas monotônico** —
  bônus deliberadamente sutis no motor (não bugs).
- **passing/crossing** saturam em ~100% no nível 90 — plausível, dá pra apertar a tolerância.

## 🎯 ACHADOS DE BALANCEAMENTO (medidos — prontos para corrigir)

Ordem aproximada de impacto:

-2. **🏆 TABELA DA LIGA QUASE ALEATÓRIA — causa LOCALIZADA** (`tabela-liga.ts` + `quicksim-forca.ts`). Em 200
   temporadas: mais forte é campeão só **11%** (real ~40-55%), termina em **7.2º**, Spearman força↔posição **0.27**
   (real ~0.7), campeão com **67 pts** (real ~85). **NÃO é o quickResult** — ele responde MUITO à força (gap 10 →
   88% vitória, gap 20 → 94%). A causa real: **`generateClub` gera clubes quase IGUAIS dentro da divisão** —
   Série A tem amplitude de força de só **1.5 ponto** (78.3–79.7, desvio 0.4)! Todo jogo é gap ~0 → moeda jogada
   → tabela aleatória. **Lever EXATO: `generate.ts:96` (`generateSquad`)** — todo clube usa `DIVISION_LEVEL[division]`
   igual; a única variação é ruído por jogador (`gauss*5`) que se anula na média (18 jogadores) → desvio só 0.4.
   Confirmado em TODAS as divisões (amplitude 1.2–1.6, variância toda ENTRE divisões, nada DENTRO). Fix: somar
   um **offset de força por CLUBE** (ex.: tier ±8) → amplitude ~16 (campeão acima do rebaixado). *Montar elenco vira título.*
   **AINDA ABERTO** (re-medido it.68). O usuário adicionou `DIVISION_CHAOS` (caos intra-jogador: pace 90/força 20 no
   mesmo cara nas div. baixas — bom p/ feel de elenco cru e arquétipos), mas isso NÃO resolve o #-2: a amplitude de
   força ENTRE clubes segue **1.6** (precisa ~16), campeão-forte 10→17%, Spearman 0.24→0.32 (ruído). Falta o que o
   #-2 pede: **tier de força POR CLUBE** (uns clubes miram `DIVISION_LEVEL` mais alto = os "grandes"), não caos por jogador.
   **PROVA DO FIX it.69 (`tabela-comfix.ts`)**: somando um tier de força por clube (`gauss × ~8`), a tabela vira
   REALISTA — campeão-forte 16%→**48%**, Spearman 0.29→**0.74**, mais forte termina 7º→**2.4º**. Confirma o lever
   exato: no `generateSquad`, `level += clubTier` (sorteado 1× por clube, ~gauss*8).
-1. **✅ RESOLVIDO — "POUCOS GOLS NA SÉRIE D"** (`tools/gols-divisao-motor.ts`). ANTES: motor físico A=0.90 /
   D=**0.38** gols (quase 0×0), ~1.3-2.7 chutes/jogo. DEPOIS dos fixes do usuário (mais chutes + "chute por cima"
   `SHOT.skyBase`): **A=3.85 / B=3.63 / C=2.80 / D=3.13 gols/jogo**, **13-15 chutes/jogo**, conversão 31%→24%.
   A Série D pulou de **0.38 → 3.13** — faixa real (~2.6-3.9) ✅. Achado #0/#-1 essencialmente fechado.
   **Re-medido it.63** (após enfraquecer o GK): gols seguem realistas (A 3.13 / D **2.90**), MAS a composição
   inverteu — chutes caíram 14→**5.5/jogo** e conversão subiu 24→**51%**, com só ~1 defesa/jogo. Placar certo pela
   rota frágil (poucos chutes × GK fraco). Resta afinar chute/defesa (volume + GK), não o total de gols.
-4. **📊 `overallOf` mis-avalia arquétipos** (`src/game/overall.ts`) — estruturalmente ok (pesos por posição),
   mas: **GKs super-avaliados cross-position** (Alisson 97/Dibu 96 = top-2 geral, acima do Messi 90 — `gkRating`
   em escala mais alta); **lateral-ala punido** (Wendell **46**! pace 82/cruza 78, mas pesos DEF só veem
   desarme/marcação); **volante subvalorizado** (Casemiro 76, desarme/força 90); **ponta-drible subvalorizada**
   (Vini 82 < Endrick 85, finishing pesa 0.26). Distorce `teamStrength`/valor/escalação. Lever: normalizar escala
   GK vs linha + sub-perfis (lateral ofensivo, DM, ponta) nos `WEIGHTS`.
   **PROVA DO FIX it.72 (`overall-fix.ts`)**: com GK ×0.9 + sub-perfis (max clássico/moderno): Alisson 97→**87**,
   Wendell 46→**72**, Casemiro 76→**92**, Vini 82→**93**, Messi 90→90 (já certo). Top-5 sai de "2 GKs no topo" p/
   craques de linha (Vini/Casemiro/Marquinhos/Raphinha/Di María). Pesos ilustrativos (afinar), mas a abordagem resolve.
-3. **📈 Evolução de jogador desbalanceada (carreira fácil)** (`tools/evolucao.ts`) — `agePlayers`+núcleo. Joia
   (18/60 OVR): num RIVAL sobe só **+6** (66 aos 24) e ESTAGNA; no SEU clube dispara pra **78 aos 24 (+18)** e
   segue até **91**. Assimetria (seu núcleo +2/ano vs rival +0) = seu time BOLA-DE-NEVE, mundo estagna → carreira
   fácil (selftest: **20/20 zeram em ≤3 temporadas**, o "máx" caiu de 4→3 após as edições — ficou ainda mais fácil).
   Também: prime (25-29) é **flat** pros rivais (sem pico real). Levers:
   `career.ts:189` (crescimento jovem p/ TODOS ~+2-3, pico no prime) e `career.ts:400` (núcleo +2 é generoso demais).
   **PROVA DO FIX it.70 (`evolucao-fix.ts`)**: hoje o gap seu×rival cresce **-3 → +11 (24) → +23 (30)** (bola-de-neve).
   Com regra SIMÉTRICA (jovem +2, pico no prime 25-28, sem bônus só-seu), a joia sobe saudável (61→77 no pico) e o
   **gap fica constante em +2** — mundo acompanha, carreira tem desafio. Fix = tirar o +2 só-do-núcleo + pico no prime p/ todos.
0. **🚨 84% DOS JOGOS 0×0 + conversão alta — ACOPLADOS** (`tools/elenco-real.ts` + `tools/clockrate-sweep.ts`).
   Varredura de clockRate (elencos reais) — gols/jogo · chutes/jogo · conversão · %0×0:
   | clockRate | gols | chutes | conv | 0×0 |
   |---|---|---|---|---|
   | **24 (atual)** | 0.5 | 1.3 | 40% | 69% |
   | 12 | 1.6 | 3.3 | 49% | 8% |
   | 6 | 2.0 | 5.9 | 34% | 20% |
   | **2** | 8.5 | **25** | 34% | 0% |
   | 1 | 26 | 76 | 34% | 0% |
   **Não dá pra acertar só com clockRate:** em clockRate≈2 os chutes ficam reais (25/jogo) mas saem 8.5 gols,
   porque a conversão trava em **~34%** (3× alta). **Correção tem que ser dupla:** `MATCH.clockRate`≈2
   (volume de chutes) **+** fortalecer o GK (`GK.saveBase`/`saveSkill`) pra conversão cair a ~10% → 25×10% = ~2.5 gols. *Maior impacto.*
2. **Pressing subdimensionado** — workRate 25→90 move só 6.1→7.5% de roubadas altas (real ~15-25%).
   Lever: peso de workRate/aggression no `ai.ts` (pressing) e `tackleRange`.
3. **Cross→gol ~2× alto + GK crava 43% dos cruzamentos** (alto). Lever: `GK.claim*`.
4. **Curva de cansaço fraca** — energia mal cai (até 0.86 em 90'). Lever: `STAMINA.sprintDrain`.
5. **⚽ Gols só no CENTROAVANTE — DIAGNÓSTICO COMPLETO** (`contribuicao.ts`+`chutes-por-posicao.ts`+`toques-por-posicao.ts`).
   Dois problemas de IA somados: (a) **a bola não chega nas pontas** — Vini/Raphinha recebem **<43 toques/jogo
   (fora do top-12)** vs 87 do #9; os meias (Bruno 97, De Paul 82 toques) distribuem tudo pro centro, não pras
   alas; (b) **o #9 chuta de 53-69% dos toques** (ganancioso; real ~10-20%). NÃO é finalização (Vini converte
   46%, melhor que o #9). Lever: `ai.ts` — `bestPass` valorizar a ala/ponta + reduzir o chute greedy do central
   + o ponta cortar pra dentro e finalizar. **É o que faz o craque diferenciado (Vini/Messi) render no jogo.**
6. **🟥 Vermelhos demais** (`tools/disciplina.ts`) — ratio falta→cartão OK (27%, real ~25-35%) e os AGRESSIVOS
   lideram certo (Cuti Romero no topo) ✅. MAS vermelhos são **38% de todos os cartões** (real ~5%): 5.2 reds vs
   8.5 amarelos/jogo. Ratio independe do clockRate → **~7× alto**. Lever: baixar `CARD.straightRedFrac` (0.12) e
   `straightRedAggr` (0.8); e reduzir acúmulo de 2º amarelo (cai junto se as faltas/jogo baixarem — ver #0).
7. **🎲 Colisão de seed** (`tools/determinismo.ts`) — `createMatch` semeia com `seedRng(Date.now())` (ms). Em
   loop rápido, 2000 partidas deram só **19 seeds distintas (99% colidem)** → partidas IDÊNTICAS numa simulação
   em massa via motor completo (placares repetidos numa rodada/temporada). Repro em si é ✅. Fix trivial: somar
   um contador global ou entropia ao seed (`seedRng(Date.now() ^ (n++ * 0x9e3779b1))`).
8. **⚖️ Viés de mando (casa × fora)** (`tools/simetria.ts`) — times IDÊNTICOS dão **casa 56% × fora 44%**,
   chutes **43 × 34**, gols 12.4 × 10.9 (N=50, não é ruído). Como o intervalo inverte a direção de ataque,
   NÃO é viés de coordenada. Causa provável: **desempate por ordem de iteração** (casa = ids 0-99, varridos
   primeiro → ganha empates exatos em `nearestOpponent`/`ballCandidate`/duelos) e/ou pontapé inicial.
   Lever: desempatar buscas de bola de forma neutra (distância estrita já ajuda; revisar `<` vs `<=`).
8. **🎯 Acerto de passe baixo → jogo PICADO + posse não premia técnica** (`tools/passes.ts` + `posse-sequencia.ts`
   + `posse-tecnica.ts`) — **55% de passe completo** (real ~80%), sistêmico. Consequência: **1.88 toques por posse**
   (real ~3-4), **42% das posses morrem em 1 toque**. E a técnica controla pouco a bola: time técnico 85 vs tosco 40
   (gap de 45!) dá só **55% de posse** (real ~65-70%) e **64% de passe** (elite devia ~85%). A posse vira **turnover
   aleatório**, não habilidade. Conecta com #5 (sem posse longa, a bola não chega às pontas). Levers: `passSpread`
   (estreitar), interceptação (`markPull`/`chaseLead`), `miscontrol` na recepção.
   **AINDA ABERTO após os fixes** (re-medido it.51): passe **49%**, posse **1.76 toques**, 48% de 1 toque — o
   "recuo ao GK" é raro demais (~0.17/jogo) pra ajudar. **LEVER LOCALIZADO** (`tools/passe-falha.ts`, it.52): das
   falhas de passe, **79% são INTERCEPTAÇÃO** e só 21% erro de mira. Defensores interceptam **42% de TODOS os
   passes** (real ~5-8%) — leem/alcançam o passe fácil demais. **Fix = reduzir interceptação** (`markPull`,
   `chaseLead`, alcance do ganho de bola solta), NÃO o `passSpread` (que resolve só 1/5).
9. **🐛 Bug de stats LOCALIZADO** (`tools/statbug.ts`) — `goals/shotsOnTarget = 1.18` no desigual ❌.
   Atribuição OK (**100% dos gols têm autor=marcador correto**). O furo: `shotsOnTarget++` (`engine.ts:833`)
   só conta quando o **GK enfrenta** o chute como candidato; gol passando por GK **batido/fora de posição**
   é contado na linha (`engine.ts:1112/1115`) **sem** incrementar `shotsOnTarget`. Fix: creditar o chute
   no alvo quando a bola entra enquadrada, não só quando o GK a alcança. (O `sot>shots` que apareceu antes
   era só no `clockRate=24`; em tempo real fica ≤1.)
