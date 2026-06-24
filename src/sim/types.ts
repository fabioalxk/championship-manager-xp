export interface Vec2 {
  x: number
  y: number
}

export type TeamId = 'home' | 'away'

export type Role = 'GK' | 'DEF' | 'MID' | 'FWD'

/** Direção de ataque no eixo X: +1 ataca para a direita, -1 para a esquerda. */
export type Dir = 1 | -1

/**
 * Atributos no estilo Football Manager — escala 0 a 100 (ver atributos.md).
 * TODOS são consumidos pela simulação; as fórmulas vivem em ratings.ts.
 */
export interface Attrs {
  // ----- FÍSICO -----
  pace: number //  velocidade máxima de corrida
  acceleration: number //  arranque: rapidez até a velocidade máxima
  agility: number //  mudança de direção (vira sem frear tanto)
  balance: number //  equilíbrio: resiste a cair/tropeçar no duelo
  jumping: number //  impulsão: disputa de bola alta/dividida
  strength: number //  força: duelos, potência do chute
  stamina: number //  fôlego: ritmo de gasto de energia
  naturalFitness: number //  recuperação de energia
  workRate: number //  intensidade sem bola (pressão/marcação)

  // ----- TÉCNICO -----
  dribbling: number //  condução/drible: mantém a bola no duelo
  firstTouch: number //  domínio: raio de controle + erro de domínio
  technique: number //  reduz o erro (spread) de passes e chutes
  passing: number //  passe: velocidade e precisão
  crossing: number //  cruzamento das pontas
  finishing: number //  finalização de perto
  longShots: number //  chute de longe (alcance e precisão)
  heading: number //  cabeceio / disputa aérea
  tackling: number //  desarme: ganha a bola no bote
  marking: number //  marcação: cola no adversário sem bola

  // ----- MENTAL -----
  vision: number //  enxerga/escolhe a melhor opção de passe
  anticipation: number //  lê a jogada e intercepta antes
  positioning: number //  posicionamento defensivo / antecipação
  offTheBall: number //  qualidade das corridas no ataque
  decisions: number //  quando conduzir, passar ou chutar
  composure: number //  frieza sob pressão (erra menos)
  concentration: number //  menos lapsos quando cansado
  consistency: number //  reduz a variância aleatória das ações
  aggression: number //  agressividade (faz faltas/cartões)
  bravery: number //  entra em botes mais arriscados
  teamwork: number //  mantém o bloco compacto/dá apoio
  flair: number //  imprevisibilidade: efeito no chute

  // ----- GOLEIRO -----
  goalkeeping: number //  defesa-base (shot stopping)
  reflexes: number //  reflexo: reação curta + alcance + rebote
  handling: number //  mãos: segura vs. espalma; evita frango
  aerialReach: number //  saída aérea: bolas altas/cruzamentos
  oneOnOne: number //  saída de frente / sweeper (1v1)
  kicking: number //  tiro de meta / chutão longo
  throwing: number //  reposição curta (lançamento de mão)
  communication: number //  comando de área: organiza a defesa
}

export interface Player {
  id: number
  number: number
  name: string
  team: TeamId
  role: Role
  attrs: Attrs
  /** posição-âncora na formação, em coordenadas "atacando para a DIREITA" */
  formationPos: Vec2
  pos: Vec2
  vel: Vec2
  /** posição no passo anterior — usada para interpolar o render (suaviza) */
  prevPos: Vec2
  /** alvo de movimento suavizado (low-pass) para não dar trancos ao mudar de destino */
  smTarget: Vec2
  /** está acomodado na zona morta? (histerese anti-jitter) */
  settled: boolean
  /** energia atual 0..1 (decai com o jogo, reduz o ritmo efetivo) */
  energy: number
  /** tempo (s) atordoado após perder a bola — fica parado se > 0 */
  stun: number
  /** quão "caído" está 0..1 (transição suave entre em pé e no chão) */
  downAmt: number
  /** quão "dono da bola" está 0..1 (fade do realce do controlador) */
  ctrlAmt: number
  yellow: boolean
  /** gols marcados na partida (para detectar bis/hat-trick) */
  goals: number
}

