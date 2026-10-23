import { ArrowUpRight } from 'lucide-react'
import CTAButton from './CTAButton'
import { firstClassSteps } from '../data/siteData'

export default function FirstClassInvitation() {
  return (
    <section className="first-bow bleed-full" aria-labelledby="first-bow-title">
      <div className="container first-bow__inner">
        <div className="first-bow__welcome">
          <p className="public-eyebrow">Your first visit / No experience needed</p>
          <h2 id="first-bow-title">You bring<br />yourself.<br /><em>We&apos;ll help<br />with the rest.</em></h2>
          <p>You do not need to feel confident before you begin. Choose a suitable class, arrive a few minutes early and take it one step at a time. No booking needed.</p>
          <CTAButton to="/beginners" variant="secondary">Step inside your first class <ArrowUpRight size={20} aria-hidden="true" /></CTAButton>
          <p className="first-bow__kit">Comfortable clothes. Water.<br />No gi to buy before you try.</p>
        </div>
        <div className="first-bow__journey">
          <p className="first-bow__label">From a first hello to the dojo floor</p>
          <ol role="list">{firstClassSteps.map((step, index) => <li key={step}><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span><p>{step}</p></li>)}</ol>
          <p className="first-bow__closing">A first class, not a test.<br /><strong>A place to start.</strong></p>
        </div>
      </div>
    </section>
  )
}
