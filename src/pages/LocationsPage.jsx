import { Link } from 'react-router-dom'
import SEO from '../components/SEO'
import CTAButton from '../components/CTAButton'
import EditorialHero from '../components/EditorialHero'
import JoinBand from '../components/JoinBand'
import DojoSchedule from '../components/DojoSchedule'
import { classSchedule, locations, venues } from '../data/siteData'

export default function LocationsPage() {
  return <>
    <SEO title="Karate Classes Wroughton, Swindon and Mevagissey | Hakuba Karate" description="Find Hakuba's Wroughton and Mevagissey dojos, venue addresses and weekly class times. Beginner-friendly Wado-Ryu karate from age 7." />
    <EditorialHero label="Our dojos / Your community" title="One club. Two places to begin. One Family." cta="Find your first class" to="/classes"><p>Train in Wroughton, Swindon or Mevagissey, Cornwall. Both dojos teach the same traditional Wado-Ryu karate, with a welcoming route into training.</p></EditorialHero>
    {locations.map((location, index) => {
      const venue = venues.find((item) => item.primary && item.area === location.name)
      return <section key={location.slug} className={`editorial-split${index % 2 ? ' editorial-split--reverse' : ''}`}>
        <figure className={`editorial-split__image${location.listingImage ? ' training-still' : ''}`}><img src={location.listingImage || location.image} alt={location.listingImageAlt || location.imageAlt} loading="lazy" /></figure>
        <div><p className="kicker">{location.area}</p><h2>Karate in {location.name}.</h2><p>{location.text}</p>{venue && <address className="venue-address"><strong>{venue.name}</strong><span>{venue.address}</span><a href={venue.w3w}>Find the venue with what3words</a></address>}<p>Usual weekly times. Check the calendar for changes, then arrive a few minutes early. No booking needed.</p><ul className="venue-sessions">{classSchedule.filter((row) => row.location === location.name).map((row) => <li key={row.id}><strong>{row.day} / {row.time}</strong><span>{row.audience}</span></li>)}</ul><Link className="editorial-link" to={`/locations/${location.slug}`}>Explore {location.name} dojo <span aria-hidden="true">&rarr;</span></Link></div>
      </section>
    })}
    <DojoSchedule title="Plan your training week" />
    <section className="editorial-band bleed-full"><div className="container editorial-band__inner"><div><p className="kicker">Monthly Wiltshire training</p><h2>Check before<br />you travel.</h2><p>Alongside our weekly Wroughton classes, we train once a month at Winterbourne Monkton Community Hall. Our Wiltshire training venues are Wroughton and Winterbourne Monkton only. Check the calendar for the monthly session date and time.</p><CTAButton href="https://hakuba-karate.co.uk/calendar/">Check the club calendar</CTAButton></div><div>{venues.filter((venue) => !venue.primary).map((venue) => <article key={venue.name}><address className="venue-address"><h3>{venue.name}</h3><span>{venue.address}</span>{venue.trainingNote && <span>{venue.trainingNote}</span>}<a href={venue.w3w}>Find venue with what3words</a></address>{venue.image && <figure className="editorial-split__image"><img src={venue.image} alt="Hakuba students and instructors at Winterbourne Monkton Community Hall" loading="lazy" /><figcaption>Winterbourne Monkton Community Hall / Monthly training</figcaption></figure>}</article>)}</div></div></section>
    <JoinBand title="Choose your dojo. Give it a go." />
  </>
}
