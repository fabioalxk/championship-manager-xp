/**
 * Rosto cartoon gerado por seed (o `id` do jogador) — usado como avatar de
 * todo jogador fictício (comprado, ganho em partida, etc.) que não tem foto
 * real. Mesmo `id` sempre desenha o mesmo rosto, então cada jogador mantém a
 * "cara" dele durante a partida/carreira.
 */
const SKIN_TONES = ['#f2c9a1', '#e0ac69', '#c68642', '#8d5524', '#5c3a21']
const HAIR_COLORS = ['#1b1b1b', '#3b2414', '#6b4423', '#caa66b', '#8a8a8a']
const HAIR_STYLES = ['bald', 'short', 'curly', 'afro', 'mohawk'] as const
const MOUTHS = ['smile', 'neutral', 'open'] as const

// PRNG determinístico simples (mulberry32) — mesmo seed sempre gera o mesmo rosto.
const mulberry32 = (seed: number) => {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const pick = <T,>(rand: () => number, arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)]

export function GeneratedFace({ seed, size }: { seed: number; size: number }) {
  const rand = mulberry32(seed)
  const skin = pick(rand, SKIN_TONES)
  const hair = pick(rand, HAIR_COLORS)
  const hairStyle = pick(rand, HAIR_STYLES)
  const mouth = pick(rand, MOUTHS)
  const beard = rand() < 0.22

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden focusable="false">
      {hairStyle === 'afro' && <circle cx={50} cy={42} r={44} fill={hair} />}
      {beard && <ellipse cx={50} cy={80} rx={27} ry={20} fill={hair} />}
      <circle cx={50} cy={54} r={36} fill={skin} />
      {hairStyle === 'short' && <ellipse cx={50} cy={26} rx={34} ry={20} fill={hair} />}
      {hairStyle === 'curly' && (
        <>
          <circle cx={26} cy={30} r={14} fill={hair} />
          <circle cx={50} cy={22} r={16} fill={hair} />
          <circle cx={74} cy={30} r={14} fill={hair} />
        </>
      )}
      {hairStyle === 'mohawk' && <path d="M42 8 L58 8 L54 36 L46 36 Z" fill={hair} />}
      <rect x={30} y={44} width={12} height={3} rx={1.5} fill={hair} />
      <rect x={58} y={44} width={12} height={3} rx={1.5} fill={hair} />
      <circle cx={38} cy={52} r={4} fill="#20232b" />
      <circle cx={62} cy={52} r={4} fill="#20232b" />
      {mouth === 'smile' && (
        <path d="M36 64 Q50 74 64 64" stroke="#5c3a21" strokeWidth={3} fill="none" strokeLinecap="round" />
      )}
      {mouth === 'neutral' && <line x1={38} y1={66} x2={62} y2={66} stroke="#5c3a21" strokeWidth={3} strokeLinecap="round" />}
      {mouth === 'open' && <ellipse cx={50} cy={66} rx={8} ry={6} fill="#7a2f2f" />}
    </svg>
  )
}
