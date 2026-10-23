import CTAButton from './CTAButton'

function ContactCTA() {
  return (
    <section className="contact-cta">
      <h2>Ready to start karate?</h2>
      <p>Choose a suitable class and arrive a few minutes early. No booking needed. Contact us if you would like help choosing.</p>
      <div className="button-row">
        <CTAButton to="/contact">Ask a question</CTAButton>
        <CTAButton to="/classes" variant="secondary">View class times</CTAButton>
      </div>
    </section>
  )
}

export default ContactCTA
