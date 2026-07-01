/** Dimensões oficiais de um campo de futebol, em metros. */
export const FIELD = {
  w: 105,
  h: 68,
  cx: 105 / 2,
  cy: 68 / 2,
}

/** Gol: largura oficial 7.32m, centrado no eixo Y. */
export const GOAL = {
  width: 7.32,
  depth: 2.2,
  /** altura oficial do travessão (m) — bola acima disso passa POR CIMA do gol */
  height: 2.44,
  get top() {
    return FIELD.cy - GOAL.width / 2
  },
  get bottom() {
    return FIELD.cy + GOAL.width / 2
  },
}

/**
 * BOLA AÉREA (eixo Z, altura). A bola pode subir (lançamentos, tiro de meta,
 * cruzamentos, escanteios e afastamentos "de qualquer maneira") e só pode ser
 * tocada por quem a alcança NA SUA ALTURA: bola alta passa por cima dos botões.
 * Tudo em metros / m/s / m/s². No ar quase não há atrito (a bola mantém o ímpeto
 * horizontal e cruza o campo); ao pousar, volta a rolar e a perder velocidade.
 */
export const AIR = {
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
  reachHeight: 3.0,
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
  /** pico (m) do arco do TIRO DE META / chutão longo do goleiro */
  goalKickPeak: 6.5,
  /** pico (m) do arco do lançamento longo de alívio (sem alvo claro) */
  longBallPeak: 4.5,
  /** velocidade horizontal mín/máx de uma bola lançada com arco (m/s) */
  arcSpeedMin: 9,
  arcSpeedMax: 26,
  // --- render do voo (vista de cima) ---
  /** quantos px de "subida" na tela por metro de altura (× escala) */
  renderLift: 1.15,
}

/**
 * Áreas marcadas (m), medidas a partir da linha de fundo e centradas no eixo Y.
 * Usadas nas regras de bola parada — sobretudo o tiro de meta (Lei 16): a bola
 * é posta na PEQUENA área e o adversário aguarda FORA da GRANDE área até a bola
 * entrar em jogo.
 */
/**
 * Faixa de anúncio do lance (banner). FONTE ÚNICA de duração, compartilhada
 * entre o motor (que congela a jogada nas transições de fase) e a UI (que exibe
 * a faixa pelo mesmo tempo). Em ms — o motor converte para segundos.
 */
export const BANNER = {
  /** faixa CENTRAL de transição de fase (1º tempo, intervalo) fica na tela */
  phaseMs: 2200,
  /** faixa de LANCE no topo (falta, cartão, escanteio...) fica na tela */
  eventMs: 2200,
}

export const AREA = {
  /** grande área: 16.5m de profundidade */
  penaltyDepth: 16.5,
  /** meia-largura da grande área: 7.32/2 + 16.5 = 20.16m */
  penaltyHalfWidth: 20.16,
  /** pequena área: 5.5m de profundidade */
  goalDepth: 5.5,
  /** meia-largura da pequena área: 7.32/2 + 5.5 = 9.16m */
  goalHalfWidth: 9.16,
  /** marca do pênalti: 11m da linha de fundo */
  penaltySpot: 11,
}

export const MATCH = {
  /** duração de cada tempo em segundos de JOGO (45 min/tempo = 90' no total). */
  halfSeconds: 45 * 60,
  /** segundos de JOGO que o RELÓGIO avança por segundo de física. É o knob da
   *  velocidade DO RELÓGIO da partida — NÃO mexe na movimentação dos jogadores
   *  (isso é o multiplicador de velocidade). Com 40 e o Normal (1.5x), o relógio
   *  anda ~60s de jogo por segundo real ≈ 1 minuto a cada segundo. */
  clockRate: 40,
}

/**
 * Saída de bola — pontapé inicial e recomeço após o gol (regras do jogo): cada
 * time fica no SEU campo; o time que sai de bola posiciona DOIS jogadores no
 * círculo central, sobre a bola, e o adversário aguarda fora do círculo. No 1º
 * tempo sai um time; no 2º, o outro (ver `firstKickoff`).
 */
export const KICKOFF = {
  /** raio do círculo central (m) — o adversário aguarda fora dele */
  centerRadius: 9.15,
  /** margem (m) da linha de meio-campo para o time que sai de bola */
  takingMargin: 1,
  /** recuo (m) do 2º batedor em relação à bola, rumo ao próprio campo */
  mateBack: 3,
  /** afastamento lateral (m) do 2º batedor em relação à bola */
  mateSide: 4,
  /** congela a jogada no apito (s) — evita roubada instantânea no recomeço */
  deadball: 0.6,
}

