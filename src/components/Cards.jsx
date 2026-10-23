import { Link } from 'react-router-dom'

export function LocationCard({ slug, name, text, area, image, imageAlt }) {
  return (
    <article className="card">
      {image ? <img src={image} alt={imageAlt || `${name} dojo`} loading="lazy" className="card-location-image" /> : null}
      <h3>{name}</h3>
      {area ? <p className="location-moustache">{area}</p> : null}
      <p>{text}</p>
      <Link to={`/locations/${slug}`}>View location details</Link>
    </article>
  )
}

export function ClassCard({ title, text, path, slug }) {
  return (
    <article className="card">
      <h3>{title}</h3>
      <p>{text}</p>
      <div className="card-links">
        <Link to={path}>View details</Link>
        <Link to={`/classes/${slug}`}>Class overview</Link>
      </div>
    </article>
  )
}

export function NewsCard({ title, date, text }) {
  return <article className="card"><p className="muted">{date}</p><h3>{title}</h3><p>{text}</p></article>
}

export function AppFeatureCard({ feature }) {
  return <article className="card"><h3>{feature}</h3><p>Clear guidance designed to support dojo training.</p></article>
}

export function InstructorCard() {
  return (
    <article className="card">
      <h3>Experienced Wado-Ryu instruction</h3>
      <p>Led by committed instructors focused on safe progression, technical quality and long-term development.</p>
      <p className="muted">Beginners and families receive practical guidance from first class through grading preparation.</p>
    </article>
  )
}
