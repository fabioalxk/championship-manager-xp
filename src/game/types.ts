import type { Attrs, Role } from '../sim/types'

/** Divisões nacionais, da elite (A) à base (D). */
export type Division = 'A' | 'B' | 'C' | 'D'

/** Ordem de força/prestígio: A é o topo, D a base. */
export const DIVISIONS: Division[] = ['A', 'B', 'C', 'D']

/** Identidade visual + nome de um clube real (sem jogadores — esses são gerados). */
export interface ClubDef {
  id: string
  name: string
  short: string // sigla de 3 letras p/ a tabela
  shirt: string // cor do uniforme
  text: string // cor do número/texto sobre a camisa
}

/** Jogador gerado (nome fictício brasileiro + atributos derivados por seed). */
export interface GenPlayer {
  id: number
  name: string
  number: number
  role: Role
  age: number
  attrs: Attrs
  overall: number // nota geral 0..100 (derivada dos atributos)
  value: number // valor de mercado (R$)
}

/** Estado de um clube dentro da carreira (elenco vivo + identidade). */
export interface ClubState {
  id: string
  name: string
  short: string
  shirt: string
  text: string
  squad: GenPlayer[]
}

/** Uma partida agendada/realizada na tabela da liga. */
export interface Fixture {
  round: number
  homeId: string
  awayId: string
  played: boolean
  homeGoals: number
  awayGoals: number
}

/** Linha da classificação. */
export interface Standing {
  clubId: string
  played: number
  won: number
  drawn: number
  lost: number
  gf: number
  ga: number
  pts: number
}

/** Estado da temporada/liga atual. */
export interface LeagueState {
  division: Division
  clubIds: string[]
  fixtures: Fixture[]
  round: number // próxima rodada a jogar (1-based); > totalRounds = encerrada
  totalRounds: number
}

/** Oferta de emprego de outro clube. */
export interface JobOffer {
  clubId: string
  division: Division
  clubName: string
}

/** Jogador disponível no mercado (free agent gerado). */
export interface MarketPlayer extends GenPlayer {
  fee: number // custo da contratação (R$)
}

/** Entrada do histórico de temporadas (para a tela de carreira). */
export interface HistoryEntry {
  year: number
  clubName: string
  division: Division
  position: number
  champion: boolean
  promoted: boolean
  relegated: boolean
}

export type CareerStatus =
  | 'season' // temporada em andamento
  | 'season_end' // fim de temporada (mostra resumo)
  | 'transfer' // janela de transferências aberta
  | 'offers' // há ofertas de emprego a decidir
  | 'won' // zerou: campeão da Série A
  | 'sacked' // demitido

/** Estado completo da carreira — é isto que é salvo/carregado. */
export interface CareerState {
  version: number
  managerName: string
  seed: number
  year: number
  clubId: string
  clubs: Record<string, ClubState>
  league: LeagueState
  money: number
  reputation: number // 0..100, cresce com sucesso e atrai clubes maiores
  history: HistoryEntry[]
  trophies: string[]
  offers: JobOffer[]
  market: MarketPlayer[]
  status: CareerStatus
  /** divisão em que o clube do jogador disputará a PRÓXIMA temporada */
  pendingDivision: Division
  /** resumo da última temporada encerrada (para a tela de fim de temporada) */
  lastSeason: HistoryEntry | null
  log: string[] // narração curta dos acontecimentos recentes
}