/**
 * Pênalti (Lei 14): falta da defesa DENTRO da própria grande área. A bola é
 * posta na marca, só o batedor e o goleiro adversário ficam na área e os demais
 * aguardam atrás da marca, fora da área, até a cobrança.
 */
export const PEN = {
  /** congela a jogada enquanto posiciona a cobrança (s) */
  deadball: 1.1,
  /** recuo (m) dos demais para fora da grande área, atrás da marca */
  waitBack: 2,
  /** espalhamento lateral (m) dos demais na entrada da área */
  waitSpread: 3.4,
}

/**
 * Tiro livre (Lei 13): a falta FORA da área vira cobrança, e o que se faz com ela
 * depende de ONDE foi: pertinho do gol bate-se DIRETO; avançado mas fechado,
 * LANÇA-SE na área para o cabeceio; longe, recompõe-se com um passe. Numa falta
 * perigosa a defesa arma a BARREIRA a 9,15 m na linha bola→gol (Lei 13).
 */
export const FREEKICK = {
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
  /** distância ao gol (m) abaixo da qual a falta é "perigosa": arma barreira */
  dangerDist: 30,
  /** desvio lateral máximo do centro do gol (m) p/ tentar o CHUTE DIRETO */
  shootCone: 18,
  /** alcance extra (m) do chute direto sobre o de jogo — bola PARADA, batida limpa.
   *  Curto de propósito: de muito longe (30 m+) a falta vira LANÇAMENTO na área, não
   *  chute direto (como na vida real) — evita a cauda de gols fáceis de fora. */
  directRangeBonus: 3,
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
  aimSpread: 0.07,
  /** bônus de defesa do goleiro contra o chute DIRETO de falta — ele está POSTADO
   *  e à espera da cobrança (bola parada), logo defende bem mais que num chute de
   *  jogo. É o que segura a conversão na faixa real (~6-8% p/ bons batedores). */
  gkSetBonus: 0.17,
}

/**
 * Impedimento (Lei 11): um atacante está em posição de impedimento se, NO INSTANTE
 * em que um companheiro joga a bola, estiver mais perto da linha de fundo
 * adversária do que a bola E do que o penúltimo defensor, no campo de ataque. O
 * lance só é apitado se esse atacante SE ENVOLVER (for o primeiro a tocar a bola).
 */
export const OFFSIDE = {
  /** margem (m) ALÉM da linha do penúltimo defensor para caracterizar impedimento.
   *  Pela Lei 11 não há margem — é uma linha; aqui um meio-corpo de tolerância
   *  absorve a amostragem discreta e enviesa LEVEMENTE a NÃO marcar lances
   *  apertados (erra a menos). A disciplina das corridas da IA (cap em
   *  linha+offsideSlack) é o que mantém o impedimento naturalmente raro. */
  margin: 0.5,
}

/**
 * Cartões e expulsões (Lei 12): a falta pode gerar amarelo; o 2º amarelo e a
 * falta grave (vermelho direto) expulsam o jogador, e o time segue com um a menos.
 */
export const CARD = {
  /** chance-base de cartão numa falta */
  base: 0.1,
  /** peso da agressividade na chance de cartão */
  aggressionWeight: 0.22,
  /** acréscimo de chance de cartão quando a falta é pênalti (lance claro) */
  penaltyBonus: 0.15,
  /** fração das faltas cartonadas que são VERMELHO direto (falta grave) */
  straightRedFrac: 0.12,
  /** quanto a agressividade do infrator aumenta a chance de vermelho direto */
  straightRedAggr: 0.8,
}

/**
 * DOGSO (Lei 12) — negar uma chance CLARA de gol com uma falta: o atacante
 * conduzia rumo ao gol, perto o bastante, e o faltoso era o ÚLTIMO obstáculo (só
 * o goleiro restava). Fora da área → VERMELHO direto (falta profissional); dentro
 * da área → AMARELO (dupla punição reduzida: o pênalti já castiga o lance).
 */
export const DOGSO = {
  /** distância (m) ao gol até onde a falta ainda nega uma chance clara */
  maxDist: 34,
  /** meia-largura (m) da rota bola→gol: um defensor nessa faixa "cobre" o lance
   *  (então não era chance clara) — estreita de propósito, p/ o DOGSO ser raro */
  lane: 6.5,
}

/**
 * MÃO NA BOLA (Lei 12): a bola batendo forte no corpo de um jogador de linha pode
 * ser marcada como mão. Na PRÓPRIA grande área do infrator → pênalti; em qualquer
 * outro ponto → tiro livre direto para o adversário. Raro de propósito (não há
 * modelo de braço): só bola forte, e mais provável com a bola ALTA. Não se aplica
 * ao goleiro dentro da própria área (ali ele pode usar as mãos).
 */
