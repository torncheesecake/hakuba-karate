import { Link } from 'react-router-dom'
import { MoveRight } from 'lucide-react'
import ClubImage from './ClubImage'

const reasons = [
  { title: 'Karate for children', text: 'From age 7, children practise listening, concentration and controlled movement. A clear routine and steady progression give them something to work towards.', to: '/kids-karate', link: 'Children\'s classes' },
  { title: 'Women starting karate', text: 'You do not need previous martial arts experience or a particular level of fitness. Women are welcome in our mixed teen and adult sessions, with time to learn the fundamentals.', to: '/adult-karate', link: 'Starting as an adult' },
  { title: 'Confidence around bullying', text: 'Respect, consideration and controlled partner practice are part of training. Karate can be a way to work on confidence; it is not a guarantee against bullying or a replacement for support from a school or trusted adult.', to: '/contact', link: 'Talk to us about your child' },
  { title: 'Fitness and flexibility', text: 'Warm-ups, repeated techniques and movement practice make training an active part of your week. Start at your own level and tell your instructor about any limitations before joining in.', to: '/adult-karate', link: 'Explore adult training' },
  { title: 'Coordination and balance', text: 'Stances, footwork and sequences of techniques give you a chance to practise moving with control. You learn one step at a time; you do not need to get everything right on your first visit.', to: '/beginners', link: 'What your first class involves' },
]

export default function TrainingReasons() {
  return (
    <section className="training-reasons" aria-labelledby="training-reasons-title">
      <div className="training-reasons__intro"><p className="kicker">Your reason. Your starting point.</p><h2 id="training-reasons-title">What brings you<br />to karate?</h2><p>Something for your child. Time for yourself. A new skill. You do not have to share the same goal to train together.</p><figure><ClubImage src="/images/cornwall-grading-september-2026.webp" alt="Hakuba students practising a partner technique at the September Cornwall grading" width="1600" height="900" loading="lazy" /><figcaption>On the dojo floor / Cornwall grading, September 2026</figcaption></figure></div>
      <div className="training-reasons__list">{reasons.map((reason) => <article key={reason.title}><h3>{reason.title}</h3><p>{reason.text}</p><Link className="editorial-link" to={reason.to}>{reason.link} <MoveRight size={18} aria-hidden="true" /></Link></article>)}</div>
    </section>
  )
}
