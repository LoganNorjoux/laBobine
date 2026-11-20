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
        <div className="poster-title">
          <span className="poster-prefix">{CINEMA.prefix}</span>
          <h1>{CINEMA.name}</h1>
          <span className="poster-city">{CINEMA.city}</span>
        </div>
      </header>

      <div className="poster-tarifs">
        {tariffs.map((t, i) => (
          <div key={i}>{t}</div>
        ))}
        {CINEMA.facebook && <div className="facebook">f Suivez-nous sur Facebook</div>}
      </div>

      {notice && <div className="poster-notice">{notice}</div>}

      {poster.weeks.map((w, i) => (
        <WeekTable key={i} week={w} />
      ))}

      <footer className="poster-footer">
        <div className="footer-line1">{CINEMA.footer.line1}</div>
        <div className="footer-line2">{CINEMA.footer.line2}</div>
        <div className="footer-credit">{CINEMA.footer.credit}</div>
      </footer>
    </div>
  )
}
