import type { Attrs, Role, TeamId, Vec2 } from './types'

export interface TeamInfo {
  id: TeamId
  name: string
  of: string // artigo + nome, p/ narração ("do Brasil")
  flag: string // caminho do SVG da bandeira (emoji de bandeira não renderiza no Windows)
  shirt: string // cor do uniforme
  text: string // cor do número
}

export const TEAMS: Record<TeamId, TeamInfo> = {
  home: { id: 'home', name: 'Brasil', of: 'do Brasil', flag: '/flags/br.svg', shirt: '#fde047', text: '#15803d' },
  away: { id: 'away', name: 'Argentina', of: 'da Argentina', flag: '/flags/ar.svg', shirt: '#7dd3fc', text: '#1e3a8a' },
}

/** Slots da formação 4-3-3 (coordenadas "atacando para a DIREITA"), em metros. */
const FORMATION_433: Vec2[] = [
  { x: 5, y: 34 }, // GK
  { x: 20, y: 12 }, // RB
  { x: 17, y: 27 }, // CB
  { x: 17, y: 41 }, // CB
  { x: 20, y: 56 }, // LB
  { x: 42, y: 20 }, // MC dir
  { x: 39, y: 34 }, // MC centro
  { x: 42, y: 48 }, // MC esq
  { x: 72, y: 15 }, // PD
  { x: 74, y: 34 }, // CA
  { x: 72, y: 53 }, // PE
]

const ROLES_433: Role[] = [
  'GK', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'FWD', 'FWD', 'FWD',
]

/** Base de atributos por posição; cada jogador sobrescreve o que se destaca. */
const baseAttrs = (role: Role): Attrs => {
  const b: Attrs = {
    pace: 13, strength: 13, stamina: 14, dribbling: 12, passing: 13,
    finishing: 10, tackling: 12, positioning: 13, aggression: 12,
    vision: 13, goalkeeping: 3,
  }
  if (role === 'GK') return { ...b, goalkeeping: 16, tackling: 6, finishing: 4 }
  if (role === 'DEF') return { ...b, tackling: 15, positioning: 15, strength: 15 }
  if (role === 'FWD') return { ...b, finishing: 15, pace: 16, dribbling: 15 }
  return b
}

interface Spec {
  number: number
  name: string
  attrs: Partial<Attrs>
}

/** Brasil — ordem segue FORMATION_433. */
const BRASIL: Spec[] = [
  { number: 1, name: 'Alisson', attrs: { goalkeeping: 19, positioning: 17, strength: 15 } },
  { number: 2, name: 'Danilo', attrs: { tackling: 15, positioning: 16, pace: 14, passing: 14 } },
  { number: 4, name: 'Marquinhos', attrs: { tackling: 17, positioning: 18, pace: 15, strength: 16 } },
  { number: 3, name: 'Gabriel M.', attrs: { tackling: 16, strength: 17, aggression: 13 } },
  { number: 6, name: 'Wendell', attrs: { pace: 15, stamina: 16, dribbling: 13, passing: 14 } },
  { number: 5, name: 'Casemiro', attrs: { tackling: 17, strength: 17, positioning: 17, aggression: 15, vision: 15, passing: 15 } },
  { number: 8, name: 'Bruno G.', attrs: { passing: 17, vision: 17, stamina: 17, dribbling: 15, tackling: 15 } },
  { number: 10, name: 'Paquetá', attrs: { dribbling: 16, passing: 16, vision: 17, finishing: 13 } },
  { number: 19, name: 'Raphinha', attrs: { pace: 17, dribbling: 17, finishing: 15, passing: 15 } },
  { number: 9, name: 'Endrick', attrs: { pace: 17, finishing: 16, dribbling: 16, strength: 14 } },
  { number: 7, name: 'Vini Jr.', attrs: { pace: 19, dribbling: 19, finishing: 15, stamina: 16 } },
]

/** Argentina — ordem segue FORMATION_433. */
const ARGENTINA: Spec[] = [
  { number: 23, name: 'Dibu', attrs: { goalkeeping: 18, positioning: 17, aggression: 13 } },
  { number: 26, name: 'Molina', attrs: { pace: 16, tackling: 14, stamina: 16 } },
  { number: 13, name: 'Cuti Romero', attrs: { tackling: 17, positioning: 17, strength: 17, aggression: 16 } },
  { number: 19, name: 'Otamendi', attrs: { tackling: 16, strength: 17, aggression: 16, pace: 12 } },
  { number: 3, name: 'Tagliafico', attrs: { pace: 15, tackling: 15, stamina: 16, aggression: 14 } },
  { number: 7, name: 'De Paul', attrs: { stamina: 18, passing: 16, dribbling: 15, tackling: 15, aggression: 15 } },
  { number: 24, name: 'Enzo', attrs: { passing: 17, vision: 18, stamina: 17, finishing: 13 } },
  { number: 20, name: 'Mac Allister', attrs: { passing: 17, vision: 17, finishing: 14, dribbling: 15 } },
  { number: 11, name: 'Di María', attrs: { dribbling: 17, passing: 17, vision: 18, finishing: 15, pace: 15 } },
  { number: 9, name: 'J. Álvarez', attrs: { finishing: 16, dribbling: 16, stamina: 17, vision: 16 } },
  { number: 10, name: 'Messi', attrs: { dribbling: 20, passing: 19, finishing: 18, vision: 20, positioning: 17, pace: 14, strength: 11 } },
]

const ROSTERS: Record<TeamId, Spec[]> = { home: BRASIL, away: ARGENTINA }

export interface SeedPlayer {
  number: number
  name: string
  role: Role
  attrs: Attrs
  formationPos: Vec2
}

/** Gera a lista de jogadores (com atributos finais) para um time. */
export const rosterFor = (team: TeamId): SeedPlayer[] =>
  ROSTERS[team].map((spec, i) => {
    const role = ROLES_433[i]
    return {
      number: spec.number,
      name: spec.name,
      role,
      attrs: { ...baseAttrs(role), ...spec.attrs },
      formationPos: { ...FORMATION_433[i] },
    }
  })
