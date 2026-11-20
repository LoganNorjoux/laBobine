import { useRef, useState } from 'react'
import { emptyPoster, emptyWeek, posterSchema } from './types'
import type { Poster } from './types'
import { WeekEditor } from './components/WeekEditor'
import { PosterA4 } from './components/PosterA4'
import { AdminPanel } from './components/AdminPanel'
import { exportImage, exportPdf } from './export'

function Icon({ name }: { name: string }) {
  return <span className="material-symbols-rounded">{name}</span>
}

export default function App() {
  const [poster, setPoster] = useState<Poster>(emptyPoster)
  const [tab, setTab] = useState<'edit' | 'preview' | 'admin'>('edit')
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const save = () => {
    const blob = new Blob([JSON.stringify(poster, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'affiche.json'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const openFile = async (f: File) => {
    try {
      const parsed = posterSchema.parse(JSON.parse(await f.text()))
      setPoster(parsed)
      setError('')
    } catch {
      setError(`Fichier invalide : ${f.name}`)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--md-surface-low)' }}>
      {/* Top app bar */}
      <header
        className="flex items-center gap-1 px-4 py-2 sticky top-0 z-10"
        style={{ background: 'var(--md-surface-container)', boxShadow: 'var(--md-shadow-1)' }}
      >
        <Icon name="theaters" />
        <h1 className="text-lg font-medium mr-4" style={{ color: 'var(--md-on-surface)' }}>
          Affiche programmation
        </h1>
        <button className="btn btn-text" onClick={() => setPoster(emptyPoster())}>
          <Icon name="note_add" /> Nouveau
        </button>
        <button className="btn btn-text" onClick={() => fileRef.current?.click()}>
          <Icon name="folder_open" /> Ouvrir…
        </button>
        <button className="btn btn-tonal" onClick={save}>
          <Icon name="save" /> Enregistrer
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && openFile(e.target.files[0])}
        />
        <div className="flex-1" />
        <button className="btn btn-outlined" onClick={() => exportImage('png')}>
          <Icon name="image" /> PNG
        </button>
        <button className="btn btn-outlined" onClick={() => exportImage('jpeg')}>
          <Icon name="image" /> JPEG
        </button>
        <button className="btn btn-filled" onClick={exportPdf}>
          <Icon name="print" /> PDF
        </button>
      </header>

      {error && (
        <div
          className="px-4 py-2 text-sm flex items-center gap-2"
          style={{ background: '#f9dedc', color: '#8c1d18' }}
        >
          <Icon name="error" /> {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex" style={{ background: 'var(--md-surface)' }}>
        <button className={`tab ${tab === 'edit' ? 'tab-active' : ''}`} onClick={() => setTab('edit')}>
          Édition
        </button>
        <button
          className={`tab ${tab === 'preview' ? 'tab-active' : ''}`}
          onClick={() => setTab('preview')}
        >
          Aperçu A4
        </button>
        <button
          className={`tab ${tab === 'admin' ? 'tab-active' : ''}`}
          onClick={() => setTab('admin')}
        >
          Admin
        </button>
      </div>

      {tab === 'edit' ? (
        <main className="p-4 max-w-6xl w-full mx-auto">
          {poster.weeks.map((w, i) => (
            <WeekEditor
              key={i}
              week={w}
              canRemove={poster.weeks.length > 1}
              onChange={(week) =>
                setPoster({ ...poster, weeks: poster.weeks.map((x, j) => (j === i ? week : x)) })
              }
              onRemove={() =>
                setPoster({ ...poster, weeks: poster.weeks.filter((_, j) => j !== i) })
              }
            />
          ))}
          {poster.weeks.length < 2 && (
            <button
              className="btn btn-outlined"
              onClick={() => {
                const last = poster.weeks[poster.weeks.length - 1]
                let start = ''
                if (last?.endDate) {
                  const d = new Date(last.endDate + 'T00:00:00')
                  d.setDate(d.getDate() + 1)
                  start = d.toISOString().slice(0, 10)
                }
                setPoster({ ...poster, weeks: [...poster.weeks, emptyWeek(start)] })
              }}
            >
              <Icon name="calendar_add_on" /> Ajouter un tableau
            </button>
          )}
        </main>
      ) : tab === 'admin' ? (
        <main className="p-4 max-w-3xl w-full mx-auto">
          <AdminPanel
            config={poster.config}
            onChange={(config) => setPoster({ ...poster, config })}
          />
        </main>
      ) : (
        <main className="flex-1 overflow-auto flex justify-center p-6">
          <div className="poster-wrap" style={{ boxShadow: 'var(--md-shadow-2)' }}>
            <PosterA4 poster={poster} />
          </div>
        </main>
      )}

      {/* Affiche toujours rendue hors-champ pour les exports (fonctionne depuis l'onglet Édition) */}
      <div
        aria-hidden
        style={{ position: 'fixed', left: '-10000px', top: 0, pointerEvents: 'none' }}
      >
        <PosterA4 poster={poster} exportRoot />
      </div>
    </div>
  )
}
