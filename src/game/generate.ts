import type { Attrs, Role } from '../sim/types'
import { baseAttrs } from '../sim/teams'
import { applyChaos, ATTR_FLOOR, type ChaosCfg, type ChaosSource } from '../sim/chaos'
import type { ClubDef, ClubState, Division, GenPlayer, MarketPlayer } from './types'
import type { WcPlayer } from './worldcupPlayers'
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
  D: 41, // baixo de propósito: com o caos da Série D a nota volta a subir p/ ~50
}

/**
 * Vantagem inicial do elenco do jogador sobre a média da divisão. Garante que o
 * técnico comece com um time um pouco mais forte que os rivais — favorito, mas
 * longe de imbatível.
 */
export const PLAYER_BOOST = 5

/**
 * Caos por divisão: quanto MAIS baixa a divisão, MAIOR o contraste ENTRE os
 * atributos de um mesmo jogador. Na Série D o elenco é cru e irregular — dá pra
 * ter pace 90 e domínio/força 20 no mesmo cara, com a nota média puxada pra baixo
 * pelos muitos "buracos". Na Série A os craques são bem mais completos/equilibrados.
 */
const DIVISION_CHAOS: Record<Division, ChaosCfg> = {
  A: { spread: 1.15, jitter: 7, spikes: 1, spikeBoost: 12, tanks: 1, tankDrop: 12, ceil: 99 },
  B: { spread: 1.35, jitter: 10, spikes: 2, spikeBoost: 16, tanks: 2, tankDrop: 18, ceil: 99 },
  C: { spread: 1.55, jitter: 14, spikes: 2, spikeBoost: 22, tanks: 3, tankDrop: 28, ceil: 99 },
  D: { spread: 1.95, jitter: 20, spikes: 3, spikeBoost: 30, tanks: 5, tankDrop: 44, ceil: 99 },
}

/** Fonte de caos baseada no Rng da carreira (determinística por seed). */
const rngChaosSource = (rng: Rng): ChaosSource => ({
  jitter: () => rng.next() * 2 - 1,
  pickN: (keys, _purpose, n) => {
    const pool = [...keys]
    const out = new Set<keyof Attrs>()
    for (let i = 0; i < n && pool.length > 0; i++) {
      out.add(pool.splice(rng.int(0, pool.length - 1), 1)[0])
    }
    return out
  },
})

/** Composição do elenco: 2 goleiros, 6 zagueiros/laterais, 6 meias, 4 atacantes. */
const SQUAD_SHAPE: Role[] = [
  'GK', 'GK',
  'DEF', 'DEF', 'DEF', 'DEF', 'DEF', 'DEF',
  'MID', 'MID', 'MID', 'MID', 'MID', 'MID',
  'FWD', 'FWD', 'FWD', 'FWD',
]

/** Valor de mercado (R$) derivado da nota e da idade (pico ~24 anos). */
export const valueOf = (overall: number, age: number): number => {
  const base = Math.pow(Math.max(0, overall - 40) / 10, 2.4) * 120_000
  const ageMul = age <= 24 ? 1.15 : age <= 28 ? 1 : age <= 31 ? 0.7 : 0.4
  return Math.round((base * ageMul) / 10_000) * 10_000
}

/**
 * Empurra os atributos de um jogador para um nível-alvo (overall aproximado),
 * preservando o perfil da posição (parte de baseAttrs). `signature` sobrepõe o
 * arquétipo real do jogador (ex.: Vini = pace/drible) — o deslocamento até o
 * alvo é IGUAL para todos os atributos, então o formato sobrevive à escala.
 * Ruído dá variedade.
 */
const scaledAttrs = (role: Role, target: number, rng: Rng, signature?: Partial<Attrs>): Attrs => {
  const a = { ...baseAttrs(role), ...signature }
  // o overall é ~média linear dos atributos: somar `delta` a todos eleva o
  // overall em ~delta. Parte-se do overall REAL da base p/ acertar o alvo.
  const baseOverall = overallOf(role, a)
  const delta = target - baseOverall + rng.gauss() * 3
  for (const k in a) {
    const key = k as keyof Attrs
    a[key] = Math.max(ATTR_FLOOR, Math.min(99, Math.round(a[key] + delta + rng.gauss() * 3)))
  }
  return a
}