/**
 * LESÕES/PANCADAS: uma falta dura pode machucar o jogador faltado. Ele passa a
 * jogar MANCANDO (perde ritmo, `Player.knock`) e fica mais tempo caído. Raro e
 * escalado pela violência do infrator (agressividade). A dor CORRE devagar ao
 * longo da partida (o `knock` decai), então uma pancada leve some em minutos e uma
 * grave persiste bem mais — sem substituições no motor, ninguém deixa o campo.
 */
export const INJURY = {
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
  recoverRate: 0.0005,
  // --- lesão SEM contato (estirão muscular) em jogo aberto ---
  /** chance por SEGUNDO de jogo de um estirão ao SPRINTAR (base minúscula: raro) */
  strainRate: 0.000006,
  /** o cansaço eleva o risco de estirão (× isto por (1-energia)) — músculo cansado */
  strainFatigue: 2.5,
  /** fração dos estirões que são GRAVES → o árbitro PARA o jogo (bola ao chão, Lei 8) */
  strainSeriousFrac: 0.4,
  /** congela a jogada no reinício de bola ao chão (s) */
  dropDeadball: 1.0,
}

export const HANDBALL = {
  /** chance-base de um contato bola-corpo FORTE ser marcado como mão */
  chance: 0.02,
  /** só a partir desta velocidade da bola (m/s) — um toque leve não é mão */
  minSpeed: 9,
  /** multiplicador da chance quando a bola está ALTA (braços mais no caminho) */
  loftMul: 2,
}

/**
 * Acréscimos (Lei 7): o tempo perdido com gols (comemoração), faltas e cartões
 * é devolvido ao fim de cada tempo. Em segundos de JOGO; zera a cada tempo.
 */
export const STOPPAGE = {
  /** somado por gol marcado */
  perGoal: 50,
  /** somado por falta */
  perFoul: 12,
  /** somado por cartão/expulsão */
  perCard: 20,
  /** teto de acréscimos por tempo (s de jogo) */
  max: 6 * 60,
}

/**
 * Lei da vantagem (Lei 5): se a falta é no campo de ataque e o time que sofreu
 * seguiria com a bola, o árbitro pode deixar o jogo seguir em vez de marcar.
 */
export const ADVANTAGE = {
  /** chance de deixar seguir quando há vantagem */
  chance: 0.55,
}

export const PHYS = {
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
  postRadius: 0.06,
}

/**
 * Chute a gol — potência e precisão num único lugar (tunáveis).
 * Velocidades em m/s; chute colocado fraco ~16, pancada de força ~36.
 */
export const SHOT = {
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
  skyVzVar: 7,
}

/**
 * Cabeceio a gol num cruzamento/escanteio (bola ALTA na grande área de ataque).
 * A cabeçada é mais fraca e menos precisa que um chute de pé — heading/impulsão
 * (aerialPower) decidem se sai enquadrada; composure firma a têmpora.
 */
export const HEAD = {
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
  scatterAim: 0.6,
}

/**
 * GESTÃO DE JOGO (leitura de placar + relógio): no fim da partida um time que
 * VENCE protege o resultado (recua o bloco, compromete menos gente à frente) e um
 * time que PERDE se lança ao ataque (empurra mais). Só atua no TERÇO FINAL e com
 * diferença no placar — em 0×0 ou no começo, o fator é 1 (não muda nada, inclusive
 * nas simulações neutras dos atributos).
 */
export const GAMESTATE = {
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
  timeWaste: 0.6,
}

export const AI = {
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
  shotCornerInset: 1.0,
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
  visionLane: 1.0,
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
  earlyCrossChance: 0.85,
}

/** Parâmetros de movimentação individual e suavização. */
export const MOVE = {
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
  ctrlEase: 12,
}

/** Fôlego: gasta ao correr, recupera ao andar/trotar (itens 2, 11, 12). */
export const STAMINA = {
  /** velocidade (m/s) a partir da qual o esforço passa a gastar fôlego */
  jogSpeed: 4.5,
  /** faixa de velocidade (m/s) acima de jogSpeed até o sprint máximo */
  sprintBand: 4,
  /** dreno por segundo de JOGO ao sprintar a fundo */
  sprintDrain: 0.009,
  /** dreno = drainBase - stamina·drainStamina (gasta menos quem tem mais fôlego);
   *  faixa suavizada para não somar à queda de ritmo já aplicada em maxSpeed */
  drainBase: 1.25,
  drainStamina: 0.7,
  /** recuperação por segundo de JOGO ao andar/trotar */
  recover: 0.004,
  /** quanto a recuperação MINGUA com a exaustão (× falta de naturalFitness) */
  recoverFade: 0.5,
  /** energia mínima — nunca zera por completo */
  floor: 0.45,
}

