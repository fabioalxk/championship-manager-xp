// tools/attribute-experiment-entry.ts
import { writeFileSync } from "node:fs";

// src/sim/constants.ts
var FIELD = {
  w: 105,
  h: 68,
  cx: 105 / 2,
  cy: 68 / 2
};
var GOAL = {
  width: 7.32,
  depth: 2.2,
  /** altura oficial do travessão (m) — bola acima disso passa POR CIMA do gol */
  height: 2.44,
  get top() {
    return FIELD.cy - GOAL.width / 2;
  },
  get bottom() {
    return FIELD.cy + GOAL.width / 2;
  }
};
var AIR = {
  /** gravidade (m/s²) que puxa a bola de volta ao chão — calibra o arco/voo */
  gravity: 11,
  /** restituição vertical ao quicar no gramado (0=morre, 1=devolve tudo) */
  bounce: 0.46,
  /** atrito do ar no plano horizontal por segundo (fração mantida; ~sem perda) */
  airDamping: 0.985,
  /** abaixo desta altura (m) a bola é tratada como rasteira (rolando no chão) */
  groundBand: 0.45,
  /** altura (m) até onde um jogador de linha bloqueia a bola COM O CORPO */
  bodyHeight: 1.25,
  /** altura (m) que o jogador de linha alcança no salto/cabeça (+ aéreo). Subida
   *  (era 2.45) p/ ALARGAR a janela do cabeceio: o atacante alcança o cruzamento
   *  numa faixa maior da descida, gerando mais cabeçadas a gol. */
  reachHeight: 3,
  /** alcance vertical extra (m) por competência aérea (jumping/heading) */
  reachAerial: 1.05,
  /** altura (m) que o GOLEIRO alcança com as mãos/salto (+ aerialReach) */
  gkReachHeight: 2.85,
  gkReachAerial: 1.1,
  /** teto de velocidade vertical inicial de um lançamento (m/s) */
  maxVz: 16,
  // --- afastamento "de qualquer maneira" (header/chutão de alívio) ---
  /** velocidade horizontal do afastamento aéreo (m/s): base + força/cabeceio */
  clearSpeedBase: 13,
  clearSpeedSkill: 7,
  /** subida vertical (m/s) do afastamento desesperado (manda pra cima) */
  clearVz: 9,
  /** dispersão angular (rad) do afastamento, apertada por aerialPower */
  clearScatter: 0.6,
  /** afastamento sob pressão NA PRÓPRIA ÁREA sai errado: chance-base de FATIAR a
   *  bola para a LINHA DE FUNDO (escanteio) em vez de mandar pra cima — é a fonte
   *  realista da maioria dos escanteios (zagueiro manda na bandeirinha "de qualquer
   *  maneira"). Calibrado para ~10 escanteios/jogo. */
  clearBehindChance: 0.58,
  /** alívio da fatia-para-fora por frieza (× composure): o zagueiro frio erra menos */
  clearBehindComposure: 0.3,
  /** subida vertical (m/s) da bola fatiada para o escanteio (menor que clearVz) */
  clearBehindVz: 5,
  // --- arco dos lançamentos com altura ---
  /** pico (m) do arco de um CRUZAMENTO flutuado. Mais BAIXO/tenso (era 2.2-3.4) p/ a
   *  bola cruzar a área na ALTURA DA CABEÇA em vez de subir demais e passar por cima
   *  de todos — assim o atacante alcança e cabeceia. */
  crossPeakMin: 1.7,
  crossPeakMax: 2.5,
  /** chance de um cruzamento da ponta sair FLUTUADO (alto) em vez de rasteiro
   *  (0.95: quase sempre alçado, p/ o cabeceio na área) */
  crossLoftChance: 0.95,
  /** pico (m) do arco do ESCANTEIO — mais ALTO que o cruzamento de jogo aberto: a
   *  cobrança é uma bola AÉREA que flutua e cai na área (sobe ~3.6-4.6m), dando tempo
   *  do atacante atacar a bola de cabeça. Vem com a velocidade horizontal mais BAIXA
   *  (ver cornerArcSpeedMin) — bola mais lenta e "chapéu", não um tenso rasteiro. */
  cornerPeakMin: 4,
  cornerPeakMax: 5,
  /** piso da velocidade horizontal (m/s) SÓ do escanteio: mais baixo que arcSpeedMin
   *  para o arco alto ainda POUSAR na área (sem esse piso menor a bola atravessaria a
   *  área). É o que deixa a cobrança flutuar lenta em vez de sair esticada. */
  cornerArcSpeedMin: 5,
  /** pico (m) do arco do TIRO DE META / chutão longo do goleiro */
  goalKickPeak: 6.5,
  /** pico (m) do arco do lançamento longo de alívio (sem alvo claro) */
  longBallPeak: 4.5,
  /** velocidade horizontal mín/máx de uma bola lançada com arco (m/s) */
  arcSpeedMin: 9,
  arcSpeedMax: 26,
  // --- render do voo (vista de cima) ---
  /** quantos px de "subida" na tela por metro de altura (× escala) */
  renderLift: 1.15
};
var BANNER = {
  /** faixa CENTRAL de transição de fase (1º tempo, intervalo) fica na tela */
  phaseMs: 2200,
  /** faixa de LANCE no topo (falta, cartão, escanteio...) fica na tela */
  eventMs: 2200
};
var AREA = {
  /** grande área: 16.5m de profundidade */
  penaltyDepth: 16.5,
  /** meia-largura da grande área: 7.32/2 + 16.5 = 20.16m */
  penaltyHalfWidth: 20.16,
  /** pequena área: 5.5m de profundidade */
  goalDepth: 5.5,
  /** meia-largura da pequena área: 7.32/2 + 5.5 = 9.16m */
  goalHalfWidth: 9.16,
  /** marca do pênalti: 11m da linha de fundo */
  penaltySpot: 11
};
var MATCH = {
  /** duração de cada tempo em segundos de JOGO (45 min/tempo = 90' no total). */
  halfSeconds: 45 * 60,
  /** segundos de JOGO que o RELÓGIO avança por segundo de física. É o knob da
   *  velocidade DO RELÓGIO da partida — NÃO mexe na movimentação dos jogadores
   *  (isso é o multiplicador de velocidade). Com 40 e o Normal (1.5x), o relógio
   *  anda ~60s de jogo por segundo real ≈ 1 minuto a cada segundo. */
  clockRate: 40
};
var WHISTLE = {
  /** meia-largura (m) da FAIXA NEUTRA em torno do meio-campo onde o apito é liberado.
   *  17.5 = terço central exato (a bola precisa ter voltado ao meio, longe das áreas). */
  neutralHalfWidth: 17.5,
  /** teto de espera (s de JOGO) por uma pausa natural depois de esgotado o tempo —
   *  passado isso o árbitro apita de qualquer jeito (não deixa o tempo esticar sem fim). */
  maxExtraWait: 90
};
var KICKOFF = {
  /** raio do círculo central (m) — o adversário aguarda fora dele */
  centerRadius: 9.15,
  /** margem (m) da linha de meio-campo para o time que sai de bola */
  takingMargin: 1,
  /** recuo (m) do 2º batedor em relação à bola, rumo ao próprio campo */
  mateBack: 3,
  /** afastamento lateral (m) do 2º batedor em relação à bola */
  mateSide: 4,
  /** congela a jogada no apito (s) — evita roubada instantânea no recomeço */
  deadball: 0.6
};
var PEN = {
  /** congela a jogada enquanto posiciona a cobrança (s) */
  deadball: 1.1,
  /** recuo (m) dos demais para fora da grande área, atrás da marca */
  waitBack: 2,
  /** espalhamento lateral (m) dos demais na entrada da área */
  waitSpread: 3.4
};
var FREEKICK = {
  /** congela a jogada enquanto o cobrador se posta (s) — falta longe do gol */
  deadball: 1.6,
  /** congela MAIS na falta perigosa: dá tempo da BARREIRA se formar e o ataque
   *  CARREGAR a área antes da cobrança (como num jogo de verdade) */
  deadballDanger: 2.8,
  /** distância regulamentar da barreira à bola (m) — Lei 13 */
  wallDist: 9.15,
  /** nº máximo de defensores que formam a barreira numa falta perigosa */
  wallMax: 3,
  /** largura (m) que a barreira cobre a partir do 1º pau — APERTADA junto ao poste
   *  (não se estende até o meio do gol), deixando o canto OPOSTO livre para o
   *  cobrador enfiar/levantar a bola; o goleiro é quem cobre esse outro canto */
  wallWidth: 2.4,
  /** desvio lateral máximo do centro do gol (m) p/ tentar o CHUTE DIRETO — cone
   *  APERTADO da zona clássica do "D". De lado disso a falta perigosa vira
   *  CRUZAMENTO na área (não se bate direto de ângulo fechado, como na vida real). */
  directCone: 11,
  /** distância ao gol (m) até onde se tenta o CHUTE DIRETO. Além dela (mas dentro
   *  de `launchDist`) a falta é ALÇADA na área em vez de batida — evita a cauda
   *  irreal de gols diretos de muito longe. Curta de propósito. */
  directMaxDist: 28,
  /** altura-alvo (m) com que o chute direto CHEGA ao gol — calcula o loft para a
   *  bola subir POR CIMA do paredão (9,15 m) e cair nesse canto (alto, sob o
   *  travessão). Vale para perto e longe: perto sobe menos, longe sobe mais. */
  targetHeight: 1.7,
  /** folga (m) acima da altura do corpo que a bola precisa ter ao cruzar o paredão
   *  — usada para LIMITAR a potência: perto, martelar manda a bola por cima do gol;
   *  é preciso COLOCAR (mais fraco, com efeito) para subir sobre o paredão e baixar */
  wallClearMargin: 0.45,
  /** distância ao gol (m) até onde se prefere LANÇAR na área a recompor */
  launchDist: 42,
  /** pico (m) do arco do lançamento de falta na área (sobe à altura de cabeça) */
  launchPeak: 4,
  /** janela (s) em que o chute direto está "no ar": só o goleiro o defende —
   *  jogadores de linha não cabeceiam o petardo enquadrado (apenas bloqueio rasteiro) */
  shotWindow: 1.6,
  /** dispersão angular EXTRA (rad) do chute direto — o tiro livre é de baixa
   *  conversão: muitos vão por cima, na barreira ou raspando a trave. Sem isso quase
   *  todos saem enquadrados e viram gol fácil (irreal). */
  aimSpread: 0.15,
  /** bônus de defesa do goleiro contra o chute DIRETO de falta — ele está POSTADO
   *  e à espera da cobrança (bola parada), logo defende bem mais que num chute de
   *  jogo. É o que segura a conversão na faixa real (~6-8% p/ bons batedores). */
  gkSetBonus: 0.64
};
var OFFSIDE = {
  /** margem (m) ALÉM da linha do penúltimo defensor para caracterizar impedimento.
   *  Pela Lei 11 não há margem — é uma linha; aqui um meio-corpo de tolerância
   *  absorve a amostragem discreta e enviesa LEVEMENTE a NÃO marcar lances
   *  apertados (erra a menos). A disciplina das corridas da IA (cap em
   *  linha+offsideSlack) é o que mantém o impedimento naturalmente raro. */
  margin: 0.5
};
var CARD = {
  /** chance-base de cartão numa falta */
  base: 0.1,
  /** peso da agressividade na chance de cartão */
  aggressionWeight: 0.22,
  /** acréscimo de chance de cartão quando a falta é pênalti (lance claro) */
  penaltyBonus: 0.15,
  /** fração das faltas cartonadas que são VERMELHO direto (falta grave) */
  straightRedFrac: 0.12,
  /** quanto a agressividade do infrator aumenta a chance de vermelho direto */
  straightRedAggr: 0.8
};
var DOGSO = {
  /** distância (m) ao gol até onde a falta ainda nega uma chance clara */
  maxDist: 34,
  /** meia-largura (m) da rota bola→gol: um defensor nessa faixa "cobre" o lance
   *  (então não era chance clara) — estreita de propósito, p/ o DOGSO ser raro */
  lane: 6.5
};
var INJURY = {
  /** chance-base de uma FALTA marcada machucar o faltado (× 1+agressividade do infrator) */
  foulChance: 0.06,
  /** fração das lesões que são GRAVES (jogo muito comprometido, cai bastante) */
  seriousFrac: 0.22,
  /** ritmo PERDIDO (0..1) numa pancada leve — desconto na velocidade de topo */
  minorImpair: 0.1,
  /** ritmo perdido numa lesão grave (mancando de verdade) */
  seriousImpair: 0.26,
  /** teto de perda de ritmo acumulada (nunca reduz o jogador a andar) */
  maxImpair: 0.36,
  /** stun EXTRA (s) do jogador machucado — fica mais tempo no chão (leve) */
  downExtra: 1.4,
  /** o `knock` some por segundo de JOGO (corre a dor) — leve some em ~min, grave dura */
  recoverRate: 5e-4,
  // --- lesão SEM contato (estirão muscular) em jogo aberto ---
  /** chance por SEGUNDO de jogo de um estirão ao SPRINTAR (base minúscula: raro) */
  strainRate: 6e-6,
  /** o cansaço eleva o risco de estirão (× isto por (1-energia)) — músculo cansado */
  strainFatigue: 2.5,
  /** fração dos estirões que são GRAVES → o árbitro PARA o jogo (bola ao chão, Lei 8) */
  strainSeriousFrac: 0.4,
  /** congela a jogada no reinício de bola ao chão (s) */
  dropDeadball: 1
};
var HANDBALL = {
  /** chance-base de um contato bola-corpo FORTE ser marcado como mão */
  chance: 0.02,
  /** só a partir desta velocidade da bola (m/s) — um toque leve não é mão */
  minSpeed: 9,
  /** multiplicador da chance quando a bola está ALTA (braços mais no caminho) */
  loftMul: 2
};
var STOPPAGE = {
  /** somado por gol marcado */
  perGoal: 50,
  /** somado por falta */
  perFoul: 12,
  /** somado por cartão/expulsão */
  perCard: 20,
  /** teto de acréscimos por tempo (s de jogo) */
  max: 6 * 60
};
var ADVANTAGE = {
  /** chance de deixar seguir quando há vantagem */
  chance: 0.55
};
var PHYS = {
  /** passo fixo da simulação (s) */
  dt: 1 / 60,
  /** aceleração-base do jogador (m/s²); cada um varia conforme o ritmo */
  playerAccel: 14,
  /** raio do jogador (m) */
  playerRadius: 0.9,
  /** raio da bola (m) */
  ballRadius: 0.45,
  /** distância para dominar a bola solta (m) — primeiro toque/recepção */
  controlRadius: 1.6,
  /** amortecimento da bola por segundo (fração da velocidade mantida);
   *  mais alto = atrito de rolamento menor, a bola corre mais (passes longos viáveis) */
  ballDamping: 0.72,
  /** empurrão à frente ao conduzir a bola (m) — controle curto (menor = mais firme) */
  dribblePush: 0.45,
  /** fator de velocidade do conduto (mais lento, deixa marcar) */
  dribbleSpeed: 0.86,
  /** efeito (Magnus) máximo dado a um chute (m/s² lateral) */
  maxSpin: 8,
  /** fração do efeito aplicada num PASSE (curva sutil, não tira da mira) */
  passSpinScale: 0.3,
  /** fração do efeito mantida por segundo (a curva vai sumindo) */
  spinDecay: 0.78,
  /** quanto da velocidade do conduto é herdada pela bola ao soltá-la (momentum) */
  releaseCarry: 0.5,
  /** taxa (1/s) com que a bola "persegue" o pé ao conduzir — elástico, não rígido */
  footLerp: 22,
  /** restituição ao bater na trave (0=morre, 1=devolve tudo) */
  postRestitution: 0.5,
  /** raio do poste (m) para a colisão da bola */
  postRadius: 0.06
};
var SHOT = {
  /** piso de velocidade do chute (m/s) — toque/colocado sem força */
  speedBase: 16,
  /** parcela da velocidade vinda da FORÇA (potência do chute) */
  speedStrength: 16,
  /** parcela menor vinda da finalização (técnica de bater firme) */
  speedFinishing: 4,
  /** parcela extra de potência vinda de longShots, só pesando no chute de LONGE */
  speedLongShots: 5,
  /** fração do efeito (curva) que o finalizador direciona ao canto mirado
   *  (resto fica aleatório). Composure firma a mão: chute frio curva PARA o gol. */
  spinAimBias: 0.7,
  /** penalidade de mira por bater FORTE (potência) — quem martela sem técnica
   *  abre o chute; technique tempera essa abertura (0=potência não custa mira) */
  powerSpread: 0.16,
  /** DISPERSÃO da finalização (fonte única, tunável): piso de erro + parcela que
   *  cresce quanto PIOR o finalizador, e o quanto technique/consistency ainda
   *  amplificam o erro. Quanto menores, mais chutes saem enquadrados (mais gols)
   *  e menos o talento separa bons de ruins (a Série D também faz gol). */
  spreadFloor: 0.04,
  spreadScale: 0.3,
  spreadTech: 0.3,
  spreadCons: 0.24,
  // --- chute POR CIMA (blazed over) ---
  /** chance-base de um chute SUBIR demais e ir por cima do gol — escalada por
   *  (1 - finalização/frieza): o afobado/tosco manda pra arquibancada. Traz de
   *  volta o "por cima do travessão" e o carimbo na trave (senão todo chute é
   *  rasteiro) e ainda derruba um pouco a conversão (hoje ~3× alta). */
  skyBase: 0.2,
  /** multiplicador da chance de subir demais quando o finalizador está PRESSIONADO */
  skyPress: 1.6,
  /** velocidade vertical (m/s) de um chute que sobe demais — piso + parcela aleatória */
  skyVzBase: 8,
  skyVzVar: 7
};
var HEAD = {
  /** chance-base de uma cabeçada a gol bem dada (0.60: quando o atacante alcança o
   *  cruzamento na área, a cabeçada tende a sair enquadrada — mais gols de cabeça) */
  base: 0.6,
  /** peso da competência aérea (jumping/heading) na chance */
  skill: 0.5,
  /** peso da frieza (composure) na chance */
  composure: 0.12,
  /** piso/teto da chance de cabecear no rumo do gol */
  floor: 0.1,
  cap: 0.96,
  /** velocidade-base da cabeçada (m/s) — mais forte (era 11) p/ o goleiro segurar
   *  menos a cabeçada; ainda abaixo do chute de pé */
  speedBase: 17,
  /** parcela de velocidade vinda da impulsão/força aérea (m/s) */
  speedSkill: 9,
  /** dispersão angular máxima da cabeçada (rad). Reduzida (era 0.42) p/ a cabeçada
   *  sair mais ENQUADRADA — sem isso a maioria ia para fora e não virava gol. */
  scatter: 0.16,
  /** quanto o heading aperta a mira (reduz o scatter; 0..1) */
  scatterAim: 0.6
};
var GAMESTATE = {
  /** fração do jogo (0..1) a partir da qual a gestão de placar começa a pesar */
  lateStart: 0.66,
  /** diferença de gols em que o efeito satura (2+ de vantagem/desvantagem = pleno) */
  diffCap: 2,
  /** amplitude do efeito no fim com placar saturado (±30% na entrega) — presente e
   *  visível (mais empates realistas, líder protege), sem sufocar o placar */
  swing: 0.3,
  /** o quanto o time que protege recua o bloco defensivo rumo ao próprio gol */
  defendDrop: 0.16,
  /** CERA: quanto o time que PROTEGE a vantagem no fim alonga suas cobranças de
   *  bola parada (goleiro cozinha o tiro de meta, cobrador demora no lateral...).
   *  O tempo "perdido" volta como ACRÉSCIMO (o árbitro compensa) — balanço neutro,
   *  só o comportamento visível + os acréscimos crescerem no fim de um jogo apertado. */
  timeWaste: 0.6
};
var AI = {
  /** o quanto o bloco do time desliza lateralmente com a bola (0..1) */
  blockShiftY: 0.6,
  /** ATAQUE: empurra o time para frente quando tem a bola (m) */
  attackPush: 16,
  /** folga (m) além do último defensor antes de cair em impedimento */
  offsideSlack: 1.5,
  /** DEFESA: compactação rumo à linha da bola ao defender (0..1) */
  compactX: 0.38,
  /** DEFESA: quão forte a marcação individual cola no adversário (0..1) */
  markTight: 0.32,
  /** amplitude (m) da tendência posicional individual (variação humana) */
  humanJitter: 1.1,
  /** distância-base ao gol para tentar o chute (m); ajustada pela finalização.
   *  20: perto o bastante p/ o jogador ENTRAR na área/conduzir antes de bater, em vez
   *  de martelar de 30m+ (30 gerava chute só de fora e gols demais). */
  shootRange: 20,
  /** offTheBall: quanto a corrida sobe rumo à linha de impedimento (0..1) */
  offBallRunDepth: 0.35,
  /** desvio lateral máximo (m) em relação ao centro do gol p/ arriscar o chute.
   *  19: cone razoável junto do shootRange menor — chutes saem de posições melhores
   *  (mais de dentro da área) em vez de ângulos impossíveis lá de fora. */
  shootCone: 19,
  /** recuo (m) do poste ao mirar o canto no chute (margem de segurança) */
  shotCornerInset: 1,
  /** tempo máximo segurando a bola antes de decidir passar (s) */
  maxHold: 0.8,
  /** distância de um adversário que conta como “pressão” (m) */
  pressureDist: 2.4,
  /** CONDUÇÃO: espaço livre à frente (m) que convida a CARREGAR a bola rumo ao
   *  gol; o drible do conduto reduz o quanto ele exige (o craque encara aperto) */
  carryRoom: 7,
  /** largura (m) do corredor à frente em que um adversário "fecha" a condução */
  carryLane: 7,
  /** dentro desta distância ao gol (m) o chute tem prioridade sobre conduzir */
  carryShootDist: 11,
  /** alcance de um passe (m) */
  passMin: 5,
  passMax: 40,
  /** antecipação (s) do interceptador sobre a trajetória da bola solta */
  chaseLead: 0.34,
  /** desconto da distância EFETIVA de caça pelo empenho (workRate chega antes) */
  chaseWorkRate: 0.22,
  /** desconto extra ao DEFENDER pela leitura (anticipation/positioning) na caça */
  chaseReadEdge: 0.3,
  /** distância (m) de adversário à linha de passe que já conta como lane limpa */
  laneSafe: 5,
  /** peso da lane livre na escolha do melhor passe */
  laneWeight: 0.9,
  /** lane abaixo disto (m) = passe estrangulado, descarta a opção */
  laneBlocked: 1.4,
  // --- recuo ao goleiro (recycle na saída de bola) ---
  /** só recua ao GK quando o conduto está no PRÓPRIO terço (m do próprio gol) */
  recycleDepth: 34,
  /** o goleiro precisa estar LIVRE p/ receber (m ao adversário mais próximo) */
  recycleGkFree: 6,
  /** linha de passe até o goleiro limpa (m ao adversário mais próximo dela) */
  recycleLane: 3,
  /** recua ao GK quando o MELHOR passe à frente progride menos que isto (m) — sem
   *  saída realmente progressiva, recicla em vez de forçar. Limiar permissivo: o que
   *  de fato prende o recuo é a posição (próprio terço + GK livre atrás + linha limpa),
   *  então na prática ele é RARO (~0.17/jogo) — a saída de bola lenta quase não existe
   *  neste motor de ritmo picado (fraqueza #8), e forçar mais infla o placar/é irreal. */
  recycleForwardGate: 26,
  /** velocidade máx (m/s) do passe de recuo — firme mas DOMINÁVEL pelo GK (recuo
   *  de pé, não um chute): abaixo de GK.controlSpeed para cair na regra do recuo */
  recycleSpeed: 11,
  /** vision: peso extra dado à PROGRESSÃO do passe (quanto enxerga o passe pra frente) */
  visionForward: 0.9,
  /** vision: peso extra dado a ENFIAR em lane apertada (vê a janela difícil) */
  visionLane: 1,
  /** decisions: bônus de peso ao companheiro LIVRE (jogo seguro do decidido) */
  decisionSafe: 0.7,
  /** decisions: penalidade por enfiar forte em lane apertada (risco desnecessário) */
  decisionRisk: 0.12,
  /** offTheBall do recebedor: peso da CORRIDA (vel à frente) que torna o
   *  companheiro uma opção de passe preferida (o craque acha quem se movimenta) */
  offBallOption: 0.5,
  /** crossing: progressão (m) exigida para preferir o cruzamento ao passe raso —
   *  base alta (cruzador fraco quase não cruza) menos a parcela por habilidade */
  crossFwdBase: 12,
  crossFwdSkill: 8,
  /** CRUZAMENTO de bola em jogo vindo da PONTA — o jogador aberto, perto da linha
   *  de fundo de ataque, busca a área (analogia ao escanteio). Estes valores foram
   *  ABERTOS (mais cruzamentos, de mais longe e mais cedo) p/ alimentar a área e
   *  gerar gols de cabeça — antes o cruzamento quase não acontecia. */
  /** afastamento (m) do meio que caracteriza estar "na ponta" (|y - cy|) */
  crossZoneWide: 8,
  /** profundidade (m) a partir da linha de fundo de ataque que forma a zona de cruzamento */
  crossZoneDepth: 36,
  /** distância (m) à linha de fundo em que o jogador "chegou na linha" e cruza de vez */
  crossBylineDepth: 26,
  /** espaço à frente (m) abaixo do qual a frente fechou e ele cruza em vez de insistir */
  crossBylineRoom: 8,
  /** na ponta, chance de trocar o cruzamento por um passe/recuo construído (variação) */
  crossPassChance: 0.05,
  /** CRUZAMENTO EM JOGO ABERTO (não só da linha de fundo): distância (m) ao gol
   *  abaixo da qual o carrier, havendo companheiro NA ÁREA e sem chute claro, alça a
   *  bola na área. É a fonte principal dos cruzamentos que geram cabeçada. */
  crossFromDist: 30,
  /** chance de, atendidas as condições, ALÇAR o cruzamento em jogo aberto (senão
   *  segue a jogada normal) — regula QUANTOS cruzamentos por jogo acontecem. */
  earlyCrossChance: 0.85
};
var MOVE = {
  /** alcance (m) em que a bola "engaja" o jogador; além disso, relaxa */
  engageRange: 40,
  /** engajamento mínimo (longe da bola ainda se ajusta um pouco) */
  engageFloor: 0.16,
  /** fração da velocidade ao se mover relaxado (resto vem do engajamento) */
  jogFloor: 0.42,
  /** zona morta (m): perto do alvo, não corrige a posição */
  deadzoneMin: 0.4,
  deadzoneMax: 2.6,
  /** fração da velocidade máx. ao SE POSICIONAR num ESCANTEIO (bola parada): os
   *  jogadores CORREM para carregar/marcar a área antes da cobrança, ignorando o
   *  freio de engajamento (que os deixaria jogando longe da bola). Sem isto o
   *  congelamento acaba com a área vazia — nenhum atacante para cabecear. */
  setPieceHustle: 0.95,
  /** quão forte a curva freia o jogador (0=para ao virar, 1=não freia) */
  turnFloor: 0.35,
  /** bônus de velocidade EFETIVA (m/s) por aceleração — nas distâncias curtas da
   *  partida quem arranca melhor passa mais tempo no topo (não só rampa inicial) */
  accelTopEnd: 0.8,
  /** taxa (1/s) de suavização do alvo de movimento (low-pass anti-trancos) */
  targetLerp: 11,
  /** histerese: já acomodado, só volta a corrigir além de dz × este fator */
  settleHysteresis: 1.7,
  /** taxa (1/s) das transições visuais suaves (cair / virar dono da bola) */
  downEase: 8,
  ctrlEase: 12
};
var STAMINA = {
  /** velocidade (m/s) a partir da qual o esforço passa a gastar fôlego */
  jogSpeed: 4.5,
  /** faixa de velocidade (m/s) acima de jogSpeed até o sprint máximo */
  sprintBand: 4,
  /** dreno por segundo de JOGO ao sprintar a fundo */
  sprintDrain: 9e-3,
  /** dreno = drainBase - stamina·drainStamina (gasta menos quem tem mais fôlego);
   *  faixa suavizada para não somar à queda de ritmo já aplicada em maxSpeed */
  drainBase: 1.25,
  drainStamina: 0.7,
  /** recuperação por segundo de JOGO ao andar/trotar */
  recover: 4e-3,
  /** quanto a recuperação MINGUA com a exaustão (× falta de naturalFitness) */
  recoverFade: 0.5,
  /** energia mínima — nunca zera por completo */
  floor: 0.45
};
var GK = {
  // --- movimentação / posicionamento (itens 25-36) ---
  /** profundidade máxima que o GK adianta a partir da própria linha (m) */
  boxDepth: 8,
  /** mínimo dentro da própria linha (m) */
  boxNear: 0.5,
  /** deslocamento lateral máximo a partir do centro do gol (m) */
  lateralRange: 9,
  /** fração da distância à bola usada para sair (sweeper-base) */
  comeOutBase: 0.11,
  /** saída extra conforme o atributo oneOnOne */
  comeOutSkill: 0.1,
  comeOutMin: 1.3,
  comeOutMax: 7,
  /** bola tão perto do gol → segura a linha para reagir ao chute (m) */
  dangerDist: 16,
  /** saída máxima quando o perigo é iminente (m) */
  dangerComeOut: 2.5,
  /** antecipação (s) da trajetória da bola ao se posicionar */
  anticipation: 0.18,
  /** quanto puxa para o lado da bola, cobrindo o canto (0..1) */
  postBias: 0.22,
  /** zona morta do GK (m) — evita tremer na linha */
  deadzone: 0.35,
  /** fração da velocidade ao sair de FRENTE (lateral vale 1.0) — anisotropia */
  frontalSpeed: 0.7,
  // --- alcance / defesa física (itens 37-39) ---
  reachBase: 2.4,
  reachReflex: 1,
  reachAgility: 0.7,
  /** extensão do alcance por (vel-controlSpeed) ao voar no chute (m·s/m) */
  diveSpeedScale: 0.05,
  diveMax: 1.6,
  /** o mergulho no chute forte escala com o REFLEXO: piso + parcela de habilidade */
  diveReflexFloor: 0.7,
  diveReflexSkill: 0.5,
  /** bola até esta velocidade = domínio sem disputa (recuo/passe atrás) */
  controlSpeed: 12,
  // --- probabilidade de defesa (itens 13-24) ---
  /** REDUZIDOS (era 0.30/0.45) p/ elevar a conversão a ~3 gols/jogo. O saveSkill
   *  baixo também ACHATA a diferença entre goleiros: sem isso, a conversão da elite
   *  disparava e a Série D não convertia (goleiros fracos não seguravam o suficiente
   *  para compensar a finalização fraca). */
  saveBase: 0.07,
  /** peso da habilidade combinada do GK (reflexo/posicion./agilidade) */
  saveSkill: 0.09,
  /** velocidade de chute sem penalidade (m/s) — abaixo disso é colocado, fácil de defender */
  saveSpeedFree: 20,
  saveSpeedPen: 0.012,
  /** penalidade por chute no canto (longe do meio do gol) */
  saveAnglePen: 0.22,
  /** bônus por estar bem posicionado na hora do chute */
  savePosBonus: 0.16,
  /** faixa (m) de tolerância do bom posicionamento */
  alignBand: 6,
  /** distância de chute considerada "perto" (menos tempo de reação) (m) */
  closeShot: 14,
  saveClosePen: 0.18,
  saveFatiguePen: 0.08,
  saveFloor: 0.12,
  saveCap: 0.8,
  // --- segurar vs. espalmar / erros (itens 17-24) ---
  holdBase: 0.55,
  holdSkill: 0.34,
  holdReflex: 0.14,
  holdSpeedPen: 0.012,
  /** mãos firmes (handling) amortecem a penalidade de segurar o chute FORTE (0..1) */
  holdSpeedHands: 0.45,
  /** velocidade do rebote/espalmada (m/s) */
  spillSpeed: 13,
  /** cooldown curto após espalmar, para a segunda bola (s) */
  spillCooldown: 0.25,
  /** chance (× reflexos) de tocar e dar rebote ao falhar a defesa (reduzida de 0.33:
   *  menos "segunda defesa" no rebote, ajudando a conversão a chegar em ~3 gols/jogo) */
  secondChance: 0.1,
  /** chance-base de "frango" em bola fácil (× falhas de handling/composure) */
  fumbleScale: 0.05,
  /** janela protegida para distribuir após defender (s) */
  protectWindow: 0.6,
  // --- distribuição (itens 45-49) ---
  /** segura a bola antes de distribuir (s) — BASE; o reflexo encurta (ver gkHoldTime) */
  holdTime: 1.2,
  /** tiro de meta: alcance (m) do chutão à frente (rumo ao meio-campo) sem alvo avançado livre */
  goalKickReach: 48,
  /** chutão de alívio: quantas direções (leques) o GK avalia para fugir do adversário */
  clearLanes: 9,
  /** alcance do chutão escalado pelo kicking: piso e parcela de habilidade (× goalKickReach) */
  kickReachFloor: 0.55,
  kickReachSkill: 0.75,
  /** tiro de meta: só busca companheiro ao menos tão à frente (m) rumo ao ataque para o chutão */
  goalKickMinFwd: 14,
  /** tiro de meta: folga mínima (m) do companheiro avançado para confiar o chutão nele */
  goalKickFree: 5,
  /** fração dos tiros de meta batidos no CHUTÃO pra frente (resto sai jogando curto) */
  goalKickLongChance: 0.55,
  kickSpeedBase: 16,
  kickSpeedSkill: 12,
  throwSpeedBase: 12,
  throwSpeedSkill: 8,
  /** espalhamento-base do chutão longo / do lançamento curto (rad) */
  longSpread: 0.18,
  shortSpread: 0.1,
  /** erro extra sob pressão, escalado pela falta de composure (rad) */
  panicSpread: 0.12,
  /**
   * Saída de bola SEGURA (evita "tocar na fogueira"): o goleiro só joga curto
   * num companheiro com bastante espaço e linha de passe limpa, dentro de um
   * alcance curto; senão, manda o chutão longo.
   */
  shortFree: 6,
  shortLane: 4,
  shortMax: 32,
  // --- carga no goleiro (item 41) ---
  /** distância de um atacante que caracteriza carga (m) */
  chargeDist: 1.9,
  /** chance-base de marcar falta na carga (× agressividade do atacante) */
  chargeFoulChance: 0.5,
  chargeStun: 0.6,
  /** RECUO (Lei 12): chance-base de o goleiro AFOBADO pegar o recuo de pé com a MÃO
   *  (lapso mental, × falta de composure) → tiro livre indireto na área. Raro: o
   *  normal é ele jogar com os pés; isto é o erro ocasional que vira lance de perigo. */
  backPassPanic: 0.03,
  /** multiplicador do erro do recuo quando há um adversário PRESSIONANDO o goleiro */
  backPassPanicPress: 3,
  // --- organização da linha (item 8) ---
  /** o quanto a comunicação do GK fecha o bloco de defesa (0..1) */
  commandShift: 0.12,
  /** bônus de defesa por comandar a área e organizar a marcação (× communication) */
  commandSave: 0.06,
  /** alcance extra (m) para abraçar bolas altas/cruzamentos — aerialReach */
  aerialClaim: 1.4,
  // --- saída aérea no cruzamento/escanteio (claim) ---
  /** chance-base de cravar o cruzamento alto ao sair (reduzida p/ 0.10, era 0.34: o
   *  goleiro abafa menos cruzamentos, deixando a bola sobrar p/ o cabeceio) */
  claimBase: 0.1,
  /** peso do aerialReach em cravar a bola alta (× nrm aerialReach) */
  claimSkill: 0.5,
  /** penalidade por bola forte ao cravar de primeira (× m/s) */
  claimSpeedPen: 0.01,
  /** piso/teto da chance de cravar o cruzamento */
  claimFloor: 0.15,
  claimCap: 0.9,
  /** bônus de defesa no 1v1/chute de perto conforme oneOnOne */
  oneOnOneBonus: 0.16,
  /** alcance (m) em que um 1v1 isolado (sem apoio do atacante) ainda premia oneOnOne */
  oneOnOneRange: 24,
  /** saída extra (m) no perigo iminente p/ ABAFAR o 1v1, escalada por oneOnOne */
  rushOneOnOne: 3.5,
  /** quanto o handling joga o rebote para LONGE do meio do gol (0..1) */
  spillWide: 0.7,
  /** piso/escala do erro aéreo: bola alta cai mais sem aerialReach (× fumbleScale) */
  aerialDropScale: 1.6
};
var CELEBRATION = {
  /** duração total (s reais) da comemoração antes do recomeço */
  duration: 3.6,
  /** velocidade da corrida de comemoração (m/s) */
  runSpeed: 7.5,
  /** raio do agrupamento dos companheiros em torno do autor (m) */
  huddle: 3.2,
  /** profundidade (m) infield a partir do escanteio do gol */
  spotInset: 13,
  /** distância (m) da linha lateral em que o autor comemora */
  spotSide: 9,
  /** distância (m) do chute ao gol a partir da qual o gol é um "GOLAÇO" */
  golacoDist: 23
};
var COLLIDE = {
  /** abaixo desta velocidade (m/s) a bola é dominada, não ricocheteia */
  minSpeed: 7,
  /** restituição do ricochete no corpo (0=morre, 1=devolve tudo) */
  restitution: 0.45,
  /** ignora quem acabou de tocar enquanto a bola está a até X m dele */
  grace: 2.2,
  /** dispersão angular (rad) do desvio no corpo */
  scatter: 0.5,
  /** chance-base de AMORTECER (controlar) em vez de só desviar */
  cushionBase: 0.16,
  /** peso da habilidade (firstTouch/antecipação ou aéreo) no amortecimento */
  cushionSkill: 0.4,
  /** peso da FORÇA (ombro a ombro) ao blindar e dominar a bola disputada */
  cushionStrength: 0.18,
  /** peso da BRAVURA ao se atirar na frente de bola forte (bloqueio com o corpo) */
  cushionBravery: 0.22,
  /** fração da velocidade mantida ao amortecer (mata a bola nos pés) */
  cushionKeep: 0.25
};
var CONTROL = {
  /** escala da chance de errar o primeiro toque na bola solta. REDUZIDA (era 0.22):
   *  menos erros de domínio → os times (sobretudo os fracos) SUSTENTAM mais posse e
   *  chegam mais vezes ao chute, o que é essencial p/ a Série D fazer gols. */
  miscontrolScale: 0.06,
  /** velocidade (m/s) acima da qual a bola é "alta/forte" e exige disputa aérea */
  loftSpeed: 18,
  /** alcance extra (m) ganho na bola alta conforme a competência aérea (1.8, era 0.9:
   *  o atacante "engata" no cruzamento de mais longe → mais cabeçadas). */
  aerialReach: 1.8,
  /** vantagem (m) de distância EFETIVA na dividida aérea conforme jumping/heading
   *  (3.2: o atacante que ataca o cruzamento ganha mais divididas de cabeça na área) */
  aerialDuelEdge: 3.2,
  /** vantagem (m) EXTRA do atacante na dividida aérea DENTRO da sua área de ataque —
   *  inclina o cruzamento para quem ataca o gol (mais gols de cabeça). Ver ballCandidate. */
  aerialAtkBoxEdge: 3,
  /** velocidade (m/s) com que a bola escapa num erro de domínio */
  squirtSpeed: 6,
  /** velocidade (m/s) em que matar a bola fica nitidamente mais difícil */
  hardTouchSpeed: 24
};
var DRIBBLE = {
  /** raio (m) em que o conduto começa a desviar do marcador */
  avoidRange: 6,
  /** peso do desvio lateral ao proteger a bola do marcador */
  avoidWeight: 1.1
};
var DUEL = {
  /** distância (até a bola) para tentar o desarme (m) */
  range: 2,
  /**
   * BALANÇO falta × contato limpo: NEM todo atordoamento é falta. No desarme
   * LIMPO (a defesa ganhou a bola) o atacante pode TROPEÇAR de leve — perde o
   * tempo, mas o juiz NÃO apita (staggerStun curto, sem bola parada). Só o bote
   * que ERRA a bola e derruba o homem (commitFoul) é falta de verdade: aí sim cai
   * no chão por mais tempo (foulStun) e a jogada para.
   */
  /** chance de um tropeço leve ao ser desarmado de forma limpa (NÃO é falta) */
  staggerChance: 0.45,
  /** atordoamento (s) do tropeço leve no desarme limpo */
  staggerStun: 0.4,
  /** atordoamento (s) de quem leva o carrinho/FALTA — cai e fica no chão */
  foulStun: 1.4,
  /** intervalo mínimo entre tentativas de desarme (s) */
  cooldown: 0.5,
  /** drible 1v1 (passar pelo marcador antes do duelo): base, peso do confronto
   *  drible/agilidade × leitura do defensor, e teto (defesa ainda funciona).
   *  beatBase↑ e beatSwing↓ (eram 0.18/0.75) tornam o drible MENOS dependente do
   *  talento: o ataque progride mais, gerando mais chances (ajuda a Série D). */
  beatBase: 0.24,
  beatSwing: 0.55,
  beatCap: 0.66,
  /** PASSOU: o defensor mordeu e ficou desequilibrado por um átimo (s) — é o que
   *  abre o espaço de verdade; o bom equilíbrio (balance) encurta essa recuperação */
  beatStun: 0.55,
  beatStunBalance: 0.45,
  /** ARRANQUE do conduto ao passar: multiplica o teto de velocidade da condução
   *  por uma janela curta (s) — o craque EXPLODE pelo vão deixado pelo marcador */
  beatBurst: 1.5,
  beatBurstTime: 0.8,
  /** folga (× cooldown) antes do próximo bote depois de um drible bem-sucedido */
  beatTackleGap: 3,
  /** chance-base de desarme bem-sucedido por tentativa (reduzida de 0.5) */
  baseWin: 0.42,
  /** peso da diferença de poder (desarme×condução) na chance de roubada. REDUZIDO
   *  (era 1.1): o desarme depende MENOS do talento, então o ataque mantém mais a
   *  posse e chega mais ao gol — parte de trazer a Série D a ~3 gols/jogo. */
  duelSwing: 0.7,
  /** vantagem física do ombro a ombro na dividida (diferença de strength, ±1) */
  strengthEdge: 0.22,
  /** o quanto a bravura torna o bote mais comprometido (ganha mais ao acertar) */
  braveryCommit: 0.35,
  /** falta no desarme falhado (modelo overreach): piso, peso da agressão, risco
   *  por esticar-se, agravante de bravura e alívio por ler bem o lance (clean) */
  foulBase: 0.1,
  foulAggr: 0.45,
  foulOverreach: 0.3,
  foulBravery: 0.25,
  foulClean: 0.6,
  /** duração da bola parada numa cobrança de falta (s) */
  deadball: 1
};
var RESTART = {
  /**
   * Bola parada no tiro de meta (s). É também o tempo de REESTRUTURAÇÃO: enquanto
   * congela, os zagueiros abrem na saída, o meio/ataque sobem e o adversário sai
   * da grande área (Lei 16). Mais alto = mais tempo de reorganização.
   */
  goalKickDeadball: 1.8,
  /**
   * Tempo (s) que a bola SEGUE rolando depois de sair pela linha de fundo, antes
   * de marcar o tiro de meta/escanteio. Sem isso a bola seria teletransportada na
   * hora e o jogador nem perceberia que saiu — agora ela cruza a linha e morre fora.
   */
  goalLineOutDelay: 1.5,
  /** faixa (m) ALÉM da linha do campo até onde a bola fora rola antes de parar (cabe
   *  no PAD do render para continuar visível, como se batesse no alambrado) */
  goalLineOutMargin: 3,
  /** bola parada no escanteio — dá tempo dos atacantes CARREGAREM a área e da
   *  defesa recuar p/ marcar antes da cobrança (s). Curto demais = cruzamento numa
   *  área vazia; ~2.6s deixa os dois blocos se posicionarem (como num jogo real). */
  cornerDeadball: 3.2,
  /** bola parada no arremesso lateral (s) — dá tempo de reposicionar, não cobra na hora */
  throwInDeadball: 1.8,
  /** recuo (m) da linha lateral onde o cobrador fica — praticamente EM CIMA da linha */
  throwInInset: 0.3,
  /** distância da linha de fundo onde a bola é posta no tiro de meta (m) — pequena área */
  goalAreaOut: 5.5,
  /** deslocamento lateral da bola no tiro de meta a partir do centro do gol (m) */
  goalAreaSide: 7,
  // --- reestruturação do tiro de meta (Lei 16) ---
  /** profundidade (m) onde os zagueiros se postam para a saída curta — FORA da
   *  grande área (penaltyDepth=16,5), pois ninguém além do batedor pode ficar
   *  dentro dela na cobrança; abrem logo na borda para o toque curto seguro */
  outletDepth: 19.5,
  /** afastamento lateral (m) dos zagueiros na saída (abrem nas pontas) */
  outletWide: 18,
  /** teto (s) de espera do tiro de meta enquanto a área não esvazia — evita
   *  travar a cobrança se algum jogador ficar preso dentro da área */
  goalKickMaxWait: 6,
  /** profundidade-base (m) onde meias/atacantes sobem para receber */
  midfieldOutlet: 26,
  /** profundidade extra (m) escalada pela função ofensiva ao subir */
  attackOutlet: 22,
  /** folga (m) ALÉM da linha da grande área onde o adversário aguarda */
  defendWait: 3,
  /** recuo da bandeirinha para dentro do campo no escanteio (m) */
  cornerInset: 0.6,
  /** alcance do cruzamento do escanteio à frente do gol (m): perto..longe do gol */
  crossNear: 6,
  crossFar: 14,
  /** raio (m) na quina da linha de fundo em que o cobrador reconhece o escanteio e cruza */
  cornerZone: 3,
  // --- posicionamento no ESCANTEIO (bola parada): carrega a área p/ o cabeceio ---
  /** slots do ATAQUE na área do escanteio (profundidade da linha de fundo, desvio
   *  lateral do centro do gol). Cobrem 1º pau, pequena área, marca do pênalti, 2º
   *  pau e a ENTRADA (rebote) — casam com a faixa de queda do cruzamento (6..14m). */
  cornerAtkSlots: [
    { depth: 7, side: -3 },
    // 1º pau (ataca a bola na queda)
    { depth: 9, side: 2 },
    // pequena/miolo
    { depth: 11, side: -1 },
    // marca do pênalti
    { depth: 10, side: 5 },
    // 2º pau
    { depth: 14, side: 0 }
    // entrada da área (rebote/afastamento curto)
  ],
  /** slots da DEFESA no escanteio: marca na ZONA DE QUEDA, GOALSIDE dos atacantes
   *  (~1-2m mais perto do gol que cada alvo do ataque) para DISPUTAR o cabeceio —
   *  nem tão fundo que deixa o atacante cabecear livre (gol fácil), nem tão à frente
   *  que corta tudo pra fora (loop de escanteio). Um fica na boca cobrindo o gol. */
  cornerDefSlots: [
    { depth: 5, side: -3 },
    // contesta o 1º pau
    { depth: 7, side: 2 },
    // contesta o miolo
    { depth: 9, side: -1 },
    // contesta a marca do pênalti
    { depth: 8, side: 5 },
    // contesta o 2º pau
    { depth: 3, side: 0 }
    // cobre a boca do gol (apoio ao goleiro)
  ],
  /** profundidade (m), a partir do meio-campo rumo ao PRÓPRIO campo, onde os
   *  zagueiros do time que COBRA o escanteio seguram (proteção ao contra-ataque) */
  cornerBackHold: 20
};
var THROW = {
  /** alcance-base do arremesso (m) — modesto, é com a mão */
  reachBase: 11,
  /** alcance extra (m) conforme a força do cobrador (lateral longo) */
  reachStrength: 11,
  /** distância mínima (m) p/ um companheiro ser alvo (não arremessa em cima de si) */
  minReach: 4,
  /** pico (m) do arco aéreo do arremesso (sobe à altura de peito/cabeça) */
  peak: 2.4,
  /** dispersão angular (rad) da mira do arremesso */
  spread: 0.1
};

