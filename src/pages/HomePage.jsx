import ClubImage from '../components/ClubImage'
import { Link } from 'react-router-dom'
import { ArrowUpRight, ArrowDown, MoveRight } from 'lucide-react'
import SEO from '../components/SEO'
import CTAButton from '../components/CTAButton'
import DojoSchedule from '../components/DojoSchedule'
import FirstClassInvitation from '../components/FirstClassInvitation'
import { federations, locations, newsItems, resources, venues } from '../data/siteData'

const teachingTeam = [
  { name: 'Rob Wall Sensei', grade: '4th Dan', dojo: 'Wroughton', role: 'Runs Wroughton classes with Andrea Bond Sensei.' },
  { name: 'Andrea Bond Sensei', grade: '3rd Dan', dojo: 'Wroughton', role: 'Runs Wroughton classes with Rob Wall Sensei.' },
  { name: 'Jim Rendell Sensei', grade: '4th Dan', dojo: 'Mevagissey', role: 'Leads Mevagissey training and attends Wroughton gradings.' },
]

function HomePage() {
  return (
    <div className="public-home hakuba-home">
      <SEO title="Traditional Wado-Ryu Karate Classes in Wroughton, Swindon & Mevagissey | Hakuba Karate" description="Beginner-friendly Wado-Ryu karate for children aged 7+, teenagers and adults in Wroughton, Swindon and Mevagissey. Find a suitable class and arrive a few minutes early. No booking needed." />

      <section className="hakuba-hero bleed-full" aria-labelledby="home-title">
        <figure className="hakuba-hero__image">
          <ClubImage src="/images/hakuba-course-september-2026.jpg" sizes="(max-width: 699px) 900px, 100vw" alt="Hakuba students practising punches together at the September course in Mevagissey" width="1280" height="960" fetchPriority="high" />
          <figcaption><span>Mevagissey / September 2026</span><a href="https://www.facebook.com/permalink.php?story_fbid=pfbid038Px4mkoLz7Cm9GssdtNahNFonrQFuUzYK2zK4r4zJBUNqNsYwD6KgsSm9dUM3mhul&id=100090005253077">Course &amp; grading <ArrowUpRight size={14} aria-hidden="true" /></a></figcaption>
        </figure>
        <div className="container hakuba-hero__inner">
          <div className="hakuba-hero__rail"><span>Hakuba Karate Dojo</span><span>Wroughton / Mevagissey</span></div>
          <div className="hakuba-hero__copy">
            <p className="public-eyebrow">Traditional Wado-Ryu. Real community.</p>
            <h1 id="home-title">Find your<br /><span>focus.</span></h1>
            <p className="hakuba-hero__local">Karate in Wroughton, Swindon<br />and Mevagissey, Cornwall.</p>
            <p className="hakuba-hero__welcome">Children 7+, teenagers and adults.<br />No experience needed.</p>
            <div className="button-row"><CTAButton to="/classes">Try a free class <ArrowUpRight size={20} aria-hidden="true" /></CTAButton><a className="public-text-link" href="#class-times">Find your class <ArrowDown size={17} aria-hidden="true" /></a></div>
          </div>
          <p className="hakuba-hero__note">A clearer head.<br />A little more confidence.</p>
        </div>
      </section>

      <nav className="dojo-start bleed-full" aria-label="Find your starting point">
        <div className="container dojo-start__inner">
          <p><span className="public-eyebrow">Step inside</span>One club. Two dojos.<br /><strong>A place to belong.</strong></p>
          <Link to="/kids-karate"><span>01 / Confidence starts here</span><strong>Children&apos;s classes</strong><small>Ages 7+ / Room to grow</small><ArrowUpRight aria-hidden="true" /></Link>
          <Link to="/adult-karate"><span>02 / A fresh challenge</span><strong>Teen &amp; adult classes</strong><small>Start from zero or return to training</small><ArrowUpRight aria-hidden="true" /></Link>
          <Link to="/beginners"><span>03 / Start as you are</span><strong>Your first class</strong><small>What to wear, bring and expect</small><ArrowUpRight aria-hidden="true" /></Link>
        </div>
      </nav>

      <section className="dojo-opening public-section" aria-labelledby="intro-title">
        <div><p className="public-eyebrow">Tradition, without intimidation</p><h2 id="intro-title">More than<br /><span>a workout.</span></h2></div>
        <div><p>A little more confidence. A clearer head. A skill you keep building. Karate gives you something to work towards, with people who want you to do well. Start as you are; we will help you find your feet.</p><p className="dojo-opening__detail">A non-profit Wado-Ryu club in Wroughton, Swindon and Mevagissey, Cornwall.</p><Link className="public-text-link" to="/about">Get to know Hakuba <MoveRight size={19} aria-hidden="true" /></Link></div>
      </section>

      <section id="class-times" className="public-schedule dojo-week public-section" aria-label="Weekly karate classes">
        <div className="public-section-heading"><p className="public-eyebrow">01 / Make it part of your week</p><Link className="public-text-link" to="/classes">Full class information <MoveRight size={19} aria-hidden="true" /></Link></div>
        <DojoSchedule title="Find your weekly class" />
        <p className="public-small">New to karate? <Link to="/classes">Choose a suitable class</Link> and arrive a few minutes early. No booking needed; contact us if you would like help choosing.</p>
      </section>

      <section className="dojo-pathways public-section" aria-labelledby="pathways-title">
        <div className="public-section-heading"><div><p className="public-eyebrow">02 / Find your starting point</p><h2 id="pathways-title">A class for you.</h2></div><p>One traditional art.<br />Room for everyone.</p></div>
        <div className="dojo-pathways__grid">
          <article className="dojo-pathway">
            <Link className="dojo-pathway__image" to="/kids-karate" aria-label="Explore children's karate"><ClubImage src="/images/facebook-grading-practice.jpg" alt="Young Hakuba students practising a controlled partner technique" width="1536" height="2048" loading="lazy" /><span>Children / 7+ <ArrowUpRight aria-hidden="true" /></span></Link>
            <div className="dojo-pathway__copy"><h3>Little steps.<br />Growing confidence.</h3><p>Focus, coordination and respect, learnt through structured practice. Patient instruction and something to feel proud of.</p><Link className="public-text-link" to="/kids-karate">Explore children&apos;s karate <MoveRight size={19} aria-hidden="true" /></Link></div>
          </article>
          <article className="dojo-pathway dojo-pathway--adult">
            <Link className="dojo-pathway__image" to="/adult-karate" aria-label="Explore adult karate"><ClubImage src="/images/video-stills/counter-practice-wide.jpg" alt="Hakuba students working on controlled counter-attacks with a partner" width="1080" height="1100" loading="lazy" /><span>Teenagers / Adults <ArrowUpRight aria-hidden="true" /></span></Link>
            <div className="dojo-pathway__copy"><h3>Switch off.<br />Step up.</h3><p>Time for yourself. Fitness, practical self-defence foundations and a fresh challenge. Start from zero or pick up where you left off.</p><Link className="public-text-link" to="/adult-karate">Explore adult karate <MoveRight size={19} aria-hidden="true" /></Link></div>
          </article>
        </div>
      </section>

      <section className="dojo-tradition bleed-full" aria-labelledby="tradition-title">
        <div className="container dojo-tradition__inner">
          <div className="dojo-tradition__heading"><p className="public-eyebrow">03 / The people behind your practice</p><h2 id="tradition-title">Rooted in tradition.<br /><span>Taught with care.</span></h2></div>
          <figure className="dojo-tradition__photo"><ClubImage src="/images/video-stills/group-partner-practice-wide.jpg" alt="Hakuba students practising in pairs together on the dojo floor" width="1080" height="1000" loading="lazy" /><figcaption>Respect and consideration are part of every practice.</figcaption></figure>
          <div className="dojo-tradition__copy"><div className="dojo-lineage"><ClubImage src="/images/ohtsuka-sensei-mono.png" alt="Grandmaster Hironori Otsuka, founder of Wado-Ryu" width="76" height="76" loading="lazy" /><p>Hakuba follows the teachings of Grandmaster Hironori Otsuka and the traditional Japanese approach of Rei, Kihon, Kumite and Kata. Your instructor introduces the fundamentals and helps you build from there.</p></div><ul className="dojo-teachers">{teachingTeam.map((teacher) => <li key={teacher.name}><div><strong>{teacher.name}</strong><span>{teacher.dojo}</span><p>{teacher.role}</p></div><span className="dojo-teachers__grade">{teacher.grade}</span></li>)}</ul><p className="dojo-tradition__guidance">Jim Rendell Sensei also attends Wroughton gradings. Mevagissey training has guidance from Gary Swift Sensei.</p><Link className="public-text-link" to="/about">Meet your dojo <MoveRight size={19} aria-hidden="true" /></Link></div>
          <div className="dojo-tradition__affiliations"><span>Part of the wider Wado community</span>{federations.map((item) => <a key={item.href} href={item.href}><ClubImage src={item.logo} alt="" width="64" height="64" loading="lazy" /><span>{item.name}</span> <ArrowUpRight size={16} aria-hidden="true" /></a>)}</div>
        </div>
      </section>

      <section className="dojo-locations public-section" aria-labelledby="venues-title">
        <div className="public-section-heading"><div><p className="public-eyebrow">04 / Local roots. Shared tradition.</p><h2 id="venues-title">See you at the dojo.</h2></div><Link className="public-text-link" to="/locations">All venues <MoveRight size={19} aria-hidden="true" /></Link></div>
        <div className="dojo-locations__grid">{locations.map((location) => {
          const venue = venues.find((item) => item.primary && item.area === location.name)
          return <article className="dojo-location" key={location.slug}><Link className="dojo-location__image" to={`/locations/${location.slug}`} aria-label={`Explore ${location.name} dojo`}><ClubImage src={location.image} alt={location.imageAlt} loading="lazy" /></Link><div className="dojo-location__copy"><p className="public-eyebrow">{location.area}</p><h3>{location.name}</h3>{venue && <address><strong>{venue.name}</strong><span>{venue.address}</span></address>}<p>{location.text}</p><Link className="public-text-link" to={`/locations/${location.slug}`}>Venue &amp; class details <MoveRight size={19} aria-hidden="true" /></Link></div></article>
        })}</div>
      </section>

      <FirstClassInvitation />

      <section className="public-practice bleed-full" aria-labelledby="practice-title"><div className="container public-practice__inner"><div className="public-practice__copy"><p className="public-eyebrow">Between classes</p><h2 id="practice-title">The practice<br /><span>doesn&apos;t stop here.</span></h2><p>Revisit your syllabus, learn the terminology and prepare for your next grading. The member app puts useful training references in one place for registered, club-approved members. You must sign in to use it.</p><div className="button-row"><CTAButton href="/app#member-access">Member app sign-in</CTAButton><Link className="public-text-link" to="/app">Explore resources <MoveRight size={19} aria-hidden="true" /></Link></div><ul className="public-resource-list">{resources.map((resource) => <li key={resource.href}><a href={resource.href}>{resource.name}<MoveRight size={19} aria-hidden="true" /></a></li>)}</ul></div><figure className="public-practice__screen"><a href="/app#member-access" aria-label="Hakuba member app sign-in, for registered and club-approved members"><ClubImage src="/images/member-app-dashboard-current.png" alt="Example Hakuba members app dashboard showing the syllabus selector and training tools menu" width="1100" height="980" loading="lazy" /></a><figcaption>Training dashboard / An example screen, not live progress or class information.</figcaption></figure></div></section>

      <section className="public-news public-section" aria-labelledby="news-title"><div><p className="public-eyebrow">From the club</p><h2 id="news-title">This is<br />our club.</h2><p>Grading days, training courses and moments from our karate community.</p><Link className="public-text-link" to="/news">All club news <MoveRight size={19} aria-hidden="true" /></Link></div><div className="public-news__list">{newsItems.slice(0, 3).map((item) => <article key={item.href}><p className="public-eyebrow">{item.date}</p><h3><a href={item.href}>{item.title}<ArrowUpRight size={24} aria-hidden="true" /></a></h3></article>)}</div></section>

      <section className="public-invitation bleed-full" aria-labelledby="invitation-title"><div className="container public-invitation__inner"><div><p className="public-eyebrow">Your first step</p><h2 id="invitation-title">Give it a go.</h2><p>No experience needed. Choose a suitable class and arrive a few minutes early. No booking required. Questions first? We are happy to help.</p></div><CTAButton to="/classes">Try a free class <ArrowUpRight aria-hidden="true" /></CTAButton></div></section>
    </div>
  )
}

export default HomePage
