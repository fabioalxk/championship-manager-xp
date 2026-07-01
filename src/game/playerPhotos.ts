import { WC_ROSTERS } from './worldcupPlayers'
import { slug } from './slug'

/**
 * Seleções com fotos reais baixadas em `public/players/<id>/<slug>.png`
 * (ver `tools/download-player-photos.mjs`). Só a seleção brasileira por
 * enquanto — as demais continuam sem foto (fallback de iniciais).
 */
const PHOTO_TEAMS = ['brasil']

const ROSTER_SLUGS: Record<string, Set<string>> = Object.fromEntries(
  PHOTO_TEAMS.map((teamId) => [teamId, new Set(WC_ROSTERS[teamId].map(([name]) => slug(name)))])
)

/** URL da foto do jogador se ele fizer parte de um elenco real com fotos baixadas. */
export function getPlayerPhotoUrl(teamId: string | undefined, name: string): string | undefined {
  const roster = teamId && ROSTER_SLUGS[teamId]
  if (!roster) return undefined
  const key = slug(name)
  return roster.has(key) ? `/players/${teamId}/${key}.png` : undefined
}
