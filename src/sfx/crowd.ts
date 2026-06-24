/**
 * Efeitos sonoros sintetizados (sem arquivos de áudio): um "rugido de torcida"
 * para o gol, montado em WebAudio a partir de ruído branco filtrado com um
 * envelope de subida/descida. Fica claro no ouvido que saiu gol.
 *
 * Política de autoplay: o AudioContext só toca após um gesto do usuário, por
 * isso `primeAudio()` deve ser chamado nos cliques (Jogar/Nova partida).
 */

let ctx: AudioContext | null = null

const getCtx = (): AudioContext | null => {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AC) return null
    ctx = new AC()
  }
  return ctx
}

/** Destrava/retoma o áudio dentro de um gesto do usuário. */
export const primeAudio = (): void => {
  const c = getCtx()
  if (c && c.state === 'suspended') void c.resume()
}

/** Toca um rugido de torcida ao sair o gol. */
export const goalRoar = (): void => {
  const c = getCtx()
  if (!c) return
  if (c.state === 'suspended') void c.resume()

  const now = c.currentTime
  const dur = 1.9

  // ruído branco = base da "torcida"
  const buffer = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  const noise = c.createBufferSource()
  noise.buffer = buffer

  // dois band-pass dão um timbre mais "humano" de multidão do que ruído cru
  const bp = c.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = 650
  bp.Q.value = 0.5
  const peak = c.createBiquadFilter()
  peak.type = 'peaking'
  peak.frequency.value = 1100
  peak.gain.value = 6

  // envelope: sobe rápido (a explosão da torcida) e decai longo
  const gain = c.createGain()
  gain.gain.setValueAtTime(0.0001, now)
  gain.gain.exponentialRampToValueAtTime(0.25, now + 0.18)
  gain.gain.setValueAtTime(0.25, now + 0.7)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur)

  noise.connect(bp)
  bp.connect(peak)
  peak.connect(gain)
  gain.connect(c.destination)
  noise.start(now)
  noise.stop(now + dur)
}
