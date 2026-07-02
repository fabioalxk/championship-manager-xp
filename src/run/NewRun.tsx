import { BRAZIL_ID, WC_TEAM_LIST } from '../game/worldcup'
import { ClubBadge } from '../ui/ClubBadge'
import { BallIcon, PlayIcon } from '../ui/icons'

/** Tela inicial do modo roguelike: escolha da seleção da jornada. */
export default function NewRun({
  onStart,
  hasSave,
  onContinue,
}: {
  onStart: (managerName: string, clubId: string) => void
  hasSave: boolean
  onContinue: () => void
}) {
  // Apenas o Brasil pode ser escolhido por enquanto.
  const clubId = BRAZIL_ID

  const start = () => onStart('Técnico', clubId)
  const chosen = WC_TEAM_LIST.find((c) => c.id === clubId)!
  const teams = WC_TEAM_LIST.filter((c) => c.id === BRAZIL_ID)

  return (
    <div className="cm-newgame rq-title">
      <img className="rq-title-bg" src="/assets/slayOfCM_background.png" alt="" aria-hidden />
      <div className="rq-title-veil" aria-hidden />
      <div className="cm-newgame-card">
        <div className="cm-brand">
          <span className="cm-brand-ball">
            <BallIcon size={46} />
          </span>
          <div className="cm-brand-lockup">
            <span className="cm-brand-kicker">Futebol Roguelike</span>
            <h1 className="cm-title">Slay of the CM</h1>
          </div>
        </div>
        <div className="rq-title-tags">
          <span className="rq-title-tag rq-tag-red">Roguelike</span>
          <span className="rq-title-tag rq-tag-blue">Copa do Mundo</span>
          <span className="rq-title-tag rq-tag-gold">Perdeu, acabou</span>
        </div>
        <p className="cm-subtitle">
          Escolha uma seleção da Copa do Mundo e suba o mapa enfrentando um adversário por fase até
          o chefão final. Perdeu uma vez? Eliminado — recomeça do zero. Vença para ser campeão.
        </p>

        {hasSave && (
          <button className="cm-btn cm-btn-primary cm-btn-block cm-btn-lg" onClick={onContinue}>
            <PlayIcon size={14} className="cm-btn-ico-lead" /> Continuar corrida
          </button>
        )}

        <div className="cm-step">
          <span>Sua seleção</span>
        </div>
        <div className="cm-club-grid rq-team-grid">
          {teams.map((c) => (
            <button
              key={c.id}
              className={`cm-club-card ${clubId === c.id ? 'active' : ''}`}
            >
              <ClubBadge club={c} size={40} />
              <span className="cm-club-card-name">{c.name}</span>
              {clubId === c.id && <span className="cm-club-check">✓</span>}
            </button>
          ))}
        </div>

        <button className="cm-btn cm-btn-go cm-btn-block cm-btn-lg" onClick={start}>
          Começar a jornada — {chosen.name} →
        </button>
      </div>
    </div>
  )
}
