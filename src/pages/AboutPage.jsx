import SEO from '../components/SEO'
import EditorialHero from '../components/EditorialHero'
import JoinBand from '../components/JoinBand'
import CTAButton from '../components/CTAButton'
import DojoSchedule from '../components/DojoSchedule'
import { federations } from '../data/siteData'

const foundations = [
  ['Rei', 'Respect', 'Respect and dojo etiquette create a positive environment for everyone on the floor.', '/images/rei2.jpg'],
  ['Kihon', 'The fundamentals', 'Practise the basics carefully. Reliable movement starts with a strong foundation.', '/images/video-stills/1121619617203683-7s.jpg'],
  ['Kumite', 'Working together', 'Controlled partner work develops timing, distance and an understanding of technique.', '/images/video-stills/partner-practice-detail.jpg'],
  ['Kata', 'Purposeful movement', 'Sequences of techniques connect the fundamentals and give students a way to deepen their practice.', null],
]

export default function AboutPage() {
  return <>
    <SEO title="About Hakuba Karate | Traditional Wado-Ryu" description="Meet the Wroughton and Mevagissey teaching teams. A non-profit Wado-Ryu club and member of the British and International Wado Federations." />
    <EditorialHero label="About Hakuba / Wroughton & Mevagissey" title="Meet your dojo.">
      <p>Karate for children aged 7+, teenagers and adults in Wroughton, Swindon and Mevagissey, Cornwall. You can start with no experience: our instructors introduce the basics and help you find your feet.</p>
      <p>We are a non-profit club. Traditional training, a local community and a welcoming place to begin.</p>
    </EditorialHero>
    <section className="editorial-split">
      <figure className="editorial-split__image"><img src="/images/video-stills/distance-practice-wide.jpg" alt="Hakuba students working in pairs on distance and timing" width="1080" height="1000" loading="lazy" /></figure>
      <div className="editorial-split__copy"><p className="kicker">The people behind your practice</p><h2>Local instruction.<br />Shared standards.</h2>
        <h3>Wroughton / Swindon</h3><p>Rob Wall Sensei (4th Dan) and Andrea Bond Sensei (3rd Dan) run Wroughton classes. Jim Rendell Sensei also attends Wroughton gradings.</p>
        <h3>Mevagissey / Cornwall</h3><p>Jim Rendell Sensei (4th Dan) leads training in Mevagissey, with guidance from Gary Swift Sensei.</p>
      </div>
    </section>
    <section className="editorial-split">
      <div><p className="kicker">New to karate?</p><h2>You do not need<br />to know it all.</h2><p>In class, you practise basic movements, work on sequences of techniques and learn controlled partner exercises. Respect and consideration for your training partners are part of the lesson, not something you are expected to arrive knowing.</p></div>
      <div><h3>Children, teenagers and adults</h3><p>Children work on concentration, coordination and confidence. Teenagers and adults build fitness and self-defence foundations through steady practice. Wroughton has separate junior and adult sessions, plus a mixed Saturday class; Mevagissey offers a family and adult session.</p><h3>Your first visit</h3><p>Choose a suitable class and arrive a few minutes early. No booking is needed; contact us if you would like help choosing. Comfortable training clothes and water are enough to start: you do not need to buy a gi before trying karate.</p><CTAButton to="/beginners" variant="secondary">See what your first class involves</CTAButton></div>
    </section>
    <DojoSchedule title="A class that fits your week" />
    <section className="editorial-band bleed-full"><div className="container editorial-band__inner">
      <div><p className="kicker">Wado-Ryu</p><h2>Tradition with<br />a purpose.</h2></div>
      <div><p>Hakuba follows the teachings of Grandmaster Hironori Otsuka and the traditional Japanese approach of Rei, Kihon, Kumite and Kata. These are not four separate destinations: they support each other throughout your training.</p><p>As a beginner, you do not need to know the Japanese terms or arrive with a particular level of fitness. Your instructor introduces the fundamentals and helps you build from there.</p></div>
    </div></section>
    <section><p className="kicker">On the dojo floor</p><h2>Four foundations. One practice.</h2><div className="foundation-grid">{foundations.map(([name, meaning, text, image]) => <article key={name}>{image ? <img src={image} alt={`${name}: ${meaning.toLowerCase()} in karate training`} loading="lazy" /> : <div className="foundation-type" aria-hidden="true"><span>Practice / Precision</span><strong>Kata</strong></div>}<h3>{name} <small>{meaning}</small></h3><p>{text}</p></article>)}</div></section>
    <section className="editorial-split editorial-split--reverse">
      <figure className="editorial-split__image instructor-photo"><img src="/images/sensei-james-rendell.jpg" alt="Jim Rendell Sensei, 4th Dan" loading="lazy" /></figure>
      <div><p className="kicker">Part of the wider Wado community</p><h2>Connected by tradition.</h2><p>Hakuba Karate is a member of the British Wado Federation and International Wado Federation.</p><ul className="resource-index federation-index">{federations.map((item) => <li key={item.href}><a href={item.href}><img src={item.logo} alt="" width="64" height="64" loading="lazy" />{item.name}<span aria-hidden="true">&rarr;</span></a></li>)}</ul><p>Our aim is steady, safe progression: respect for the art, consideration for your training partners and a clear path from your first lesson onwards.</p></div>
    </section>
    <JoinBand title="Come and meet your dojo." />
  </>
}
