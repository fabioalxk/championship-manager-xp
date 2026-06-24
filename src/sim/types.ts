export interface Vec2 {
  x: number
  y: number
}

export type TeamId = 'home' | 'away'

export type Role = 'GK' | 'DEF' | 'MID' | 'FWD'

/** Direção de ataque no eixo X: +1 ataca para a direita, -1 para a esquerda. */
export type Dir = 1 | -1

/** Atributos no estilo CM/FM — escala 1 a 20. */
export interface Attrs {
  pace: number //  ritmo / velocidade
  strength: number //  força (duelos, desarmes)
  stamina: number //  fôlego (cai ao longo do jogo)
  dribbling: number //  drible / conduzir a bola
  passing: number //  precisão de passe
  finishing: number //  finalização
  tackling: number //  desarme / roubada de bola
  positioning: number //  posicionamento / interceptação
  aggression: number //  agressividade (faz faltas)
  vision: number //  visão de jogo (escolha de passe)
  goalkeeping: number //  defesa (relevante só p/ GK)
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
  /** energia atual 0..1 (decai com o jogo, reduz o ritmo efetivo) */
  energy: number
  /** tempo (s) atordoado após perder a bola — fica parado se > 0 */
  stun: number
  yellow: boolean
}

export interface Ball {
  pos: Vec2
  vel: Vec2
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
}

export type MatchStatus = 'play' | 'over'

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
  /** último jogador a finalizar (para narrar o gol) */
  lastShooterId: number | null
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
  events: MatchEvent[]
}