// src/sim/chaos.ts
var GK_ONLY = ["goalkeeping", "handling", "aerialReach", "oneOnOne", "kicking", "throwing", "communication"];
var GK_CORE = ["goalkeeping", "reflexes", "handling"];
var applyChaos = (attrs, role, cfg, src) => {
  const out = { ...attrs };
  const keys = Object.keys(out);
  const used = role === "GK" ? keys : keys.filter((k) => !GK_ONLY.includes(k));
  const mean2 = used.reduce((a, k) => a + out[k], 0) / used.length;
  const spikable = used.filter((k) => !(role === "GK" && GK_CORE.includes(k)));
  const tankable = used.filter((k) => out[k] < mean2 && !(role === "GK" && GK_CORE.includes(k)));
  const spikes = src.pickN(spikable, "spike", cfg.spikes);
  const tanks = src.pickN(tankable, "tank", cfg.tanks);
  const clamp3 = (v) => Math.max(cfg.floor, Math.min(cfg.ceil, Math.round(v)));
  for (const k of used) {
    let v = mean2 + (out[k] - mean2) * cfg.spread;
    v += src.jitter(k) * cfg.jitter;
    if (spikes.has(k)) v += cfg.spikeBoost;
    if (tanks.has(k)) v -= cfg.tankDrop;
    out[k] = clamp3(v);
  }
  return out;
};

