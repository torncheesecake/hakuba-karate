import { useEffect, useId, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, MapPin } from 'lucide-react'
import { classSchedule, locations } from '../data/siteData'
import { formatCalendarDate, getNextOccurrence } from '../data/calendar'
import CalendarNotice from './CalendarNotice'

const filters = [
  { id: 'all', label: 'Both dojos' },
  { id: 'Wroughton', label: 'Wroughton' },
  { id: 'Mevagissey', label: 'Mevagissey' },
]
const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const shortDate = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'short' })

function Session({ row, now }) {
  const next = getNextOccurrence(row, now)
  const interest = row.type === 'Kids' ? 'Kids' : row.type === 'Adults' ? 'Teen-adult' : 'Not sure'
  const enquiry = new globalThis.URLSearchParams({ location: row.location, interest, session: row.id })
  const [start, end] = row.time.split(' to ')
  const samePeriod = start.slice(-2) === end.slice(-2)
  const displayStart = samePeriod ? start.slice(0, -2) : start

  return (
    <li className="dojo-schedule__session">
      <div className="dojo-schedule__when">
        <h4>{row.day}</h4>
        <p className="dojo-schedule__time">{displayStart}<span aria-label=" to ">&ndash;</span>{end}</p>
      </div>
      <div className="dojo-schedule__who">
        <p className="dojo-schedule__audience">{row.audience}</p>
        {now && <p className="dojo-schedule__next">{next ? <>Next class: <time dateTime={next.date} title={formatCalendarDate(next.date)}>{shortDate.format(new Date(`${next.date}T12:00:00Z`))}</time></> : 'Ask the club for the next date.'}</p>}
      </div>
      <Link className="dojo-schedule__enquiry" to={`/contact?${enquiry}`} aria-label={`Ask about ${row.audience}, ${row.day} at ${row.time} in ${row.location}`}>
        Ask about this class <ArrowUpRight size={17} aria-hidden="true" />
      </Link>
    </li>
  )
}

function DojoSchedule({ title = 'Class schedule', compact = false, location = 'all', types = null }) {
  const [active, setActive] = useState('all')
  const [now, setNow] = useState(null)
  const id = useId()
  const selectedLocation = location === 'all' ? active : location

  useEffect(() => {
    // Keep prerender and hydration equal; calculate provisional dates after mount.
    const updateClock = () => setNow(new Date())
    updateClock()
    const interval = window.setInterval(updateClock, 30000)
    return () => window.clearInterval(interval)
  }, [])

  const groups = useMemo(() => locations.map((dojo) => ({
    ...dojo,
    sessions: classSchedule.filter((row) => row.location === dojo.name
      && (selectedLocation === 'all' || row.location === selectedLocation)
      && (!types || types.includes(row.type)))
      .sort((a, b) => weekdays.indexOf(a.day) - weekdays.indexOf(b.day)),
  })).filter((dojo) => dojo.sessions.length), [selectedLocation, types])

  return (
    <section className={`dojo-schedule ${compact ? 'dojo-schedule--compact' : ''}`} aria-labelledby={`${id}-title`}>
      <div className="dojo-schedule__heading">
        <div><h2 id={`${id}-title`}>{title}</h2><p>Usual weekly sessions. Beginners welcome.</p></div>
        {location === 'all' && <div className="dojo-schedule__filters" role="group" aria-label="Filter class times by dojo">
          {filters.map((filter) => <button key={filter.id} type="button" className={`dojo-schedule__filter ${active === filter.id ? 'is-active' : ''}`} onClick={() => setActive(filter.id)} aria-pressed={active === filter.id} aria-controls={`${id}-sessions`}>{filter.label}</button>)}
        </div>}
      </div>
      <p className="dojo-schedule__guidance">No booking needed. Choose a suitable session and arrive a few minutes early to meet your instructor. Check the calendar for any changes; dates below are provisional.</p>
      <div id={`${id}-sessions`} className="dojo-schedule__groups">
        {groups.map((dojo) => <section className="dojo-schedule__dojo" key={dojo.slug} aria-labelledby={`${id}-${dojo.slug}`}>
          <header className="dojo-schedule__place">
            <div><p>{dojo.area}</p><h3 id={`${id}-${dojo.slug}`}>{dojo.name}</h3><span>{dojo.sessions[0].venue}</span></div>
            <Link to={`/locations/${dojo.slug}`} aria-label={`${dojo.name} venue details`}><MapPin size={18} aria-hidden="true" /> Venue details</Link>
          </header>
          <ul className="dojo-schedule__sessions">{dojo.sessions.map((row) => <Session key={row.id} row={row} now={now} />)}</ul>
        </section>)}
        {groups.length === 0 && <p>No matching weekly sessions. Ask us to help you find a class.</p>}
      </div>
      <CalendarNotice now={now} location={selectedLocation} />
    </section>
  )
}

export default DojoSchedule
