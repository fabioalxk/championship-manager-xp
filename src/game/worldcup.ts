/**
 * Seleções nacionais para o modo "Slay of the CM" — o técnico assume uma
 * seleção (Brasil sempre disponível) e enfrenta outras seleções pelo mapa.
 * Identidade só: nome + cores do uniforme + bandeira (SVG em `public/flags/wc/`,
 * baixado de flagcdn.com — usar arquivo em vez de emoji evita o problema de
 * bandeiras não renderizarem em algumas combinações de SO/navegador/fonte).
 * Os jogadores continuam fictícios/gerados.
 */
import type { BadgeClub } from '../ui/ClubBadge'

export interface NationalTeam extends BadgeClub {
  name: string
}

type Row = [id: string, name: string, short: string, shirt: string, text: string]

/** Brasil vem primeiro de propósito: é sempre a 1ª opção oferecida ao jogador. */
const ROWS: Row[] = [
  ['brasil', 'Brasil', 'BRA', '#fde047', '#16a34a'],
  ['argentina', 'Argentina', 'ARG', '#7dd3fc', '#1e3a8a'],
  ['franca', 'França', 'FRA', '#1e40af', '#f8fafc'],
  ['alemanha', 'Alemanha', 'ALE', '#f8fafc', '#111827'],
  ['espanha', 'Espanha', 'ESP', '#dc2626', '#fbbf24'],
  ['inglaterra', 'Inglaterra', 'ING', '#f8fafc', '#1e3a8a'],
  ['portugal', 'Portugal', 'POR', '#b91c1c', '#16a34a'],
  ['holanda', 'Holanda', 'HOL', '#f97316', '#1e3a8a'],
  ['italia', 'Itália', 'ITA', '#38bdf8', '#111827'],
  ['belgica', 'Bélgica', 'BEL', '#111827', '#dc2626'],
  ['uruguai', 'Uruguai', 'URU', '#60a5fa', '#111827'],
  ['croacia', 'Croácia', 'CRO', '#dc2626', '#f8fafc'],
  ['colombia', 'Colômbia', 'COL', '#fbbf24', '#1e3a8a'],
  ['chile', 'Chile', 'CHI', '#dc2626', '#f8fafc'],
  ['mexico', 'México', 'MEX', '#16a34a', '#f8fafc'],
  ['estados-unidos', 'Estados Unidos', 'EUA', '#1e3a8a', '#f8fafc'],
  ['canada', 'Canadá', 'CAN', '#dc2626', '#f8fafc'],
  ['japao', 'Japão', 'JAP', '#1e3a8a', '#f8fafc'],
  ['coreia-do-sul', 'Coreia do Sul', 'COR', '#f8fafc', '#dc2626'],
  ['marrocos', 'Marrocos', 'MAR', '#dc2626', '#16a34a'],
  ['senegal', 'Senegal', 'SEN', '#16a34a', '#fbbf24'],
  ['nigeria', 'Nigéria', 'NIG', '#16a34a', '#f8fafc'],
  ['gana', 'Gana', 'GAN', '#dc2626', '#fbbf24'],
  ['suica', 'Suíça', 'SUI', '#dc2626', '#f8fafc'],
  ['polonia', 'Polônia', 'POL', '#f8fafc', '#dc2626'],
  ['australia', 'Austrália', 'AUS', '#fbbf24', '#16a34a'],
  ['ira', 'Irã', 'IRA', '#111827', '#dc2626'],
  ['arabia-saudita', 'Arábia Saudita', 'KSA', '#16a34a', '#f8fafc'],
  ['catar', 'Catar', 'QAT', '#7f1d3a', '#f8fafc'],
  ['tunisia', 'Tunísia', 'TUN', '#dc2626', '#f8fafc'],
  ['equador', 'Equador', 'EQU', '#fbbf24', '#111827'],
  ['paraguai', 'Paraguai', 'PAR', '#dc2626', '#f8fafc'],
  ['peru', 'Peru', 'PER', '#dc2626', '#f8fafc'],
  ['venezuela', 'Venezuela', 'VEN', '#7f1d3a', '#111827'],
  ['costa-rica', 'Costa Rica', 'CRC', '#dc2626', '#f8fafc'],
  ['jamaica', 'Jamaica', 'JAM', '#111827', '#fbbf24'],
  ['panama', 'Panamá', 'PAN', '#dc2626', '#1e3a8a'],
  ['egito', 'Egito', 'EGI', '#dc2626', '#111827'],
  ['argelia', 'Argélia', 'ARL', '#16a34a', '#f8fafc'],
  ['camaroes', 'Camarões', 'CAM', '#16a34a', '#dc2626'],
  ['africa-do-sul', 'África do Sul', 'RSA', '#fbbf24', '#16a34a'],
  ['nova-zelandia', 'Nova Zelândia', 'NZL', '#111827', '#f8fafc'],
  ['suecia', 'Suécia', 'SUE', '#fde047', '#1e3a8a'],
  ['dinamarca', 'Dinamarca', 'DIN', '#dc2626', '#f8fafc'],
  ['ucrania', 'Ucrânia', 'UCR', '#fde047', '#1e3a8a'],
  ['turquia', 'Turquia', 'TUR', '#dc2626', '#f8fafc'],
  ['servia', 'Sérvia', 'SER', '#dc2626', '#111827'],
]

/** Lista ordenada (Brasil primeiro) — usada na tela de escolha da seleção. */
export const WC_TEAM_LIST: NationalTeam[] = ROWS.map(([id, name, short, shirt, text]) => ({
  id,
  name,
  short,
  shirt,
  text,
  flag: `/flags/wc/${id}.svg`,
}))

/** Mesma seleções indexadas por id — usada pelo motor da corrida (adversários, badges). */
export const ALL_CLUBS: Record<string, NationalTeam> = Object.fromEntries(
  WC_TEAM_LIST.map((t) => [t.id, t]),
)

export const BRAZIL_ID = 'brasil'
