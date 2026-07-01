import type { Attrs, Role } from './types'

/** Atributos exclusivos do goleiro — jogador de linha não entra na média do "spread". */
export const GK_ONLY: (keyof Attrs)[] = ['goalkeeping']
/** Núcleo que faz o goleiro DEFENDER — nunca vira "buraco" (senão deixa de ser GK). */
export const GK_CORE: (keyof Attrs)[] = ['goalkeeping']

/** Piso global de QUALQUER atributo: nenhum jogador fica abaixo disto. */
export const ATTR_FLOOR = 15

/** Intensidade do caos: quanto MAIOR, mais discrepantes ficam os atributos de um jogador. */
export interface ChaosCfg {
  spread: number //  afasta cada atributo da média do jogador (arquétipo + agudo)
  jitter: number //  ruído ± máximo por atributo (textura)
  spikes: number //  nº de "dons de craque" empurrados ao teto
  spikeBoost: number
  tanks: number //   nº de pontos fracos afundados de vez
  tankDrop: number
  ceil: number
}

/**
 * Fonte de aleatoriedade do caos. Abstrai a origem para o MESMO algoritmo servir
 * a duas necessidades: seleções reais (hash estável por jogador) e carreira (Rng
 * sequencial por seed).
 */
export interface ChaosSource {
  /** ruído em [-1,1] para um atributo (será multiplicado por cfg.jitter). */
  jitter: (key: keyof Attrs) => number
  /** escolhe n atributos dentre `keys` (dons de craque ou buracos). */
  pickN: (keys: (keyof Attrs)[], purpose: 'spike' | 'tank', n: number) => Set<keyof Attrs>
}

/**
 * Aplica o caos sobre atributos já mesclados: afasta da média (arquétipo mais
 * agudo), adiciona ruído, crava alguns "dons" no teto e afunda alguns "buracos".
 * Dons saem de qualquer atributo usado; buracos só dos PONTOS FRACOS (< média),
 * assim a assinatura (o pico que define o jogador) nunca é destruída.
 */
export const applyChaos = (attrs: Attrs, role: Role, cfg: ChaosCfg, src: ChaosSource): Attrs => {
  const out = { ...attrs }
  const keys = Object.keys(out) as (keyof Attrs)[]
  // a média (pivô do "spread") só conta os atributos que o jogador de fato usa
  const used = role === 'GK' ? keys : keys.filter((k) => !GK_ONLY.includes(k))
  const mean = used.reduce((a, k) => a + out[k], 0) / used.length

  const spikable = used.filter((k) => !(role === 'GK' && GK_CORE.includes(k)))
  const tankable = used.filter((k) => out[k] < mean && !(role === 'GK' && GK_CORE.includes(k)))
  const spikes = src.pickN(spikable, 'spike', cfg.spikes)
  const tanks = src.pickN(tankable, 'tank', cfg.tanks)

  const clamp = (v: number) => Math.max(ATTR_FLOOR, Math.min(cfg.ceil, Math.round(v)))
  for (const k of used) {
    let v = mean + (out[k] - mean) * cfg.spread //           1) afasta da média
    v += src.jitter(k) * cfg.jitter //                       2) ruído
    if (spikes.has(k)) v += cfg.spikeBoost //                3) dom de craque
    if (tanks.has(k)) v -= cfg.tankDrop //                   4) buraco
    out[k] = clamp(v)
  }
  return out
}
