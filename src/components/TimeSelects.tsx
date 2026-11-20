const TIMES: string[] = []
for (let h = 7; h <= 23; h++) {
  for (const m of ['00', '15', '30', '45']) {
    TIMES.push(`${String(h).padStart(2, '0')}:${m}`)
  }
}

// value : "18:30" | '' ; onPick appelé au choix d'un horaire.
export function TimeSelects({
  value,
  onPick,
  dashed,
}: {
  value: string
  onPick: (v: string) => void
  dashed?: boolean
}) {
  return (
    <select
      className="md-field h-7 text-xs text-center w-full min-w-0"
      style={{ padding: '0 2px', borderStyle: dashed ? 'dashed' : 'solid' }}
      value={value}
      onChange={(e) => e.target.value && onPick(e.target.value)}
    >
      <option value="">--:--</option>
      {TIMES.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  )
}
