export interface Vec2 {
  x: number
  y: number
}

export type TeamId = 'home' | 'away'

export type Role = 'GK' | 'DEF' | 'MID' | 'FWD'

/** Direção de ataque no eixo X: +1 ataca para a direita, -1 para a esquerda. */
export type Dir = 1 | -1

/**
 * Tipo de cobrança de um TIRO LIVRE, pela POSIÇÃO da falta (Lei 13): perto e
 * central → CHUTE DIRETO por cima da barreira; avançado mas fora do cone (ou de
 * lado) → CRUZAMENTO na área para o cabeceio; longe → RECOMPOSIÇÃO com um passe.
 * Fonte única (ver `freeKickKind`) para o motor (barreira/congelamento) e a IA
 * (posicionamento/decisão) andarem sempre juntos.
 */
export type FreeKickKind = 'direct' | 'cross' | 'far'

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
  /** janela (s) de ARRANQUE pós-drible: conduz acima do ritmo por um átimo (explode pelo espaço) */
  burst: number
  /** PANCADA/lesão 0..1: fração de velocidade PERDIDA por jogar machucado após uma
   *  falta dura (joga mancando). Some devagar ao longo da partida (corre a dor). */
  knock: number
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
  /** ALTURA da bola acima do gramado (m) — 0 = rolando no chão, >0 = no ar.
   *  Só quem alcança a bola na sua altura pode tocá-la: bola alta passa por
   *  cima dos botões (lançamentos, cruzamentos, escanteios, tiro de meta). */
  z: number
  /** velocidade vertical (m/s) — sobe (>0) e cai pela gravidade até quicar */
  vz: number
  /** posição no passo anterior — usada para interpolar o render */
  prevPos: Vec2
  /** altura no passo anterior — interpola o render do "voo" da bola */
  prevZ: number
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
  | 'dribble'
  | 'half'
  | 'kickoff'
  | 'goalkick'
  | 'corner'
  | 'penalty'
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
  /** expulsões (cartões vermelhos) sofridas por este time */
  reds: number
  tackles: number
  possessionTicks: number
  /** defesas do goleiro deste time */
  saves: number
  /** rebotes/espalmadas dados pelo goleiro (bola viva) */
  rebounds: number
  /** arremessos laterais a favor deste time */
  throwIns: number
  /** tiros de meta a favor deste time */
  goalKicks: number
  /** escanteios a favor deste time */
  corners: number
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

/**
 * Faixa de anúncio (banner) que surge sobre o campo a cada LANCE relevante —
 * falta, pênalti, cartão, escanteio, intervalo, 2º tempo — para deixar CLARO o
 * que acabou de acontecer, no mesmo espírito da comemoração de gol (mais leve).
 * É efêmera: a UI a exibe por alguns segundos e some sozinha; o `id` crescente
 * faz a faixa REapareer/reanimar mesmo em dois lances iguais seguidos.
 */