// src/sim/teams.ts
var TEAMS = {
  home: { id: "home", name: "Brasil", of: "do Brasil", flag: "/flags/br.svg", shirt: "#fde047", text: "#15803d" },
  away: { id: "away", name: "Argentina", of: "da Argentina", flag: "/flags/ar.svg", shirt: "#7dd3fc", text: "#1e3a8a" }
};
var FORMATION_433 = [
  { x: 5, y: 34 },
  // GK
  { x: 20, y: 12 },
  // RB
  { x: 17, y: 27 },
  // CB
  { x: 17, y: 41 },
  // CB
  { x: 20, y: 56 },
  // LB
  { x: 42, y: 20 },
  // MC dir
  { x: 39, y: 34 },
  // MC centro
  { x: 42, y: 48 },
  // MC esq
  { x: 72, y: 15 },
  // PD
  { x: 74, y: 34 },
  // CA
  { x: 72, y: 53 }
  // PE
];
var ROLES_433 = [
  "GK",
  "DEF",
  "DEF",
  "DEF",
  "DEF",
  "MID",
  "MID",
  "MID",
  "FWD",
  "FWD",
  "FWD"
];
var baseAttrs = (role) => {
  const b = {
    // físico
    pace: 65,
    acceleration: 65,
    agility: 62,
    balance: 62,
    jumping: 60,
    strength: 65,
    stamina: 70,
    naturalFitness: 70,
    workRate: 65,
    // técnico
    dribbling: 60,
    firstTouch: 62,
    technique: 62,
    passing: 65,
    crossing: 55,
    finishing: 50,
    longShots: 52,
    heading: 55,
    tackling: 60,
    marking: 60,
    // mental
    vision: 63,
    anticipation: 62,
    positioning: 64,
    offTheBall: 60,
    decisions: 62,
    composure: 58,
    concentration: 62,
    consistency: 62,
    aggression: 60,
    bravery: 62,
    teamwork: 64,
    flair: 55,
    // reflexo: reação para tocar/chutar de primeira — atributo de TODOS (item: reflexos 0..100)
    reflexes: 60,
    // goleiro (jogador de linha quase não usa o resto)
    goalkeeping: 15,
    handling: 20,
    aerialReach: 25,
    oneOnOne: 20,
    kicking: 45,
    throwing: 35,
    communication: 45
  };
  if (role === "GK")
    return {
      ...b,
      goalkeeping: 78,
      tackling: 30,
      finishing: 20,
      marking: 35,
      reflexes: 75,
      handling: 72,
      aerialReach: 70,
      oneOnOne: 68,
      kicking: 70,
      throwing: 65,
      communication: 72,
      composure: 70,
      agility: 70,
      acceleration: 62,
      jumping: 70
    };
  if (role === "DEF")
    return { ...b, tackling: 78, marking: 76, positioning: 78, strength: 76, heading: 70, bravery: 72 };
  if (role === "MID")
    return { ...b, passing: 72, stamina: 78, workRate: 75, vision: 70, teamwork: 72 };
  return { ...b, finishing: 78, pace: 80, dribbling: 78, offTheBall: 75, longShots: 68 };
};
var BRASIL = [
  { number: 1, name: "Alisson", attrs: { goalkeeping: 95, positioning: 90, strength: 75, reflexes: 90, handling: 88, aerialReach: 86, oneOnOne: 86, kicking: 82, throwing: 78, communication: 84, composure: 92, agility: 80, jumping: 80 } },
  // lateral veterano: inteligente, mas perdendo o pique e sem peso ofensivo
  { number: 2, name: "Danilo", attrs: { tackling: 76, marking: 78, positioning: 82, pace: 64, acceleration: 60, passing: 72, crossing: 62, teamwork: 78, decisions: 78, stamina: 62, dribbling: 54, finishing: 28, longShots: 32, flair: 36 } },
  // zagueiro-líder: leitura e saída de bola de elite, nulo no ataque
  { number: 4, name: "Marquinhos", attrs: { tackling: 86, marking: 88, positioning: 92, pace: 80, strength: 78, heading: 78, composure: 86, anticipation: 88, passing: 74, dribbling: 58, finishing: 26, longShots: 28, crossing: 30, flair: 32 } },
  // muralha canhota: forte e bom de cabeça, MUITO lento e tosco com a bola
  { number: 3, name: "Gabriel M.", attrs: { tackling: 84, marking: 82, strength: 90, aggression: 70, heading: 86, bravery: 84, pace: 58, acceleration: 56, agility: 46, dribbling: 38, passing: 56, technique: 44, finishing: 24, longShots: 22, composure: 56 } },
  // lateral-ala: pace e cruzamento, FRACO defensivamente e no jogo aéreo
  { number: 6, name: "Wendell", attrs: { pace: 82, acceleration: 80, stamina: 86, dribbling: 68, passing: 70, crossing: 78, workRate: 80, tackling: 54, marking: 52, heading: 40, strength: 52, finishing: 38, positioning: 52 } },
  // volante destruidor: rouba e impõe físico, porém LENTO e travado tecnicamente
  { number: 5, name: "Casemiro", attrs: { tackling: 90, marking: 86, strength: 90, positioning: 90, aggression: 82, vision: 72, passing: 74, bravery: 86, teamwork: 80, longShots: 72, heading: 80, pace: 56, acceleration: 52, agility: 44, dribbling: 48, firstTouch: 56 } },
  // box-to-box completo: o equilibrado do time (poucas fraquezas, nada de elite)
  { number: 8, name: "Bruno G.", attrs: { passing: 86, vision: 84, stamina: 90, dribbling: 76, tackling: 78, workRate: 86, longShots: 76, technique: 80, composure: 76, pace: 66, finishing: 56, heading: 52 } },
  // camisa 10 de flair: técnica e visão, mas some na marcação e é inconstante
  { number: 10, name: "Paquet\xE1", attrs: { dribbling: 86, passing: 82, vision: 86, finishing: 62, flair: 86, technique: 86, firstTouch: 84, composure: 70, pace: 68, tackling: 38, marking: 36, strength: 50, heading: 42, workRate: 54, consistency: 46 } },
  // ponta-flecha: veloz e driblador, ZERO defesa e fraco no físico/aéreo
  { number: 19, name: "Raphinha", attrs: { pace: 88, acceleration: 86, dribbling: 86, finishing: 76, passing: 72, crossing: 86, flair: 82, longShots: 76, agility: 86, offTheBall: 76, heading: 36, strength: 50, tackling: 30, marking: 28, composure: 62 } },
  // joia crua: letal e veloz, mas verde de decisão/passe/sangue-frio
  { number: 9, name: "Endrick", attrs: { pace: 90, acceleration: 88, finishing: 86, dribbling: 80, strength: 66, offTheBall: 82, heading: 72, agility: 82, anticipation: 70, passing: 42, vision: 44, decisions: 46, composure: 50, consistency: 46, tackling: 22, workRate: 52, technique: 64 } },
  // O DIFERENCIADO: pace/drible irreais e flair absurdo — mas finaliza só "bem",
  // não marca, é fraco no alto/físico e ainda decide mal sob pressão
  { number: 7, name: "Vini Jr.", attrs: { pace: 97, acceleration: 96, dribbling: 96, finishing: 72, stamina: 82, flair: 92, agility: 94, offTheBall: 80, technique: 86, crossing: 70, passing: 66, heading: 32, strength: 54, tackling: 20, marking: 22, composure: 58, decisions: 56, consistency: 56 } }
];
var ARGENTINA = [
  { number: 23, name: "Dibu", attrs: { goalkeeping: 90, positioning: 85, aggression: 72, reflexes: 86, handling: 84, aerialReach: 82, oneOnOne: 92, kicking: 78, throwing: 72, communication: 82, composure: 92, agility: 78, jumping: 78 } },
  // lateral motor: pace e fôlego, limitado tecnicamente e na finalização
  { number: 26, name: "Molina", attrs: { pace: 84, acceleration: 82, tackling: 72, stamina: 84, marking: 72, crossing: 74, workRate: 82, dribbling: 62, passing: 62, finishing: 36, technique: 56, heading: 46, composure: 56 } },
  // zagueiro brigão: marcação e raça de elite, tosco com a bola
  { number: 13, name: "Cuti Romero", attrs: { tackling: 88, marking: 88, positioning: 86, strength: 88, aggression: 88, heading: 82, bravery: 86, anticipation: 82, pace: 72, composure: 70, dribbling: 50, passing: 62, technique: 50, finishing: 26, flair: 32 } },
  // veterano-bloco: MUITO lento, mas parede física e aérea, decisivo na raça
  { number: 19, name: "Otamendi", attrs: { tackling: 82, marking: 80, strength: 90, aggression: 88, pace: 50, acceleration: 48, agility: 40, heading: 86, bravery: 88, dribbling: 36, technique: 40, passing: 56, finishing: 22, composure: 58, consistency: 56 } },
  // lateral regular: sólido e equilibrado, sem grande ponto fora da curva
  { number: 3, name: "Tagliafico", attrs: { pace: 74, tackling: 78, stamina: 84, aggression: 72, marking: 78, crossing: 70, dribbling: 56, passing: 66, finishing: 36, heading: 56, flair: 42, strength: 64 } },
  // motor incansável: pega, corre e briga 90', sem refino de finalização/aéreo
  { number: 7, name: "De Paul", attrs: { stamina: 94, passing: 80, dribbling: 78, tackling: 78, aggression: 80, workRate: 92, teamwork: 86, technique: 78, pace: 72, vision: 74, finishing: 52, heading: 46, longShots: 66 } },
  // volante-criador: passe e leitura excelentes, NÃO é rápido nem físico
  { number: 24, name: "Enzo", attrs: { passing: 88, vision: 88, stamina: 86, finishing: 62, technique: 82, longShots: 80, decisions: 86, composure: 80, pace: 60, acceleration: 58, tackling: 62, strength: 56, dribbling: 70, heading: 48, agility: 58 } },
  // meia inteligente: técnica e chute de fora, mediano fisicamente
  { number: 20, name: "Mac Allister", attrs: { passing: 86, vision: 84, finishing: 70, dribbling: 78, technique: 84, longShots: 80, composure: 84, decisions: 82, pace: 62, tackling: 66, strength: 54, heading: 46, stamina: 82 } },
  // bruxo veterano: pés mágicos, mas o físico FOI embora e não defende
  { number: 11, name: "Di Mar\xEDa", attrs: { dribbling: 86, passing: 86, vision: 90, finishing: 76, pace: 70, acceleration: 66, crossing: 90, flair: 90, technique: 88, longShots: 84, agility: 82, offTheBall: 76, stamina: 60, strength: 40, tackling: 28, marking: 28, heading: 36, consistency: 58 } },
  // 9 moderno e móvel: completo e trabalhador, fraco no alto e no corpo
  { number: 9, name: "J. \xC1lvarez", attrs: { finishing: 84, dribbling: 80, stamina: 90, vision: 80, offTheBall: 88, workRate: 88, anticipation: 82, pace: 80, acceleration: 82, passing: 72, technique: 78, composure: 78, heading: 56, strength: 56, tackling: 44 } },
  // O DIFERENCIADO: drible/passe/visão/técnica sobrenaturais — porém físico
  // mínimo (frágil, devagar, sem fôlego) e não corre nem marca um lance
  { number: 10, name: "Messi", attrs: { dribbling: 99, passing: 97, finishing: 92, vision: 99, positioning: 80, pace: 70, acceleration: 68, strength: 40, flair: 99, technique: 99, firstTouch: 98, composure: 97, longShots: 88, decisions: 97, offTheBall: 86, agility: 86, stamina: 56, workRate: 28, tackling: 20, marking: 22, heading: 44, aggression: 32, jumping: 44 } }
];
var ROSTERS = { home: BRASIL, away: ARGENTINA };
var CHAOS = {
  spread: 1.5,
  //  afasta cada atributo da média do jogador (arquétipo + agudo)
  jitter: 13,
  //   ruído ± máximo por atributo (textura)
  spikes: 2,
  //    nº de "dons de craque" empurrados ao teto
  spikeBoost: 24,
  tanks: 4,
  //     nº de pontos fracos afundados de vez
  tankDrop: 34,
  floor: 5,
  ceil: 99
};
var hash01 = (n) => {
  let t = n + 1831565813 >>> 0;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};
var strSeed = (s) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};
var chaosAttrs = (attrs, role, seed) => applyChaos(attrs, role, CHAOS, {
  jitter: (k) => (hash01(seed ^ strSeed(k) ^ 2654435769) - 0.5) * 2,
  pickN: (keys, purpose, n) => {
    const salt = seed ^ (purpose === "spike" ? 20915 : 31276);
    return new Set([...keys].sort((a, b) => hash01(salt ^ strSeed(a)) - hash01(salt ^ strSeed(b))).slice(0, n));
  }
});
var rosterFor = (team) => ROSTERS[team].map((spec, i) => {
  const role = ROLES_433[i];
  const seed = strSeed(`${team}:${spec.name}:${spec.number}`);
  return {
    number: spec.number,
    name: spec.name,
    role,
    attrs: chaosAttrs({ ...baseAttrs(role), ...spec.attrs }, role, seed),
    formationPos: { ...FORMATION_433[i] }
  };
});

// src/sim/vector.ts
var vec = (x, y) => ({ x, y });
var add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
var sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
var scale = (a, k) => ({ x: a.x * k, y: a.y * k });
var len = (a) => Math.hypot(a.x, a.y);
var dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
var norm = (a) => {
  const l = len(a);
  return l > 1e-9 ? { x: a.x / l, y: a.y / l } : { x: 0, y: 0 };
};
var limit = (a, max) => {
  const l = len(a);
  return l > max ? scale(a, max / l) : a;
};
var dirTo = (from, to) => norm(sub(to, from));
var lerp = (a, b, t) => a + (b - a) * t;
var lerpV = (a, b, t) => ({
  x: lerp(a.x, b.x, t),
  y: lerp(a.y, b.y, t)
});
var perp = (a) => ({ x: -a.y, y: a.x });

// src/sim/formation.ts
var homePos = (p, dir) => dir === 1 ? { ...p.formationPos } : { x: FIELD.w - p.formationPos.x, y: FIELD.h - p.formationPos.y };
var attackingGoalX = (dir) => dir === 1 ? FIELD.w : 0;
var defendingGoalX = (dir) => dir === 1 ? 0 : FIELD.w;
var freeKickKind = (spot, atkGx) => {
  const dGoal = dist(spot, vec(atkGx, FIELD.cy));
  const lateral = Math.abs(spot.y - FIELD.cy);
  if (lateral < FREEKICK.directCone && dGoal < FREEKICK.directMaxDist) return "direct";
  if (dGoal < FREEKICK.launchDist) return "cross";
  return "far";
};
var inPenaltyArea = (pos, goalX) => {
  const inX = goalX === 0 ? pos.x <= AREA.penaltyDepth : pos.x >= FIELD.w - AREA.penaltyDepth;
  return inX && Math.abs(pos.y - FIELD.cy) <= AREA.penaltyHalfWidth;
};
var buildTeam = (team, idOffset, dir, roster = rosterFor(team)) => roster.map((s, i) => {
  const p = {
    id: idOffset + i,
    number: s.number,
    name: s.name,
    team,
    role: s.role,
    attrs: s.attrs,
    formationPos: s.formationPos,
    pos: { x: 0, y: 0 },
    vel: { x: 0, y: 0 },
    prevPos: { x: 0, y: 0 },
    smTarget: { x: 0, y: 0 },
    settled: false,
    energy: 1,
    stun: 0,
    burst: 0,
    knock: 0,
    downAmt: 0,
    ctrlAmt: 0,
    yellow: false,
    goals: 0
  };
  p.pos = homePos(p, dir);
  p.prevPos = { ...p.pos };
  p.smTarget = { ...p.pos };
  return p;
});
var buildPlayers = (rosters) => [
  ...buildTeam("home", 0, 1, rosters?.home),
  ...buildTeam("away", 100, -1, rosters?.away)
];

