import { useState } from 'react'
import { BRAZIL_ID, WC_TEAM_LIST } from '../game/worldcup'
import { ClubBadge } from '../ui/ClubBadge'

/** Tela inicial do modo roguelike: nome do técnico + escolha da seleção da jornada. */
export default function NewRun({
  onStart,
  hasSave,
  onContinue,
}: {
  onStart: (managerName: string, clubId: string) => void
  hasSave: boolean
  onContinue: () => void
}) {
  const [name, setName] = useState('')
  // Brasil sempre vem primeiro na lista e já entra selecionado por padrão.
  const [clubId, setClubId] = useState(BRAZIL_ID)

  const start = () => onStart(name.trim() || 'Técnico', clubId)
  const chosen = WC_TEAM_LIST.find((c) => c.id === clubId)!

  return (
    <div className="cm-newgame">
      <div className="cm-newgame-card">
        <div className="cm-brand">
          <span className="cm-brand-ball">⚽</span>
          <h1 className="cm-title">Slay of the CM</h1>
        </div>
        <p className="cm-subtitle">
          Escolha uma seleção da Copa do Mundo e suba o mapa enfrentando um adversário por fase até
          o chefão final. Perdeu uma vez? Eliminado — recomeça do zero. Vença para ser campeão.
        </p>

        {hasSave && (
          <button className="cm-btn cm-btn-primary cm-btn-block cm-btn-lg" onClick={onContinue}>
            ▶ Continuar corrida
          </button>
        )}

        <div className="cm-step">
          <span className="cm-step-num">1</span>
          <span>Como você se chama?</span>
        </div>
        <input
          className="cm-input"
          value={name}
          placeholder="Seu nome"
          onChange={(e) => setName(e.target.value)}
          maxLength={24}
        />

        <div className="cm-step">
          <span className="cm-step-num">2</span>
          <span>Escolha sua seleção</span>
        </div>
        <div className="cm-club-grid rq-team-grid">
          {WC_TEAM_LIST.map((c) => (
            <button
              key={c.id}
              className={`cm-club-card ${clubId === c.id ? 'active' : ''}`}
              onClick={() => setClubId(c.id)}
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
