import type { PosterConfig } from '../types'

interface Props {
  config: PosterConfig
  onChange: (config: PosterConfig) => void
}

export function AdminPanel({ config, onChange }: Props) {
  const setTariff = (i: number, v: string) =>
    onChange({ ...config, tariffs: config.tariffs.map((t, j) => (j === i ? v : t)) })

  return (
    <div className="flex flex-col gap-6">
      <section className="md-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-rounded" style={{ color: 'var(--md-primary)' }}>
            sell
          </span>
          <h2 className="font-medium">Tarifs affichés sur l'affiche</h2>
        </div>
        <div className="flex flex-col gap-2">
          {config.tariffs.map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                className="md-field flex-1"
                value={t}
                onChange={(e) => setTariff(i, e.target.value)}
              />
              <button
                className="icon-btn"
                title="Supprimer la ligne"
                style={{ color: 'var(--md-error)' }}
                onClick={() =>
                  onChange({ ...config, tariffs: config.tariffs.filter((_, j) => j !== i) })
                }
              >
                <span className="material-symbols-rounded">delete</span>
              </button>
            </div>
          ))}
          <button
            className="btn btn-tonal self-start"
            onClick={() => onChange({ ...config, tariffs: [...config.tariffs, ''] })}
          >
            <span className="material-symbols-rounded">add</span>
            Ajouter une ligne de tarif
          </button>
        </div>
      </section>

      <section className="md-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <span className="material-symbols-rounded" style={{ color: 'var(--md-primary)' }}>
            campaign
          </span>
          <h2 className="font-medium">Annonce (concours, événement…)</h2>
        </div>
        <textarea
          className="md-field"
          style={{ height: 'auto', minHeight: 72, padding: '10px 12px' }}
          placeholder="Le premier mardi soir de chaque mois, une place de cinéma à gagner…"
          value={config.notice}
          onChange={(e) => onChange({ ...config, notice: e.target.value })}
        />
        <p className="text-xs mt-1" style={{ color: 'var(--md-on-surface-variant)' }}>
          Laisser vide pour masquer le bandeau sur l'affiche.
        </p>
      </section>
    </div>
  )
}
