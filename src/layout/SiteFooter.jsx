import { Link } from 'react-router-dom'
import { contact, federations } from '../data/siteData'

function SiteFooter() {
  return (
    <footer className="site-footer public-footer">
      <div className="container footer-mega">
        <div>
          <img src="/hakuba-logo.png" alt="Hakuba Karate logo" className="footer-logo" />
          <h2>Hakuba Karate Dojo</h2>
          <p>Traditional Wado-Ryu karate classes in Wroughton, Swindon and Mevagissey for children, teens and adults.</p>
          <p className="footer-affiliations">Member of the {federations.map((federation, index) => <span key={federation.href}>{index > 0 && ' and '}<a href={federation.href}>{federation.name}</a></span>)}.</p>
          <p><a href={`mailto:${contact.email}`}>{contact.email}</a><br /><a href={`tel:${contact.phone.replace(/\s+/g, '')}`}>{contact.phone}</a></p>
        </div>
        <div>
          <h3>Quick links</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/classes">Classes</Link></li>
            <li><Link to="/beginners">First Class</Link></li>
            <li><Link to="/kids-karate">Children&apos;s karate</Link></li>
            <li><Link to="/adult-karate">Teen and adult karate</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h3>Locations</h3>
          <ul>
            <li><Link to="/locations/wroughton">Wroughton</Link></li>
            <li><Link to="/locations/mevagissey">Mevagissey</Link></li>
            <li><Link to="/locations">All venues</Link></li>
            <li><a href="https://www.facebook.com/profile.php?id=61586031931783">Wroughton on Facebook</a></li>
            <li><a href="https://www.facebook.com/profile.php?id=100090005253077">Mevagissey on Facebook</a></li>
          </ul>
        </div>
        <div>
          <h3>Resources</h3>
          <ul>
            <li><a href="https://hakuba-karate.co.uk/grading-syllabus/">Syllabus</a></li>
            <li><a href="https://hakuba-karate.co.uk/karate-terminology/">Terminology</a></li>

            <li><a href="https://hakuba-karate.co.uk/katas-of-wadoryu/">Katas</a></li>
            <li><a href="/app#member-access">Member app sign-in</a></li>
          </ul>
        </div>
      </div>
      <div className="container footer-meta">
        <Link to="/admin">Admin preview</Link>
        <p>© {new Date().getFullYear()} Hakuba Wadoryu Karate Club</p>
      </div>
    </footer>
  )
}

export default SiteFooter
