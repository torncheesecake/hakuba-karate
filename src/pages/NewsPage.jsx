import SEO from '../components/SEO'
import EditorialHero from '../components/EditorialHero'
import JoinBand from '../components/JoinBand'
import { newsItems } from '../data/siteData'

export default function NewsPage() {
  return <>
    <SEO title="Hakuba Karate News and Updates" description="Club news, grading days and Wado-Ryu training courses from Hakuba Karate in Wroughton and Mevagissey." />
    <EditorialHero label="From the club" title="On the floor. Part of a community." image="/images/cornwall-grading-september-2026.webp" alt="Two Hakuba students demonstrating partner work during a Cornwall grading" cta="Find a class" to="/classes"><p>Training courses, grading days and news from our dojos. Explore the club's published updates below.</p></EditorialHero>
    <section className="news-band"><p className="kicker">The club journal</p><h2>News &amp; updates.</h2><div className="news-band__list">{newsItems.map((item) => <article key={item.href}><p className="news-date">{item.date}</p><h3>{item.title}</h3><a href={item.href}>Read the club post <span aria-hidden="true">&#8599;</span></a></article>)}</div></section>
    <section className="editorial-band bleed-full"><div className="container editorial-band__inner"><div><p className="kicker">From our dojos</p><h2>Keep in touch<br />with your club.</h2><div className="community-video-gallery"><figure className="community-video-still"><img src="/images/saturday-mixed-session.png" alt="Children and adults practising punches together during a Hakuba mixed Saturday class" width="511" height="287" loading="lazy" /><figcaption>A moment from our Saturday mixed class. <a href="https://www.facebook.com/reel/1078469797932010">Watch the club video</a>.</figcaption></figure><figure className="community-video-still"><img src="/images/ellendune-class-video.png" alt="Hakuba students practising karate together at Ellendune Community Centre in Wroughton" width="511" height="287" loading="lazy" /><figcaption>Training at Ellendune, Wroughton. <a href="https://www.facebook.com/reel/1121619617203683">Watch the club video</a>.</figcaption></figure></div></div><div><p>Follow the local Facebook pages for photos and club updates. For changes to class arrangements, check the club calendar.</p><ul className="resource-index"><li><a href="https://www.facebook.com/profile.php?id=61586031931783">Wroughton / Wiltshire <span aria-hidden="true">&#8599;</span></a></li><li><a href="https://www.facebook.com/profile.php?id=100090005253077">Mevagissey / Cornwall <span aria-hidden="true">&#8599;</span></a></li><li><a href="https://hakuba-karate.co.uk/calendar/">Club calendar <span aria-hidden="true">&#8599;</span></a></li></ul></div></div></section>
    <JoinBand title="Be part of the next chapter." />
  </>
}