// src/sim/ratings.ts
var nrm = (v) => v / 100;
var clamp01 = (v) => Math.max(0, Math.min(1, v));
var maxSpeed = (p) => {
  const base = 5.4 + nrm(p.attrs.pace) * 4.3 + nrm(p.attrs.acceleration) * MOVE.accelTopEnd;
  const fatigueDrop = 0.18 + (1 - nrm(p.attrs.stamina)) * 0.12;
  const fatigue = 1 - fatigueDrop * (1 - p.energy);
  return base * fatigue * (1 - p.knock);
};
var outfieldAccel = (a) => PHYS.playerAccel * (0.7 + nrm(a.acceleration) * 0.6);
var turnFloorOf = (a) => clamp01(MOVE.turnFloor + nrm(a.agility) * 0.4);
var recoverMul = (a) => 0.6 + nrm(a.naturalFitness) * 1;
var knockResist = (a) => nrm(a.balance);
var footing = (a) => clamp01(nrm(a.balance) * 0.75 + nrm(a.agility) * 0.25);
var aerialPower = (a) => nrm(a.jumping) * 0.6 + nrm(a.heading) * 0.3 + nrm(a.balance) * 0.1;
var controlReach = (a, ballSpeed) => {
  const base = PHYS.controlRadius * (0.7 + nrm(a.firstTouch) * 0.7);
  const aerial = ballSpeed > CONTROL.loftSpeed ? aerialPower(a) * CONTROL.aerialReach : 0;
  return base + aerial;
};
var miscontrol = (p, ballSpeed) => {
  const a = p.attrs;
  const skill = nrm(a.firstTouch) * 0.6 + nrm(a.composure) * 0.4;
  const tired = (1 - p.energy) * (1 - nrm(a.concentration) * 0.6);
  const hard = clamp01(ballSpeed / CONTROL.hardTouchSpeed);
  return clamp01((1 - skill) * CONTROL.miscontrolScale * (0.6 + tired) * (0.7 + hard * 0.8));
};
var tacklePower = (a) => nrm(a.tackling) * 0.55 + nrm(a.strength) * 0.3 + nrm(a.positioning) * 0.15;
var carryPower = (a) => nrm(a.dribbling) * 0.45 + nrm(a.strength) * 0.25 + nrm(a.balance) * 0.2 + nrm(a.agility) * 0.1;
var tackleRange = (a) => DUEL.range * (0.9 + nrm(a.bravery) * 0.45 + nrm(a.workRate) * 0.25);
var dribbleSpeedMul = (a) => PHYS.dribbleSpeed * (0.78 + nrm(a.dribbling) * 0.5);
var spread = (skill, a, baseScale, floor = 0) => {
  const tech = 1 - nrm(a.technique) * 0.5;
  const cons = 1 + (1 - nrm(a.consistency)) * 0.4;
  return (floor + (1 - skill) * baseScale) * tech * cons;
};
var passSpeed = (a) => 12 + nrm(a.passing) * 11;
var passSpread = (a, pressured = false) => spread(nrm(a.passing), a, 0.28, 0.015) + (pressured ? (1 - nrm(a.composure)) * 0.12 : 0);
var crossSpeed = (a) => 14 + nrm(a.crossing) * 8;
var crossSpread = (a, pressured = false) => spread(nrm(a.crossing), a, 0.26) + (pressured ? (1 - nrm(a.composure)) * 0.12 : 0);
var shotSpeed = (a) => SHOT.speedBase + nrm(a.strength) * SHOT.speedStrength + nrm(a.finishing) * SHOT.speedFinishing;
var shotSpread = (a, far, pressured, power = 0) => {
  const acc = nrm(a.finishing) * (1 - far) + nrm(a.longShots) * far;
  const calm = (1 - nrm(a.composure)) * (pressured ? 0.2 : 0.08);
  const flairTrim = nrm(a.flair) * (1 - far) * 0.1;
  const powerCost = power * (1 - nrm(a.technique)) * SHOT.powerSpread;
  const tech = 1 - nrm(a.technique) * SHOT.spreadTech;
  const cons = 1 + (1 - nrm(a.consistency)) * SHOT.spreadCons;
  const base = (SHOT.spreadFloor + (1 - acc) * SHOT.spreadScale) * tech * cons;
  return Math.max(0.02, base - flairTrim + calm + powerCost);
};
var shootRangeOf = (a, base) => (
  // flair levanta a AMBIÇÃO: o ousado arrisca o petardo de longe que o sóbrio nem
  // cogita (a precisão de longe ainda vem de longShots no shotSpread).
  base * (0.7 + nrm(a.finishing) * 0.5 + nrm(a.longShots) * 0.5 + nrm(a.flair) * 0.2)
);
var chaseLead = (a) => AI.chaseLead * (0.6 + nrm(a.anticipation) * 0.8) * (0.85 + nrm(a.acceleration) * 0.3);
var markPull = (a) => clamp01(nrm(a.marking) * 0.8 + nrm(a.anticipation) * 0.2);
var shapeMul = (a) => 0.7 + nrm(a.teamwork) * 0.6;
var offBallAdvance = (a) => 0.6 + nrm(a.offTheBall) * 0.8;
var holdMax = (a) => AI.maxHold * (0.7 + nrm(a.decisions) * 0.6) * (1 - nrm(a.reflexes) * 0.4);
var flairSpin = (a) => 0.4 + nrm(a.flair) * 0.6;
var gkMaxSpeed = (p) => {
  const a = p.attrs;
  const base = 5.2 + nrm(a.agility) * 2.2 + nrm(a.acceleration) * 1.8;
  const fatigueDrop = 0.18 + (1 - nrm(a.stamina)) * 0.12;
  const fatigue = 1 - fatigueDrop * (1 - p.energy);
  return base * fatigue;
};
var gkReach = (a) => GK.reachBase + nrm(a.reflexes) * GK.reachReflex + nrm(a.agility) * GK.reachAgility;
var gkSaveBase = (a) => nrm(a.goalkeeping) * 0.36 + nrm(a.reflexes) * 0.36 + nrm(a.handling) * 0.1 + nrm(a.positioning) * 0.18;
var gkHoldChance = (a, speed) => clamp01(
  GK.holdBase + (nrm(a.handling) * GK.holdSkill + nrm(a.reflexes) * GK.holdReflex) - speed * GK.holdSpeedPen * (1 - nrm(a.handling) * GK.holdSpeedHands)
);
var gkHoldTime = (a) => GK.holdTime * (1 - nrm(a.reflexes) * 0.6);
var gkKickSpeed = (a) => GK.kickSpeedBase + nrm(a.kicking) * GK.kickSpeedSkill;
var gkKickReach = (a) => GK.goalKickReach * (GK.kickReachFloor + nrm(a.kicking) * GK.kickReachSkill);
var gkDistroQuality = (a) => clamp01(0.2 + nrm(a.decisions) * 0.4 + nrm(a.composure) * 0.2 + nrm(a.vision) * 0.2);
var gkThrowSpeed = (a) => GK.throwSpeedBase + nrm(a.throwing) * GK.throwSpeedSkill;
var gkDistroSpread = (a, long, pressured) => {
  const skill = long ? a.kicking : a.throwing;
  const base = (1 - nrm(skill)) * (long ? GK.longSpread : GK.shortSpread);
  const panic = pressured ? (1 - nrm(a.composure)) * GK.panicSpread : 0;
  return base + panic;
};

// src/sim/rng.ts
var seedRng = (seed) => seed >>> 0;
var rand = (s) => {
  s.rngState = s.rngState + 1831565813 >>> 0;
  let t = s.rngState;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
};

// src/sim/ai.ts
var arc = (d, peak, minSpeed = AIR.arcSpeedMin) => {
  const t = Math.sqrt(8 * peak / AIR.gravity);
  const speed = clamp(d / t, minSpeed, AIR.arcSpeedMax);
  return { speed, loft: clamp(AIR.gravity * t / 2, 0, AIR.maxVz) };
};
var teammates = (s, t) => s.players.filter((p) => p.team === t);
var opponents = (s, t) => s.players.filter((p) => p.team !== t);
var clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
var nearestOfTeam = (s, t, point, includeGK = false) => {
  const ok = (p) => (includeGK || p.role !== "GK") && p.stun <= 0;
  const pool = teammates(s, t).filter(ok);
  const arr = pool.length ? pool : teammates(s, t).filter((p) => includeGK || p.role !== "GK");
  return arr.reduce((b, p) => dist(p.pos, point) < dist(b.pos, point) ? p : b);
};
var nearestOppDist = (s, p) => Math.min(...opponents(s, p.team).map((o) => dist(o.pos, p.pos)));
var nearestOpp = (s, p) => opponents(s, p.team).filter((o) => o.role !== "GK").reduce((b, o) => dist(o.pos, p.pos) < dist(b.pos, p.pos) ? o : b);
var forwardSpace = (s, carrier, fwd) => {
  let min = Infinity;
  for (const o of opponents(s, carrier.team)) {
    if (o.role === "GK") continue;
    if ((o.pos.x - carrier.pos.x) * fwd <= 0) continue;
    if (Math.abs(o.pos.y - carrier.pos.y) > AI.carryLane) continue;
    const d = dist(o.pos, carrier.pos);
    if (d < min) min = d;
  }
  return min;
};
var predictBall = (s, t) => {
  const b = s.ball;
  if (b.z > AIR.groundBand || b.vz > 0.1) {
    const tLand = (b.vz + Math.sqrt(b.vz * b.vz + 2 * AIR.gravity * b.z)) / AIR.gravity;
    return add(b.pos, scale(b.vel, tLand));
  }
  const d = PHYS.ballDamping;
  const ln = Math.log(d);
  const f = Math.abs(ln) > 1e-6 ? (Math.pow(d, t) - 1) / ln : t;
  return add(b.pos, scale(b.vel, f));
};
var passTravelTime = (d, speed) => d / (speed * 0.85);
var passLeadPoint = (carrier, m, speed) => {
  const t = clamp(passTravelTime(dist(carrier.pos, m.pos), speed), 0, 0.8);
  return add(m.pos, scale(m.vel, t));
};
var laneClearance = (s, from, to, t) => {
  const seg = { x: to.x - from.x, y: to.y - from.y };
  const segLen2 = seg.x * seg.x + seg.y * seg.y;
  let min = Infinity;
  for (const o of opponents(s, t)) {
    if (o.role === "GK") continue;
    const w = { x: o.pos.x - from.x, y: o.pos.y - from.y };
    const proj = segLen2 > 1e-6 ? clamp((w.x * seg.x + w.y * seg.y) / segLen2, 0, 1) : 0;
    const closest = add(from, scale(seg, proj));
    const d = dist(o.pos, closest);
    if (d < min) min = d;
  }
  return min;
};
var teamGk = (s, t) => s.players.find((p) => p.team === t && p.role === "GK");
var gkClearTarget = (s, gk, fwd) => {
  const base = clamp(gk.pos.x + fwd * gkKickReach(gk.attrs), 4, FIELD.w - 4);
  const foes = opponents(s, gk.team).filter((o) => o.role !== "GK");
  let best = vec(base, FIELD.cy);
  let bestClear = -Infinity;
  for (let i = 0; i < GK.clearLanes; i++) {
    const frac = GK.clearLanes > 1 ? i / (GK.clearLanes - 1) : 0.5;
    const t = vec(base, clamp(FIELD.h * frac, 4, FIELD.h - 4));
    const lane = laneClearance(s, gk.pos, t, gk.team);
    const land = foes.length ? Math.min(...foes.map((o) => dist(o.pos, t))) : Infinity;
    const clear = Math.min(lane, land);
    if (clear > bestClear) {
      bestClear = clear;
      best = t;
    }
  }
  const straight = vec(base, FIELD.cy);
  const q = gkDistroQuality(gk.attrs);
  return add(straight, scale({ x: best.x - straight.x, y: best.y - straight.y }, q));
};
var aimShot = (s, carrier, dir) => {
  const gx = attackingGoalX(dir);
  const gk = teamGk(s, carrier.team === "home" ? "away" : "home");
  const top = GOAL.top + AI.shotCornerInset;
  const bottom = GOAL.bottom - AI.shotCornerInset;
  const y = gk ? gk.pos.y < FIELD.cy ? bottom : top : carrier.pos.y < FIELD.cy ? bottom : top;
  return vec(gx, y);
};
var crossTarget = (s, atkGx) => {
  const into = atkGx === 0 ? 1 : -1;
  const reach = RESTART.crossNear + rand(s) * (RESTART.crossFar - RESTART.crossNear);
  return vec(atkGx + into * reach, FIELD.cy + (rand(s) - 0.5) * GOAL.width);
};
var crossAction = (s, carrier, target, pressured) => {
  const aim = withNoise(s, carrier.pos, target, crossSpread(carrier.attrs, pressured));
  if (s.corner) {
    const peak = AIR.cornerPeakMin + rand(s) * (AIR.cornerPeakMax - AIR.cornerPeakMin);
    const a = arc(dist(carrier.pos, target), peak, AIR.cornerArcSpeedMin);
    return { type: "pass", target: aim, speed: a.speed, to: null, loft: a.loft };
  }
  if (rand(s) < AIR.crossLoftChance) {
    const peak = AIR.crossPeakMin + rand(s) * (AIR.crossPeakMax - AIR.crossPeakMin);
    const a = arc(dist(carrier.pos, target), peak);
    return { type: "pass", target: aim, speed: a.speed, to: null, loft: a.loft };
  }
  return { type: "pass", target: aim, speed: crossSpeed(carrier.attrs), to: null };
};
var sign = (dir) => dir;
var engagement = (s, p) => {
  const d = dist(s.ball.pos, p.pos);
  const anticip = 0.85 + nrm(p.attrs.positioning) * 0.3;
  let e = (1.18 - d / MOVE.engageRange) * anticip;
  if (s.possession && s.possession !== p.team)
    e *= 0.75 + nrm(p.attrs.workRate) * 0.45 + nrm(p.attrs.aggression) * 0.12;
  return clamp(e, MOVE.engageFloor, 1);
};
var withNoise = (st, from, to, spread2) => {
  const d = dirTo(from, to);
  const a = (rand(st) - 0.5) * 2 * spread2;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return add(from, scale({ x: d.x * c - d.y * s, y: d.x * s + d.y * c }, 60));
};
var ROLE_ADVANCE = {
  GK: 0,
  DEF: 0.2,
  MID: 0.55,
  FWD: 0.9
};
var humanBias = (p) => {
  const a = p.id * 73 % 7 - 3;
  const b = p.id * 31 % 5 - 2;
  return vec(a / 3 * AI.humanJitter, b / 2 * AI.humanJitter);
};
var offsideLineFwd = (s, attackTeam, fwd) => Math.max(
  ...opponents(s, attackTeam).filter((o) => o.role !== "GK").map((o) => o.pos.x * fwd)
);
var gameUrgency = (s, team) => {
  const diff = s.score[team] - s.score[team === "home" ? "away" : "home"];
  if (diff === 0) return 1;
  const prog = clamp(s.time / (2 * MATCH.halfSeconds), 0, 1);
  const late = clamp((prog - GAMESTATE.lateStart) / (1 - GAMESTATE.lateStart), 0, 1);
  if (late <= 0) return 1;
  const lead = clamp(diff / GAMESTATE.diffCap, -1, 1);
  return 1 - lead * late * GAMESTATE.swing;
};
var attackTarget = (s, p, fwd, home) => {
  const ball = s.ball;
  const pull = engagement(s, p);
  const ballFwd = clamp((ball.pos.x - FIELD.cx) * fwd / (FIELD.w / 2), 0, 1);
  const adv = ROLE_ADVANCE[p.role] * (0.4 + ballFwd * 0.9) * offBallAdvance(p.attrs);
  const bias = humanBias(p);
  const atkGx = attackingGoalX(fwd);
  const ballWide = Math.abs(ball.pos.y - FIELD.cy) > AI.crossZoneWide;
  const ballByline = Math.abs(ball.pos.x - atkGx) < AI.crossZoneDepth;
  const landing = ball.z > AIR.groundBand ? predictBall(s, 0.4) : null;
  const crossDropping = landing !== null && dist(landing, vec(atkGx, FIELD.cy)) < AI.crossZoneDepth;
  const isBoxRunner = p.role === "FWD" || p.role === "MID";
  if (isBoxRunner && p.id !== s.controllerId && s.possession === p.team && (crossDropping || ballByline && ballWide)) {
    if (crossDropping && landing) {
      return vec(clamp(landing.x, 2, FIELD.w - 2), clamp(landing.y, GOAL.top - 2, GOAL.bottom + 2));
    }
    const into = atkGx === 0 ? 1 : -1;
    const slot = p.id % 3;
    const bx = atkGx + into * (slot === 0 ? 6 : slot === 1 ? 11 : 9);
    const by = FIELD.cy + (slot === 0 ? -3 : slot === 1 ? 0 : 4);
    return vec(clamp(bx, 2, FIELD.w - 2), clamp(by, GOAL.top - 1, GOAL.bottom + 1));
  }
  const urg = gameUrgency(s, p.team);
  let tx = home.x + fwd * adv * AI.attackPush * urg + bias.x;
  if (p.role !== "GK" && p.id !== s.controllerId) {
    const line = offsideLineFwd(s, p.team, fwd) + AI.offsideSlack;
    const push = clamp(nrm(p.attrs.offTheBall) * AI.offBallRunDepth * urg, 0, 1);
    tx = tx * (1 - push) + line * fwd * push;
  }
  const ty = home.y + (ball.pos.y - FIELD.cy) * AI.blockShiftY * pull + bias.y;
  const capFwd = offsideLineFwd(s, p.team, fwd) + AI.offsideSlack;
  if (tx * fwd > capFwd) tx = capFwd * fwd;
  return vec(clamp(tx, 2, FIELD.w - 2), clamp(ty, 2, FIELD.h - 2));
};
var defendTarget = (s, p, home) => {
  const ball = s.ball;
  const pull = engagement(s, p);
  const bias = humanBias(p);
  const compact = AI.compactX * shapeMul(p.attrs);
  let tx = home.x + (ball.pos.x - home.x) * compact * pull + bias.x;
  let ty = home.y + (ball.pos.y - FIELD.cy) * AI.blockShiftY * pull + bias.y;
  let commTight = 1;
  if (p.role === "DEF" || p.role === "MID") {
    const gkc = teamGk(s, p.team);
    if (gkc) commTight = 1 + nrm(gkc.attrs.communication) * 0.35;
  }
  const m = markPull(p.attrs) * (0.35 + (1 - 0.35) * pull) * AI.markTight * commTight;
  if (m > 1e-3) {
    const o = nearestOpp(s, p);
    tx += (o.pos.x - tx) * m;
    ty += (o.pos.y - ty) * m;
  }
  if (p.role === "DEF") {
    const gk = teamGk(s, p.team);
    const comm = gk ? nrm(gk.attrs.communication) : 0;
    ty = FIELD.cy + (ty - FIELD.cy) * (1 - GK.commandShift * comm);
  }
  const urg = gameUrgency(s, p.team);
  if (urg < 1) {
    const ownGoalX = defendingGoalX(s.attackDir[p.team]);
    tx += (ownGoalX - tx) * (1 - urg) * GAMESTATE.defendDrop;
  }
  return vec(clamp(tx, 2, FIELD.w - 2), clamp(ty, 2, FIELD.h - 2));
};
var goalKickStation = (s, p) => {
  const kt = s.restartTeam;
  const gx = defendingGoalX(s.attackDir[kt]);
  const into = gx === 0 ? 1 : -1;
  const home = homePos(p, s.attackDir[p.team]);
  if (p.team !== kt) {
    const insideWidth = Math.abs(home.y - FIELD.cy) < AREA.penaltyHalfWidth;
    const insideDepth = (home.x - gx) * into < AREA.penaltyDepth + RESTART.defendWait;
    const tx = insideWidth && insideDepth ? gx + into * (AREA.penaltyDepth + RESTART.defendWait) : home.x;
    return vec(clamp(tx, 2, FIELD.w - 2), home.y);
  }
  if (p.role === "DEF") {
    const wing = home.y < FIELD.cy ? -1 : 1;
    return vec(
      gx + into * RESTART.outletDepth,
      clamp(FIELD.cy + wing * RESTART.outletWide, 5, FIELD.h - 5)
    );
  }
  const up = RESTART.midfieldOutlet + ROLE_ADVANCE[p.role] * RESTART.attackOutlet;
  return vec(clamp(gx + into * up, 5, FIELD.w - 5), home.y);
};
var freeKickStation = (s, p) => {
  const kt = s.restartTeam;
  const dir = s.attackDir[p.team];
  const home = homePos(p, dir);
  const spot = s.ball.pos;
  const kind = s.fkKind ?? "far";
  if (kind === "cross") return cornerStation(s, p);
  if (p.team === kt) {
    if (p.id === s.controllerId) return p.pos;
    if (kind === "direct") {
      const atkGx = attackingGoalX(dir);
      const into = atkGx === 0 ? 1 : -1;
      const wing = p.id % 2 === 0 ? 1 : -1;
      const x = atkGx + into * (AREA.penaltyDepth - 2);
      const y = FIELD.cy + wing * (11 + p.id % 3 * 3);
      return vec(clamp(x, 2, FIELD.w - 2), clamp(y, 4, FIELD.h - 4));
    }
    return attackTarget(s, p, sign(dir), home);
  }
  const goalC = vec(defendingGoalX(dir), FIELD.cy);
  if (kind !== "direct") return defendTarget(s, p, home);
  const idx = s.wallIds.indexOf(p.id);
  if (idx < 0) {
    if (p.role !== "DEF") return homePos(p, dir);
    const into = goalC.x === 0 ? 1 : -1;
    const wing = p.id % 2 === 0 ? 1 : -1;
    const x = goalC.x + into * (AREA.goalDepth + 1);
    const y = FIELD.cy + wing * (AREA.goalHalfWidth + 2 + p.id % 3);
    return vec(clamp(x, 2, FIELD.w - 2), clamp(y, 4, FIELD.h - 4));
  }
  const ns = Math.sign(spot.y - FIELD.cy) || 1;
  const frac = s.wallIds.length > 1 ? idx / (s.wallIds.length - 1) : 0;
  const aimY = FIELD.cy + ns * (GOAL.width / 2 - frac * FREEKICK.wallWidth);
  const t = add(spot, scale(dirTo(spot, vec(goalC.x, aimY)), FREEKICK.wallDist));
  return vec(clamp(t.x, 2, FIELD.w - 2), clamp(t.y, 2, FIELD.h - 2));
};
var cornerStation = (s, p) => {
  const kt = s.restartTeam;
  const dir = s.attackDir[p.team];
  if (p.team === kt) {
    if (p.id === s.controllerId) return p.pos;
    const atkGx = attackingGoalX(dir);
    const into2 = atkGx === 0 ? 1 : -1;
    if (p.role === "DEF")
      return vec(clamp(FIELD.cx - dir * RESTART.cornerBackHold, 5, FIELD.w - 5), homePos(p, dir).y);
    const slot2 = RESTART.cornerAtkSlots[boxRank(s, p, kt, atkGx)];
    return vec(
      clamp(atkGx + into2 * slot2.depth, 3, FIELD.w - 3),
      clamp(FIELD.cy + slot2.side, GOAL.top - 4, GOAL.bottom + 4)
    );
  }
  const ownGx = defendingGoalX(dir);
  const into = ownGx === 0 ? 1 : -1;
  if (p.role === "FWD") return vec(clamp(FIELD.cx + dir * 8, 5, FIELD.w - 5), homePos(p, dir).y);
  const slot = RESTART.cornerDefSlots[boxRank(s, p, kt === "home" ? "away" : "home", ownGx)];
  return vec(
    clamp(ownGx + into * slot.depth, 3, FIELD.w - 3),
    clamp(FIELD.cy + slot.side, GOAL.top - 4, GOAL.bottom + 4)
  );
};
var boxRank = (s, p, team, gx) => {
  const goalC = vec(gx, FIELD.cy);
  const isAtk = team === s.restartTeam;
  const cand = s.players.filter(
    (q) => q.team === team && q.role !== "GK" && q.id !== s.controllerId && !(isAtk ? q.role === "DEF" : q.role === "FWD")
  );
  const key = (q) => dist(q.pos, goalC) * 1e3 + q.id;
  const rank = cand.filter((q) => key(q) < key(p)).length;
  return rank % RESTART.cornerAtkSlots.length;
};
var desiredTarget = (s, p) => {
  const ball = s.ball;
  const dir = s.attackDir[p.team];
  if (p.role === "GK") {
    const gx = defendingGoalX(dir);
    const goalC = vec(gx, FIELD.cy);
    const aim = add(ball.pos, scale(ball.vel, GK.anticipation));
    const toGoal = dirTo(aim, goalC);
    const dToGoal = dist(aim, goalC);
    const sweep = GK.comeOutBase + nrm(p.attrs.oneOnOne) * GK.comeOutSkill;
    let comeOut = clamp(dToGoal * sweep, GK.comeOutMin, GK.comeOutMax);
    if (dToGoal < GK.dangerDist) {
      const cap = s.controllerId !== null && s.players.find((pl) => pl.id === s.controllerId)?.team !== p.team ? GK.dangerComeOut + nrm(p.attrs.oneOnOne) * GK.rushOneOnOne : GK.dangerComeOut;
      comeOut = Math.min(comeOut, cap);
    }
    if (s.deadball > 0 && s.restartTeam && s.restartTeam !== p.team)
      comeOut = GK.comeOutMin;
    const t = add(goalC, scale(toGoal, -comeOut));
    const post = (aim.y - FIELD.cy) * GK.postBias;
    const xLo = gx === 0 ? GK.boxNear : FIELD.w - GK.boxDepth;
    const xHi = gx === 0 ? GK.boxDepth : FIELD.w - GK.boxNear;
    return vec(
      clamp(t.x, xLo, xHi),
      clamp(t.y + post, FIELD.cy - GK.lateralRange, FIELD.cy + GK.lateralRange)
    );
  }
  if (s.penalty && p.id !== s.controllerId) return p.pos;
  if (s.deadball > 0 && s.restartTeam) {
    if (s.goalKick) return goalKickStation(s, p);
    if (s.freeKick) return freeKickStation(s, p);
    if (s.corner) return cornerStation(s, p);
    if (p.team !== s.restartTeam) return homePos(p, dir);
  }
  const chaser = nearestOfTeam(s, p.team, ball.pos);
  if (chaser.id === p.id) {
    return predictBall(s, chaseLead(p.attrs));
  }
  const home = homePos(p, dir);
  return s.possession === p.team ? attackTarget(s, p, sign(dir), home) : defendTarget(s, p, home);
};
var bestPass = (s, carrier, fwd) => teammates(s, carrier.team).filter((m) => m.id !== carrier.id && m.role !== "GK").map((m) => {
  const d = dist(carrier.pos, m.pos);
  const forward = (m.pos.x - carrier.pos.x) * fwd;
  const free = nearestOppDist(s, m);
  const lane = laneClearance(s, carrier.pos, m.pos, carrier.team);
  const runFwd = Math.max(0, m.vel.x * fwd);
  const optionPull = nrm(m.attrs.offTheBall) * runFwd * AI.offBallOption;
  const vis = nrm(carrier.attrs.vision);
  const dec = nrm(carrier.attrs.decisions);
  const risk = forward * Math.max(0, AI.laneSafe - lane) * AI.decisionRisk;
  const score = forward * (0.6 + vis * AI.visionForward) + free * (0.6 + dec * AI.decisionSafe) + Math.min(lane, AI.laneSafe) * AI.laneWeight * (0.6 + vis * AI.visionLane) + optionPull * (0.5 + vis * 0.5) - risk * dec;
  return { m, d, forward, lane, score };
}).filter(
  (c) => c.d >= AI.passMin && c.d <= AI.passMax && c.forward > -4 && c.lane > AI.laneBlocked
).sort((a, b) => b.score - a.score)[0];
var freeKickAction = (s, carrier, dir, fwd) => {
  const atkGx = attackingGoalX(dir);
  const goalC = vec(atkGx, FIELD.cy);
  const dGoal = dist(carrier.pos, goalC);
  if (s.indirectFK) {
    const mate = teammates(s, carrier.team).filter((m) => m.id !== carrier.id && m.role !== "GK" && m.stun <= 0).sort((a2, b) => dist(carrier.pos, a2.pos) - dist(carrier.pos, b.pos))[0];
    const speed = passSpeed(carrier.attrs);
    if (mate)
      return {
        type: "pass",
        target: withNoise(s, carrier.pos, passLeadPoint(carrier, mate, speed), passSpread(carrier.attrs, false)),
        speed,
        to: mate
      };
    return { type: "pass", target: vec(carrier.pos.x + fwd * 3, carrier.pos.y + 4), speed, to: null };
  }
  const kind = s.fkKind ?? "far";
  if (kind === "direct") {
    const ns = Math.sign(carrier.pos.y - FIELD.cy) || 1;
    const aim = vec(atkGx, FIELD.cy - ns * (GOAL.width / 2 - AI.shotCornerInset));
    const w = FREEKICK.wallDist;
    const denom = AIR.bodyHeight + FREEKICK.wallClearMargin - FREEKICK.targetHeight * w / dGoal;
    let speed = shotSpeed(carrier.attrs);
    if (denom > 0.05)
      speed = Math.min(speed, Math.sqrt(0.5 * AIR.gravity * w * (dGoal - w) / denom));
    const tGoal = dGoal / speed;
    const loft = clamp(
      (FREEKICK.targetHeight + 0.5 * AIR.gravity * tGoal * tGoal) / tGoal,
      0,
      AIR.maxVz
    );
    const far = clamp((dGoal - 6) / 24, 0, 1);
    const power = clamp((speed - SHOT.speedBase) / (SHOT.speedStrength + SHOT.speedFinishing), 0, 1);
    const spread2 = shotSpread(carrier.attrs, far, false, power) + FREEKICK.aimSpread;
    return {
      type: "shoot",
      target: withNoise(s, carrier.pos, aim, spread2),
      speed,
      loft
    };
  }
  if (kind === "cross") {
    const target = crossTarget(s, atkGx);
    const a2 = arc(dist(carrier.pos, target), FREEKICK.launchPeak);
    return {
      type: "pass",
      target: withNoise(s, carrier.pos, target, crossSpread(carrier.attrs, false)),
      speed: a2.speed,
      to: null,
      loft: a2.loft
    };
  }
  const best = bestPass(s, carrier, fwd);
  if (best) {
    const speed = passSpeed(carrier.attrs);
    return {
      type: "pass",
      target: withNoise(s, carrier.pos, passLeadPoint(carrier, best.m, speed), passSpread(carrier.attrs, false)),
      speed,
      to: best.m
    };
  }
  const a = arc(35, AIR.longBallPeak);
  return { type: "pass", target: vec(carrier.pos.x + fwd * 35, carrier.pos.y), speed: a.speed, to: null, loft: a.loft };
};
var gkRecycleTarget = (s, carrier, dir) => {
  const gk = teamGk(s, carrier.team);
  if (!gk) return null;
  const ownGoalX = defendingGoalX(dir);
  const depth = Math.abs(carrier.pos.x - ownGoalX);
  if (depth > AI.recycleDepth) return null;
  if (Math.abs(gk.pos.x - ownGoalX) >= depth) return null;
  if (nearestOppDist(s, gk) < AI.recycleGkFree) return null;
  if (laneClearance(s, carrier.pos, gk.pos, carrier.team) < AI.recycleLane) return null;
  return gk;
};
var decideAction = (s, carrier) => {
  const dir = s.attackDir[carrier.team];
  const goal = vec(attackingGoalX(dir), FIELD.cy);
  const dGoal = dist(carrier.pos, goal);
  const pressured = nearestOppDist(s, carrier) < AI.pressureDist;
  const fwd = sign(dir);
  if (s.freeKick) return freeKickAction(s, carrier, dir, fwd);
  if (s.throwIn) {
    const reach = THROW.reachBase + nrm(carrier.attrs.strength) * THROW.reachStrength;
    const mates = teammates(s, carrier.team).filter(
      (m) => m.id !== carrier.id && m.role !== "GK"
    );
    const pick = mates.map((m) => ({ m, d: dist(carrier.pos, m.pos), free: nearestOppDist(s, m), fwd: (m.pos.x - carrier.pos.x) * fwd })).filter((c) => c.d >= THROW.minReach && c.d <= reach).sort((a2, b) => b.free + b.fwd * 0.4 - (a2.free + a2.fwd * 0.4))[0];
    const to = pick?.m ?? mates.reduce((b, m) => dist(carrier.pos, m.pos) < dist(carrier.pos, b.pos) ? m : b);
    const a = arc(dist(carrier.pos, to.pos), THROW.peak);
    const target = withNoise(s, carrier.pos, passLeadPoint(carrier, to, a.speed), THROW.spread);
    return { type: "pass", target, speed: a.speed, to, loft: a.loft };
  }
  if (carrier.role === "GK") {
    const longKick = (to, peak, panic = false) => {
      const aim = to ? passLeadPoint(carrier, to, gkKickSpeed(carrier.attrs)) : gkClearTarget(s, carrier, fwd);
      const a = arc(dist(carrier.pos, aim), peak);
      const target2 = withNoise(s, carrier.pos, aim, gkDistroSpread(carrier.attrs, true, panic));
      return { type: "pass", target: target2, speed: a.speed, to, loft: a.loft };
    };
    if (s.goalKick) {
      const adv = teammates(s, carrier.team).filter((m) => m.id !== carrier.id && m.role !== "GK").map((m) => ({ m, fwdness: (m.pos.x - carrier.pos.x) * fwd, free: nearestOppDist(s, m) })).filter((c) => c.fwdness > GK.goalKickMinFwd && c.free > GK.goalKickFree).sort((a, b) => b.fwdness + b.free - (a.fwdness + a.free))[0];
      const short = teammates(s, carrier.team).filter((m) => m.id !== carrier.id && m.role !== "GK").map((m) => ({
        m,
        d: dist(carrier.pos, m.pos),
        fwdness: (m.pos.x - carrier.pos.x) * fwd,
        free: nearestOppDist(s, m),
        lane: laneClearance(s, carrier.pos, m.pos, carrier.team)
      })).filter((c) => c.d <= GK.shortMax && c.free > GK.shortFree && c.lane > GK.shortLane).sort((a, b) => b.free + b.fwdness * 0.3 - (a.free + a.fwdness * 0.3))[0];
      if (rand(s) < GK.goalKickLongChance || !short)
        return longKick(adv?.m ?? null, AIR.goalKickPeak);
      const speed = gkThrowSpeed(carrier.attrs);
      return {
        type: "pass",
        target: withNoise(s, carrier.pos, passLeadPoint(carrier, short.m, speed), gkDistroSpread(carrier.attrs, false, false)),
        speed,
        to: short.m
      };
    }
    if (!pressured && s.holdTime < gkHoldTime(carrier.attrs)) return { type: "dribble" };
    const mate = teammates(s, carrier.team).filter((m) => m.id !== carrier.id && m.role !== "GK").map((m) => ({
      m,
      d: dist(carrier.pos, m.pos),
      fwdness: (m.pos.x - carrier.pos.x) * fwd,
      free: nearestOppDist(s, m),
      lane: laneClearance(s, carrier.pos, m.pos, carrier.team)
    })).filter((c) => c.d <= GK.shortMax && c.free > GK.shortFree && c.lane > GK.shortLane).sort((a, b) => b.fwdness + b.free - (a.fwdness + a.free))[0];
    if (pressured || !mate) return longKick(mate?.m ?? null, AIR.longBallPeak, pressured);
    const target = withNoise(
      s,
      carrier.pos,
      passLeadPoint(carrier, mate.m, gkThrowSpeed(carrier.attrs)),
      gkDistroSpread(carrier.attrs, false, pressured)
    );
    return { type: "pass", target, speed: gkThrowSpeed(carrier.attrs), to: mate.m };
  }
  const atkGx = attackingGoalX(dir);
  const inCorner = Math.abs(carrier.pos.x - atkGx) < RESTART.cornerZone && (carrier.pos.y < RESTART.cornerZone || carrier.pos.y > FIELD.h - RESTART.cornerZone);
  if (inCorner) {
    return crossAction(s, carrier, crossTarget(s, atkGx), pressured);
  }
  const room = forwardSpace(s, carrier, fwd);
  const canCarry = !pressured && room > AI.carryRoom * (1.3 - nrm(carrier.attrs.dribbling) * 0.6);
  const cone = AI.shootCone * (1.3 - nrm(carrier.attrs.decisions) * 0.6);
  const central = Math.abs(carrier.pos.y - FIELD.cy) < cone;
  const inShotRange = central && dGoal < shootRangeOf(carrier.attrs, AI.shootRange);
  if (inShotRange && (!canCarry || dGoal < AI.carryShootDist)) {
    const far = clamp((dGoal - 6) / 24, 0, 1);
    const speed = shotSpeed(carrier.attrs);
    const power = clamp((speed - SHOT.speedBase) / (SHOT.speedStrength + SHOT.speedFinishing), 0, 1);
    return {
      type: "shoot",
      target: withNoise(s, carrier.pos, aimShot(s, carrier, dir), shotSpread(carrier.attrs, far, pressured, power)),
      speed
    };
  }
  const boxRunner = teammates(s, carrier.team).some(
    (m) => m.id !== carrier.id && m.role !== "GK" && inPenaltyArea(m.pos, atkGx)
  );
  const wideEnough = Math.abs(carrier.pos.y - FIELD.cy) > 6;
  if (boxRunner && dGoal < AI.crossFromDist && !inShotRange && (pressured || wideEnough) && rand(s) < AI.earlyCrossChance) {
    return crossAction(s, carrier, crossTarget(s, atkGx), pressured);
  }
  const best = bestPass(s, carrier, fwd);
  const onWing = Math.abs(carrier.pos.y - FIELD.cy) > AI.crossZoneWide;
  const inCrossZone = onWing && Math.abs(carrier.pos.x - atkGx) < AI.crossZoneDepth;
  if (inCrossZone) {
    const atByline = Math.abs(carrier.pos.x - atkGx) < AI.crossBylineDepth || room < AI.crossBylineRoom;
    if (atByline || pressured || s.holdTime > holdMax(carrier.attrs)) {
      if (best && rand(s) < AI.crossPassChance) {
        const speed = passSpeed(carrier.attrs);
        return {
          type: "pass",
          target: withNoise(s, carrier.pos, passLeadPoint(carrier, best.m, speed), passSpread(carrier.attrs, pressured)),
          speed,
          to: best.m
        };
      }
      return crossAction(s, carrier, crossTarget(s, atkGx), pressured);
    }
    return { type: "dribble" };
  }
  if (canCarry) return { type: "dribble" };
  if (pressured || s.holdTime > holdMax(carrier.attrs)) {
    if (!best || best.forward < AI.recycleForwardGate) {
      const keeper = gkRecycleTarget(s, carrier, dir);
      if (keeper) {
        const speed = Math.min(passSpeed(carrier.attrs), AI.recycleSpeed);
        return {
          type: "pass",
          target: withNoise(s, carrier.pos, passLeadPoint(carrier, keeper, speed), passSpread(carrier.attrs, pressured)),
          speed,
          to: keeper
        };
      }
    }
    if (best) {
      const wide = Math.abs(carrier.pos.y - FIELD.cy) > FIELD.h * 0.3;
      const crossFwdGate = AI.crossFwdBase - nrm(carrier.attrs.crossing) * AI.crossFwdSkill;
      const useCross = wide && best.forward > crossFwdGate;
      const speed = useCross ? crossSpeed(carrier.attrs) : passSpeed(carrier.attrs);
      const spr = useCross ? crossSpread(carrier.attrs, pressured) : passSpread(carrier.attrs, pressured);
      return {
        type: "pass",
        target: withNoise(s, carrier.pos, passLeadPoint(carrier, best.m, speed), spr),
        speed,
        to: best.m
      };
    }
    const a = arc(30, AIR.longBallPeak);
    return {
      type: "pass",
      target: vec(carrier.pos.x + fwd * 30, carrier.pos.y),
      speed: a.speed,
      to: null,
      loft: a.loft
    };
  }
  return { type: "dribble" };
};

