import { useCallback, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { Attrs, Role } from '../sim/types'

/** Um atributo exibível: chave interna, rótulo PT-BR e explicação (popup "i"). */
export interface AttrMeta {
  key: keyof Attrs
  label: string
  /** Explicação curta de COMO o atributo influencia o jogo (fonte: atributos.md). */
  desc: string
}

/** Rótulos em PT-BR, ordem de exibição e explicações, agrupados como em atributos.md. */
export const ATTR_GROUPS: { title: string; keys: AttrMeta[] }[] = [
  {
    title: 'Físico',
    keys: [
      { key: 'pace', label: 'Velocidade', desc: 'Velocidade máxima de corrida. Define quem chega primeiro na dividida, foge do marcador e persegue o contra-ataque.' },
      { key: 'acceleration', label: 'Aceleração', desc: 'Arranque e mudança de direção. Decide as disputas em curta distância, as arrancadas e a velocidade do goleiro.' },
      { key: 'strength', label: 'Físico', desc: 'Força, impulsão e fôlego: vence duelos de corpo e bola alta (cabeceio), dá POTÊNCIA ao chute e não "apaga" no 2º tempo.' },
    ],
  },
  {
    title: 'Técnico',
    keys: [
      { key: 'dribbling', label: 'Drible', desc: 'Condução, drible e talento: mantém a bola no duelo, conduz em velocidade e dá efeito/ousadia ao chute.' },
      { key: 'firstTouch', label: 'Domínio', desc: 'Qualidade ao matar a bola. Toque ruim faz a bola espirrar e o lance se perder.' },
      { key: 'passing', label: 'Passe', desc: 'Velocidade e precisão do passe — rasteiro ou alçado (cruzamento) — e o refino técnico geral.' },
      { key: 'finishing', label: 'Finalização', desc: 'Precisão do chute em qualquer distância, e a ousadia de arriscar de mais longe.' },
      { key: 'tackling', label: 'Defesa', desc: 'Desarme e marcação: rouba a bola no bote, cola no adversário e pressiona a saída.' },
    ],
  },
  {
    title: 'Mental',
    keys: [
      { key: 'positioning', label: 'QI de jogo', desc: 'Leitura completa: posicionar-se, antecipar, atacar o espaço, manter o bloco — e a frieza de decidir certo sob pressão.' },
    ],
  },
  {
    title: 'Goleiro',
    keys: [
      { key: 'goalkeeping', label: 'Goleiro', desc: 'O pacote completo do posto: defender o chute, segurar a bola, reflexo/alcance, saída no alto e o mano a mano.' },
    ],
  },
]

export const ROLE_LABEL: Record<Role, string> = {
  GK: 'Goleiro',
  DEF: 'Defesa',
  MID: 'Meio-campo',
  FWD: 'Ataque',
}

/** Cor conforme a faixa do atributo/nota (0..100). Fonte única de escala visual. */
export const attrColor = (v: number): string =>
  v >= 85 ? '#22c55e' : v >= 70 ? '#84cc16' : v >= 50 ? '#facc15' : '#f97316'

/** Média geral simples (todos os atributos) — usada na tela de elenco da demo. */
export const overallOfAll = (a: Attrs): number => {
  const vals = Object.values(a)
  return Math.round(vals.reduce((s, v) => s + v, 0) / vals.length)
}

/**
 * Ícone "i" com popup explicativo, para o jogador que quiser saber mais. Abre no
 * hover do mouse, no foco (teclado) e no clique (toque). O balão é renderizado num
 * PORTAL no body com `position: fixed`, então nunca é cortado pelo scroll do modal.
 */
export function AttrInfo({ label, desc }: { label: string; desc: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [tip, setTip] = useState<{ x: number; y: number; above: boolean } | null>(null)

  const show = useCallback(() => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const above = r.top > 140 // acima se couber; senão, abaixo do ícone
    const half = 130 // metade da largura máx. do balão, para não vazar nas bordas
    const x = Math.max(half, Math.min(window.innerWidth - half, r.left + r.width / 2))
    setTip({ x, y: above ? r.top - 8 : r.bottom + 8, above })
  }, [])
  const hide = useCallback(() => setTip(null), [])

  return (
    <span
      ref={ref}
      className="ps-info"
      tabIndex={0}
      role="button"
      aria-label={`O que é ${label}?`}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
      onClick={(e) => {
        e.stopPropagation()
        if (tip) hide()
        else show()
      }}
    >
      i
      {tip &&
        createPortal(
          <span
            className={`ps-tip ${tip.above ? 'above' : 'below'}`}
            role="tooltip"
            style={{ left: tip.x, top: tip.y }}
          >
            <strong>{label}</strong>
            {desc}
          </span>,
          document.body,
        )}
    </span>
  )
}

export function AttrBar({ label, value, desc }: { label: string; value: number; desc?: string }) {
  return (
    <div className="ps-attr">
      <span className="ps-attr-label">
        {label}
        {desc && <AttrInfo label={label} desc={desc} />}
      </span>
      <span className="ps-attr-bar">
        <span className="ps-attr-fill" style={{ width: `${value}%`, background: attrColor(value) }} />
      </span>
      <span className="ps-attr-val" style={{ color: attrColor(value) }}>
        {value}
      </span>
    </div>
  )
}

/** Painel de grupos de atributos de um jogador (reutilizado em telas diferentes). */
export function AttrGroups({ role, attrs }: { role: Role; attrs: Attrs }) {
  const groups = ATTR_GROUPS.filter((g) => g.title !== 'Goleiro' || role === 'GK')
  return (
    <div className="ps-groups">
      {groups.map((g) => (
        <div key={g.title} className="ps-group">
          <h4>{g.title}</h4>
          {g.keys.map((k) => (
            <AttrBar key={k.key} label={k.label} value={attrs[k.key]} desc={k.desc} />
          ))}
        </div>
      ))}
    </div>
  )
}
