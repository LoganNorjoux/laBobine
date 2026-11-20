import { CINEMA } from '../constants'
import { fmtWeekTitle, timeToMinutes, weekDates } from '../types'
import type { Poster, Week } from '../types'

function AgeBadge({ rating }: { rating: string }) {
  if (rating === 'TP') return null
  return <span className="age-badge">{rating}<span className="age-unit">ans</span></span>
}

function WeekTable({ week }: { week: Week }) {
  const cols = weekDates(week)
  return (
    <div className="week">
      <h3 className="week-title">{fmtWeekTitle(week)}</h3>
      <table className="prog">
        <thead>
          <tr>
            <th className="col-film">FILMS</th>
            {cols.map((c) => (
              <th key={c.iso}>
                {c.label} {c.num}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {week.films.map((f) => (
            <tr key={f.id}>
              <td className="col-film">
                <span className="film-title">
                  {f.title || <em className="placeholder">sans titre</em>}
                  {f.version === 'VOST' && <span className="vost"> (VOST)</span>}
                </span>
                <AgeBadge rating={f.ageRating} />
                {f.tag && <div className="film-tag">{f.tag}</div>}
              </td>
              {cols.map((c) => (
                <td key={c.iso}>
                  {f.sessions
                    .filter((s) => s.dayIndex === c.index)
                    .sort((a, b) => timeToMinutes(a.time) - timeToMinutes(b.time))
                    .map((s, i) => (
                      <div key={i} className="session">
                        {s.time}
                        {s.star && <sup>*</sup>}
                      </div>
                    ))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function PosterA4({ poster, exportRoot }: { poster: Poster; exportRoot?: boolean }) {
  const { tariffs, notice } = poster.config
  return (
    <div className="poster-a4" data-export={exportRoot ? 'true' : undefined}>
      <header className="poster-header">
        <svg className="reel" viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r="46" fill="none" stroke="#fff" strokeWidth="7" />
          <circle cx="50" cy="50" r="10" fill="#fff" />
          {[0, 72, 144, 216, 288].map((deg) => (
            <circle
              key={deg}
              cx={50 + 26 * Math.cos((deg * Math.PI) / 180)}
              cy={50 + 26 * Math.sin((deg * Math.PI) / 180)}
              r="9"
              fill="#fff"
            />
          ))}
        </svg>
        <svg className="filmstrip" viewBox="0 0 140 40" aria-hidden>
          <path d="M2 38 Q 70 2 138 26" fill="none" stroke="#fff" strokeWidth="14" />
          {Array.from({ length: 7 }, (_, i) => (
            <rect key={i} x={8 + i * 19} y={22 - i * 1.6} width="9" height="7" rx="1.5" fill="#c8102e" transform={`rotate(${-12 + i * 1.5} ${8 + i * 19} ${22 - i * 1.6})`} />
          ))}
        </svg>
        <div className="poster-title">
          <div className="poster-prefix">{CINEMA.prefix}</div>
          <h1>{CINEMA.name}</h1>
          <div className="poster-city">{CINEMA.city}</div>
        </div>
      </header>

      <div className="poster-tarifs">
        {tariffs.map((t, i) => (
          <div key={i}>{t}</div>
        ))}
        {CINEMA.facebook && <div className="facebook">f Suivez-nous sur Facebook</div>}
      </div>

      {notice && <div className="poster-notice"><span>{notice}</span></div>}

      {poster.weeks.map((w, i) => (
        <WeekTable key={i} week={w} />
      ))}

      <div className="poster-credit">{CINEMA.footer.credit}</div>

      <footer className="poster-footer">
        <div className="footer-line1">{CINEMA.footer.line1}</div>
        <div className="footer-line2">Nos sponsors : {CINEMA.footer.line2}</div>
      </footer>
    </div>
  )
}
