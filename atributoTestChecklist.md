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
- [x] ⚠️ **Curva de 90 min** — `tools/curva.ts`: fatigado (stamina 30) × resistente (85). Resistente
  termina com energia **0.99 vs 0.86**, vence **258×191 gols**, marca **48%** no último terço (vs 21% no 1º) ✅.
  PORÉM o surto de fim é **global** (o fatigado também marca 49% no fim) — energia mal cai (só até 0.86 em 90'),
  então a vantagem do "fôlego" é **modesta**. Possível alvo: aprofundar o dreno de stamina.
- [x] ✅ **Bola parada** — `tools/bolaparada.ts`: cruzamento ataque-aéreo × defesa+GK. Matriz monotônica
  nos 2 eixos ✅. Equilíbrio 50×50: 43% cravados / 28% afastados / 14% fora / 8% defendidos / **5.8% gol**.
  ⚠️ cross→gol levemente alto (~3% real) e **GK crava 43%** dos cruzamentos (alto — goleiro real sai em menos).
- [x] ⚠️ **Pressão vs saída de bola** — `tools/pressao.ts`: pressing (workRate 90) recupera **7.5%** das
  bolas no campo de ataque (16/jogo) vs passivo (workRate 25) **6.1%** (13/jogo). Direção ✅, mas efeito
  **FRACO**: swing 25→90 move só 6.1→7.5% (real ~15-25%). **Pressing subdimensionado** (workRate pesa pouco).
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
- [x] ⚠️ **Tiro livre direto** — `tools/freekick-sim.ts` (do usuário): conversão direta **2.7%** (central 3.1%),
  real ~5-8%. Levemente baixo, mas FK raro é ok. Causa: só **20% dos chutes chegam ao gol** (resto na barreira/
  abafado) — a colocação não vence a barreira o bastante. Baixa prioridade.
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
- [x] 🚨 **Elencos REAIS (Brasil×Argentina, clockRate real)** — `tools/elenco-real.ts`: **84% dos jogos 0×0**,
  0.16 gols/jogo, 0.7 chutes/jogo. A compressão do clockRate esvazia a partida. **Achado #0** (ver abaixo).
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
-1. **🚨🎯 "POUCOS GOLS NA SÉRIE D" CONFIRMADO** (`tools/gols-divisao.ts` vs `gols-divisao-motor.ts`) — a
   discrepância raiz da CARREIRA. **Quick-sim (Poisson, que popula a TABELA): 2.7 gols/jogo em TODAS as divisões**
   ✅ (D=2.71). **Motor físico (que o jogador ASSISTE): A=0.90 / B=0.65 / C=0.50 / D=0.38** ❌. Dois mundos:
   tabela realista, jogo assistido quase 0×0. Série D é a pior porque time fraco (força 57) cria menos chances
   (1.3 chutes vs 2.7 da A) e o `clockRate=40` da carreira comprime ainda mais. **Fix = #0** (baixar clockRate
   do motor + GK), e o efeito é mais forte nas divisões baixas. *É o que o usuário sente jogando.*
-4. **📊 `overallOf` mis-avalia arquétipos** (`src/game/overall.ts`) — estruturalmente ok (pesos por posição),
   mas: **GKs super-avaliados cross-position** (Alisson 97/Dibu 96 = top-2 geral, acima do Messi 90 — `gkRating`
   em escala mais alta); **lateral-ala punido** (Wendell **46**! pace 82/cruza 78, mas pesos DEF só veem
   desarme/marcação); **volante subvalorizado** (Casemiro 76, desarme/força 90); **ponta-drible subvalorizada**
   (Vini 82 < Endrick 85, finishing pesa 0.26). Distorce `teamStrength`/valor/escalação. Lever: normalizar escala
   GK vs linha + sub-perfis (lateral ofensivo, DM, ponta) nos `WEIGHTS`.
-3. **📈 Evolução de jogador desbalanceada (carreira fácil)** (`tools/evolucao.ts`) — `agePlayers`+núcleo. Joia
   (18/60 OVR): num RIVAL sobe só **+6** (66 aos 24) e ESTAGNA; no SEU clube dispara pra **78 aos 24 (+18)** e
   segue até **91**. Assimetria (seu núcleo +2/ano vs rival +0) = seu time BOLA-DE-NEVE, mundo estagna → carreira
   fácil (selftest zera em ~3 temporadas). Também: prime (25-29) é **flat** pros rivais (sem pico real). Levers:
   `career.ts:189` (crescimento jovem p/ TODOS ~+2-3, pico no prime) e `career.ts:400` (núcleo +2 é generoso demais).
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
9. **🐛 Bug de stats LOCALIZADO** (`tools/statbug.ts`) — `goals/shotsOnTarget = 1.18` no desigual ❌.
   Atribuição OK (**100% dos gols têm autor=marcador correto**). O furo: `shotsOnTarget++` (`engine.ts:833`)
   só conta quando o **GK enfrenta** o chute como candidato; gol passando por GK **batido/fora de posição**
   é contado na linha (`engine.ts:1112/1115`) **sem** incrementar `shotsOnTarget`. Fix: creditar o chute
   no alvo quando a bola entra enquadrada, não só quando o GK a alcança. (O `sot>shots` que apareceu antes
   era só no `clockRate=24`; em tempo real fica ≤1.)
