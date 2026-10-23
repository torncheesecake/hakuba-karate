import { firstClassSteps } from '../data/siteData'

function FirstClassSteps() {
  return (
    <section>
      <h2>What happens first</h2>
      <ol className="steps-list">
        {firstClassSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
    </section>
  )
}

export default FirstClassSteps
