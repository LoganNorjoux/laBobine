import { useState } from 'react'
import { emptyFilm, fmtDate, weekDates } from '../types'
import type { Week } from '../types'
import { FilmEditor } from './FilmEditor'

function Icon({ name }: { name: string }) {
  return <span className="material-symbols-rounded">{name}</span>
}

interface Props {
  week: Week
  canRemove: boolean
  onChange: (week: Week) => void
  onRemove: () => void
}

export function WeekEditor({ week, canRemove, onChange, onRemove }: Props) {
  const [editing, setEditing] = useState(!week.startDate || !week.endDate)
  const setFilms = (films: Week['films']) => onChange({ ...week, films })
  const cols = weekDates(week)

  const moveFilm = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= week.films.length) return
    const films = [...week.films]
    ;[films[i], films[j]] = [films[j], films[i]]
    setFilms(films)
  }

  return (
    <section className="mb-6">
      <div
        className="flex items-center gap-2 mb-3 px-4 py-2 rounded-2xl"
        style={{ background: 'var(--md-surface-container)' }}
      >
        <span className="material-symbols-rounded" style={{ color: 'var(--md-primary)' }}>
          calendar_month
        </span>

        {editing ? (
          <>
            <h2 className="font-medium" style={{ color: 'var(--md-on-surface)' }}>
              Période du
            </h2>
            <input
              type="date"
              className="md-field w-40"
              value={week.startDate}
              onChange={(e) => onChange({ ...week, startDate: e.target.value })}
            />
            <h2 className="font-medium" style={{ color: 'var(--md-on-surface)' }}>
              au
            </h2>
            <input
              type="date"
              className="md-field w-40"
              value={week.endDate}
              onChange={(e) => onChange({ ...week, endDate: e.target.value })}
            />
            <button
              className="icon-btn"
              onClick={() => setEditing(false)}
              disabled={!week.startDate || !week.endDate}
              title="Valider les dates"
              style={{ color: 'var(--md-primary)' }}
            >
              <Icon name="check" />
            </button>
          </>
        ) : (
          <h2 className="font-medium" style={{ color: 'var(--md-on-surface)' }}>
            Période du {fmtDate(week.startDate)} au {fmtDate(week.endDate)}
          </h2>
        )}

        <div className="flex-1" />
        {!editing && (
          <button className="icon-btn" onClick={() => setEditing(true)} title="Modifier les dates">
            <Icon name="edit" />
          </button>
        )}
        <button
          className="icon-btn"
          onClick={onRemove}
          disabled={!canRemove}
          title="Supprimer cette période"
          style={{ color: 'var(--md-error)' }}
        >
          <Icon name="delete" />
        </button>
      </div>

      <div className="flex flex-col gap-2.5">
        {week.films.map((film, i) => (
          <FilmEditor
            key={film.id}
            film={film}
            index={i}
            cols={cols}
            isFirst={i === 0}
            isLast={i === week.films.length - 1}
            onChange={(f) => setFilms(week.films.map((x) => (x.id === f.id ? f : x)))}
            onRemove={() => setFilms(week.films.filter((x) => x.id !== film.id))}
            onMove={(dir) => moveFilm(i, dir)}
          />
        ))}
        <button
          className="btn btn-tonal self-start"
          onClick={() => setFilms([...week.films, emptyFilm()])}
        >
          <span className="material-symbols-rounded">add</span>
          Ajouter un film
        </button>
      </div>
    </section>
  )
}