// src/sim/engine.ts
var clamp2 = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
var byId = (s, id) => s.players.find((p) => p.id === id);
var other = (t) => t === "home" ? "away" : "home";
var endFreeKickPhase = (s) => {
  s.wallIds = [];
  s.fkKind = null;
  s.fkShotTimer = 0;
};
var teamGk2 = (s, t) => s.players.find((p) => p.team === t && p.role === "GK");
var emptyStats = () => ({
  shots: 0,
  shotsOnTarget: 0,
  fouls: 0,
  yellows: 0,
  reds: 0,
  tackles: 0,
  possessionTicks: 0,
  saves: 0,
  rebounds: 0,
  throwIns: 0,
  goalKicks: 0,
  corners: 0
});
var addStoppage = (s, sec) => {
  s.stoppage = Math.min(STOPPAGE.max, s.stoppage + sec);
};
var minute = (s) => Math.min(90, Math.max(1, Math.ceil(s.time / 60)));
var addEvent = (s, type, team, text) => {
  s.events.push({ minute: minute(s), type, team, text });
  if (s.events.length > 60) s.events.shift();
};
var PHASE_BANNERS = /* @__PURE__ */ new Set(["kickoff", "half"]);
var announce = (s, type, team, title, text) => {
  addEvent(s, type, team, text);
  s.banner = { id: (s.banner?.id ?? 0) + 1, type, team, title, text };
  if (PHASE_BANNERS.has(type)) s.introPause = BANNER.phaseMs / 1e3;
};
var createMatch = (rosters) => {
  const s = {
    players: buildPlayers(rosters),
    ball: {
      pos: vec(FIELD.cx, FIELD.cy),
      vel: vec(0, 0),
      z: 0,
      vz: 0,
      prevPos: vec(FIELD.cx, FIELD.cy),
      prevZ: 0,
      spin: 0,
      roll: 0
    },
    possession: "home",
    controllerId: null,
    holdTime: 0,
    kickCooldown: 0,
    tackleCooldown: 0,
    deadball: 0,
    outOfPlay: 0,
    pendingGoalLineX: null,
    goalKickWait: 0,
    restartTeam: null,
    goalKick: false,
    throwIn: false,
    freeKick: false,
    wallIds: [],
    fkKind: null,
    fkShotTimer: 0,
    penalty: false,
    corner: false,
    fromRestart: false,
    offsidePend: null,
    indirectFK: false,
    indirectTakerId: null,
    stoppage: 0,
    lastShooterId: null,
    lastShotDist: 0,
    lastShotHeader: false,
    lastPasserId: null,
    lastTouchId: null,
    score: { home: 0, away: 0 },
    time: 0,
    half: 1,
    status: "play",
    attackDir: { home: 1, away: -1 },
    firstKickoff: "home",
    stats: { home: emptyStats(), away: emptyStats() },
    celebration: null,
    banner: null,
    introPause: 0,
    events: [],
    // seed variando por partida (variedade), mas determinístico DENTRO da partida
    rngState: seedRng(Date.now())
  };
  kickoff(s, s.firstKickoff);
  announce(s, "kickoff", s.firstKickoff, "1\xBA TEMPO", "Apito inicial \u2014 bola rolando!");
  return s;
};
var kickoff = (s, kicking) => {
  const center = vec(FIELD.cx, FIELD.cy);
  for (const p of s.players) {
    const pos = homePos(p, s.attackDir[p.team]);
    const ownGoalX = defendingGoalX(s.attackDir[p.team]);
    const margin = p.team === kicking ? KICKOFF.takingMargin : KICKOFF.centerRadius;
    if (ownGoalX === 0) pos.x = Math.min(pos.x, FIELD.cx - margin);
    else pos.x = Math.max(pos.x, FIELD.cx + margin);
    placeTaker(p, pos);
  }
  const towardOwn = defendingGoalX(s.attackDir[kicking]) === 0 ? -1 : 1;
  const takers = s.players.filter((p) => p.team === kicking && p.role !== "GK").sort((a, b) => dist(a.pos, center) - dist(b.pos, center));
  const taker = takers[0];
  const mate = takers[1];
  placeTaker(taker, { ...center });
  if (mate)
    placeTaker(
      mate,
      vec(FIELD.cx + towardOwn * KICKOFF.mateBack, FIELD.cy + KICKOFF.mateSide)
    );
  s.ball.pos = { ...center };
  s.ball.vel = vec(0, 0);
  s.ball.z = 0;
  s.ball.vz = 0;
  s.ball.prevPos = { ...s.ball.pos };
  s.ball.prevZ = 0;
  s.ball.spin = 0;
  s.possession = kicking;
  s.controllerId = taker.id;
  s.lastTouchId = taker.id;
  s.restartTeam = kicking;
  s.goalKick = false;
  s.throwIn = false;
  s.freeKick = false;
  s.corner = false;
  endFreeKickPhase(s);
  s.penalty = false;
  s.holdTime = 0;
  s.kickCooldown = 0;
  s.tackleCooldown = KICKOFF.deadball + DUEL.cooldown;
  s.deadball = KICKOFF.deadball;
  s.outOfPlay = 0;
  s.pendingGoalLineX = null;
  s.lastPasserId = null;
  s.fromRestart = true;
  s.offsidePend = null;
  s.indirectFK = false;
  s.indirectTakerId = null;
};
var clampPos = (p) => {
  p.pos.x = clamp2(p.pos.x, 0, FIELD.w);
  p.pos.y = clamp2(p.pos.y, 0, FIELD.h);
};
var steer = (p, target, dt, maxV, dz = 0.6) => {
  const to = sub(target, p.pos);
  const d = len(to);
  const restDz = p.settled ? dz * MOVE.settleHysteresis : dz;
  if (d < restDz) {
    p.settled = true;
    p.vel = scale(p.vel, Math.pow(0.05, dt));
    p.pos = add(p.pos, scale(p.vel, dt));
    clampPos(p);
    return;
  }
  p.settled = false;
  const dir = norm(to);
  let desired = d < dz + 2 ? maxV * ((d - dz) / 2) : maxV;
  const sp = len(p.vel);
  if (sp > 0.4) {
    const cosT = (p.vel.x * dir.x + p.vel.y * dir.y) / sp;
    const tf = turnFloorOf(p.attrs);
    desired *= tf + (1 - tf) * clamp2((cosT + 1) / 2, 0, 1);
  }
  desired = clamp2(desired, 0, maxV);
  const accel = outfieldAccel(p.attrs);
  const dv = limit(sub(scale(dir, desired), p.vel), accel * dt);
  p.vel = limit(add(p.vel, dv), maxV);
  p.pos = add(p.pos, scale(p.vel, dt));
  clampPos(p);
};
var advancePlayer = (s, p, dt) => {
  if (p.role === "GK") return advanceGk(s, p, dt);
  if (p.stun > 0) {
    p.vel = scale(p.vel, Math.pow(0.03, dt));
    p.pos = add(p.pos, scale(p.vel, dt));
    clampPos(p);
    return;
  }
  const eng = engagement(s, p);
  const hustle = (s.corner || s.fkKind !== null && s.fkKind !== "far") && s.deadball > 0;
  const effMax = hustle ? maxSpeed(p) * MOVE.setPieceHustle : maxSpeed(p) * (MOVE.jogFloor + (1 - MOVE.jogFloor) * eng);
  const dz = hustle ? MOVE.deadzoneMin : MOVE.deadzoneMin + (1 - eng) * (MOVE.deadzoneMax - MOVE.deadzoneMin);
  const k = clamp2(MOVE.targetLerp * dt, 0, 1);
  p.smTarget = lerpV(p.smTarget, desiredTarget(s, p), k);
  steer(p, p.smTarget, dt, effMax, dz);
};
var advanceGk = (s, p, dt) => {
  if (p.stun > 0) {
    p.vel = scale(p.vel, Math.pow(0.03, dt));
    p.pos = add(p.pos, scale(p.vel, dt));
    clampPos(p);
    return;
  }
  const k = clamp2(MOVE.targetLerp * dt, 0, 1);
  p.smTarget = lerpV(p.smTarget, desiredTarget(s, p), k);
  const to = sub(p.smTarget, p.pos);
  const d = len(to);
  const lateral = d > 1e-6 ? Math.abs(to.y) / d : 1;
  const maxV = gkMaxSpeed(p) * (GK.frontalSpeed + (1 - GK.frontalSpeed) * lateral);
  steer(p, p.smTarget, dt, maxV, GK.deadzone);
};
var separate = (s) => {
  const minD = PHYS.playerRadius * 2;
  for (let i = 0; i < s.players.length; i++) {
    for (let j = i + 1; j < s.players.length; j++) {
      const a = s.players[i];
      const b = s.players[j];
      const to = sub(b.pos, a.pos);
      const d = len(to);
      if (d >= minD || d < 1e-6) continue;
      const u = scale(to, 1 / d);
      const overlap = minD - d;
      const aFree = a.id !== s.controllerId && a.stun <= 0 && a.role !== "GK";
      const bFree = b.id !== s.controllerId && b.stun <= 0 && b.role !== "GK";
      if (aFree && bFree) {
        a.pos = sub(a.pos, scale(u, overlap / 2));
        b.pos = add(b.pos, scale(u, overlap / 2));
      } else if (aFree) {
        a.pos = sub(a.pos, scale(u, overlap));
      } else if (bFree) {
        b.pos = add(b.pos, scale(u, overlap));
      }
      if (aFree) clampPos(a);
      if (bFree) clampPos(b);
    }
  }
};
var gainReach = (p, ballSpeed, airborne) => {
  if (p.role !== "GK") return controlReach(p.attrs, ballSpeed);
  const dive = clamp2((ballSpeed - GK.controlSpeed) * GK.diveSpeedScale, 0, GK.diveMax) * (GK.diveReflexFloor + nrm(p.attrs.reflexes) * GK.diveReflexSkill);
  const aerial = airborne ? nrm(p.attrs.aerialReach) * GK.aerialClaim : 0;
  return gkReach(p.attrs) + dive + aerial;
};
var reachHeightOf = (p) => p.role === "GK" ? AIR.gkReachHeight + nrm(p.attrs.aerialReach) * AIR.gkReachAerial : AIR.reachHeight + aerialPower(p.attrs) * AIR.reachAerial;
var ballCandidate = (s, team) => {
  const ballSpeed = len(s.ball.vel);
  const airborne = s.ball.z > AIR.groundBand;
  let best = null;
  let bestScore = Infinity;
  for (const p of s.players) {
    if (team && p.team !== team) continue;
    if (s.wallIds.includes(p.id)) continue;
    if (s.fkShotTimer > 0 && p.role !== "GK") continue;
    if (s.ball.z > reachHeightOf(p)) continue;
    const d = dist(p.pos, s.ball.pos);
    if (d >= gainReach(p, ballSpeed, airborne)) continue;
    const atkBox = inPenaltyArea(s.ball.pos, attackingGoalX(s.attackDir[p.team]));
    const score = airborne && p.role !== "GK" ? d - aerialPower(p.attrs) * CONTROL.aerialDuelEdge - (atkBox ? CONTROL.aerialAtkBoxEdge : 0) : d;
    if (score < bestScore) {
      bestScore = score;
      best = p;
    }
  }
  return best;
};
var nearestOpponentToPoint = (s, t, point, range) => {
  let best = null;
  let bestD = range;
  for (const o of s.players) {
    if (o.team === t) continue;
    const d = dist(o.pos, point);
    if (d < bestD) {
      bestD = d;
      best = o;
    }
  }
  return best;
};
var gkChargeFoul = (s, gk) => {
  const att = nearestOpponentToPoint(s, gk.team, gk.pos, GK.chargeDist);
  if (!att) return;
  s.tackleCooldown = DUEL.cooldown;
  if (rand(s) >= GK.chargeFoulChance * nrm(att.attrs.aggression)) return;
  s.stats[att.team].fouls++;
  addStoppage(s, STOPPAGE.perFoul);
  s.deadball = DUEL.deadball;
  s.possession = gk.team;
  s.restartTeam = gk.team;
  att.stun = GK.chargeStun;
  announce(s, "foul", att.team, "FALTA", `Carga em ${gk.name} \u2014 falta da defesa!`);
};
var tryTackle = (s) => {
  if (s.controllerId === null || s.tackleCooldown > 0) return;
  const carrier = byId(s, s.controllerId);
  if (carrier.role === "GK") return gkChargeFoul(s, carrier);
  const def = nearestOpponentToPoint(s, carrier.team, s.ball.pos, DUEL.range * 1.3);
  if (!def || dist(def.pos, s.ball.pos) > tackleRange(def.attrs)) return;
  s.tackleCooldown = DUEL.cooldown;
  const beat = nrm(carrier.attrs.dribbling) * 0.6 + nrm(carrier.attrs.agility) * 0.4;
  const read = nrm(def.attrs.anticipation) * 0.5 + nrm(def.attrs.positioning) * 0.5;
  const beatProb = clamp2(DUEL.beatBase + (beat - read) * DUEL.beatSwing, 0, DUEL.beatCap);
  if (rand(s) < beatProb) {
    def.stun = DUEL.beatStun * (1 - footing(def.attrs) * DUEL.beatStunBalance);
    carrier.burst = DUEL.beatBurstTime;
    const fwd = dirTo(carrier.pos, vec(attackingGoalX(s.attackDir[carrier.team]), FIELD.cy));
    carrier.vel = add(carrier.vel, scale(fwd, maxSpeed(carrier) * (DUEL.beatBurst - 1) * 0.5));
    s.tackleCooldown = DUEL.cooldown * DUEL.beatTackleGap;
    addEvent(s, "dribble", carrier.team, `Drible de ${carrier.name} \u2014 passou por ${def.name}!`);
    return;
  }
  const defR = tacklePower(def.attrs);
  const attR = carryPower(carrier.attrs);
  const commit = 1 + nrm(def.attrs.bravery) * DUEL.braveryCommit;
  const winProb = clamp2(DUEL.baseWin + (defR - attR) * DUEL.duelSwing * commit, 0.12, 0.92);
  if (rand(s) < winProb) {
    const stagger = DUEL.staggerChance * (1 - footing(carrier.attrs) * 0.6);
    if (rand(s) < stagger) carrier.stun = DUEL.staggerStun;
    s.controllerId = def.id;
    s.possession = def.team;
    s.holdTime = 0;
    s.tackleCooldown = DUEL.cooldown;
    s.stats[def.team].tackles++;
    s.lastPasserId = null;
    return;
  }
  const reachOut = clamp2(dist(def.pos, s.ball.pos) / tackleRange(def.attrs), 0, 1);
  const cleanCut = nrm(def.attrs.positioning) * 0.5 + nrm(def.attrs.anticipation) * 0.5;
  const foulProb = DUEL.foulBase + nrm(def.attrs.aggression) * DUEL.foulAggr + reachOut * (DUEL.foulOverreach + nrm(def.attrs.bravery) * DUEL.foulBravery) * (1 - cleanCut * DUEL.foulClean);
  if (rand(s) < foulProb) commitFoul(s, def, carrier);
};
var sendOff = (s, p, reason) => {
  s.stats[p.team].reds++;
  addStoppage(s, STOPPAGE.perCard);
  addEvent(s, "card", p.team, `\u{1F7E5} ${p.name} (${TEAMS[p.team].name}) \u2014 EXPULSO (${reason})`);
  if (s.controllerId === p.id) s.controllerId = null;
  if (s.lastTouchId === p.id) s.lastTouchId = null;
  if (s.lastPasserId === p.id) s.lastPasserId = null;
  if (s.lastShooterId === p.id) s.lastShooterId = null;
  s.players = s.players.filter((q) => q.id !== p.id);
  return "VERMELHO";
};
var giveYellow = (s, def) => {
  def.yellow = true;
  s.stats[def.team].yellows++;
  addStoppage(s, STOPPAGE.perCard);
  addEvent(s, "card", def.team, `\u{1F7E8} ${def.name} (${TEAMS[def.team].name}) \u2014 amarelo`);
  return "AMARELO";
};
var isClearChance = (s, carrier, def) => {
  if (carrier.role === "GK") return false;
  const fwd = s.attackDir[carrier.team];
  if ((carrier.pos.x - FIELD.cx) * fwd <= 0) return false;
  const goalC = vec(attackingGoalX(fwd), FIELD.cy);
  if (dist(carrier.pos, goalC) > DOGSO.maxDist) return false;
  for (const o of s.players) {
    if (o.team === carrier.team || o.role === "GK" || o.id === def.id) continue;
    if ((o.pos.x - carrier.pos.x) * fwd <= 0) continue;
    if (Math.abs(o.pos.y - carrier.pos.y) <= DOGSO.lane) return false;
  }
  return true;
};
var applyCard = (s, def, penalty, dogso) => {
  if (dogso) {
    if (!penalty && def.role !== "GK")
      return sendOff(s, def, "negar chance clara de gol");
    if (def.role !== "GK" && def.yellow) return sendOff(s, def, "2\xBA amarelo");
    return giveYellow(s, def);
  }
  const prob = CARD.base + nrm(def.attrs.aggression) * CARD.aggressionWeight + (penalty ? CARD.penaltyBonus : 0);
  if (rand(s) >= prob) return null;
  const redFrac = CARD.straightRedFrac * (1 + nrm(def.attrs.aggression) * CARD.straightRedAggr);
  if (def.role !== "GK" && (rand(s) < redFrac || def.yellow))
    return sendOff(s, def, def.yellow ? "2\xBA amarelo" : "falta grave");
  return giveYellow(s, def);
};
var maybeInjure = (s, def, victim) => {
  if (victim.role === "GK") return;
  if (rand(s) >= INJURY.foulChance * (1 + nrm(def.attrs.aggression))) return;
  const serious = rand(s) < INJURY.seriousFrac;
  const impair = serious ? INJURY.seriousImpair : INJURY.minorImpair;
  victim.knock = Math.min(INJURY.maxImpair, victim.knock + impair);
  victim.stun += serious ? INJURY.downExtra * 1.8 : INJURY.downExtra;
  addStoppage(s, STOPPAGE.perFoul);
  addEvent(
    s,
    "foul",
    victim.team,
    serious ? `\u{1F691} ${victim.name} fica ca\xEDdo \u2014 sente muito a pancada!` : `${victim.name} sente a pancada da falta e segue mancando`
  );
};
var commitFoul = (s, def, carrier) => {
  s.stats[def.team].fouls++;
  addStoppage(s, STOPPAGE.perFoul);
  const ownGoalX = defendingGoalX(s.attackDir[def.team]);
  const penalty = inPenaltyArea(carrier.pos, ownGoalX);
  const dogso = isClearChance(s, carrier, def);
  const card = applyCard(s, def, penalty, dogso);
  const fwd = s.attackDir[carrier.team];
  const inAttackingHalf = (carrier.pos.x - FIELD.cx) * fwd > 0;
  if (!penalty && inAttackingHalf && rand(s) < ADVANTAGE.chance) {
    announce(
      s,
      "foul",
      def.team,
      card ?? "VANTAGEM",
      `Falta de ${def.name} \u2014 vantagem, ${TEAMS[carrier.team].name} segue!`
    );
    return;
  }
  carrier.stun = DUEL.foulStun * (1 - knockResist(carrier.attrs) * 0.4);
  s.controllerId = null;
  s.holdTime = 0;
  maybeInjure(s, def, carrier);
  if (penalty) return penaltyKick(s, carrier.team, ownGoalX);
  announce(s, "foul", def.team, card ?? "FALTA", `Falta de ${def.name} sobre ${carrier.name}`);
  setupFreeKick(s, carrier.team, { ...carrier.pos });
};
var placedKickRating = (p) => nrm(p.attrs.longShots) * 0.5 + nrm(p.attrs.finishing) * 0.3 + nrm(p.attrs.technique) * 0.2;
var setupFreeKick = (s, team, spot, indirect = false) => {
  const atkGx = attackingGoalX(s.attackDir[team]);
  const kind = freeKickKind(spot, atkGx);
  const dangerous = kind !== "far";
  const eligible = s.players.filter((p) => p.team === team && p.role !== "GK" && p.stun <= 0);
  const pool = eligible.length ? eligible : s.players.filter((p) => p.team === team && p.role !== "GK");
  const taker = kind === "direct" ? pool.reduce((b, p) => placedKickRating(p) > placedKickRating(b) ? p : b) : pool.reduce((b, p) => dist(p.pos, spot) < dist(b.pos, spot) ? p : b);
  placeTaker(taker, spot);
  placeDeadBall(s, taker, team, dangerous ? FREEKICK.deadballDanger : FREEKICK.deadball);
  s.freeKick = true;
  s.fkKind = kind;
  if (indirect) {
    s.indirectFK = true;
    s.indirectTakerId = taker.id;
  }
  if (kind === "direct") {
    const defTeam = other(team);
    const ns = Math.sign(spot.y - FIELD.cy) || 1;
    const nearPost = vec(atkGx, FIELD.cy + ns * (GOAL.width / 2));
    const wallPt = add(spot, scale(dirTo(spot, nearPost), FREEKICK.wallDist));
    s.wallIds = s.players.filter((p) => p.team === defTeam && p.role !== "GK").sort((a, b) => dist(a.pos, wallPt) - dist(b.pos, wallPt)).slice(0, FREEKICK.wallMax).map((w) => w.id);
  }
};
var penaltyKick = (s, team, goalX) => {
  const spotX = goalX === 0 ? AREA.penaltySpot : FIELD.w - AREA.penaltySpot;
  const spot = vec(spotX, FIELD.cy);
  const outfield = s.players.filter((p) => p.team === team && p.role !== "GK");
  const taker = outfield.reduce((b, p) => p.attrs.finishing > b.attrs.finishing ? p : b);
  const into = goalX === 0 ? 1 : -1;
  const edgeX = goalX === 0 ? AREA.penaltyDepth : FIELD.w - AREA.penaltyDepth;
  let k = 0;
  for (const p of s.players) {
    if (p.id === taker.id) {
      placeTaker(p, { ...spot });
      continue;
    }
    if (p.role === "GK") {
      placeTaker(p, p.team === team ? homePos(p, s.attackDir[p.team]) : vec(goalX, FIELD.cy));
      continue;
    }
    const lane = edgeX + into * (PEN.waitBack + k % 2 * 1.6);
    const yy = clamp2(FIELD.cy + (k % 8 - 3.5) * PEN.waitSpread, 4, FIELD.h - 4);
    placeTaker(p, vec(lane, yy));
    k++;
  }
  s.ball.pos = { ...spot };
  s.ball.prevPos = { ...spot };
  s.ball.prevZ = 0;
  s.ball.vel = vec(0, 0);
  s.ball.z = 0;
  s.ball.vz = 0;
  s.ball.spin = 0;
  s.possession = team;
  s.controllerId = taker.id;
  s.lastTouchId = taker.id;
  s.restartTeam = team;
  s.goalKick = false;
  s.throwIn = false;
  s.freeKick = false;
  endFreeKickPhase(s);
  s.penalty = true;
  s.holdTime = 0;
  s.kickCooldown = 0;
  s.tackleCooldown = PEN.deadball + DUEL.cooldown;
  s.deadball = PEN.deadball;
  s.lastPasserId = null;
  s.fromRestart = true;
  s.offsidePend = null;
  s.indirectFK = false;
  s.indirectTakerId = null;
  announce(s, "penalty", team, "P\xCANALTI!", `P\xEAnalti para ${TEAMS[team].name}! ${taker.name} vai cobrar`);
};
var isBackPass = (s, gk) => s.lastPasserId !== null && s.lastPasserId !== gk.id && byId(s, s.lastPasserId).team === gk.team;
var backPassHandle = (s, gk) => {
  const opp = other(gk.team);
  s.controllerId = null;
  s.holdTime = 0;
  addStoppage(s, STOPPAGE.perFoul);
  announce(
    s,
    "foul",
    gk.team,
    "INDIRETO",
    `${gk.name} pega o recuo com a m\xE3o \u2014 tiro livre indireto para ${TEAMS[opp].name}!`
  );
  setupFreeKick(s, opp, { ...s.ball.pos }, true);
};
var gkGrab = (s, gk) => {
  s.controllerId = gk.id;
  s.possession = gk.team;
  s.lastTouchId = gk.id;
  s.lastPasserId = null;
  s.holdTime = 0;
  s.tackleCooldown = GK.protectWindow;
  endFreeKickPhase(s);
};
var spillBall = (s, gk) => {
  const dir = s.attackDir[gk.team];
  const away = defendingGoalX(dir) === 0 ? 1 : -1;
  const side = gk.pos.y >= FIELD.cy ? 1 : -1;
  const scatter = (rand(s) - 0.5) * 1.6;
  const bias = nrm(gk.attrs.handling) * GK.spillWide * (Math.PI / 2) * side;
  const ang = scatter * (1 - nrm(gk.attrs.handling) * GK.spillWide) + bias;
  s.ball.pos = { ...gk.pos };
  s.ball.vel = vec(Math.cos(ang) * away * GK.spillSpeed, Math.sin(ang) * GK.spillSpeed);
  s.ball.spin = 0;
  s.ball.z = 0;
  s.ball.vz = 0;
  s.controllerId = null;
  s.possession = null;
  s.lastTouchId = gk.id;
  s.lastPasserId = null;
  s.holdTime = 0;
  s.kickCooldown = GK.spillCooldown;
  s.stats[gk.team].rebounds++;
  endFreeKickPhase(s);
};
var ballCrossY = (s, gx) => {
  const b = s.ball;
  if (Math.abs(b.vel.x) < 1e-3) return b.pos.y;
  const t = (gx - b.pos.x) / b.vel.x;
  return t > 0 ? b.pos.y + b.vel.y * t : b.pos.y;
};
var saveProbability = (s, gk, speed) => {
  const a = gk.attrs;
  const gx = defendingGoalX(s.attackDir[gk.team]);
  const goalC = vec(gx, FIELD.cy);
  let p = GK.saveBase + gkSaveBase(a) * GK.saveSkill;
  p -= Math.max(0, speed - GK.saveSpeedFree) * GK.saveSpeedPen;
  const ny = ballCrossY(s, gx);
  const corner = clamp2(Math.abs(ny - FIELD.cy) / (GOAL.width / 2), 0, 1.4);
  p -= corner * GK.saveAnglePen;
  const align = 1 - clamp2(Math.abs(gk.pos.y - ny) / GK.alignBand, 0, 1);
  p += align * GK.savePosBonus;
  if (s.lastShooterId !== null) {
    const near = clamp2((GK.closeShot - dist(byId(s, s.lastShooterId).pos, goalC)) / GK.closeShot, 0, 1);
    p -= near * GK.saveClosePen;
    p += near * nrm(a.oneOnOne) * GK.oneOnOneBonus;
  }
  p -= (1 - gk.energy) * GK.saveFatiguePen;
  p += nrm(a.communication) * GK.commandSave;
  if (s.fkShotTimer > 0) p += FREEKICK.gkSetBonus;
  return clamp2(p, GK.saveFloor, GK.saveCap);
};
var offsideLineFwd2 = (s, attackTeam, fwd) => {
  let max = -Infinity;
  for (const o of s.players) {
    if (o.team === attackTeam || o.role === "GK") continue;
    const f = o.pos.x * fwd;
    if (f > max) max = f;
  }
  return max === -Infinity ? FIELD.w : max;
};
var markOffside = (s, passer) => {
  const t = passer.team;
  const fwd = s.attackDir[t];
  const line = offsideLineFwd2(s, t, fwd) + OFFSIDE.margin;
  const ballFwd = s.ball.pos.x * fwd;
  const ids = [];
  for (const p of s.players) {
    if (p.team !== t || p.role === "GK" || p.id === passer.id) continue;
    const pf = p.pos.x * fwd;
    if (pf > line && pf > ballFwd && pf > FIELD.cx) ids.push(p.id);
  }
  s.offsidePend = ids.length ? { team: t, ids } : null;
};
var callOffside = (s, offender) => {
  s.offsidePend = null;
  s.controllerId = null;
  s.holdTime = 0;
  addStoppage(s, STOPPAGE.perFoul);
  announce(
    s,
    "foul",
    offender.team,
    "IMPEDIMENTO",
    `Impedimento de ${offender.name}!`
  );
  setupFreeKick(s, other(offender.team), { ...offender.pos }, true);
};
var tryGainLoose = (s) => {
  if (s.controllerId !== null || s.kickCooldown > 0 || s.deadball > 0) return;
  const cand = ballCandidate(s);
  if (!cand) return;
  if (s.offsidePend) {
    if (s.offsidePend.team === cand.team && s.offsidePend.ids.includes(cand.id))
      return callOffside(s, cand);
    s.offsidePend = null;
  }
  if (cand.role === "GK") {
    if (!inPenaltyArea(s.ball.pos, defendingGoalX(s.attackDir[cand.team])))
      return controlLoose(s, cand);
    const a = cand.attrs;
    const speed = len(s.ball.vel);
    const gx = defendingGoalX(s.attackDir[cand.team]);
    const airborne = s.ball.z > AIR.groundBand;
    const onTarget = Math.abs(ballCrossY(s, gx) - FIELD.cy) < GOAL.width / 2;
    if (airborne && !onTarget) {
      const claim = clamp2(
        GK.claimBase + nrm(a.aerialReach) * GK.claimSkill - speed * GK.claimSpeedPen,
        GK.claimFloor,
        GK.claimCap
      );
      if (rand(s) < claim) {
        addEvent(s, "save", cand.team, `${cand.name} sai e abafa o cruzamento!`);
        return rand(s) < gkHoldChance(a, speed) ? gkGrab(s, cand) : spillBall(s, cand);
      }
      const drop = (1 - nrm(a.aerialReach)) * GK.fumbleScale * GK.aerialDropScale;
      if (rand(s) < drop) return spillBall(s, cand);
      s.kickCooldown = 0.3;
      return;
    }
    if (!airborne && speed <= GK.controlSpeed) {
      if (isBackPass(s, cand)) {
        const pressed = nearestOpponentToPoint(s, cand.team, cand.pos, AI.pressureDist) !== null;
        const panic = GK.backPassPanic * (1 - nrm(a.composure)) * (pressed ? GK.backPassPanicPress : 1);
        if (rand(s) < panic) return backPassHandle(s, cand);
        return controlLoose(s, cand);
      }
      const fumble = (1 - nrm(a.handling)) * (1 - nrm(a.composure)) * GK.fumbleScale;
      if (rand(s) < fumble) return spillBall(s, cand);
      return gkGrab(s, cand);
    }
    s.stats[other(cand.team)].shotsOnTarget++;
    if (rand(s) < saveProbability(s, cand, speed)) {
      s.stats[cand.team].saves++;
      addEvent(s, "save", cand.team, `Defesa de ${cand.name}!`);
      return rand(s) < gkHoldChance(a, speed) ? gkGrab(s, cand) : spillBall(s, cand);
    }
    if (rand(s) < GK.secondChance * nrm(a.reflexes)) {
      s.stats[cand.team].saves++;
      addEvent(s, "save", cand.team, `${cand.name} espalma no susto!`);
      return spillBall(s, cand);
    }
    s.kickCooldown = 0.3;
    return;
  }
  const dir = s.attackDir[cand.team];
  const pressured = nearestOpponentToPoint(s, cand.team, cand.pos, AI.pressureDist) !== null;
  if (s.ball.z > AIR.groundBand) {
    if (tryHeaderOnGoal(s, cand)) return;
    const inOwnBox = inPenaltyArea(s.ball.pos, defendingGoalX(dir));
    const ownHalf = (cand.pos.x - FIELD.cx) * dir < 0;
    if (inOwnBox || pressured && ownHalf) return clearUpfield(s, cand);
    return controlLoose(s, cand);
  }
  if (inPenaltyArea(s.ball.pos, defendingGoalX(dir)) && pressured)
    return clearUpfield(s, cand);
  controlLoose(s, cand);
};
var clearUpfield = (s, p) => {
  const ownGoalX = defendingGoalX(s.attackDir[p.team]);
  if (inPenaltyArea(p.pos, ownGoalX) && rand(s) < AIR.clearBehindChance * (1 - nrm(p.attrs.composure) * AIR.clearBehindComposure)) {
    const cornerY = p.pos.y < FIELD.cy ? RESTART.cornerInset : FIELD.h - RESTART.cornerInset;
    let d2 = dirTo(p.pos, vec(ownGoalX, cornerY));
    if (len(d2) < 1e-6) d2 = vec(ownGoalX === 0 ? -1 : 1, 0);
    s.ball.pos = { ...p.pos };
    s.ball.vel = scale(d2, AIR.clearSpeedBase);
    s.ball.vz = AIR.clearBehindVz;
    s.ball.spin = 0;
    s.controllerId = null;
    s.possession = p.team;
    s.lastTouchId = p.id;
    s.lastPasserId = null;
    s.holdTime = 0;
    s.kickCooldown = 0.3;
    endFreeKickPhase(s);
    return;
  }
  const goalC = vec(attackingGoalX(s.attackDir[p.team]), FIELD.cy);
  let d = dirTo(p.pos, goalC);
  if (len(d) < 1e-6) d = vec(s.attackDir[p.team], 0);
  const scat = AIR.clearScatter * (1 - aerialPower(p.attrs) * 0.5);
  const ang = (rand(s) - 0.5) * 2 * scat;
  const c = Math.cos(ang);
  const sn = Math.sin(ang);
  d = vec(d.x * c - d.y * sn, d.x * sn + d.y * c);
  s.ball.pos = { ...p.pos };
  s.ball.vel = scale(d, AIR.clearSpeedBase + aerialPower(p.attrs) * AIR.clearSpeedSkill);
  s.ball.vz = AIR.clearVz;
  s.ball.spin = 0;
  s.controllerId = null;
  s.possession = p.team;
  s.lastTouchId = p.id;
  s.lastPasserId = null;
  s.holdTime = 0;
  s.kickCooldown = 0.3;
  endFreeKickPhase(s);
};
var tryHeaderOnGoal = (s, p) => {
  if (p.role === "GK") return false;
  if (s.ball.z <= AIR.groundBand) return false;
  const goalX = attackingGoalX(s.attackDir[p.team]);
  if (!inPenaltyArea(s.ball.pos, goalX)) return false;
  const incoming = -(s.ball.vel.x * (s.ball.pos.x - p.pos.x) + s.ball.vel.y * (s.ball.pos.y - p.pos.y));
  if (incoming <= 0) return false;
  const ah = aerialPower(p.attrs);
  const headChance = clamp2(
    HEAD.base + ah * HEAD.skill + nrm(p.attrs.composure) * HEAD.composure,
    HEAD.floor,
    HEAD.cap
  );
  if (rand(s) >= headChance) return false;
  const goalC = vec(goalX, FIELD.cy);
  let dir = norm(sub(goalC, p.pos));
  if (len(dir) < 1e-6) dir = norm(s.ball.vel);
  const scat = HEAD.scatter * (1 - nrm(p.attrs.heading) * HEAD.scatterAim);
  const ang = (rand(s) - 0.5) * 2 * scat;
  const c = Math.cos(ang);
  const sn = Math.sin(ang);
  dir = vec(dir.x * c - dir.y * sn, dir.x * sn + dir.y * c);
  const headSpeed = HEAD.speedBase + ah * HEAD.speedSkill;
  s.ball.pos = { ...p.pos };
  s.ball.vel = scale(dir, headSpeed);
  s.ball.spin = 0;
  s.controllerId = null;
  s.possession = p.team;
  s.lastTouchId = p.id;
  s.lastShooterId = p.id;
  s.lastShotDist = dist(p.pos, goalC);
  s.lastShotHeader = true;
  s.holdTime = 0;
  s.kickCooldown = 0.3;
  s.stats[p.team].shots++;
  addEvent(s, "shot", p.team, `Cabe\xE7ada de ${p.name}!`);
  return true;
};
var controlLoose = (s, cand) => {
  endFreeKickPhase(s);
  if (rand(s) < miscontrol(cand, len(s.ball.vel))) {
    const away = len(s.ball.vel) > 0.5 ? norm(s.ball.vel) : vec(rand(s) - 0.5, rand(s) - 0.5);
    s.ball.vel = scale(norm(away), CONTROL.squirtSpeed);
    s.lastTouchId = cand.id;
    s.kickCooldown = 0.2;
    return;
  }
  if (s.lastPasserId !== null) {
    const passer = byId(s, s.lastPasserId);
    if (passer.team !== cand.team || passer.id === cand.id) s.lastPasserId = null;
  }
  s.controllerId = cand.id;
  s.possession = cand.team;
  s.lastTouchId = cand.id;
  s.holdTime = 0;
};
var handballOffence = (s, p) => {
  const opp = other(p.team);
  const goalX = defendingGoalX(s.attackDir[p.team]);
  s.controllerId = null;
  s.holdTime = 0;
  if (inPenaltyArea(p.pos, goalX)) {
    addEvent(s, "foul", p.team, `M\xE3o na bola de ${p.name} na \xE1rea!`);
    return penaltyKick(s, opp, goalX);
  }
  addStoppage(s, STOPPAGE.perFoul);
  announce(s, "foul", p.team, "M\xC3O NA BOLA", `M\xE3o na bola de ${p.name} \u2014 tiro livre`);
  setupFreeKick(s, opp, { ...p.pos });
};
var ballPlayerCollisions = (s) => {
  if (s.controllerId !== null) return;
  const b = s.ball;
  if (b.z > AIR.bodyHeight) return;
  const speed = len(b.vel);
  if (speed < COLLIDE.minSpeed) return;
  const rr = PHYS.playerRadius + PHYS.ballRadius;
  for (const p of s.players) {
    if (p.role === "GK" || p.stun > 0) continue;
    if (p.id === s.lastTouchId && dist(p.pos, b.pos) < COLLIDE.grace) continue;
    const off = sub(b.pos, p.pos);
    const d = len(off);
    if (d >= rr || d < 1e-6) continue;
    const nv = scale(off, 1 / d);
    const vn = b.vel.x * nv.x + b.vel.y * nv.y;
    if (vn >= 0) continue;
    const hbLoft = b.z > AIR.groundBand ? HANDBALL.loftMul : 1;
    if (speed >= HANDBALL.minSpeed && rand(s) < HANDBALL.chance * hbLoft) {
      s.lastTouchId = p.id;
      return handballOffence(s, p);
    }
    b.pos = add(p.pos, scale(nv, rr));
    s.lastTouchId = p.id;
    const lofted = b.z > AIR.groundBand || speed > CONTROL.loftSpeed;
    const skill = (lofted ? nrm(p.attrs.heading) * 0.7 + nrm(p.attrs.jumping) * 0.3 : nrm(p.attrs.firstTouch) * 0.6 + nrm(p.attrs.anticipation) * 0.4) + nrm(p.attrs.strength) * COLLIDE.cushionStrength;
    const brave = nrm(p.attrs.bravery) * clamp2((speed - COLLIDE.minSpeed) / COLLIDE.minSpeed, 0, 1) * COLLIDE.cushionBravery;
    if (rand(s) < COLLIDE.cushionBase + skill * COLLIDE.cushionSkill + brave) {
      b.vel = scale(b.vel, COLLIDE.cushionKeep);
      b.spin = 0;
      s.possession = p.team;
    } else {
      b.vel = sub(b.vel, scale(nv, vn * (1 + COLLIDE.restitution)));
      const a = (rand(s) - 0.5) * COLLIDE.scatter;
      const c = Math.cos(a);
      const sn = Math.sin(a);
      b.vel = vec(b.vel.x * c - b.vel.y * sn, b.vel.x * sn + b.vel.y * c);
      b.spin = 0;
    }
    return;
  }
};
var advanceBallFlight = (s, dt) => {
  const airborne = s.ball.z > AIR.groundBand || s.ball.vz !== 0;
  if (airborne) {
    s.ball.vz -= AIR.gravity * dt;
    s.ball.z += s.ball.vz * dt;
    s.ball.pos = add(s.ball.pos, scale(s.ball.vel, dt));
    s.ball.vel = scale(s.ball.vel, Math.pow(AIR.airDamping, dt));
    if (s.ball.z <= 0) {
      s.ball.z = 0;
      s.ball.vz = -s.ball.vz * AIR.bounce;
      if (s.ball.vz < 1.5) s.ball.vz = 0;
      s.ball.vel = scale(s.ball.vel, 0.86);
    }
  } else {
    if (Math.abs(s.ball.spin) > 1e-4) {
      const u = norm(s.ball.vel);
      s.ball.vel = add(s.ball.vel, scale(perp(u), s.ball.spin * dt));
      s.ball.spin *= Math.pow(PHYS.spinDecay, dt);
    }
    s.ball.pos = add(s.ball.pos, scale(s.ball.vel, dt));
    s.ball.vel = scale(s.ball.vel, Math.pow(PHYS.ballDamping, dt));
  }
  s.ball.roll += len(s.ball.vel) * dt;
};
var teamDefending = (s, goalX) => defendingGoalX(s.attackDir.home) === goalX ? "home" : "away";
var scoreOrDisallow = (s, gx) => {
  if (s.indirectFK) {
    addEvent(
      s,
      "goalkick",
      teamDefending(s, gx),
      "Gol anulado: tiro livre indireto n\xE3o vale batido direto"
    );
    return goalKick(s, teamDefending(s, gx), gx);
  }
  return scoreGoal(s, teamDefending(s, gx), gx);
};
var crossbarBounce = (s, gx) => {
  const b = s.ball;
  const into = gx === 0 ? 1 : -1;
  b.pos.x = gx + into * (PHYS.ballRadius + PHYS.postRadius + 0.05);
  b.vel.x = Math.abs(b.vel.x) * into * PHYS.postRestitution;
  b.vz = -Math.abs(b.vz) * PHYS.postRestitution - 2;
  b.z = GOAL.height - 0.05;
  b.spin = 0;
  const who = s.lastShooterId !== null ? byId(s, s.lastShooterId) : null;
  addEvent(s, "shot", who?.team ?? null, who ? `No travess\xE3o! ${who.name} carimba a trave!` : "Na trave!");
};
var resolveBounds = (s) => {
  const b = s.ball;
  if (s.indirectFK && s.lastTouchId !== null && s.lastTouchId !== s.indirectTakerId)
    s.indirectFK = false;
  for (const gx of [0, FIELD.w]) {
    for (const py of [GOAL.top, GOAL.bottom]) {
      const post = vec(gx, py);
      const off = sub(b.pos, post);
      const d = len(off);
      const rr = PHYS.ballRadius + PHYS.postRadius;
      if (d < rr && d > 1e-6) {
        const nv = scale(off, 1 / d);
        const vn = b.vel.x * nv.x + b.vel.y * nv.y;
        if (vn < 0) b.vel = sub(b.vel, scale(nv, vn * (1 + PHYS.postRestitution)));
        b.pos = add(post, scale(nv, rr));
        b.spin = 0;
      }
    }
  }
  const barBand = PHYS.ballRadius + PHYS.postRadius;
  const inMouthY = b.pos.y > GOAL.top && b.pos.y < GOAL.bottom;
  const atGoalLine = (gx) => {
    if (inMouthY) {
      if (b.z < GOAL.height - barBand) return scoreOrDisallow(s, gx);
      if (b.z <= GOAL.height + barBand) return crossbarBounce(s, gx);
    }
    return beginGoalLineOut(s, gx);
  };
  if (b.pos.x <= 0) return atGoalLine(0);
  if (b.pos.x >= FIELD.w) return atGoalLine(FIELD.w);
  if (b.pos.y <= 0 || b.pos.y >= FIELD.h) {
    const lastTeam = s.lastTouchId !== null ? byId(s, s.lastTouchId).team : s.possession;
    const throwTeam = lastTeam ? other(lastTeam) : "home";
    const lineY = b.pos.y <= 0 ? RESTART.throwInInset : FIELD.h - RESTART.throwInInset;
    const exitX = clamp2(b.pos.x, RESTART.cornerInset, FIELD.w - RESTART.cornerInset);
    const exit = vec(exitX, lineY);
    const taker = nearestOfTeamTo(s, throwTeam, exit);
    placeTaker(taker, exit);
    placeDeadBall(s, taker, throwTeam, RESTART.throwInDeadball);
    s.throwIn = true;
    s.stats[throwTeam].throwIns++;
  }
};
var nearestOfTeamTo = (s, t, point) => {
  const ok = (p) => p.team === t && p.role !== "GK" && p.stun <= 0;
  const pool = s.players.filter(ok);
  const arr = pool.length ? pool : s.players.filter((p) => p.team === t && p.role !== "GK");
  return arr.reduce((b, p) => dist(p.pos, point) < dist(b.pos, point) ? p : b);
};
var placeTaker = (p, at) => {
  p.pos = { ...at };
  p.vel = vec(0, 0);
  p.prevPos = { ...p.pos };
  p.smTarget = { ...p.pos };
  p.settled = false;
};
var leadProtect = (s, team) => {
  const diff = s.score[team] - s.score[other(team)];
  if (diff <= 0) return 0;
  const prog = clamp2(s.time / (2 * MATCH.halfSeconds), 0, 1);
  const late = clamp2((prog - GAMESTATE.lateStart) / (1 - GAMESTATE.lateStart), 0, 1);
  return clamp2(diff / GAMESTATE.diffCap, 0, 1) * late;
};
var placeDeadBall = (s, taker, team, deadball) => {
  const wasteExtra = deadball * leadProtect(s, team) * GAMESTATE.timeWaste;
  deadball += wasteExtra;
  if (wasteExtra > 0) addStoppage(s, wasteExtra * MATCH.clockRate);
  s.ball.pos = { ...taker.pos };
  s.ball.prevPos = { ...s.ball.pos };
  s.ball.prevZ = 0;
  s.ball.vel = vec(0, 0);
  s.ball.z = 0;
  s.ball.vz = 0;
  s.ball.spin = 0;
  s.possession = team;
  s.restartTeam = team;
  s.goalKick = false;
  s.throwIn = false;
  s.freeKick = false;
  s.corner = false;
  endFreeKickPhase(s);
  s.penalty = false;
  s.controllerId = taker.id;
  s.lastTouchId = taker.id;
  s.holdTime = 0;
  s.kickCooldown = 0;
  s.tackleCooldown = deadball + DUEL.cooldown;
  s.deadball = deadball;
  s.outOfPlay = 0;
  s.pendingGoalLineX = null;
  s.goalKickWait = 0;
  s.fromRestart = true;
  s.offsidePend = null;
  s.indirectFK = false;
  s.indirectTakerId = null;
};
var penaltyAreaClear = (s, gx, takerId) => !s.players.some((p) => p.id !== takerId && inPenaltyArea(p.pos, gx));
var beginGoalLineOut = (s, gx) => {
  s.outOfPlay = RESTART.goalLineOutDelay;
  s.pendingGoalLineX = gx;
  s.controllerId = null;
  s.holdTime = 0;
};
var restartGoalLine = (s, gx) => {
  const defender = teamDefending(s, gx);
  const attacker = other(defender);
  const lastTeam = s.lastTouchId !== null ? byId(s, s.lastTouchId).team : s.possession;
  return lastTeam === defender ? cornerKick(s, attacker, gx) : goalKick(s, defender, gx);
};
var goalKick = (s, team, gx) => {
  const gk = teamGk2(s, team);
  const into = gx === 0 ? 1 : -1;
  const side = s.ball.pos.y < FIELD.cy ? -1 : 1;
  placeTaker(
    gk,
    vec(
      gx + into * RESTART.goalAreaOut,
      clamp2(FIELD.cy + side * RESTART.goalAreaSide, 2, FIELD.h - 2)
    )
  );
  placeDeadBall(s, gk, team, RESTART.goalKickDeadball);
  s.goalKick = true;
  s.stats[team].goalKicks++;
};
var cornerKick = (s, team, gx) => {
  const into = gx === 0 ? 1 : -1;
  const cornerY = s.ball.pos.y < FIELD.cy ? RESTART.cornerInset : FIELD.h - RESTART.cornerInset;
  const corner = vec(gx + into * RESTART.cornerInset, cornerY);
  const taker = nearestOfTeamTo(s, team, corner);
  placeTaker(taker, corner);
  placeDeadBall(s, taker, team, RESTART.cornerDeadball);
  s.corner = true;
  s.stats[team].corners++;
  announce(s, "corner", team, "ESCANTEIO", `Escanteio para ${TEAMS[team].name}`);
};
var dropBall = (s) => {
  const team = s.possession ?? (s.lastTouchId !== null ? byId(s, s.lastTouchId).team : "home");
  const spot = { ...s.ball.pos };
  const taker = nearestOfTeamTo(s, team, spot);
  placeTaker(taker, spot);
  placeDeadBall(s, taker, team, INJURY.dropDeadball);
  announce(
    s,
    "foul",
    null,
    "BOLA AO CH\xC3O",
    `Jogo parado por les\xE3o \u2014 bola ao ch\xE3o para ${TEAMS[team].name}`
  );
};
var goalMilestone = (goals) => goals === 2 ? "DOBLETE!" : goals === 3 ? "HAT-TRICK!" : goals >= 4 ? `${goals} GOLS!` : null;
var goalContext = (scorer, diff) => {
  if (diff === 0) return "EMPATE!";
  if (diff === 1) return `${TEAMS[scorer].name.toUpperCase()} NA FRENTE!`;
  if (diff > 1) return "AMPLIA O PLACAR!";
  return "DIMINUI!";
};
var scoreGoal = (s, conceded, goalX) => {
  const scorer = other(conceded);
  const diffBefore = s.score[scorer] - s.score[conceded];
  s.score[scorer]++;
  s.penalty = false;
  addStoppage(s, STOPPAGE.perGoal);
  const shooter = s.lastShooterId !== null ? byId(s, s.lastShooterId) : null;
  const author = shooter && shooter.team === scorer ? shooter : null;
  if (author) author.goals++;
  const passer = s.lastPasserId !== null ? byId(s, s.lastPasserId) : null;
  const assist = passer && passer.team === scorer && (!author || passer.id !== author.id) ? passer : null;
  const golaco = author !== null && s.lastShotDist >= CELEBRATION.golacoDist;
  const milestone = author ? goalMilestone(author.goals) : null;
  const context = goalContext(scorer, diffBefore + 1);
  const who = author ? ` ${author.name}!` : "!";
  const label = golaco ? "GOLA\xC7O" : "GOL";
  const assistTxt = assist ? ` (assist. ${assist.name})` : "";
  addEvent(s, "goal", scorer, `\u26BD ${label} ${TEAMS[scorer].of}!${who}${assistTxt}`);
  const into = goalX === 0 ? -1 : 1;
  s.ball.pos = vec(
    goalX + into * GOAL.depth * 0.55,
    clamp2(s.ball.pos.y, GOAL.top + 0.4, GOAL.bottom - 0.4)
  );
  s.ball.vel = vec(0, 0);
  s.ball.z = 0;
  s.ball.vz = 0;
  s.ball.prevPos = { ...s.ball.pos };
  s.ball.prevZ = 0;
  s.ball.spin = 0;
  s.controllerId = null;
  s.possession = null;
  s.lastPasserId = null;
  endFreeKickPhase(s);
  const side = s.ball.pos.y < FIELD.cy ? CELEBRATION.spotSide : FIELD.h - CELEBRATION.spotSide;
  const spotX = goalX === 0 ? CELEBRATION.spotInset : FIELD.w - CELEBRATION.spotInset;
  s.celebration = {
    team: scorer,
    scorerId: author ? author.id : null,
    scorerName: author ? author.name : null,
    scorerNumber: author ? author.number : null,
    scorerGoals: author ? author.goals : 0,
    assistName: assist ? assist.name : null,
    golaco,
    milestone,
    context,
    homeScore: s.score.home,
    awayScore: s.score.away,
    minute: minute(s),
    goalX,
    spot: vec(spotX, side),
    t: 0
  };
};
var stepCelebration = (s, dtReal) => {
  const c = s.celebration;
  if (!c) return;
  for (const p of s.players) p.prevPos = { ...p.pos };
  s.ball.prevPos = { ...s.ball.pos };
  s.ball.prevZ = s.ball.z;
  c.t += dtReal;
  for (const p of s.players) {
    p.ctrlAmt = lerp(p.ctrlAmt, 0, clamp2(MOVE.ctrlEase * dtReal, 0, 1));
    if (p.stun > 0) p.stun = Math.max(0, p.stun - dtReal);
    p.downAmt = lerp(p.downAmt, p.stun > 0 ? 1 : 0, clamp2(MOVE.downEase * dtReal, 0, 1));
    if (p.role === "GK") {
      p.vel = scale(p.vel, Math.pow(0.05, dtReal));
      p.pos = add(p.pos, scale(p.vel, dtReal));
      clampPos(p);
      continue;
    }
    if (p.team === c.team) {
      let target = c.spot;
      if (p.id !== c.scorerId) {
        const ang = p.id * 2.39996;
        target = add(c.spot, vec(Math.cos(ang) * CELEBRATION.huddle, Math.sin(ang) * CELEBRATION.huddle));
      }
      steer(p, target, dtReal, CELEBRATION.runSpeed, 0.5);
    } else {
      steer(p, homePos(p, s.attackDir[p.team]), dtReal, CELEBRATION.runSpeed * 0.4, 1);
    }
  }
  separate(s);
  if (c.t >= CELEBRATION.duration) {
    s.celebration = null;
    kickoff(s, other(c.team));
  }
};
var atNaturalBreak = (s) => s.deadball <= 0 && s.outOfPlay <= 0 && s.fkShotTimer <= 0 && s.ball.z <= AIR.groundBand && Math.abs(s.ball.pos.x - FIELD.cx) <= WHISTLE.neutralHalfWidth;
var timeUp = (s, target) => s.time >= target && (atNaturalBreak(s) || s.time >= target + WHISTLE.maxExtraWait);
var switchSides = (s) => {
  s.half = 2;
  s.attackDir.home = s.attackDir.home * -1;
  s.attackDir.away = s.attackDir.away * -1;
  s.stoppage = 0;
  addEvent(s, "kickoff", other(s.firstKickoff), "Come\xE7a o 2\xBA tempo!");
  kickoff(s, other(s.firstKickoff));
  announce(s, "half", null, "INTERVALO", "Come\xE7a o 2\xBA tempo \u2014 os times trocam de lado");
};
var step = (s, dt) => {
  if (s.status === "over" || s.celebration) return;
  for (const p of s.players) p.prevPos = { ...p.pos };
  s.ball.prevPos = { ...s.ball.pos };
  s.ball.prevZ = s.ball.z;
  s.time += dt * MATCH.clockRate;
  if (s.half === 1 && timeUp(s, MATCH.halfSeconds + s.stoppage)) {
    switchSides(s);
    return;
  }
  if (s.half === 2 && timeUp(s, 2 * MATCH.halfSeconds + s.stoppage)) {
    s.status = "over";
    const r = `${s.score.home} x ${s.score.away}`;
    addEvent(s, "fulltime", null, `\u{1F3C1} Fim de jogo \u2014 Brasil ${r} Argentina`);
    return;
  }
  const sec = dt * MATCH.clockRate;
  let stopForInjury = false;
  for (const p of s.players) {
    const speed = len(p.vel);
    const sta = nrm(p.attrs.stamina);
    if (speed > STAMINA.jogSpeed) {
      const intensity = clamp2((speed - STAMINA.jogSpeed) / STAMINA.sprintBand, 0, 1);
      p.energy -= sec * STAMINA.sprintDrain * intensity * (STAMINA.drainBase - sta * STAMINA.drainStamina);
    } else {
      const depletion = 1 - (1 - p.energy) * STAMINA.recoverFade * (1 - nrm(p.attrs.naturalFitness));
      p.energy += sec * STAMINA.recover * recoverMul(p.attrs) * depletion;
    }
    p.energy = clamp2(p.energy, STAMINA.floor, 1);
    if (p.stun > 0) p.stun = Math.max(0, p.stun - dt);
    if (p.burst > 0) p.burst = Math.max(0, p.burst - dt);
    if (p.knock > 0) p.knock = Math.max(0, p.knock - sec * INJURY.recoverRate);
    if (s.deadball <= 0 && p.role !== "GK" && p.stun <= 0 && p.knock < INJURY.maxImpair && speed > STAMINA.jogSpeed && rand(s) < INJURY.strainRate * (1 + (1 - p.energy) * INJURY.strainFatigue) * sec) {
      const serious = rand(s) < INJURY.strainSeriousFrac;
      p.knock = Math.min(INJURY.maxImpair, p.knock + (serious ? INJURY.seriousImpair : INJURY.minorImpair));
      p.stun += serious ? INJURY.downExtra * 2 : INJURY.downExtra;
      addStoppage(s, STOPPAGE.perFoul);
      addEvent(
        s,
        "foul",
        p.team,
        serious ? `\u{1F691} ${p.name} cai sozinho \u2014 parece muscular!` : `${p.name} sente um estir\xE3o e segue`
      );
      if (serious && s.controllerId !== null) stopForInjury = true;
    }
    p.ctrlAmt = lerp(p.ctrlAmt, s.controllerId === p.id ? 1 : 0, clamp2(MOVE.ctrlEase * dt, 0, 1));
    p.downAmt = lerp(p.downAmt, p.stun > 0 ? 1 : 0, clamp2(MOVE.downEase * dt, 0, 1));
  }
  if (stopForInjury) dropBall(s);
  s.kickCooldown = Math.max(0, s.kickCooldown - dt);
  s.tackleCooldown = Math.max(0, s.tackleCooldown - dt);
  s.fkShotTimer = Math.max(0, s.fkShotTimer - dt);
  if (s.deadball > 0) {
    s.deadball -= dt;
    if (s.deadball <= 0) s.penalty = false;
    if (s.goalKick && s.deadball <= 0 && s.restartTeam) {
      s.goalKickWait += dt;
      const gx = defendingGoalX(s.attackDir[s.restartTeam]);
      if (s.goalKickWait < RESTART.goalKickMaxWait && !penaltyAreaClear(s, gx, s.controllerId))
        s.deadball = dt;
    }
    for (const p of s.players) {
      if (p.id === s.controllerId) continue;
      advancePlayer(s, p, dt);
    }
    if (s.controllerId !== null) {
      const taker = byId(s, s.controllerId);
      s.ball.pos = { ...taker.pos };
      s.ball.prevPos = { ...s.ball.pos };
      s.ball.vel = vec(0, 0);
    } else {
      s.ball.vel = vec(0, 0);
    }
    s.ball.spin = 0;
    s.ball.z = 0;
    s.ball.vz = 0;
    return;
  }
  if (s.outOfPlay > 0) {
    s.outOfPlay -= dt;
    for (const p of s.players) advancePlayer(s, p, dt);
    separate(s);
    advanceBallFlight(s, dt);
    const m = RESTART.goalLineOutMargin;
    if (s.ball.pos.x < -m || s.ball.pos.x > FIELD.w + m) s.ball.vel.x = 0;
    if (s.ball.pos.y < -m || s.ball.pos.y > FIELD.h + m) s.ball.vel.y = 0;
    s.ball.pos.x = clamp2(s.ball.pos.x, -m, FIELD.w + m);
    s.ball.pos.y = clamp2(s.ball.pos.y, -m, FIELD.h + m);
    if (s.outOfPlay <= 0) {
      restartGoalLine(s, s.pendingGoalLineX ?? 0);
      s.pendingGoalLineX = null;
    }
    return;
  }
  if (s.possession) s.stats[s.possession].possessionTicks++;
  tryTackle(s);
  tryGainLoose(s);
  let dribbleDir = null;
  if (s.controllerId !== null && s.deadball <= 0) {
    const carrier = byId(s, s.controllerId);
    s.holdTime += dt;
    const action = decideAction(s, carrier);
    if (action.type === "dribble") {
      const goal = vec(attackingGoalX(s.attackDir[carrier.team]), FIELD.cy);
      let dd = dirTo(carrier.pos, goal);
      const foe = nearestOpponentToPoint(s, carrier.team, carrier.pos, DRIBBLE.avoidRange);
      if (foe) {
        const away = dirTo(foe.pos, carrier.pos);
        const close = clamp2(
          (DRIBBLE.avoidRange - dist(foe.pos, carrier.pos)) / DRIBBLE.avoidRange,
          0,
          1
        );
        dd = norm(add(dd, scale(away, close * DRIBBLE.avoidWeight)));
      }
      dribbleDir = dd;
    } else {
      const dir = dirTo(carrier.pos, action.target);
      const carry = Math.max(0, carrier.vel.x * dir.x + carrier.vel.y * dir.y);
      s.ball.vel = scale(dir, action.speed + carry * PHYS.releaseCarry);
      s.ball.z = 0;
      s.ball.vz = action.loft ?? 0;
      const spinMax = (action.type === "shoot" ? PHYS.maxSpin : PHYS.maxSpin * PHYS.passSpinScale) * flairSpin(carrier.attrs);
      if (action.type === "shoot") {
        const pp = perp(dir);
        const toCorner = (action.target.y - s.ball.pos.y) * pp.y + (action.target.x - s.ball.pos.x) * pp.x;
        const aimSign = toCorner >= 0 ? 1 : -1;
        const bias = SHOT.spinAimBias * nrm(carrier.attrs.composure);
        s.ball.spin = ((1 - bias) * (rand(s) - 0.5) * 2 + bias * aimSign) * spinMax;
      } else {
        s.ball.spin = (rand(s) - 0.5) * 2 * spinMax;
      }
      s.lastTouchId = carrier.id;
      if (action.type === "shoot") {
        s.stats[carrier.team].shots++;
        s.lastShooterId = carrier.id;
        s.lastShotHeader = false;
        if (s.freeKick) s.fkShotTimer = FREEKICK.shotWindow;
        s.lastShotDist = dist(carrier.pos, vec(attackingGoalX(s.attackDir[carrier.team]), FIELD.cy));
        if (!action.loft) {
          const compose = nrm(carrier.attrs.finishing) * 0.5 + nrm(carrier.attrs.composure) * 0.5;
          const pressuredShot = nearestOpponentToPoint(s, carrier.team, carrier.pos, AI.pressureDist) !== null;
          const skyP = SHOT.skyBase * (1 - compose) * (pressuredShot ? SHOT.skyPress : 1);
          if (rand(s) < skyP) s.ball.vz = SHOT.skyVzBase + rand(s) * SHOT.skyVzVar;
        }
        addEvent(s, "shot", carrier.team, `Chute de ${carrier.name}!`);
      } else {
        s.lastPasserId = carrier.id;
        if (!s.fromRestart) markOffside(s, carrier);
      }
      s.controllerId = null;
      s.fromRestart = false;
      s.goalKick = false;
      s.throwIn = false;
      s.freeKick = false;
      s.corner = false;
      s.holdTime = 0;
      s.kickCooldown = 0.3;
    }
  }
  for (const p of s.players) {
    if (s.controllerId === p.id && dribbleDir && p.role !== "GK") {
      const burstMul = p.burst > 0 ? DUEL.beatBurst : 1;
      steer(p, add(p.pos, scale(dribbleDir, 6)), dt, maxSpeed(p) * dribbleSpeedMul(p.attrs) * burstMul, 0.3);
    } else {
      advancePlayer(s, p, dt);
    }
  }
  separate(s);
  if (s.controllerId !== null) {
    const carrier = byId(s, s.controllerId);
    const facing = dribbleDir ?? (len(carrier.vel) > 0.1 ? norm(carrier.vel) : dirTo(carrier.pos, vec(attackingGoalX(s.attackDir[carrier.team]), FIELD.cy)));
    const off = PHYS.playerRadius + PHYS.ballRadius + PHYS.dribblePush;
    const target = add(carrier.pos, scale(facing, off));
    s.ball.pos = lerpV(s.ball.pos, target, clamp2(PHYS.footLerp * dt, 0, 1));
    s.ball.vel = { ...carrier.vel };
    s.ball.spin = 0;
    s.ball.z = 0;
    s.ball.vz = 0;
    s.ball.roll += len(carrier.vel) * dt;
  } else {
    advanceBallFlight(s, dt);
    ballPlayerCollisions(s);
    resolveBounds(s);
  }
};

