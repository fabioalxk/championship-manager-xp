import { useState } from 'react'

/** O mínimo que o badge precisa — casa com ClubDef e ClubState. */
export interface BadgeClub {
  id: string
  short: string
  shirt: string
  text: string
  /** caminho do SVG da bandeira (seleções) — quando presente, substitui o escudo/sigla.
   *  É um arquivo local (não emoji): o emoji de bandeira não renderiza de forma
   *  confiável em todo SO/navegador (vira sigla de 2 letras em várias combinações). */
  flag?: string
}

/**
 * Escudo do clube (`/crests/<id>.png`, baixado por tools/download-crests.mjs).
 * Se a imagem faltar/falhar, cai para a sigla sobre a cor do clube — assim
 * nenhuma tela quebra mesmo sem o escudo (ex.: clube novo sem arquivo).
 * Times com `flag` (seleções) pulam o escudo e mostram a bandeira (SVG) direto.
 */
export function ClubBadge({
  club,
  size = 24,
  className = '',
}: {
  club: BadgeClub
  size?: number
  className?: string
}) {
  const [failed, setFailed] = useState(false)
  const box = { width: size, height: size }

  if (club.flag)
    return (
      <span className={`cm-crest cm-crest-flag ${className}`} style={box}>
        <img className="cm-crest-flag-img" src={club.flag} alt={club.short} loading="lazy" />
      </span>
    )

  if (failed)
    return (
      <span
        className={`cm-crest cm-crest-fallback ${className}`}
        style={{ ...box, background: club.shirt, color: club.text, fontSize: Math.round(size * 0.38) }}
      >
        {club.short}
      </span>
    )

  return (
    <img
      className={`cm-crest ${className}`}
      style={box}
      src={`/crests/${club.id}.png`}
      alt={club.short}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  )
}
