export default function TrainingFocus({ id, label, title, intro, items }) {
  return (
    <section className="training-focus" aria-labelledby={`${id}-title`}>
      <div className="training-focus__heading">
        <div><p className="kicker">{label}</p><h2 id={`${id}-title`}>{title}</h2></div>
        <p>{intro}</p>
      </div>
      <dl className="training-focus__list">
        {items.map((item, index) => <div key={item.title}>
          <dt><span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>{item.title}</dt>
          <dd>{item.text}</dd>
        </div>)}
      </dl>
    </section>
  )
}
