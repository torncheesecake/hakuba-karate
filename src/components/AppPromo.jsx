import CTAButton from './CTAButton'
import { CalendarCheck2, GraduationCap, NotebookPen, Smartphone } from 'lucide-react'

function AppPromo() {
  return (
    <section className="app-promo">
      <div>
        <h2>Train smarter with the Hakuba app</h2>
        <p>Registered, club-approved members can sign in for syllabus support, class updates, training resources and grading preparation. Registration and club approval are required before using the app.</p>
        <div className="button-row">
          <CTAButton to="/app">Explore the app</CTAButton>
          <CTAButton href="/app#member-access" variant="secondary">Member app sign-in</CTAButton>
        </div>
      </div>
      <div className="app-mockup" aria-hidden="true">
        <div className="app-mockup__screen">
          <p className="app-mockup__title"><Smartphone size={16} /> Hakuba App</p>
          <ul>
            <li><NotebookPen size={14} /> Syllabus</li>
            <li><GraduationCap size={14} /> Practice support</li>
            <li><CalendarCheck2 size={14} /> Class information</li>
            <li><Smartphone size={14} /> Progress tools</li>
          </ul>
        </div>
      </div>
    </section>
  )
}

export default AppPromo
