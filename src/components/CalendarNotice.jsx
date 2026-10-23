import { CalendarDays } from 'lucide-react'
import { calendarSource, formatCalendarDate, getActiveExceptions } from '../data/calendar'

export default function CalendarNotice({ now = null, location = 'all' }) {
  const exceptions = getActiveExceptions(now, location)

  return (
    <aside className="calendar-notice" aria-label="Calendar information">
      <div className="calendar-notice__intro"><CalendarDays size={21} aria-hidden="true" /><div><strong>Before you head to the dojo</strong><p>Check your class date and venue before travelling. <a href={calendarSource.url}>Check the club calendar</a> for newer updates.</p></div></div>
      {exceptions.length > 0 && <div className="calendar-notice__changes"><strong>Known changes in the next 35 days</strong><ul>{exceptions.map((exception) => <li key={`${exception.sessionId}-${exception.date}`}>{exception.notice}</li>)}</ul></div>}
      <details><summary>Calendar source &amp; monthly training</summary><p className="calendar-notice__source">Checked {formatCalendarDate(calendarSource.checkedOn)}. This is not a live feed. Only individually verified closures are excluded from the next possible dates.</p>{location !== 'Mevagissey' && <p>We also train once a month at Winterbourne Monkton Community Hall. Ask the club for the date and time.</p>}</details>
    </aside>
  )
}
