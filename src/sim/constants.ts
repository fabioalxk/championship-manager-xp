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
  get top() {
    return FIELD.cy - GOAL.width / 2
  },
  get bottom() {
    return FIELD.cy + GOAL.width / 2
  },
}

/**
 * Áreas marcadas (m), medidas a partir da linha de fundo e centradas no eixo Y.
 * Usadas nas regras de bola parada — sobretudo o tiro de meta (Lei 16): a bola
 * é posta na PEQUENA área e o adversário aguarda FORA da GRANDE área até a bola
 * entrar em jogo.
 */
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
  /** duração de cada tempo em segundos de JOGO */
  halfSeconds: 45 * 60,
  /** segundos de JOGO por segundo de física (relógio corre acelerado) */
  clockRate: 8,
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
  dribblePush: 0.6,
  /** fator de velocidade do conduto (mais lento, deixa marcar) */
  dribbleSpeed: 0.86,
  /** efeito (Magnus) máximo dado a um chute (m/s² lateral) */
  maxSpin: 5,
  /** fração do efeito aplicada num PASSE (curva sutil, não tira da mira) */
  passSpinScale: 0.3,
  /** fração do efeito mantida por segundo (a curva vai sumindo) */
  spinDecay: 0.55,
  /** quanto da velocidade do conduto é herdada pela bola ao soltá-la (momentum) */
  releaseCarry: 0.5,
  /** taxa (1/s) com que a bola "persegue" o pé ao conduzir — elástico, não rígido */
  footLerp: 16,
  /** restituição ao bater na trave (0=morre, 1=devolve tudo) */
  postRestitution: 0.5,
  /** raio do poste (m) para a colisão da bola */
  postRadius: 0.06,
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
  /** distância-base ao gol para tentar o chute (m); ajustada pela finalização */
  shootRange: 15,
  /** desvio lateral máximo (m) em relação ao centro do gol p/ arriscar o chute */
  shootCone: 15,
  /** recuo (m) do poste ao mirar o canto no chute (margem de segurança) */
  shotCornerInset: 1.0,
  /** tempo máximo segurando a bola antes de decidir passar (s) */
  maxHold: 0.8,
  /** distância de um adversário que conta como “pressão” (m) */
  pressureDist: 2.4,
  /** alcance de um passe (m) */
  passMin: 5,
  passMax: 40,
  /** antecipação (s) do interceptador sobre a trajetória da bola solta */
  chaseLead: 0.34,
  /** distância (m) de adversário à linha de passe que já conta como lane limpa */
  laneSafe: 5,
  /** peso da lane livre na escolha do melhor passe */
  laneWeight: 0.9,
  /** lane abaixo disto (m) = passe estrangulado, descarta a opção */
  laneBlocked: 1.4,
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
  /** quão forte a curva freia o jogador (0=para ao virar, 1=não freia) */
  turnFloor: 0.45,
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
  sprintDrain: 0.007,
  /** recuperação por segundo de JOGO ao andar/trotar */
  recover: 0.004,
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
  /** bola até esta velocidade = domínio sem disputa (recuo/passe atrás) */
  controlSpeed: 12,

  // --- probabilidade de defesa (itens 13-24) ---
  saveBase: 0.3,
  /** peso da habilidade combinada do GK (reflexo/posicion./agilidade) */
  saveSkill: 0.45,
  /** velocidade de chute sem penalidade (m/s) */
  saveSpeedFree: 22,
  saveSpeedPen: 0.008,
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
  saveCap: 0.94,

  // --- segurar vs. espalmar / erros (itens 17-24) ---
  holdBase: 0.55,
  holdSkill: 0.45,
  holdSpeedPen: 0.012,
  /** velocidade do rebote/espalmada (m/s) */
  spillSpeed: 13,
  /** cooldown curto após espalmar, para a segunda bola (s) */
  spillCooldown: 0.25,
  /** chance (× reflexos) de tocar e dar rebote ao falhar a defesa */
  secondChance: 0.33,
  /** chance-base de "frango" em bola fácil (× falhas de handling/composure) */
  fumbleScale: 0.05,
  /** janela protegida para distribuir após defender (s) */
  protectWindow: 0.6,

  // --- distribuição (itens 45-49) ---
  /** segura a bola antes de distribuir (s) — BASE; o reflexo encurta (ver gkHoldTime) */
  holdTime: 1.2,
  /** tiro de meta: alcance (m) do chutão à frente (rumo ao meio-campo) sem alvo avançado livre */
  goalKickReach: 48,
  /** tiro de meta: só busca companheiro ao menos tão à frente (m) rumo ao ataque para o chutão */
  goalKickMinFwd: 14,
  /** tiro de meta: folga mínima (m) do companheiro avançado para confiar o chutão nele */
  goalKickFree: 5,
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

  // --- organização da linha (item 8) ---
  /** o quanto a comunicação do GK fecha o bloco de defesa (0..1) */
  commandShift: 0.12,
  /** alcance extra (m) para abraçar bolas altas/cruzamentos — aerialReach */
  aerialClaim: 1.4,
  /** bônus de defesa no 1v1/chute de perto conforme oneOnOne */
  oneOnOneBonus: 0.16,
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
  /** fração da velocidade mantida ao amortecer (mata a bola nos pés) */
  cushionKeep: 0.25,
}

/** Domínio da bola solta / disputa aérea (firstTouch, jumping, heading). */
export const CONTROL = {
  /** escala da chance de errar o primeiro toque na bola solta */
  miscontrolScale: 0.22,
  /** velocidade (m/s) acima da qual a bola é "alta/forte" e exige disputa aérea */
  loftSpeed: 18,
  /** alcance extra (m) ganho na bola alta conforme a competência aérea */
  aerialReach: 0.9,
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
  /** chance de um tropeço leve ao ser desarmado de forma limpa */
  staggerChance: 0.45,
  /** atordoamento (s) do tropeço leve */
  staggerStun: 0.4,
  /** atordoamento (s) de quem leva o carrinho/falta — cai e fica no chão */
  foulStun: 1.4,
  /** intervalo mínimo entre tentativas de desarme (s) */
  cooldown: 0.5,
  /** chance-base de desarme bem-sucedido por tentativa */
  baseWin: 0.5,
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
  /** bola parada no escanteio — dá tempo dos atacantes subirem para a área (s) */
  cornerDeadball: 1.0,
  /** bola parada no arremesso lateral (s) */
  throwInDeadball: 0.4,
  /** distância da linha de fundo onde a bola é posta no tiro de meta (m) — pequena área */
  goalAreaOut: 5.5,
  /** deslocamento lateral da bola no tiro de meta a partir do centro do gol (m) */
  goalAreaSide: 7,
  // --- reestruturação do tiro de meta (Lei 16) ---
  /** profundidade (m) onde os zagueiros se postam para a saída curta (borda da área) */
  outletDepth: 11,
  /** afastamento lateral (m) dos zagueiros na saída (abrem nas pontas) */
  outletWide: 15,
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
}
