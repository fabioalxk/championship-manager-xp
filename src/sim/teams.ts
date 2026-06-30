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
export const FORMATION_433: Vec2[] = [
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

export const ROLES_433: Role[] = [
  'GK', 'DEF', 'DEF', 'DEF', 'DEF', 'MID', 'MID', 'MID', 'FWD', 'FWD', 'FWD',
]

/** Base de atributos por posição (escala 0..100); cada jogador sobrescreve o que se destaca. */
export const baseAttrs = (role: Role): Attrs => {
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

/** Brasil — ordem segue FORMATION_433. Cada jogador é um ARQUÉTIPO: forças E
 *  fraquezas reais (não "bom em tudo"). Vini é o diferenciado da equipe. */
const BRASIL: Spec[] = [
  { number: 1, name: 'Alisson', attrs: { goalkeeping: 95, positioning: 90, strength: 75, reflexes: 90, handling: 88, aerialReach: 86, oneOnOne: 86, kicking: 82, throwing: 78, communication: 84, composure: 92, agility: 80, jumping: 80 } },
  // lateral veterano: inteligente, mas perdendo o pique e sem peso ofensivo
  { number: 2, name: 'Danilo', attrs: { tackling: 76, marking: 78, positioning: 82, pace: 64, acceleration: 60, passing: 72, crossing: 62, teamwork: 78, decisions: 78, stamina: 62, dribbling: 54, finishing: 28, longShots: 32, flair: 36 } },
  // zagueiro-líder: leitura e saída de bola de elite, nulo no ataque
  { number: 4, name: 'Marquinhos', attrs: { tackling: 86, marking: 88, positioning: 92, pace: 80, strength: 78, heading: 78, composure: 86, anticipation: 88, passing: 74, dribbling: 58, finishing: 26, longShots: 28, crossing: 30, flair: 32 } },
  // muralha canhota: forte e bom de cabeça, MUITO lento e tosco com a bola
  { number: 3, name: 'Gabriel M.', attrs: { tackling: 84, marking: 82, strength: 90, aggression: 70, heading: 86, bravery: 84, pace: 58, acceleration: 56, agility: 46, dribbling: 38, passing: 56, technique: 44, finishing: 24, longShots: 22, composure: 56 } },
  // lateral-ala: pace e cruzamento, FRACO defensivamente e no jogo aéreo
  { number: 6, name: 'Wendell', attrs: { pace: 82, acceleration: 80, stamina: 86, dribbling: 68, passing: 70, crossing: 78, workRate: 80, tackling: 54, marking: 52, heading: 40, strength: 52, finishing: 38, positioning: 52 } },
  // volante destruidor: rouba e impõe físico, porém LENTO e travado tecnicamente
  { number: 5, name: 'Casemiro', attrs: { tackling: 90, marking: 86, strength: 90, positioning: 90, aggression: 82, vision: 72, passing: 74, bravery: 86, teamwork: 80, longShots: 72, heading: 80, pace: 56, acceleration: 52, agility: 44, dribbling: 48, firstTouch: 56 } },
  // box-to-box completo: o equilibrado do time (poucas fraquezas, nada de elite)
  { number: 8, name: 'Bruno G.', attrs: { passing: 86, vision: 84, stamina: 90, dribbling: 76, tackling: 78, workRate: 86, longShots: 76, technique: 80, composure: 76, pace: 66, finishing: 56, heading: 52 } },
  // camisa 10 de flair: técnica e visão, mas some na marcação e é inconstante
  { number: 10, name: 'Paquetá', attrs: { dribbling: 86, passing: 82, vision: 86, finishing: 62, flair: 86, technique: 86, firstTouch: 84, composure: 70, pace: 68, tackling: 38, marking: 36, strength: 50, heading: 42, workRate: 54, consistency: 46 } },
  // ponta-flecha: veloz e driblador, ZERO defesa e fraco no físico/aéreo
  { number: 19, name: 'Raphinha', attrs: { pace: 88, acceleration: 86, dribbling: 86, finishing: 76, passing: 72, crossing: 86, flair: 82, longShots: 76, agility: 86, offTheBall: 76, heading: 36, strength: 50, tackling: 30, marking: 28, composure: 62 } },
  // joia crua: letal e veloz, mas verde de decisão/passe/sangue-frio
  { number: 9, name: 'Endrick', attrs: { pace: 90, acceleration: 88, finishing: 86, dribbling: 80, strength: 66, offTheBall: 82, heading: 72, agility: 82, anticipation: 70, passing: 42, vision: 44, decisions: 46, composure: 50, consistency: 46, tackling: 22, workRate: 52, technique: 64 } },
  // O DIFERENCIADO: pace/drible irreais e flair absurdo — mas finaliza só "bem",
  // não marca, é fraco no alto/físico e ainda decide mal sob pressão
  { number: 7, name: 'Vini Jr.', attrs: { pace: 97, acceleration: 96, dribbling: 96, finishing: 72, stamina: 82, flair: 92, agility: 94, offTheBall: 80, technique: 86, crossing: 70, passing: 66, heading: 32, strength: 54, tackling: 20, marking: 22, composure: 58, decisions: 56, consistency: 56 } },
]

/** Argentina — ordem segue FORMATION_433. Mesma ideia: arquétipos plurais.
 *  Messi é o diferenciado: técnico/mental de outro planeta, físico mínimo. */
const ARGENTINA: Spec[] = [
  { number: 23, name: 'Dibu', attrs: { goalkeeping: 90, positioning: 85, aggression: 72, reflexes: 86, handling: 84, aerialReach: 82, oneOnOne: 92, kicking: 78, throwing: 72, communication: 82, composure: 92, agility: 78, jumping: 78 } },
  // lateral motor: pace e fôlego, limitado tecnicamente e na finalização
  { number: 26, name: 'Molina', attrs: { pace: 84, acceleration: 82, tackling: 72, stamina: 84, marking: 72, crossing: 74, workRate: 82, dribbling: 62, passing: 62, finishing: 36, technique: 56, heading: 46, composure: 56 } },
  // zagueiro brigão: marcação e raça de elite, tosco com a bola
  { number: 13, name: 'Cuti Romero', attrs: { tackling: 88, marking: 88, positioning: 86, strength: 88, aggression: 88, heading: 82, bravery: 86, anticipation: 82, pace: 72, composure: 70, dribbling: 50, passing: 62, technique: 50, finishing: 26, flair: 32 } },
  // veterano-bloco: MUITO lento, mas parede física e aérea, decisivo na raça
  { number: 19, name: 'Otamendi', attrs: { tackling: 82, marking: 80, strength: 90, aggression: 88, pace: 50, acceleration: 48, agility: 40, heading: 86, bravery: 88, dribbling: 36, technique: 40, passing: 56, finishing: 22, composure: 58, consistency: 56 } },
  // lateral regular: sólido e equilibrado, sem grande ponto fora da curva
  { number: 3, name: 'Tagliafico', attrs: { pace: 74, tackling: 78, stamina: 84, aggression: 72, marking: 78, crossing: 70, dribbling: 56, passing: 66, finishing: 36, heading: 56, flair: 42, strength: 64 } },
  // motor incansável: pega, corre e briga 90', sem refino de finalização/aéreo
  { number: 7, name: 'De Paul', attrs: { stamina: 94, passing: 80, dribbling: 78, tackling: 78, aggression: 80, workRate: 92, teamwork: 86, technique: 78, pace: 72, vision: 74, finishing: 52, heading: 46, longShots: 66 } },
  // volante-criador: passe e leitura excelentes, NÃO é rápido nem físico
  { number: 24, name: 'Enzo', attrs: { passing: 88, vision: 88, stamina: 86, finishing: 62, technique: 82, longShots: 80, decisions: 86, composure: 80, pace: 60, acceleration: 58, tackling: 62, strength: 56, dribbling: 70, heading: 48, agility: 58 } },
  // meia inteligente: técnica e chute de fora, mediano fisicamente
  { number: 20, name: 'Mac Allister', attrs: { passing: 86, vision: 84, finishing: 70, dribbling: 78, technique: 84, longShots: 80, composure: 84, decisions: 82, pace: 62, tackling: 66, strength: 54, heading: 46, stamina: 82 } },
  // bruxo veterano: pés mágicos, mas o físico FOI embora e não defende
  { number: 11, name: 'Di María', attrs: { dribbling: 86, passing: 86, vision: 90, finishing: 76, pace: 70, acceleration: 66, crossing: 90, flair: 90, technique: 88, longShots: 84, agility: 82, offTheBall: 76, stamina: 60, strength: 40, tackling: 28, marking: 28, heading: 36, consistency: 58 } },
  // 9 moderno e móvel: completo e trabalhador, fraco no alto e no corpo
  { number: 9, name: 'J. Álvarez', attrs: { finishing: 84, dribbling: 80, stamina: 90, vision: 80, offTheBall: 88, workRate: 88, anticipation: 82, pace: 80, acceleration: 82, passing: 72, technique: 78, composure: 78, heading: 56, strength: 56, tackling: 44 } },
  // O DIFERENCIADO: drible/passe/visão/técnica sobrenaturais — porém físico
  // mínimo (frágil, devagar, sem fôlego) e não corre nem marca um lance
  { number: 10, name: 'Messi', attrs: { dribbling: 99, passing: 97, finishing: 92, vision: 99, positioning: 80, pace: 70, acceleration: 68, strength: 40, flair: 99, technique: 99, firstTouch: 98, composure: 97, longShots: 88, decisions: 97, offTheBall: 86, agility: 86, stamina: 56, workRate: 28, tackling: 20, marking: 22, heading: 44, aggression: 32, jumping: 44 } },
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
