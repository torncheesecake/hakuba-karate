import CTAButton from './CTAButton'

function PageHero({ eyebrow, title, text }) {
  return (
    <section className="hero">
      {eyebrow ? <p className="section-intro__eyebrow">{eyebrow}</p> : null}
      <h1>{title}</h1>
      <p>{text}</p>
      <div className="button-row">
        <CTAButton to="/beginners">Your first class</CTAButton>
        <CTAButton to="/classes" variant="secondary">View class times</CTAButton>
      </div>
    </section>
  )
}

export default PageHero
