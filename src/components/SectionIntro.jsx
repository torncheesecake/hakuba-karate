function SectionIntro({ eyebrow, title, text }) {
  return (
    <header className="section-intro">
      {eyebrow && <p className="section-intro__eyebrow">{eyebrow}</p>}
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </header>
  )
}

export default SectionIntro
