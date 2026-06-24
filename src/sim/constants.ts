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
  /** distância para dominar a bola solta (m) */
  controlRadius: 1.3,
  /** alcance do goleiro para defender (m) */
  gkReach: 3.2,
  /** amortecimento da bola por segundo (fração da velocidade mantida) */
  ballDamping: 0.5,
  /** empurrão à frente ao conduzir a bola (m) — controle curto */
  dribblePush: 0.8,
  /** fator de velocidade do conduto (mais lento, deixa marcar) */
  dribbleSpeed: 0.86,
}

export const AI = {
  /** o quanto o bloco do time desliza com a bola (0..1) */
  blockShiftX: 0.55,
  blockShiftY: 0.6,
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
