import type { Fixture, Standing } from './types'

/**
 * Gera o calendário de pontos corridos (turno e returno) pelo método do círculo.
 * Requer número PAR de clubes. Resultado: 2*(n-1) rodadas, todos x todos 2x.
 */
export const buildFixtures = (clubIds: string[]): Fixture[] => {
  const ids = [...clubIds]
  const n = ids.length
  const rounds = n - 1
  const half = n / 2
  const fixtures: Fixture[] = []

  // turno (returno é o espelho com mando invertido)
  const arr = [...ids]
  for (let r = 0; r < rounds; r++) {
    for (let i = 0; i < half; i++) {
      const a = arr[i]
      const b = arr[n - 1 - i]
      // alterna mando por rodada p/ equilibrar casa/fora
      const home = (r + i) % 2 === 0 ? a : b
      const away = home === a ? b : a
      fixtures.push({ round: r + 1, homeId: home, awayId: away, played: false, homeGoals: 0, awayGoals: 0 })
      fixtures.push({ round: r + 1 + rounds, homeId: away, awayId: home, played: false, homeGoals: 0, awayGoals: 0 })
    }
    // rotaciona mantendo o primeiro fixo
    arr.splice(1, 0, arr.pop()!)
  }
  return fixtures
}

export const totalRounds = (n: number): number => 2 * (n - 1)

/** Calcula a classificação a partir das partidas já jogadas. */
export const computeStandings = (clubIds: string[], fixtures: Fixture[]): Standing[] => {
  const table: Record<string, Standing> = {}
  for (const id of clubIds) {
    table[id] = { clubId: id, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, pts: 0 }
  }
  for (const f of fixtures) {
    if (!f.played) continue
    const h = table[f.homeId]
    const a = table[f.awayId]
    if (!h || !a) continue
    h.played++; a.played++
    h.gf += f.homeGoals; h.ga += f.awayGoals
    a.gf += f.awayGoals; a.ga += f.homeGoals
    if (f.homeGoals > f.awayGoals) { h.won++; h.pts += 3; a.lost++ }
    else if (f.homeGoals < f.awayGoals) { a.won++; a.pts += 3; h.lost++ }
    else { h.drawn++; a.drawn++; h.pts++; a.pts++ }
  }
  return Object.values(table).sort(sortStanding)
}

const gd = (s: Standing) => s.gf - s.ga

/** Ordena por pontos, saldo, gols pró e nome (estável). */
export const sortStanding = (a: Standing, b: Standing): number =>
  b.pts - a.pts || gd(b) - gd(a) || b.gf - a.gf || a.clubId.localeCompare(b.clubId)

/** Posição (1-based) de um clube na classificação ordenada. */
export const positionOf = (standings: Standing[], clubId: string): number =>
  standings.findIndex((s) => s.clubId === clubId) + 1