export interface Banner {
  /** identificador crescente — a UI reanima a faixa quando ele muda */
  id: number
  type: EventType
  /** time relacionado ao lance (cor/escudo da faixa); null = neutro (intervalo) */
  team: TeamId | null
  /** palavra-faixa em destaque, ex.: "FALTA", "PÊNALTI!", "INTERVALO" */
  title: string
  /** descrição do lance (reaproveita o texto do evento do feed) */
  text: string
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
  /** bola saiu pela linha de fundo: segundos que ela AINDA rola antes do reinício
   *  (deixa claro que saiu, em vez de teletransportar direto para o tiro de meta) */
  outOfPlay: number
  /** linha de fundo (0 ou FIELD.w) por onde a bola saiu — define o reinício pendente */
  pendingGoalLineX: number | null
  /** tempo (s) já aguardado no tiro de meta pela área esvaziar (teto goalKickMaxWait) */
  goalKickWait: number
  /** time que reinicia a jogada parada (o adversário recua) */
  restartTeam: TeamId | null
  /** o reinício atual é um TIRO DE META → o goleiro chuta longo (chutão), não toca curto */
  goalKick: boolean
  /** o reinício atual é um ARREMESSO LATERAL → o cobrador lança com a MÃO (bola
   *  aérea, força limitada) buscando um companheiro; nunca arremessa para si mesmo */
  throwIn: boolean
  /** o reinício atual é um TIRO LIVRE (falta fora da área) → o cobrador bate
   *  DIRETO ao gol, LANÇA na área ou recompõe, e a defesa arma a barreira (Lei 13) */
  freeKick: boolean
  /** ids dos defensores que formam a BARREIRA do tiro livre (Lei 13). Fonte única:
   *  a IA os posiciona em leque e o motor os deixa BLOQUEAR rasteiro (corpo) mas
   *  NÃO cabecear a bola alçada por cima — o chute por cima do paredão é do goleiro.
   *  Vazio fora de um tiro livre perigoso; some quando a jogada se resolve. */
  wallIds: number[]
  /** tipo da cobrança do tiro livre em andamento (chute direto / cruzamento na
   *  área / recomposição), classificado pela POSIÇÃO da falta em `setupFreeKick`.
   *  Fonte única lida pela IA (posicionamento e decisão) e pelo motor (barreira,
   *  congelamento e hustle). `null` fora de um tiro livre (ver `freeKickKind`). */
  fkKind: FreeKickKind | null
  /** tempo (s) restante em que um CHUTE DIRETO de falta está "no ar" rumo ao gol:
   *  enquanto corre, os jogadores de LINHA não cabeceiam/abafam a bola alta (só o
   *  goleiro defende, ou ela bate na barreira rasteira / entra / sai) — um petardo
   *  enquadrado não é "aliviado" de cabeça por um zagueiro qualquer. */
  fkShotTimer: number
  /** cobrança de pênalti em andamento → todos aguardam fora da área até o chute */
  penalty: boolean
  /** o reinício atual é um ESCANTEIO → durante o congelamento os atacantes CARREGAM
   *  a área (1º pau/marca/2º pau) e a defesa recua para MARCAR na área; o cobrador
   *  alça o cruzamento para o cabeceio. Sem isso a bola era alçada numa área vazia. */
  corner: boolean
  /** a jogada atual nasce de uma BOLA PARADA (lateral, escanteio, tiro de meta,
   *  tiro livre, saída) → a PRIMEIRA bola entregue por essa cobrança NÃO está
   *  sujeita a impedimento (Lei 11). Consumido no primeiro toque/entrega. */
  fromRestart: boolean
  /** IMPEDIMENTO pendente (Lei 11): atacantes que estavam em posição de
   *  impedimento NO INSTANTE do último passe em jogo. Se um deles for o primeiro
   *  a se envolver com a bola, o lance é apitado; se um companheiro habilitado
   *  (ou um adversário) toca antes, a fase se encerra sem impedimento. */
  offsidePend: { team: TeamId; ids: number[] } | null
  /** o tiro livre atual é INDIRETO (impedimento, recuo pego com a mão): NÃO vale
   *  gol batido DIRETO — a bola precisa tocar um 2º jogador. Some quando um 2º
   *  jogador toca a bola (vira "direto") ou no próximo recomeço. */
  indirectFK: boolean
  /** id do cobrador do tiro livre indireto — enquanto ele for o único a ter tocado
   *  a bola, um gol não vale (Lei 13). */
  indirectTakerId: number | null
  /** acréscimos do tempo atual (s de jogo), somados por gol/falta/cartão; zera a cada tempo */
  stoppage: number
  /** último jogador a finalizar (para narrar o gol) */
  lastShooterId: number | null
  /** distância (m) do último chute ao gol — rotula golaço de longe */
  lastShotDist: number
  /** o último chute foi de CABEÇA? (rotula gol de cabeça / diagnóstico) */
  lastShotHeader: boolean
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
  /** faixa de anúncio do último lance relevante (falta, pênalti, intervalo...) */
  banner: Banner | null
  /** segundos REAIS restantes de CONGELAMENTO na transição de fase (1º tempo /
   *  intervalo): enquanto > 0 a jogada não corre — o jogo só recomeça quando a
   *  faixa central sai da tela. Contado em tempo de parede pelo loop, não no relógio. */
  introPause: number
  events: MatchEvent[]
  /** estado do PRNG determinístico (mulberry32) — replays e debug consistentes */
  rngState: number
}
