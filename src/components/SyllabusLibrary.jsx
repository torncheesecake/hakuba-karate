import syllabuses from '../data/publicSyllabus.json'

export default function SyllabusLibrary() {
  return <section className="syllabus-library" id="syllabus" aria-labelledby="syllabus-title">
    <div className="syllabus-library__intro"><div><p className="kicker">The club resource library</p><h2 id="syllabus-title">Find your syllabus.</h2></div><p>Choose your grade to read it here, without zooming into a PDF. Keep practising earlier material too: progression builds on what you already know.</p></div>
    <p className="syllabus-library__note">These reading versions adapt the club&apos;s published PDFs for club use. Your instructor confirms current grading requirements. The original documents remain available below.</p>
    <div className="syllabus-library__list">{syllabuses.map(item => <details className={`syllabus-reader syllabus-reader--${item.id}`} id={`syllabus-${item.id}`} name="syllabus" key={item.id}>
      <summary><span className="syllabus-reader__belt" aria-hidden="true" /><strong>{item.grade}</strong><span>{item.colour} belt</span><span className="syllabus-reader__action">Read syllabus <span aria-hidden="true">+</span></span></summary>
      <article className="syllabus-reader__body" aria-label={`${item.grade} syllabus`}>
        <header><p className="kicker">Hakuba Wado-Ryu / Reading edition</p><h3>{item.grade} / {item.colour} belt</h3><a className="editorial-link" href={item.pdf}>Open original PDF <span aria-hidden="true">↗</span></a></header>
        {item.sections.map((section, index) => <section className="syllabus-reader__section" key={index}><h4>{section.title}</h4><div>{section.blocks.map((text, n) => <p key={n}>{text}</p>)}</div></section>)}
        <footer><p>Selected reference material from the published document, not a substitute for dojo instruction. Your instructor confirms current grading requirements.</p><a href={item.source}>View the club&apos;s source PDF</a></footer>
      </article>
    </details>)}</div>
  </section>
}
