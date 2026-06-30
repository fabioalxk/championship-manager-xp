import type { Role } from '../sim/types'
import { FORMATION_433, ROLES_433, type SeedPlayer } from '../sim/teams'
import type { GenPlayer } from './types'

/**
 * Monta a escalação 4-3-3 (11 SeedPlayer para o motor animado) a partir do
 * elenco: melhor goleiro + melhores jogadores por posição, encaixados nos slots
 * da formação. Faltando jogadores de uma posição, completa com os melhores
 * restantes (qualquer um) — o motor sempre recebe 11 botões.
 */
export const lineupFor = (squad: GenPlayer[]): SeedPlayer[] => {
  const byRole: Record<Role, GenPlayer[]> = { GK: [], DEF: [], MID: [], FWD: [] }
  for (const p of squad) byRole[p.role].push(p)
  for (const r of Object.keys(byRole) as Role[]) byRole[r].sort((a, b) => b.overall - a.overall)

  const used = new Set<number>()
  const pickFor = (role: Role): GenPlayer => {
    const fromRole = byRole[role].find((p) => !used.has(p.id))
    const chosen =
      fromRole ?? [...squad].sort((a, b) => b.overall - a.overall).find((p) => !used.has(p.id))!
    used.add(chosen.id)
    return chosen
  }

  return ROLES_433.map((role, i) => {
    const p = pickFor(role)
    return {
      number: p.number,
      name: p.name,
      role,
      attrs: p.attrs,
      formationPos: { ...FORMATION_433[i] },
    }
  })
}
