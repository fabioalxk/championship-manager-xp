# 🧪 Checklist de Simulações por Atributo

Para **cada atributo** existe uma simulação isolada que prova que ele **muda o
comportamento** do motor na direção certa — variando o atributo em **30/50/70/90**
(resto em 50) e medindo uma métrica real.

## Como rodar

Harness único: **`tools/attrsim.ts`** (cobre os 39 atributos) e **`tools/dribbletest.ts`**
(estudo aprofundado do drible 1v1). Importam as funções/constantes **reais**
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

- [x] ✅ **pace** — `maxSpeed` · velocidade de topo **7.1→9.7 m/s** (30→90).
- [x] ✅ **acceleration** — `outfieldAccel`+kinemática · tempo p/ 10 m **1.46→1.32 s**.
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
- [ ] ⬜ **vision** — seleção de passe (`ai.ts:552`). É **lógica de IA** (escolhe o
  homem livre), não probabilística — precisa de um teste de "escolha entre opções
  ruidosas". Único ainda sem sim isolado.

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

## 🔗 Simulações de INTEGRAÇÃO (cruzam vários atributos) — a fazer

Validam que os sistemas combinam certo numa partida completa (usam `engine.ts:step`):

- [ ] ⬜ **Posse 1v1 sustentada** — drible × tackling/positioning/strength (parcial em `dribbletest.ts`).
- [ ] ⬜ **Pressão vs saída de bola** — workRate/aggression (A) × passing/composure (B): % roubadas no ataque.
- [ ] ⬜ **Curva de 90 min** — stamina/naturalFitness do elenco: gols/chances por faixa de tempo.
- [ ] ⬜ **Bola parada** — jumping+heading × aerialReach+positioning: % de cabeçada perigosa.
- [ ] ⬜ **Finalização vs goleiro** — finishing/longShots/composure × goalkeeping/reflexes/handling/oneOnOne: xG→gol.
- [ ] ⬜ **Disciplina** — aggression/bravery: faltas+cartões por jogo (faixa realista ~10–15 faltas).
- [ ] ⬜ **Placar agregado** — N partidas forte × fraco: distribuição de placar plausível.

---

## 📋 Resumo

**38/39 atributos** com simulação isolada e **monotônica** (`tools/attrsim.ts`).
Falta só **vision** (depende da lógica de seleção de passe da IA) e as **7
simulações de integração** acima. Observações:

- **naturalFitness, oneOnOne, communication** têm efeito **pequeno mas monotônico** —
  são bônus deliberadamente sutis no motor (não bugs).
- **passing/crossing** saturam em ~100% no nível 90 — craque acerta quase tudo na
  distância testada; plausível, mas dá pra apertar a tolerância se quiser mais gradiente.
