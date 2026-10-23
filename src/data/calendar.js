export const calendarSource = {
  url: 'https://hakuba-karate.co.uk/calendar/',
  checkedOn: '2026-10-17',
}

// Only individually verified dates belong here, not inferred recurring closures.
export const calendarExceptions = [
  {
    date: '2026-10-19',
    sessionId: 'wroughton-adults-mon',
    location: 'Wroughton',
    status: 'closed',
    verified: true,
    notice: 'No Wroughton teens and adults class on Monday 19 October 2026.',
    source: calendarSource.url,
    checkedOn: calendarSource.checkedOn,
  },
  {
    date: '2026-11-16',
    sessionId: 'wroughton-adults-mon',
    location: 'Wroughton',
    status: 'closed',
    verified: true,
    notice: 'No Wroughton teens and adults class on Monday 16 November 2026.',
    source: calendarSource.url,
    checkedOn: calendarSource.checkedOn,
  },
  {
    date: '2026-11-30',
    sessionId: 'wroughton-adults-mon',
    location: 'Wroughton',
    status: 'closed',
    verified: true,
    notice: 'No Wroughton teens and adults class on Monday 30 November 2026: the hall is unavailable.',
    source: calendarSource.url,
    checkedOn: calendarSource.checkedOn,
  },
]

const lookAheadDays = 35
const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const londonFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/London',
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
})
const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'UTC', weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
})

export function getLondonDateTime(now) {
  const parts = Object.fromEntries(londonFormatter.formatToParts(now).map(({ type, value }) => [type, value]))
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  }
}

export function addCalendarDays(date, days) {
  const value = new Date(`${date}T12:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}

export function formatCalendarDate(date) {
  return dateFormatter.format(new Date(`${date}T12:00:00Z`))
}

export function getActiveExceptions(now, location = 'all') {
  if (!now) return []
  const { date } = getLondonDateTime(now)
  const lastDate = addCalendarDays(date, lookAheadDays)
  return calendarExceptions.filter((exception) => exception.verified && exception.status === 'closed'
    && exception.date >= date && exception.date <= lastDate
    && (location === 'all' || exception.location === location))
}

export function getNextOccurrence(session, now) {
  if (!now) return null
  const start = session.time.match(/^(\d{1,2}):(\d{2})(am|pm)/)
  if (!start || !weekdays.includes(session.day)) return null
  const startMinutes = (Number(start[1]) % 12 + (start[3] === 'pm' ? 12 : 0)) * 60 + Number(start[2])
  const today = getLondonDateTime(now)

  for (let offset = 0; offset <= lookAheadDays; offset += 1) {
    const date = addCalendarDays(today.date, offset)
    if (weekdays[new Date(`${date}T12:00:00Z`).getUTCDay()] !== session.day) continue
    if (offset === 0 && startMinutes <= today.minutes) continue
    const closed = calendarExceptions.some((exception) => exception.verified && exception.status === 'closed'
      && exception.sessionId === session.id && exception.date === date)
    if (!closed) return { date, time: session.time, provisional: true }
  }
  return null
}