/**
 * Goleiro — TODOS os números do GK ficam aqui (item 30/50: nada de mágico espalhado).
 * Escalas: distâncias em m, velocidades em m/s, tempos em s, probabilidades 0..1.
 */
export const GK = {
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
  reachReflex: 1.0,
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
  aerialDropScale: 1.6,
}

/**
 * Comemoração do gol — a sequência roda em tempo REAL (independe da velocidade
 * da simulação) para que o lance seja sempre legível: a bola fica na rede, o
 * autor corre comemorar e o banner central anuncia quem marcou.
 */
export const CELEBRATION = {
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
  golacoDist: 23,
}

/**
 * Colisão da bola com o CORPO do jogador de linha (bloqueios, desvios e
 * interceptações físicas). Só vale para a bola SOLTA e RÁPIDA — bola lenta é
 * dominada normalmente (tryGainLoose). A disputa decide entre amortecer
 * (controlar) e apenas desviar (bloqueio), conforme os atributos.
 */
export const COLLIDE = {
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
  cushionKeep: 0.25,
}

/** Domínio da bola solta / disputa aérea (firstTouch, jumping, heading). */
export const CONTROL = {
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
  aerialAtkBoxEdge: 3.0,
  /** velocidade (m/s) com que a bola escapa num erro de domínio */
  squirtSpeed: 6,
  /** velocidade (m/s) em que matar a bola fica nitidamente mais difícil */
  hardTouchSpeed: 24,
}

/** Condução de bola com proteção (afasta do marcador mais próximo). */
export const DRIBBLE = {
  /** raio (m) em que o conduto começa a desviar do marcador */
  avoidRange: 6,
  /** peso do desvio lateral ao proteger a bola do marcador */
  avoidWeight: 1.1,
}

export const DUEL = {
  /** distância (até a bola) para tentar o desarme (m) */
  range: 2.0,
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
  deadball: 1.0,
}

/**
 * Reinícios de bola na LINHA DE FUNDO e LATERAL (tiro de meta, escanteio,
 * arremesso lateral). Distâncias em m, tempos em s. Quem mandou a bola para
 * fora (lastTouchId) define o reinício: atacante → tiro de meta; defensor →
 * escanteio.
 */
export const RESTART = {
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
    { depth: 7, side: -3 }, // 1º pau (ataca a bola na queda)
    { depth: 9, side: 2 }, // pequena/miolo
    { depth: 11, side: -1 }, // marca do pênalti
    { depth: 10, side: 5 }, // 2º pau
    { depth: 14, side: 0 }, // entrada da área (rebote/afastamento curto)
  ],
  /** slots da DEFESA no escanteio: recua para dentro da própria área e protege o
   *  GOL — GOALSIDE dos atacantes (mais fundo, na boca/6m e nos postes). Fica atrás
   *  da zona de queda para o atacante disputar o 1º toque (senão a zaga corta tudo). */
  cornerDefSlots: [
    { depth: 2, side: -3 }, // 1º pau (linha)
    { depth: 2, side: 3 }, // 2º pau (linha)
    { depth: 5, side: 0 }, // miolo da pequena área
    { depth: 6, side: -5 },
    { depth: 7, side: 4 },
  ],
  /** profundidade (m), a partir do meio-campo rumo ao PRÓPRIO campo, onde os
   *  zagueiros do time que COBRA o escanteio seguram (proteção ao contra-ataque) */
  cornerBackHold: 20,
}

/**
 * Arremesso lateral (Lei 15): a bola volta ao jogo LANÇADA COM A MÃO por cima da
 * cabeça — é sempre AÉREA e de força limitada (mão, não pé). O cobrador busca um
 * companheiro (nunca arremessa para si mesmo). A distância cresce um pouco com a
 * FORÇA do cobrador (o "lateral longo"), mas nunca chega à potência de um chute.
 */
export const THROW = {
  /** alcance-base do arremesso (m) — modesto, é com a mão */
  reachBase: 11,
  /** alcance extra (m) conforme a força do cobrador (lateral longo) */
  reachStrength: 11,
  /** distância mínima (m) p/ um companheiro ser alvo (não arremessa em cima de si) */
  minReach: 4,
  /** pico (m) do arco aéreo do arremesso (sobe à altura de peito/cabeça) */
  peak: 2.4,
  /** dispersão angular (rad) da mira do arremesso */
  spread: 0.1,
}
