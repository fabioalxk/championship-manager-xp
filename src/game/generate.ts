import type { Attrs, Role } from '../sim/types'
import { baseAttrs } from '../sim/teams'
import type { ClubDef, ClubState, Division, GenPlayer, MarketPlayer } from './types'
import { makeName, FIRST_COUNT, LAST_COUNT } from './names'
import { overallOf } from './overall'
import type { Rng } from './random'

/**
 * Nível médio de overall esperado por divisão (A é a elite). A faixa é COMPRIMIDA
 * de propósito (76→62 em vez de 78→56): no motor físico os gols escalam com o
 * talento ABSOLUTO, então elencos muito fracos (Série D antiga, 56) mal criavam
 * chances. Aproximar as divisões mantém ~3 gols/jogo em TODAS elas sem deixar a
 * elite exagerar — preservando ainda um gradiente perceptível de qualidade.
 */
export const DIVISION_LEVEL: Record<Division, number> = {
  A: 76,
  B: 71,
  C: 67,
  D: 64,
}

/**
 * Vantagem inicial do elenco do jogador sobre a média da divisão. Garante que o
 * técnico comece com um time um pouco mais forte que os rivais — favorito, mas
 * longe de imbatível.
 */
export const PLAYER_BOOST = 5

/** Composição do elenco: 2 goleiros, 6 zagueiros/laterais, 6 meias, 4 atacantes. */
const SQUAD_SHAPE: Role[] = [
  'GK', 'GK',
  'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF',
  'MID', 'MID', 'MID', 'MID', 'MID', 'MID',
  'FWD', 'FWD', 'FWD', 'FWD',
]

/** Valor de mercado (R$) derivado da nota e da idade (pico ~24 anos). */
const valueOf = (overall: number, age: number): number => {
  const base = Math.pow(Math.max(0, overall - 40) / 10, 2.4) * 120_000
  const ageMul = age <= 24 ? 1.15 : age <= 28 ? 1 : age <= 31 ? 0.7 : 0.4
  return Math.round((base * ageMul) / 10_000) * 10_000
}

/**
 * Empurra os atributos de um jogador para um nível-alvo (overall aproximado),
 * preservando o perfil da posição (parte de baseAttrs). Ruído dá variedade.
 */
const scaledAttrs = (role: Role, target: number, rng: Rng): Attrs => {
  const a = { ...baseAttrs(role) }
  // o overall é ~média linear dos atributos: somar `delta` a todos eleva o
  // overall em ~delta. Parte-se do overall REAL da base p/ acertar o alvo.
  const baseOverall = overallOf(role, a)
  const delta = target - baseOverall + rng.gauss() * 3
  for (const k in a) {
    const key = k as keyof Attrs
    a[key] = Math.max(1, Math.min(99, Math.round(a[key] + delta + rng.gauss() * 3)))
  }
  return a
}

let nextId = 1
const freshId = () => nextId++

/** Garante que novos ids não colidam com elencos carregados de um save. */
export const ensureIdAbove = (min: number): void => {
  if (min >= nextId) nextId = min + 1
}

/** Gera um jogador para uma posição num nível-alvo. */
export const generatePlayer = (
  role: Role,
  target: number,
  number: number,
  rng: Rng,
): GenPlayer => {
  const attrs = scaledAttrs(role, target, rng)
  const overall = overallOf(role, attrs)
  const age = rng.int(17, 34)
  return {
    id: freshId(),
    name: makeName(rng.int(0, FIRST_COUNT - 1), rng.int(0, LAST_COUNT - 1)),
    number,
    role,
    age,
    attrs,
    overall,
    value: valueOf(overall, age),
  }
}

/** Gera o elenco completo de um clube no nível da sua divisão (+ boost opcional). */
export const generateSquad = (division: Division, rng: Rng, boost = 0): GenPlayer[] => {
  const level = DIVISION_LEVEL[division] + boost
  const used = new Set<number>()
  const pickNumber = (): number => {
    let n = rng.int(1, 39)
    while (used.has(n)) n = rng.int(1, 39)
    used.add(n)
    return n
  }
  return SQUAD_SHAPE.map((role) =>
    generatePlayer(role, level + rng.gauss() * 5, pickNumber(), rng),
  )
}

/**
 * Monta o estado de um clube (identidade real + elenco gerado). `boost` eleva o
 * nível do elenco — usado para o clube do jogador começar à frente dos rivais.
 */
export const generateClub = (
  def: ClubDef,
  division: Division,
  rng: Rng,
  boost = 0,
): ClubState => ({
  id: def.id,
  name: def.name,
  short: def.short,
  shirt: def.shirt,
  text: def.text,
  squad: generateSquad(division, rng, boost),
})

/** Gera jogadores disponíveis no mercado (free agents) com taxa de contratação. */
export const generateMarket = (division: Division, count: number, rng: Rng): MarketPlayer[] => {
  const level = DIVISION_LEVEL[division]
  const roles: Role[] = ['GK', 'DEF', 'DEF', 'MID', 'MID', 'FWD', 'FWD', 'DEF', 'MID', 'FWD']
  return Array.from({ length: count }, (_, i) => {
    // o mercado oferece de reforços medianos a craques acima da divisão
    const target = level + rng.range(-4, 12)
    const p = generatePlayer(roles[i % roles.length], target, rng.int(1, 39), rng)
    return { ...p, fee: Math.max(50_000, Math.round(p.value * rng.range(0.9, 1.25))) }
  })
}
