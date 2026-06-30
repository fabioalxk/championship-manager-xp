/**
 * Resolve conflito de uniformes: se mandante e visitante têm cores parecidas,
 * o VISITANTE troca para um uniforme reserva (sua 2ª cor, ou branco/preto — o
 * que tiver mais contraste), como no futebol real. Garante diferenciar os times
 * em campo.
 */

export interface Kit {
  shirt: string
  text: string
}

const rgb = (hex: string): [number, number, number] => {
  const h = hex.replace('#', '')
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ]
}

/** Distância euclidiana entre duas cores (0 = idênticas, ~441 = máx). */
const colorDist = (a: string, b: string): number => {
  const [r1, g1, b1] = rgb(a)
  const [r2, g2, b2] = rgb(b)
  return Math.hypot(r1 - r2, g1 - g2, b1 - b2)
}

/** Luminância simples (0..1) para escolher texto claro/escuro. */
const isLight = (hex: string): boolean => {
  const [r, g, b] = rgb(hex)
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6
}

/** Cor de número legível sobre a camisa. */
const textForShirt = (shirt: string): string => (isLight(shirt) ? '#111827' : '#f8fafc')

/** Cores parecidas o bastante para confundir em campo. */
const CLASH_THRESHOLD = 110

const WHITE = '#f8fafc'
const BLACK = '#111827'

/**
 * Devolve os uniformes finais de mando e visitante, trocando o do visitante por
 * um reserva quando há conflito com o do mandante.
 */
export const resolveKits = (home: Kit, away: Kit): { home: Kit; away: Kit } => {
  if (colorDist(home.shirt, away.shirt) >= CLASH_THRESHOLD) {
    return { home, away }
  }
  // 1) tenta a 2ª cor do visitante (cor do número), se contrastar com o mando
  if (colorDist(home.shirt, away.text) >= CLASH_THRESHOLD) {
    return { home, away: { shirt: away.text, text: textForShirt(away.text) } }
  }
  // 2) cai para branco ou preto — o que estiver mais longe da cor do mandante
  const alt = colorDist(home.shirt, WHITE) >= colorDist(home.shirt, BLACK) ? WHITE : BLACK
  return { home, away: { shirt: alt, text: textForShirt(alt) } }
}
