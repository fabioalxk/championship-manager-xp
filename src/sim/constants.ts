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

export const MATCH = {
  /** duração de cada tempo em segundos de JOGO */
  halfSeconds: 45 * 60,
  /** segundos de JOGO por segundo de física (relógio corre acelerado) */
  clockRate: 8,
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
  /** segura a bola antes de distribuir (s de jogo) */
  holdTime: 1.2,
  kickSpeedBase: 16,
  kickSpeedSkill: 12,
  throwSpeedBase: 12,
  throwSpeedSkill: 8,
  /** espalhamento-base do chutão longo / do lançamento curto (rad) */
  longSpread: 0.18,
  shortSpread: 0.1,
  /** erro extra sob pressão, escalado pela falta de composure (rad) */
  panicSpread: 0.12,

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