// src/game/experiments/attributeExperiment.ts
var ATTR_KEYS = [
  "pace",
  "acceleration",
  "agility",
  "balance",
  "jumping",
  "strength",
  "stamina",
  "naturalFitness",
  "workRate",
  "dribbling",
  "firstTouch",
  "technique",
  "passing",
  "crossing",
  "finishing",
  "longShots",
  "heading",
  "tackling",
  "marking",
  "vision",
  "anticipation",
  "positioning",
  "offTheBall",
  "decisions",
  "composure",
  "concentration",
  "consistency",
  "aggression",
  "bravery",
  "teamwork",
  "flair",
  "goalkeeping",
  "reflexes",
  "handling",
  "aerialReach",
  "oneOnOne",
  "kicking",
  "throwing",
  "communication"
];
var flatAttrs = (value) => {
  const a = {};
  for (const k of ATTR_KEYS) a[k] = value;
  return a;
};
var buildTeam2 = (attr2, value) => ROLES_433.map((role, i) => ({
  number: i + 1,
  name: `#${i + 1}`,
  role,
  attrs: { ...flatAttrs(50), [attr2]: value },
  formationPos: { ...FORMATION_433[i] }
}));
var MAX_STEPS = 4e5;
var simulateOne = (attr2, seed, testSide) => {
  const testTeam = buildTeam2(attr2, 100);
  const controlTeam = buildTeam2(attr2, 50);
  const home = testSide === "home" ? testTeam : controlTeam;
  const away = testSide === "home" ? controlTeam : testTeam;
  const match = createMatch({ home, away });
  match.rngState = seedRng(seed);
  let guard = 0;
  while (match.status !== "over" && guard++ < MAX_STEPS) {
    if (match.celebration) stepCelebration(match, PHYS.dt);
    else step(match, PHYS.dt);
  }
  if (match.status !== "over") throw new Error(`partida n\xE3o terminou em ${MAX_STEPS} passos (seed ${seed})`);
  const testStats = testSide === "home" ? match.stats.home : match.stats.away;
  const controlStats = testSide === "home" ? match.stats.away : match.stats.home;
  const testGoals2 = testSide === "home" ? match.score.home : match.score.away;
  const controlGoals2 = testSide === "home" ? match.score.away : match.score.home;
  return {
    testGoals: testGoals2,
    controlGoals: controlGoals2,
    testShots: testStats.shots,
    controlShots: controlStats.shots,
    testShotsOnTarget: testStats.shotsOnTarget,
    controlShotsOnTarget: controlStats.shotsOnTarget,
    testPossessionTicks: testStats.possessionTicks,
    controlPossessionTicks: controlStats.possessionTicks,
    testFouls: testStats.fouls,
    controlFouls: controlStats.fouls
  };
};
var runExperiment = (attr2, trials2, baseSeed2) => {
  const results2 = [];
  for (let i = 0; i < trials2; i++) {
    const seed = baseSeed2 + i * 104729;
    const testSide = i % 2 === 0 ? "home" : "away";
    results2.push(simulateOne(attr2, seed, testSide));
  }
  return results2;
};

