import SEO from '../components/SEO'
import CTAButton from '../components/CTAButton'
import EditorialHero from '../components/EditorialHero'
import DojoSchedule from '../components/DojoSchedule'
import FAQ from '../components/FAQ'
import JoinBand from '../components/JoinBand'
import TrainingFocus from '../components/TrainingFocus'
import ClubImage from '../components/ClubImage'

const adultSessionTypes = ['Adults', 'Mixed', 'Family']
const trainingFocus = [
  { title: 'Fitness through practice', text: 'Warm-ups, footwork and repeated techniques make training an active part of your week. Give the basics your attention rather than trying to keep up with someone else.' },
  { title: 'Flexibility, at your pace', text: 'You do not need high kicks or impressive flexibility to start learning. Work within your range of movement and discuss any limitations with your instructor before class.' },
  { title: 'Coordination and balance', text: 'Practise where to place your feet, how to hold a stance and how to link movements together. Repetition gives you time to work on control, not just speed.' },
]
const adultQuestions = [
  ['Can I start with no martial arts experience?', 'Yes. Beginners start with the fundamentals, including basic movements and dojo etiquette. You do not need to know Japanese terms, own a gi or have held a belt before.'],
  ['Are these women-only classes?', 'No. Women are welcome in our mixed teen and adult classes. Tell us if you are nervous about starting or have questions about partner work so we can discuss your first visit.'],
  ['What should I wear?', 'Comfortable training clothing is enough for your first class. Bring water and arrive a few minutes early to meet your instructor. No booking is needed.'],
  ['How do I work towards a belt?', 'Use the published grading syllabus alongside your instructor\'s guidance. Gradings are a progression in your training, not something you need to prepare for before your first lesson.'],
]

export default function AdultsPage() {
  return (
    <>
      <SEO title="Adult Karate in Swindon, Wroughton & Mevagissey | Hakuba" description="Start Wado-Ryu karate with no experience. Teen and adult classes in Wroughton, Swindon and Mevagissey, with fitness, self-defence foundations and guided progression." />
      <EditorialHero label="Teen and adult training" title="Make time to train." image="/images/facebook-paired-technique.jpg" alt="Adult and younger Hakuba students practising open-hand techniques together">
        <p>Learn traditional Wado-Ryu in Wroughton or Mevagissey. Start with no previous experience and work through the fundamentals with structured coaching.</p>
      </EditorialHero>
      <section className="editorial-split">
        <figure className="editorial-split__image">
          <ClubImage src="/images/adult-partner-practice.jpg" alt="Adult Hakuba students practising a controlled partner exercise with other pairs training behind them" width="1080" height="1000" loading="lazy" />
        </figure>
        <div className="editorial-split__copy">
          <p className="kicker">Technique / Practice / Progression</p>
          <h2>Give the fundamentals your attention.</h2>
          <p>Training covers basic techniques, kata and grading preparation. Sessions allow steady progression without pressure to rush.</p>
          <p>New to karate? Your first class introduces core basics and dojo etiquette. Wear comfortable training clothing and bring water.</p>
          <CTAButton to="/beginners" variant="secondary">Plan your first class</CTAButton>
        </div>
      </section>
      <TrainingFocus id="adult-training" label="Fitness / Flexibility / Coordination" title="Start where you are." intro="You do not have to arrive feeling fit, flexible or coordinated. These are things you can work on through practice, one session at a time." items={trainingFocus} />

      <section id="women-starting-karate" className="editorial-band bleed-full">
        <div className="container editorial-band__inner">
          <div><p className="kicker">Women starting karate</p><h2>A first class.<br />Not a fitness test.</h2><p>You do not need a sporting background to give karate a go. Women are welcome in Hakuba&apos;s mixed teen and adult sessions, including complete beginners.</p><CTAButton to="/contact?interest=Beginner">Ask about starting karate</CTAButton></div>
          <div><h3>Room to ask questions</h3><p>If you are unsure about the class, the pace or partner practice, you are welcome to contact us before your first visit. We can explain what to expect and help you choose a suitable session.</p><h3>The same foundations</h3><p>Basic techniques, kata and controlled partner exercises form part of traditional Wado-Ryu training. You start with the fundamentals and build from there, with guidance from your instructor.</p><p>These are mixed classes, not a separate women-only course.</p></div>
        </div>
      </section>

      <DojoSchedule title="Teen, adult and mixed classes" types={adultSessionTypes} />
      <section>
        <h2>Choose your dojo.</h2>
        <p>Wroughton has Monday and Thursday teen and adult sessions, plus a mixed Saturday class. Mevagissey trains on Tuesday in a family and adults session.</p>
        <div className="button-row">
          <CTAButton to="/classes/adults">Adult session details</CTAButton>
          <CTAButton to="/locations" variant="secondary">Find your venue</CTAButton>
        </div>
      </section>
      <section className="pathway-split">
        <article>
          <p className="kicker">Between classes</p>
          <h2>Revisit what you learn.</h2>
          <p>The public grading syllabus and karate terminology are useful references alongside your instructor&apos;s guidance.</p>
          <div className="button-row">
            <CTAButton href="https://hakuba-karate.co.uk/grading-syllabus/" variant="secondary">Grading syllabus</CTAButton>
            <CTAButton href="https://hakuba-karate.co.uk/karate-terminology/" variant="secondary">Karate terminology</CTAButton>
          </div>
        </article>
        <article>
          <p className="kicker">For club members</p>
          <h2>Training references in one place.</h2>
          <p>The member app is for registered, club-approved members only. You must sign in to use it; it is not required to attend your first class.</p>
          <CTAButton to="/app" variant="secondary">About the member app</CTAButton>
        </article>
      </section>
      <FAQ title="Before your first adult class" items={adultQuestions} />
      <JoinBand title="Find your place on the dojo floor." />
    </>
  )
}
