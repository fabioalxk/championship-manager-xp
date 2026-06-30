import type { ClubDef, Division } from './types'

/**
 * Clubes REAIS por divisão (identidade só: nome + cores). Os jogadores são
 * fictícios gerados — usar nomes de atletas reais no Brasil esbarra em direito
 * de imagem (nem EA nem Football Manager usam). Nome de clube é tolerado.
 *
 * Tupla compacta: [nome, sigla, cor da camisa, cor do texto].
 */
type Row = [string, string, string, string]

const A: Row[] = [
  ['Flamengo', 'FLA', '#e11d2a', '#111827'],
  ['Palmeiras', 'PAL', '#10663b', '#ffffff'],
  ['Corinthians', 'COR', '#111827', '#ffffff'],
  ['São Paulo', 'SAO', '#e11d2a', '#ffffff'],
  ['Santos', 'SAN', '#f8fafc', '#111827'],
  ['Fluminense', 'FLU', '#7f1d3a', '#16a34a'],
  ['Botafogo', 'BOT', '#111827', '#f8fafc'],
  ['Vasco', 'VAS', '#111827', '#e11d2a'],
  ['Grêmio', 'GRE', '#1e6fd6', '#111827'],
  ['Internacional', 'INT', '#e11d2a', '#ffffff'],
  ['Atlético-MG', 'CAM', '#111827', '#ffffff'],
  ['Cruzeiro', 'CRU', '#1e40af', '#ffffff'],
  ['Bahia', 'BAH', '#1e6fd6', '#e11d2a'],
  ['RB Bragantino', 'RBB', '#f8fafc', '#e11d2a'],
  ['Mirassol', 'MIR', '#f6c915', '#10663b'],
  ['Coritiba', 'CFC', '#10663b', '#ffffff'],
  ['Athletico-PR', 'CAP', '#e11d2a', '#111827'],
  ['Chapecoense', 'CHA', '#10663b', '#ffffff'],
  ['Remo', 'REM', '#1e3a8a', '#ffffff'],
  ['Vitória', 'VIT', '#e11d2a', '#111827'],
]

const B: Row[] = [
  ['América-MG', 'AME', '#10663b', '#ffffff'],
  ['Athletic', 'ATH', '#111827', '#f6c915'],
  ['Atlético-GO', 'ACG', '#e11d2a', '#111827'],
  ['Avaí', 'AVA', '#1e40af', '#f6c915'],
  ['Botafogo-SP', 'BSP', '#111827', '#e11d2a'],
  ['Ceará', 'CEA', '#111827', '#f8fafc'],
  ['CRB', 'CRB', '#e11d2a', '#111827'],
  ['Criciúma', 'CRI', '#f6c915', '#111827'],
  ['Cuiabá', 'CUI', '#f6c915', '#10663b'],
  ['Fortaleza', 'FOR', '#1e40af', '#e11d2a'],
  ['Goiás', 'GOI', '#10663b', '#ffffff'],
  ['Juventude', 'JUV', '#10663b', '#ffffff'],
  ['Londrina', 'LON', '#111827', '#1e6fd6'],
  ['Náutico', 'NAU', '#e11d2a', '#ffffff'],
  ['Novorizontino', 'NOV', '#f6c915', '#1e40af'],
  ['Operário-PR', 'OPE', '#111827', '#f8fafc'],
  ['Ponte Preta', 'PON', '#111827', '#f8fafc'],
  ['São Bernardo', 'SBE', '#1e3a8a', '#f6c915'],
  ['Sport', 'SPT', '#e11d2a', '#111827'],
  ['Vila Nova', 'VIL', '#10663b', '#e11d2a'],
]

const C: Row[] = [
  ['Confiança', 'CON', '#1e40af', '#e11d2a'],
  ['Ypiranga', 'YPI', '#111827', '#e11d2a'],
  ['Maringá', 'MGA', '#1e6fd6', '#ffffff'],
  ['Ituano', 'ITU', '#e11d2a', '#111827'],
  ['Botafogo-PB', 'BPB', '#111827', '#e11d2a'],
  ['Figueirense', 'FIG', '#111827', '#f8fafc'],
  ['Anápolis', 'ANA', '#1e40af', '#ffffff'],
  ['Itabaiana', 'ITB', '#1e6fd6', '#ffffff'],
  ['Guarani', 'GUA', '#10663b', '#ffffff'],
  ['Floresta', 'FLO', '#111827', '#f6c915'],
  ['Brusque', 'BRU', '#1e40af', '#f8fafc'],
  ['Caxias', 'CAX', '#1e40af', '#e11d2a'],
  ['Paysandu', 'PAY', '#1e40af', '#f8fafc'],
  ['Volta Redonda', 'VRE', '#111827', '#f6c915'],
  ['Amazonas', 'AMA', '#10663b', '#f6c915'],
  ['Ferroviária', 'FER', '#e11d2a', '#111827'],
  ['Inter de Limeira', 'ILI', '#1e6fd6', '#ffffff'],
  ['Maranhão', 'MAR', '#e11d2a', '#f6c915'],
  ['Santa Cruz', 'STC', '#e11d2a', '#111827'],
  ['Barra-SC', 'BAR', '#111827', '#e11d2a'],
]

const D: Row[] = [
  ['ABC', 'ABC', '#111827', '#f8fafc'],
  ['América-RN', 'ARN', '#e11d2a', '#111827'],
  ['Treze', 'TRE', '#1e40af', '#ffffff'],
  ['Campinense', 'CAM', '#1e6fd6', '#f8fafc'],
  ['Ferroviário', 'FCE', '#e11d2a', '#111827'],
  ['Tombense', 'TOM', '#111827', '#f6c915'],
  ['Aparecidense', 'APA', '#10663b', '#f6c915'],
  ['Pouso Alegre', 'POU', '#1e40af', '#ffffff'],
  ['Brasil de Pelotas', 'BRP', '#e11d2a', '#111827'],
  ['São José-RS', 'SJO', '#111827', '#e11d2a'],
  ['Real Noroeste', 'RNO', '#1e6fd6', '#f6c915'],
  ['Porto Velho', 'PVE', '#111827', '#f8fafc'],
  ['Nova Iguaçu', 'NIG', '#10663b', '#e11d2a'],
  ['Portuguesa-RJ', 'PRJ', '#e11d2a', '#10663b'],
  ['Águia de Marabá', 'AGU', '#1e40af', '#f6c915'],
  ['Cascavel', 'CAS', '#1e40af', '#ffffff'],
  ['Marcílio Dias', 'MDI', '#111827', '#e11d2a'],
  ['Operário-MS', 'OMS', '#111827', '#f8fafc'],
  ['Costa Rica-MS', 'CRM', '#1e40af', '#f8fafc'],
  ['União Rondonópolis', 'URO', '#e11d2a', '#f6c915'],
]

const slug = (name: string): string =>
  name
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const toDefs = (rows: Row[]): ClubDef[] =>
  rows.map(([name, short, shirt, text]) => ({ id: slug(name), name, short, shirt, text }))

/** Pool de clubes reais por divisão (20 cada). */
export const CLUBS_BY_DIVISION: Record<Division, ClubDef[]> = {
  A: toDefs(A),
  B: toDefs(B),
  C: toDefs(C),
  D: toDefs(D),
}

/** Índice id → ClubDef em todas as divisões (para lookup rápido). */
export const ALL_CLUBS: Record<string, ClubDef> = Object.fromEntries(
  Object.values(CLUBS_BY_DIVISION)
    .flat()
    .map((c) => [c.id, c]),
)
