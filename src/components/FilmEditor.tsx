import { useState } from 'react'
import { AGE_RATINGS, normalizeTime, sortSessions, toTimeInput, VERSIONS } from '../types'
import { TimeSelects } from './TimeSelects'
import type { DayCol, Film, Session } from '../types'

function Icon({ name }: { name: string }) {
  return <span className="material-symbols-rounded">{name}</span>
}

function NewSessionInput({ onCommit }: { onCommit: (times: string[]) => void }) {
  return (
    <TimeSelects value="" dashed onPick={(v) => onCommit([v])} />
  )
}

interface Props {
  film: Film
  index: number
  cols: DayCol[]
  onChange: (film: Film) => void
  onRemove: () => void
  onMove: (dir: -1 | 1) => void
  isFirst: boolean
  isLast: boolean
}

export function FilmEditor({
  film,
  index,
  cols,
  onChange,
  onRemove,
  onMove,
  isFirst,
  isLast,
}: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const set = (patch: Partial<Film>) => onChange({ ...film, ...patch })

  const sessionsFor = (dayIndex: number) =>
    film.sessions.map((s, i) => ({ s, i })).filter(({ s }) => s.dayIndex === dayIndex)

  const updateSession = (i: number, patch: Partial<Session>) =>
    set({
      sessions: sortSessions(
        film.sessions.map((s, j) => (j === i ? { ...s, ...patch } : s)),
      ),
    })

  const removeSession = (i: number) =>
    set({ sessions: film.sessions.filter((_, j) => j !== i) })

  const addSessions = (dayIndex: number, times: string[]) =>
    set({
      sessions: sortSessions([
        ...film.sessions,
        ...times.map((raw) => ({ dayIndex, time: normalizeTime(raw) ?? raw })),
      ]),
    })

  return (
    <div className="md-card p-3">
      <div className="flex gap-1 mb-3">
      <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
        <span
          className="text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center"
          style={{ background: 'var(--md-primary-container)', color: 'var(--md-on-primary-container)' }}
        >
          {index + 1}
        </span>
        <input
          className="md-field flex-1 min-w-0 h-8 md:h-10 text-sm md:text-base font-medium uppercase"
          placeholder="Titre du film"
          value={film.title}
          onChange={(e) => set({ title: e.target.value })}
        />
        {!collapsed && (
          <div className="flex items-center gap-2 basis-full md:basis-auto flex-wrap">
            <select
              className="md-field w-24 md:w-28"
              value={film.ageRating}
              onChange={(e) => set({ ageRating: e.target.value as Film['ageRating'] })}
              title="Badge âge"
            >
              {AGE_RATINGS.map((a) => (
                <option key={a} value={a}>
                  {a === 'TP' ? 'T.P.' : `${a} ans`}
                </option>
              ))}
            </select>
            <select
              className="md-field w-20 md:w-24"
              value={film.version}
              onChange={(e) => set({ version: e.target.value as Film['version'] })}
            >
              {VERSIONS.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
            <input
              className="md-field flex-1 min-w-0 md:flex-none md:w-44 italic"
              placeholder="Tag (avant-première…)"
              value={film.tag}
              onChange={(e) => set({ tag: e.target.value })}
            />
          </div>
        )}
        <button className="icon-btn hidden md:inline-flex" onClick={() => onMove(-1)} disabled={isFirst} title="Monter">
          <Icon name="arrow_upward" />
        </button>
        <button className="icon-btn hidden md:inline-flex" onClick={() => onMove(1)} disabled={isLast} title="Descendre">
          <Icon name="arrow_downward" />
        </button>
        <button className="icon-btn hidden md:inline-flex" onClick={onRemove} title="Supprimer" style={{ color: 'var(--md-error)' }}>
          <Icon name="delete" />
        </button>
      </div>

      {/* Colonne dédiée : chevron + actions (en ligne sur mobile) */}
      <div className="flex flex-row md:flex-col shrink-0">
        <button
          className="icon-btn md:hidden"
          onClick={() => onMove(-1)}
          disabled={isFirst}
          title="Monter"
        >
          <Icon name="arrow_upward" />
        </button>
        <button
          className="icon-btn md:hidden"
          onClick={() => onMove(1)}
          disabled={isLast}
          title="Descendre"
        >
          <Icon name="arrow_downward" />
        </button>
        <button
          className="icon-btn md:hidden"
          onClick={onRemove}
          title="Supprimer"
          style={{ color: 'var(--md-error)' }}
        >
          <Icon name="delete" />
        </button>
        <button
          className="icon-btn"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Déplier' : 'Replier'}
        >
          <Icon name={collapsed ? 'expand_more' : 'expand_less'} />
        </button>
      </div>
      </div>

      {collapsed ? (
        <div className="text-xs" style={{ color: 'var(--md-on-surface-variant)' }}>
          {film.sessions.length} séance{film.sessions.length > 1 ? 's' : ''}
        </div>
      ) : (
      <div
        className="grid gap-1.5"
        style={{
          gridTemplateColumns: `repeat(auto-fill, minmax(${cols.length > 7 ? 70 : 90}px, 1fr))`,
        }}
      >
        {cols.map((c) => (
          <div
            key={c.iso}
            className="rounded-lg p-1.5"
            style={{ border: '1px solid var(--md-outline-variant)', background: 'var(--md-surface-low)' }}
          >
            <div
              className="text-[10px] font-bold text-center mb-1 uppercase tracking-wide"
              style={{ color: 'var(--md-on-surface-variant)' }}
            >
              {c.label} {c.num}
            </div>
            {sessionsFor(c.index).map(({ s, i }) => (
              <div key={i} className="flex items-center gap-0.5 mb-1">
                <div className="flex-1 min-w-0">
                  <TimeSelects
                    value={toTimeInput(s.time) ?? ''}
                    onPick={(v) => updateSession(i, { time: normalizeTime(v) ?? s.time })}
                  />
                </div>
                <button
                  className="icon-btn"
                  style={{ width: 28, height: 28 }}
                  onClick={() => removeSession(i)}
                >
                  <Icon name="close" />
                </button>
              </div>
            ))}
            <NewSessionInput onCommit={(times) => addSessions(c.index, times)} />
          </div>
        ))}
      </div>
      )}
    </div>
  )
}