let nextId = 1
const freshId = () => nextId++

/** Garante que novos ids não colidam com elencos carregados de um save. */
export const ensureIdAbove = (min: number): void => {
  if (min >= nextId) nextId = min + 1
}

/**
 * Gera um jogador para uma posição num nível-alvo, opcionalmente com caos da
 * divisão. `name` sobrescreve o nome fictício e `signature` dá o arquétipo real
 * de atributos (usados pelas seleções da Copa com elenco REAL).
 */
export const generatePlayer = (
  role: Role,
  target: number,
  number: number,
  rng: Rng,
  chaos?: ChaosCfg,
  name?: string,
  signature?: Partial<Attrs>,
): GenPlayer => {
  const scaled = scaledAttrs(role, target, rng, signature)
  const attrs = chaos ? applyChaos(scaled, role, chaos, rngChaosSource(rng)) : scaled
  // jogador REAL (name): reancora o overall no alvo — o caos vira TEXTURA de
  // atributos (picos/buracos), não loteria de qualidade. Sem isso a hierarquia
  // real do elenco (Vini > Wendell) se perdia no sorteio do caos.
  if (name) {
    const drift = target + rng.gauss() * 2 - overallOf(role, attrs)
    for (const k in attrs) {
      const key = k as keyof Attrs
      attrs[key] = Math.max(ATTR_FLOOR, Math.min(99, Math.round(attrs[key] + drift)))
    }
  }
  const overall = overallOf(role, attrs)
  const age = rng.int(17, 34)
  return {
    id: freshId(),
    name: name ?? makeName(rng.int(0, FIRST_COUNT - 1), rng.int(0, LAST_COUNT - 1)),
    number,
    role,
    age,
    attrs,
    overall,
    value: valueOf(overall, age),
  }
}

/**
 * Gera um elenco a partir de um "molde" de posições (ordem livre) num nível-alvo,
 * com números de camisa únicos. Base compartilhada por `generateSquad` (elenco de
 * divisão) e por qualquer outro modo que precise gerar jogadores em lote (ex.: o
 * modo roguelike gera o elenco inicial e os adversários do mapa com isto).
 * `roster` (paralelo a `shape`) traz os jogadores REAIS das seleções da Copa:
 * nome, delta de qualidade e (quando há arquétipo) assinatura + camisa reais.
 * Os deltas são CENTRALIZADOS (menos a média do time), então a hierarquia entre
 * companheiros é a real e a média do elenco fica exatamente no `level`.
 */
export const generateSquadShaped = (
  shape: Role[],
  level: number,
  chaos: ChaosCfg,
  rng: Rng,
  roster?: WcPlayer[],
): GenPlayer[] => {
  const used = new Set<number>(roster?.flatMap((p) => (p.number != null ? [p.number] : [])) ?? [])
  const pickNumber = (): number => {
    let n = rng.int(1, 39)
    while (used.has(n)) n = rng.int(1, 39)
    used.add(n)
    return n
  }
  const meanDelta = roster ? roster.reduce((s, p) => s + p.delta, 0) / roster.length : 0
  return shape.map((role, i) => {
    const real = roster?.[i]
    const target = level + (real ? real.delta - meanDelta : rng.gauss() * 5)
    return generatePlayer(role, target, real?.number ?? pickNumber(), rng, chaos, real?.name, real?.attrs)
  })
}

/** Gera o elenco completo de um clube no nível da sua divisão (+ boost opcional). */
export const generateSquad = (division: Division, rng: Rng, boost = 0): GenPlayer[] =>
  generateSquadShaped(SQUAD_SHAPE, DIVISION_LEVEL[division] + boost, DIVISION_CHAOS[division], rng)

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
  const chaos = DIVISION_CHAOS[division]
  const roles: Role[] = ['GK', 'DEF', 'DEF', 'MID', 'MID', 'FWD', 'FWD', 'DEF', 'MID', 'FWD']
  return Array.from({ length: count }, (_, i) => {
    // o mercado oferece de reforços medianos a craques acima da divisão
    const target = level + rng.range(-4, 12)
    const p = generatePlayer(roles[i % roles.length], target, rng.int(1, 39), rng, chaos)
    return { ...p, fee: Math.max(50_000, Math.round(p.value * rng.range(0.9, 1.25))) }
  })
}
