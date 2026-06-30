import type { ClubState, GenPlayer } from './types'

/** Melhor goleiro + 10 melhores jogadores de linha (escalação implícita). */
export const bestEleven = (squad: GenPlayer[]): GenPlayer[] => {
  const gks = squad.filter((p) => p.role === 'GK').sort((a, b) => b.overall - a.overall)
  const outs = squad.filter((p) => p.role !== 'GK').sort((a, b) => b.overall - a.overall)
  const eleven: GenPlayer[] = []
  if (gks[0]) eleven.push(gks[0])
  eleven.push(...outs.slice(0, 11 - eleven.length))
  return eleven
}

/** Força do time 0..100 = média da melhor escalação. */
export const teamStrength = (club: ClubState): number => {
  const xi = bestEleven(club.squad)
  if (xi.length === 0) return 40
  return xi.reduce((s, p) => s + p.overall, 0) / xi.length
}
