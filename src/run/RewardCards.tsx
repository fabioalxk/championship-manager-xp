import type { RunState } from '../game/runTypes'
import { pickReward } from '../game/run'
import { GK_ONLY } from '../sim/chaos'
import { ATTR_GROUPS, ROLE_LABEL, attrColor } from '../ui/attrDisplay'
import type { GenPlayer } from '../game/types'
import type { RunApi } from './useRun'

const ATTR_LABEL: Record<string, string> = Object.fromEntries(
  ATTR_GROUPS.flatMap((g) => g.keys.map((k) => [k.key, k.label])),
)

/**
 * Os 2 atributos mais fortes e os 2 mais fracos — deixa o CONTRASTE do jogador
 * visível. Ignora os atributos EXCLUSIVOS de goleiro em quem não é goleiro
 * (senão todo jogador de linha "erra" por ter defesa/reflexos baixos, o que
 * não é uma fraqueza de verdade — ele nunca usa esses atributos).
 */
const highlightsOf = (p: GenPlayer) => {
  const entries = (Object.entries(p.attrs) as [string, number][]).filter(
    ([k]) => p.role === 'GK' || !GK_ONLY.includes(k as (typeof GK_ONLY)[number]),
  )
  const sorted = [...entries].sort((a, b) => b[1] - a[1])
  return { best: sorted.slice(0, 2), worst: sorted.slice(-2).reverse() }
}

function RewardCard({ p, onPick }: { p: GenPlayer; onPick: () => void }) {
  const { best, worst } = highlightsOf(p)
  return (
    <button className="rc-card" onClick={onPick}>
      <div className="rc-card-head">
        <span className="rc-card-role">{ROLE_LABEL[p.role]}</span>
        <span className="rc-card-ovr" style={{ color: attrColor(p.overall) }}>
          {p.overall}
        </span>
      </div>
      <div className="rc-card-name">{p.name}</div>
      <div className="rc-card-age">{p.age} anos</div>
      <div className="rc-card-attrs">
        {best.map(([k, v]) => (
          <span key={k} className="rc-attr rc-attr-good">
            ▲ {ATTR_LABEL[k] ?? k} {v}
          </span>
        ))}
        {worst.map(([k, v]) => (
          <span key={k} className="rc-attr rc-attr-bad">
            ▼ {ATTR_LABEL[k] ?? k} {v}
          </span>
        ))}
      </div>
      <span className="cm-btn cm-btn-primary cm-btn-block rc-pick-btn">Escolher</span>
    </button>
  )
}

/** Pop-up de recompensa após vencer: 3 cartas caóticas, escolhe 1 pro banco. */
export default function RewardCards({ state, act }: { state: RunState; act: RunApi['act'] }) {
  if (!state.pendingReward) return null
  return (
    <div className="cm-backdrop">
      <div className="rc-modal">
        <h2>🎁 Reforço conquistado!</h2>
        <p className="cm-modal-sub">Escolha 1 dos 3 jogadores — ele entra no seu banco de reservas.</p>
        <div className="rc-grid">
          {state.pendingReward.map((p, i) => (
            <RewardCard key={p.id} p={p} onPick={() => act((s) => pickReward(s, i))} />
          ))}
        </div>
      </div>
    </div>
  )
}
