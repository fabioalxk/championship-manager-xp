import { useState } from 'react'
import { getPlayerPhotoUrl } from '../game/playerPhotos'
import { GeneratedFace } from './generatedFace'

/**
 * Foto do jogador (`/players/<teamId>/<slug>.png`, baixada por
 * tools/download-player-photos.mjs) quando ele faz parte de um elenco real
 * com fotos baixadas (hoje só a seleção brasileira). Sem foto ou em caso de
 * erro de carregamento, cai para um rosto cartoon gerado a partir do `id` do
 * jogador — assim todo jogador tem uma cara, real ou não, e nenhuma tela
 * quebra por falta de arquivo.
 */
export function PlayerAvatar({
  teamId,
  name,
  id,
  size = 28,
  className = '',
}: {
  teamId: string | undefined
  name: string
  id: number
  size?: number
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const box = { width: size, height: size }
  const src = getPlayerPhotoUrl(teamId, name)

  if (!src || failed)
    return (
      <span className={`cm-player-avatar cm-player-avatar-fallback ${className}`} style={box}>
        <GeneratedFace seed={id} size={size} />
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
