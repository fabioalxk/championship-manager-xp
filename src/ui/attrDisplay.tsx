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
      { key: 'acceleration', label: 'Aceleração', desc: 'Arranque: rapidez para atingir a velocidade máxima. Decide as disputas em curta distância e as arrancadas.' },
      { key: 'agility', label: 'Agilidade', desc: 'Mudar de direção sem frear tanto. Ajuda a driblar, a se manter em pé no duelo e é chave na velocidade do goleiro.' },
      { key: 'balance', label: 'Equilíbrio', desc: 'Resiste a cair ou tropeçar no contato e protege melhor a bola no duelo.' },
      { key: 'jumping', label: 'Impulsão', desc: 'Salto. Principal fator para ganhar a bola alta em cruzamentos, escanteios e divididas aéreas.' },
      { key: 'strength', label: 'Força', desc: 'Força física: vence duelos de corpo e, principalmente, dá POTÊNCIA ao chute.' },
      { key: 'stamina', label: 'Fôlego', desc: 'Fôlego baixo faz o jogador "apagar" no 2º tempo, perdendo ritmo mais cedo e mais fundo.' },
      { key: 'naturalFitness', label: 'Forma física', desc: 'Rapidez para recuperar energia entre as corridas ao longo da partida.' },
      { key: 'workRate', label: 'Intensidade', desc: 'Intensidade sem a bola: quanto pressiona, marca e volta para ajudar a defesa.' },
    ],
  },
  {
    title: 'Técnico',
    keys: [
      { key: 'dribbling', label: 'Drible', desc: 'Condução e drible: mantém a bola colada no pé no duelo e conduz em velocidade sem perdê-la.' },
      { key: 'firstTouch', label: 'Domínio', desc: 'Qualidade ao matar a bola. Toque ruim faz a bola espirrar e o lance se perder.' },
      { key: 'technique', label: 'Técnica', desc: 'Refino geral: reduz o erro (a imprecisão) de passes e chutes.' },
      { key: 'passing', label: 'Passe', desc: 'Velocidade e precisão do passe. Passador ruim erra até sem pressão.' },
      { key: 'crossing', label: 'Cruzamento', desc: 'Precisão da bola alçada das pontas, escanteios e laterais.' },
      { key: 'finishing', label: 'Finalização', desc: 'Precisão do chute de perto do gol (e ajuda a bater firme).' },
      { key: 'longShots', label: 'Chute de longe', desc: 'Precisão e alcance dos chutes de fora da área.' },
      { key: 'heading', label: 'Cabeceio', desc: 'Qualidade para ganhar e direcionar a bola de cabeça na disputa aérea.' },
      { key: 'tackling', label: 'Desarme', desc: 'Eficácia em roubar a bola no bote ou carrinho.' },
      { key: 'marking', label: 'Marcação', desc: 'Quão colado fica no adversário sem a bola, fechando o espaço.' },
    ],
  },
  {
    title: 'Mental',
    keys: [
      { key: 'vision', label: 'Visão de jogo', desc: 'Enxergar e escolher a melhor opção de passe (e ajuda o goleiro a distribuir).' },
      { key: 'anticipation', label: 'Antecipação', desc: 'Ler a jogada e chegar antes na bola para interceptar.' },
      { key: 'positioning', label: 'Posicionamento', desc: 'Colocar-se no lugar certo na defesa. É base da defesa do goleiro.' },
      { key: 'offTheBall', label: 'Movimentação', desc: 'Movimentação sem bola: qualidade das corridas para se oferecer e atacar o espaço.' },
      { key: 'decisions', label: 'Decisões', desc: 'Escolher a hora certa de passar, chutar ou conduzir — sem apressar nem enrolar.' },
      { key: 'composure', label: 'Frieza', desc: 'Sob pressão erra menos: mira mais o chute e domina melhor com o marcador em cima.' },
      { key: 'concentration', label: 'Concentração', desc: 'Menos lapsos e erros bobos quando o cansaço aperta.' },
      { key: 'consistency', label: 'Consistência', desc: 'Regularidade. O irregular alterna lances geniais com erros absurdos.' },
      { key: 'aggression', label: 'Agressividade', desc: 'Entra mais duro: rouba mais bolas, mas comete mais faltas e cartões.' },
      { key: 'bravery', label: 'Bravura', desc: 'Atira-se a botes mais arriscados, alcançando divididas que o cauteloso nem tenta.' },
      { key: 'teamwork', label: 'Trabalho em equipe', desc: 'Mantém o bloco compacto e dá opções de apoio aos companheiros.' },
      { key: 'flair', label: 'Imprevisibilidade', desc: 'Dá efeito/curva ao chute e ousadia para arriscar o lance genial.' },
    ],
  },
  {
    title: 'Goleiro',
    keys: [
      { key: 'goalkeeping', label: 'Defesa', desc: 'Defesa-base: a habilidade central de defender o chute (shot stopping).' },
      { key: 'reflexes', label: 'Reflexos', desc: 'Reação e alcance para as defesas de reação curta e os rebotes.' },
      { key: 'handling', label: 'Mãos', desc: 'Segurar a bola em vez de dar rebote. Mãos ruins soltam o "frango".' },
      { key: 'aerialReach', label: 'Saída aérea', desc: 'Alcance para sair e cortar cruzamentos e bolas altas na área.' },
      { key: 'oneOnOne', label: 'Um contra um', desc: 'Fechar o ângulo no frente a frente e sair como líbero nas bolas nas costas da defesa.' },
      { key: 'kicking', label: 'Tiro de meta', desc: 'Distância e potência do chutão e do lançamento longo.' },
      { key: 'throwing', label: 'Reposição', desc: 'Qualidade e velocidade da saída curta com a mão.' },
      { key: 'communication', label: 'Comunicação', desc: 'Comanda e organiza a linha de defesa, mantendo-a compacta.' },
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
