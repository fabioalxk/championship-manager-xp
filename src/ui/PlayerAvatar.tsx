import { useState } from 'react'
import { getPlayerPhotoUrl } from '../game/playerPhotos'

/**
 * Foto do jogador (`/players/<teamId>/<slug>.png`, baixada por
 * tools/download-player-photos.mjs) quando ele faz parte de um elenco real
 * com fotos baixadas (hoje só a seleção brasileira). Sem foto ou em caso de
 * erro de carregamento, cai para as iniciais do nome sobre um fundo neutro —
 * nenhuma tela quebra por falta de arquivo.
 */
export function PlayerAvatar({
  teamId,
  name,
  size = 28,
  className = '',
}: {
  teamId: string | undefined
  name: string
  size?: number
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const box = { width: size, height: size }
  const src = getPlayerPhotoUrl(teamId, name)

  if (!src || failed)
    return (
      <span
        className={`cm-player-avatar cm-player-avatar-fallback ${className}`}
        style={{ ...box, fontSize: Math.round(size * 0.4) }}
      >
        {initials(name)}
      </span>
    )

  return (
    <img
      className={`cm-player-avatar ${className}`}
      style={box}
      src={src}
      alt={name}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}

const initials = (name: string): string =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
