import { useParams } from 'react-router-dom'
import SEO from '../components/SEO'
import EditorialHero from '../components/EditorialHero'
import CTAButton from '../components/CTAButton'
import JoinBand from '../components/JoinBand'
import DojoSchedule from '../components/DojoSchedule'
import { locations, venues } from '../data/siteData'

export default function LocationDetailPage() {
  const { slug } = useParams()
  const location = locations.find((item) => item.slug === slug)
  if (!location) return <section><SEO title="Location Not Found | Hakuba Karate" description="Find the Wroughton and Mevagissey Hakuba dojos." noIndex /><h1>Location not found</h1><CTAButton to="/locations">Find a dojo</CTAButton></section>
  const venue = venues.find((item) => item.primary && item.area === location.name)
  return <>
    <SEO title={`Karate classes in ${location.name} | Hakuba Karate`} description={`Beginner-friendly Wado-Ryu karate in ${location.name}, ${location.area}. Find your venue, class times and teaching team.`} />
    <EditorialHero label={`${location.name} / ${location.area}`} title={`Karate in ${location.name}.`} image={location.image} alt={location.imageAlt}><p>{location.text}</p><p>Children aged 7+, teenagers and adults are welcome. Choose a suitable class and arrive a few minutes early. No booking needed; contact us if you would like help choosing.</p></EditorialHero>
    <section className="editorial-split"><div><p className="kicker">Find the dojo</p><h2>Your local<br />training floor.</h2>{venue && <address className="venue-address"><strong>{venue.name}</strong><span>{venue.address}</span><a href={venue.w3w}>Find the venue with what3words</a></address>}</div><div><h3>Your teaching team</h3><p>{slug === 'wroughton' ? 'Rob Wall Sensei (4th Dan) and Andrea Bond Sensei (3rd Dan) run the Wroughton classes. Jim Rendell Sensei also attends Wroughton gradings.' : 'Jim Rendell Sensei (4th Dan) leads Mevagissey training, with guidance from Gary Swift Sensei.'}</p><p>Both Hakuba dojos teach the same traditional Wado-Ryu karate. Beginners start with the fundamentals, with progression guided by their instructor.</p><CTAButton to="/about" variant="secondary">Meet the club</CTAButton></div></section>
    <DojoSchedule title={`Class times in ${location.name}.`} location={location.name} />
    <section className="editorial-band bleed-full"><div className="container editorial-band__inner"><div><p className="kicker">A welcoming first step</p><h2>New to karate?<br />You belong here.</h2></div><div><p>No previous experience is needed. Wear comfortable training clothes and bring water. No booking is needed. Arrive a few minutes early to meet the instructor.</p><CTAButton to="/beginners" variant="secondary">Read the first-class guide</CTAButton></div></div></section>
    <JoinBand title={`Start training in ${location.name}.`} />
  </>
}
