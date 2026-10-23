const defaultItems = [
  ['Can parents stay and watch?', 'Yes. Parents are welcome to stay and watch every lesson, not just the first.'],
  ['Who can join?', 'Children aged 7+, teenagers and adults are welcome, including complete beginners.'],
  ['What happens in the first class?', 'You will be introduced to the dojo, meet the instructor and learn core basics in a supportive format.'],
  ['Do I need experience?', 'No. We teach clear fundamentals and help you build confidence step by step.'],
]

function FAQ({ title = 'Common questions', items = defaultItems }) {
  return (
    <section>
      <h2>{title}</h2>
      {items.map(([q, a]) => (
        <details key={q} className="faq-item">
          <summary>{q}</summary>
          <p>{a}</p>
        </details>
      ))}
    </section>
  )
}

export default FAQ
