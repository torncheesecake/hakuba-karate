import { ArrowUpRight } from 'lucide-react'
import CTAButton from './CTAButton'

export default function JoinBand({ title = 'Your next step starts here.' }) {
  return (
    <section className="join-band bleed-full">
      <div className="container join-band__inner">
        <div><p className="kicker">Wroughton / Mevagissey</p><h2>{title}</h2><p>Beginners welcome, from age 7. Choose a suitable class and arrive a few minutes early. No booking needed. Contact us if you would like help choosing.</p></div>
        <CTAButton to="/classes">View class times <ArrowUpRight size={20} aria-hidden="true" /></CTAButton>
      </div>
    </section>
  )
}