export interface Ball {
  pos: Vec2
  vel: Vec2
  /** posição no passo anterior — usada para interpolar o render */
  prevPos: Vec2
  /** efeito lateral (m/s²) aplicado perpendicular à direção — curva à la Magnus */
  spin: number
  /** ângulo de rolagem acumulado (rad) — só para o giro visual da bola */
  roll: number
}

export type EventType =
  | 'goal'
  | 'shot'
  | 'save'
  | 'foul'
  | 'card'
  | 'tackle'
  | 'half'
  | 'kickoff'
  | 'goalkick'
  | 'corner'
  | 'fulltime'

export interface MatchEvent {
  minute: number
  type: EventType
  team: TeamId | null
  text: string
}

export interface TeamStats {
  shots: number
  shotsOnTarget: number
  fouls: number
  yellows: number
  tackles: number
  possessionTicks: number
  /** defesas do goleiro deste time */
  saves: number
  /** rebotes/espalmadas dados pelo goleiro (bola viva) */
  rebounds: number
}

export type MatchStatus = 'play' | 'over'

/**
 * Sequência de comemoração de um gol: congela a jogada por alguns segundos e
 * guarda tudo que o banner central e a animação em campo precisam para deixar
 * CLARO o que aconteceu — quem marcou, por qual time e o placar resultante.
 */
export interface Celebration {
  /** time que MARCOU */
  team: TeamId
  /** autor do gol (null = gol sem autor identificado / contra) */
  scorerId: number | null
  scorerName: string | null
  scorerNumber: number | null
  /** nº de gols do autor na partida (2 = doblete, 3 = hat-trick) */
  scorerGoals: number
  /** quem deu a assistência (null = sem assistência / lance individual) */
  assistName: string | null
  /** finalização de longe (rotula "GOLAÇO") */
  golaco: boolean
  /** selo de marca pessoal ("DOBLETE!", "HAT-TRICK!") ou null */
  milestone: string | null
  /** "história" do placar ("EMPATE!", "BRASIL NA FRENTE!"...) ou null */
  context: string | null
  /** placar já atualizado, para exibir no banner */
  homeScore: number
  awayScore: number
  /** minuto do gol */
  minute: number
  /** X do gol onde a bola entrou (0 ou FIELD.w) — orienta os efeitos em campo */
  goalX: number
  /** ponto no campo para onde o autor corre comemorar (perto do escanteio) */
  spot: Vec2
  /** tempo REAL decorrido (s) desde o gol */
  t: number
}

export interface MatchState {
  players: Player[]
  ball: Ball
  possession: TeamId | null
  controllerId: number | null
  holdTime: number
  kickCooldown: number
  tackleCooldown: number
  /** congela a jogada por X segundos (cobrança de falta / lateral) */
  deadball: number
  /** time que reinicia a jogada parada (o adversário recua) */
  restartTeam: TeamId | null
  /** o reinício atual é um TIRO DE META → o goleiro chuta longo (chutão), não toca curto */
  goalKick: boolean
  /** último jogador a finalizar (para narrar o gol) */
  lastShooterId: number | null
  /** distância (m) do último chute ao gol — rotula golaço de longe */
  lastShotDist: number
  /** último a dar um passe (candidato a assistência); null quando inválido */
  lastPasserId: number | null
  /** último jogador a tocar a bola (atribui lateral/escanteio e desvios) */
  lastTouchId: number | null
  score: Record<TeamId, number>
  /** tempo de JOGO decorrido em segundos (0..5400) */
  time: number
  half: 1 | 2
  status: MatchStatus
  /** direção de ataque atual de cada time (inverte no 2º tempo) */
  attackDir: Record<TeamId, Dir>
  /** quem bateu a saída do 1º tempo (o outro bate no 2º) */
  firstKickoff: TeamId
  stats: Record<TeamId, TeamStats>
  /** comemoração em andamento (congela a jogada); null = jogo normal */
  celebration: Celebration | null
  events: MatchEvent[]
  /** estado do PRNG determinístico (mulberry32) — replays e debug consistentes */
  rngState: number
}