// tools/attribute-experiment-entry.ts
var attr = process.argv[2] ?? "pace";
var trials = Number(process.argv[3] ?? 1e3);
var baseSeed = Number(process.argv[4] ?? 20260701);
var mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
var std = (xs) => {
  const m = mean(xs);
  return Math.sqrt(xs.reduce((a, b) => a + (b - m) ** 2, 0) / (xs.length - 1));
};
var erf = (x) => {
  const sign2 = x < 0 ? -1 : 1;
  const a1 = 0.254829592, a2 = -0.284496736, a3 = 1.421413741, a4 = -1.453152027, a5 = 1.061405429, p = 0.3275911;
  const t = 1 / (1 + p * Math.abs(x));
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign2 * y;
};
var pValueTwoTailed = (t) => {
  const z = Math.abs(t);
  return 1 - erf(z / Math.sqrt(2));
};
var t0 = Date.now();
var results = runExperiment(attr, trials, baseSeed);
var ms = Date.now() - t0;
var testGoals = results.map((r) => r.testGoals);
var controlGoals = results.map((r) => r.controlGoals);
var diffGoals = results.map((r) => r.testGoals - r.controlGoals);
var testShots = results.map((r) => r.testShots);
var controlShots = results.map((r) => r.controlShots);
var testSOT = results.map((r) => r.testShotsOnTarget);
var controlSOT = results.map((r) => r.controlShotsOnTarget);
var testPoss = results.map((r) => r.testPossessionTicks);
var controlPoss = results.map((r) => r.controlPossessionTicks);
var testFouls = results.map((r) => r.testFouls);
var controlFouls = results.map((r) => r.controlFouls);
var wins = results.filter((r) => r.testGoals > r.controlGoals).length;
var draws = results.filter((r) => r.testGoals === r.controlGoals).length;
var losses = results.filter((r) => r.testGoals < r.controlGoals).length;
var dMean = mean(diffGoals);
var dStd = std(diffGoals);
var tStat = dMean / (dStd / Math.sqrt(trials));
var pValue = pValueTwoTailed(tStat);
var fmt = (n, d = 3) => n.toFixed(d);
var report = `# Experimento de isolamento de atributo \u2014 \`${attr}\`

Metodologia: ${trials} partidas completas (11x11, motor f\xEDsico real) simuladas.
Todos os atributos de todos os jogadores come\xE7am em 50. Em cada partida, o time
"teste" tem **${attr} = 100** para os 11 jogadores; o time "controle" mant\xE9m
**tudo em 50** (inclusive ${attr}). O lado (mandante/visitante) do time teste
alterna a cada partida para cancelar o vi\xE9s estrutural do pontap\xE9 inicial.
Seed manual determin\xEDstica (${baseSeed} + i\xB7104729) \u2014 reproduz\xEDvel.

Tempo total: ${(ms / 1e3).toFixed(1)}s (${(ms / trials).toFixed(0)}ms/partida).

## Gols

| | Teste (${attr}=100) | Controle (${attr}=50) |
|---|---|---|
| M\xE9dia de gols/partida | ${fmt(mean(testGoals))} | ${fmt(mean(controlGoals))} |
| Desvio padr\xE3o | ${fmt(std(testGoals))} | ${fmt(std(controlGoals))} |
| Total de gols (${trials} partidas) | ${testGoals.reduce((a, b) => a + b, 0)} | ${controlGoals.reduce((a, b) => a + b, 0)} |

**Diferen\xE7a m\xE9dia (teste \u2212 controle): ${fmt(dMean)} gols/partida** (desvio padr\xE3o da diferen\xE7a: ${fmt(dStd)})

**Teste t pareado:** t = ${fmt(tStat, 2)}, p ${pValue < 1e-4 ? "< 0.0001" : `= ${fmt(pValue, 4)}`}
${Math.abs(tStat) > 1.96 ? "\u2192 Estatisticamente significativo (95%)." : "\u2192 N\xC3O estatisticamente significativo (95%)."}

## Resultado das partidas (do ponto de vista do time TESTE)

| Vit\xF3rias | Empates | Derrotas |
|---|---|---|
| ${wins} (${fmt(wins / trials * 100, 1)}%) | ${draws} (${fmt(draws / trials * 100, 1)}%) | ${losses} (${fmt(losses / trials * 100, 1)}%) |

## Estat\xEDsticas complementares (m\xE9dias por partida)

| M\xE9trica | Teste | Controle |
|---|---|---|
| Finaliza\xE7\xF5es | ${fmt(mean(testShots))} | ${fmt(mean(controlShots))} |
| Finaliza\xE7\xF5es no alvo | ${fmt(mean(testSOT))} | ${fmt(mean(controlSOT))} |
| Ticks de posse | ${fmt(mean(testPoss), 0)} | ${fmt(mean(controlPoss), 0)} |
| Faltas cometidas (placebo \u2014 n\xE3o deveria variar com ${attr}) | ${fmt(mean(testFouls))} | ${fmt(mean(controlFouls))} |

## Conclus\xE3o

${Math.abs(tStat) <= 1.96 ? `O atributo **${attr}** n\xE3o mostrou impacto estatisticamente significativo nos gols em ${trials} partidas isoladas.` : dMean > 0 ? `O atributo **${attr}** teve impacto **positivo** e estatisticamente significativo: o time com ${attr}=100 marcou em m\xE9dia ${fmt(dMean)} gols/partida a mais que o controle (tudo 50).` : `O atributo **${attr}** teve impacto **negativo** e estatisticamente significativo: o time com ${attr}=100 marcou em m\xE9dia ${fmt(Math.abs(dMean))} gols/partida a MENOS que o controle \u2014 investigar poss\xEDvel bug na f\xF3rmula/consumo deste atributo.`}
`;
var outPath = `reports/experimento-${String(attr)}.md`;
writeFileSync(outPath, report, "utf-8");
var jsonOut = {
  attr: String(attr),
  trials,
  baseSeed,
  ms,
  testGoalsMean: mean(testGoals),
  controlGoalsMean: mean(controlGoals),
  testGoalsStd: std(testGoals),
  controlGoalsStd: std(controlGoals),
  diffMean: dMean,
  diffStd: dStd,
  tStat,
  pValue,
  significant: Math.abs(tStat) > 1.96,
  wins,
  draws,
  losses,
  testShotsMean: mean(testShots),
  controlShotsMean: mean(controlShots),
  testSOTMean: mean(testSOT),
  controlSOTMean: mean(controlSOT),
  testPossMean: mean(testPoss),
  controlPossMean: mean(controlPoss),
  testFoulsMean: mean(testFouls),
  controlFoulsMean: mean(controlFouls)
};
writeFileSync(`reports/json/${String(attr)}.json`, JSON.stringify(jsonOut, null, 2), "utf-8");
console.log(report);
console.log(`
Relat\xF3rio salvo em ${outPath}`);
