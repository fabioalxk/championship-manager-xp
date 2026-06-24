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

/** Base de atributos por posição (escala 0..100); cada jogador sobrescreve o que se destaca. */
const baseAttrs = (role: Role): Attrs => {
  const b: Attrs = {
    // físico
    pace: 65, acceleration: 65, agility: 62, balance: 62, jumping: 60,
    strength: 65, stamina: 70, naturalFitness: 70, workRate: 65,
    // técnico
    dribbling: 60, firstTouch: 62, technique: 62, passing: 65, crossing: 55,
    finishing: 50, longShots: 52, heading: 55, tackling: 60, marking: 60,
    // mental
    vision: 63, anticipation: 62, positioning: 64, offTheBall: 60, decisions: 62,
    composure: 58, concentration: 62, consistency: 62, aggression: 60,
    bravery: 62, teamwork: 64, flair: 55,
    // reflexo: reação para tocar/chutar de primeira — atributo de TODOS (item: reflexos 0..100)
    reflexes: 60,
    // goleiro (jogador de linha quase não usa o resto)
    goalkeeping: 15, handling: 20, aerialReach: 25, oneOnOne: 20,
    kicking: 45, throwing: 35, communication: 45,
  }
  if (role === 'GK')
    return {
      ...b, goalkeeping: 78, tackling: 30, finishing: 20, marking: 35,
      reflexes: 75, handling: 72, aerialReach: 70, oneOnOne: 68,
      kicking: 70, throwing: 65, communication: 72, composure: 70,
      agility: 70, acceleration: 62, jumping: 70,
    }
  if (role === 'DEF')
    return { ...b, tackling: 78, marking: 76, positioning: 78, strength: 76, heading: 70, bravery: 72 }
  if (role === 'MID')
    return { ...b, passing: 72, stamina: 78, workRate: 75, vision: 70, teamwork: 72 }
  // FWD
  return { ...b, finishing: 78, pace: 80, dribbling: 78, offTheBall: 75, longShots: 68 }
}

interface Spec {
  number: number
  name: string
  attrs: Partial<Attrs>
}

/** Brasil — ordem segue FORMATION_433. */
const BRASIL: Spec[] = [
  { number: 1, name: 'Alisson', attrs: { goalkeeping: 95, positioning: 90, strength: 75, reflexes: 90, handling: 86, aerialReach: 86, oneOnOne: 86, kicking: 82, throwing: 78, communication: 84, composure: 90, agility: 80, jumping: 80 } },
  { number: 2, name: 'Danilo', attrs: { tackling: 76, marking: 78, positioning: 80, pace: 72, passing: 72, crossing: 66, teamwork: 74 } },
  { number: 4, name: 'Marquinhos', attrs: { tackling: 86, marking: 88, positioning: 90, pace: 78, strength: 80, heading: 78, composure: 82, anticipation: 82 } },
  { number: 3, name: 'Gabriel M.', attrs: { tackling: 82, marking: 80, strength: 86, aggression: 66, heading: 80, bravery: 80 } },
  { number: 6, name: 'Wendell', attrs: { pace: 78, stamina: 82, dribbling: 66, passing: 72, crossing: 74, workRate: 76 } },
  { number: 5, name: 'Casemiro', attrs: { tackling: 86, marking: 82, strength: 86, positioning: 86, aggression: 76, vision: 76, passing: 76, bravery: 82, teamwork: 80, longShots: 72 } },
  { number: 8, name: 'Bruno G.', attrs: { passing: 86, vision: 86, stamina: 86, dribbling: 76, tackling: 76, workRate: 82, longShots: 74, technique: 78 } },
  { number: 10, name: 'Paquetá', attrs: { dribbling: 82, passing: 82, vision: 86, finishing: 66, flair: 80, technique: 82, firstTouch: 80 } },
  { number: 19, name: 'Raphinha', attrs: { pace: 86, dribbling: 86, finishing: 76, passing: 76, crossing: 82, flair: 78, longShots: 74 } },
  { number: 9, name: 'Endrick', attrs: { pace: 86, finishing: 82, dribbling: 80, strength: 70, offTheBall: 78, heading: 72 } },
  { number: 7, name: 'Vini Jr.', attrs: { pace: 96, acceleration: 94, dribbling: 95, finishing: 76, stamina: 80, flair: 88, agility: 90, offTheBall: 80, technique: 84 } },
]

/** Argentina — ordem segue FORMATION_433. */
const ARGENTINA: Spec[] = [
  { number: 23, name: 'Dibu', attrs: { goalkeeping: 90, positioning: 85, aggression: 70, reflexes: 86, handling: 82, aerialReach: 82, oneOnOne: 90, kicking: 78, throwing: 72, communication: 82, composure: 90, agility: 78, jumping: 78 } },
  { number: 26, name: 'Molina', attrs: { pace: 82, tackling: 72, stamina: 82, marking: 72, crossing: 74, workRate: 78 } },
  { number: 13, name: 'Cuti Romero', attrs: { tackling: 86, marking: 86, positioning: 85, strength: 86, aggression: 82, heading: 80, bravery: 82, anticipation: 80 } },
  { number: 19, name: 'Otamendi', attrs: { tackling: 82, marking: 80, strength: 86, aggression: 82, pace: 62, heading: 82, bravery: 84 } },
  { number: 3, name: 'Tagliafico', attrs: { pace: 76, tackling: 76, stamina: 82, aggression: 70, marking: 74, crossing: 72 } },
  { number: 7, name: 'De Paul', attrs: { stamina: 90, passing: 82, dribbling: 78, tackling: 76, aggression: 76, workRate: 88, teamwork: 82, technique: 78 } },
  { number: 24, name: 'Enzo', attrs: { passing: 86, vision: 90, stamina: 86, finishing: 66, technique: 82, longShots: 78, decisions: 82 } },
  { number: 20, name: 'Mac Allister', attrs: { passing: 86, vision: 84, finishing: 72, dribbling: 78, technique: 82, longShots: 78, composure: 80 } },
  { number: 11, name: 'Di María', attrs: { dribbling: 86, passing: 86, vision: 90, finishing: 76, pace: 76, crossing: 86, flair: 86, technique: 86, longShots: 80 } },
  { number: 9, name: 'J. Álvarez', attrs: { finishing: 82, dribbling: 80, stamina: 86, vision: 80, offTheBall: 84, workRate: 84, anticipation: 80 } },
  { number: 10, name: 'Messi', attrs: { dribbling: 99, passing: 96, finishing: 92, vision: 99, positioning: 86, pace: 72, strength: 55, flair: 99, technique: 99, firstTouch: 96, composure: 95, longShots: 88, decisions: 95, offTheBall: 88, agility: 88 } },
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
