import { useParams } from 'react-router-dom'
import SEO from '../components/SEO'
import EditorialHero from '../components/EditorialHero'
import CTAButton from '../components/CTAButton'
import JoinBand from '../components/JoinBand'
import DojoSchedule from '../components/DojoSchedule'

const pathways = {
  kids: { title: 'Kids karate classes', label: 'Children / Ages 7+', filter: ['Kids', 'Mixed', 'Family'], text: 'A structured introduction to Wado-Ryu for children aged 7+. Practise movement, concentration and respect, with guidance from your instructor.', link: '/kids-karate' },
  adults: { title: 'Teen and adult karate classes', label: 'Teenagers / Adults', filter: ['Adults', 'Mixed', 'Family'], text: 'Begin with the fundamentals, or return to training. Build fitness and self-defence foundations through steady, purposeful practice.', link: '/adult-karate' },
  beginners: { title: 'Beginner karate classes', label: 'Your first step', filter: ['Kids', 'Mixed', 'Adults', 'Family'], text: 'No experience needed. Choose a suitable class and arrive a few minutes early. Contact us if you would like help choosing a session.', link: '/beginners' },
}

export default function ClassDetailPage() {
  const { slug } = useParams()
  const selected = pathways[slug]
  if (!selected) return <section><SEO title="Class Not Found | Hakuba Karate" description="Find a Hakuba karate class in Wroughton or Mevagissey." noIndex /><h1>Class page not found</h1><CTAButton to="/classes">View all classes</CTAButton></section>
  return <>
    <SEO title={`${selected.title} | Hakuba Karate`} description={`${selected.title} with real class times in Wroughton and Mevagissey.`} />
    <EditorialHero label={selected.label} title={selected.title}><p>{selected.text}</p></EditorialHero>
    <DojoSchedule title="Choose your usual class time" types={selected.filter} />
    <section className="editorial-band bleed-full"><div className="container editorial-band__inner"><div><p className="kicker">Before your first visit</p><h2>Come as<br />you are.</h2></div><div><p>No booking is needed. Choose a suitable class from the timetable. You can try karate in comfortable training clothes: bring water, arrive a few minutes early and meet your instructor.</p><div className="button-row"><CTAButton to={selected.link}>Explore this training pathway</CTAButton><CTAButton to="/beginners" variant="secondary">First-class guide</CTAButton></div></div></div></section>
    <JoinBand />
  </>
}
