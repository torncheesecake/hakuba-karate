import SEO from '../components/SEO'
import CTAButton from '../components/CTAButton'
import EditorialHero from '../components/EditorialHero'
import DojoSchedule from '../components/DojoSchedule'
import FAQ from '../components/FAQ'
import JoinBand from '../components/JoinBand'
import TrainingFocus from '../components/TrainingFocus'
import ClubImage from '../components/ClubImage'

const juniorSessionTypes = ['Kids', 'Mixed', 'Family']
const trainingFocus = [
  { title: 'Focus and listening', text: 'Following an instruction, watching a demonstration and trying again are part of each lesson. Children have something specific to concentrate on, one movement at a time.' },
  { title: 'Coordination and control', text: 'Stances, footwork and basic techniques give children a chance to practise balance and controlled movement. Getting the basics right matters more than rushing ahead.' },
  { title: 'Respect for others', text: 'Bowing, listening and consideration for training partners are part of learning karate. Progress is about how children practise as well as the techniques they learn.' },
]
const parentQuestions = [
  ['Can parents stay and watch?', 'Yes. Parents are welcome to stay and watch every lesson, not just the first.'],
  ['What age can my child start?', 'Children can join from age 7. Wroughton has a Thursday juniors class and a mixed Saturday session; Mevagissey has a Tuesday family and adults session. Ask the club which is most suitable.'],
  ['Do I need to buy a gi before the first class?', 'No. Your child can try karate in comfortable training clothing. Bring water and arrive a few minutes early to meet the instructor. No booking is needed.'],
  ['What if my child is nervous?', 'You are welcome to contact us before their first visit if you have questions. Arriving a few minutes early gives you time to meet the instructor and explain what your child is worried about.'],
  ['Can karate help if my child is being bullied?', 'Training gives children an opportunity to work on confidence, respect and controlled movement. It is not a guarantee against bullying or a substitute for support from their school or a trusted adult. Tell us what you hope your child will get from training.'],
  ['How does belt progression work?', 'The grading syllabus sets out the techniques for each grade. Your child learns through regular practice, with their instructor guiding progression. There is no need to know the syllabus before the first class.'],
]

export default function KidsPage() {
  return (
    <>
      <SEO title="Kids Karate in Wroughton, Swindon & Mevagissey | Hakuba" description="Children's Wado-Ryu karate from age 7 in Wroughton, Swindon and Mevagissey. Find junior and family class times, meet the club and plan a beginner-friendly first visit." />
      <EditorialHero label="Kids karate / Ages 7+" title="A place to begin." image="/images/facebook-grading-practice.jpg" alt="Young Hakuba students practising a controlled partner technique">
        <p>Karate for children aged 7 and above. Respect, concentration and coordination are part of learning traditional Wado-Ryu, one technique at a time.</p>
        <p>Complete beginners are welcome. Your child can try a suitable class without booking. Arrive a few minutes early to meet the instructor.</p>
      </EditorialHero>
      <section className="editorial-split editorial-split--reverse">
        <figure className="editorial-split__image training-still">
          <ClubImage src="/images/video-stills/1078469797932010-18s.jpg" alt="Children and adults practising basic punches together in a mixed Hakuba class" width="511" height="287" loading="lazy" />
        </figure>
        <div className="editorial-split__copy">
          <p className="kicker">Learning through practice</p>
          <h2>The basics come first.</h2>
          <p>Children learn rei (respect), kihon (basic techniques) and structured movement. Regular practice gives them time to work on each skill.</p>
          <p>Instructors offer supportive coaching and guidance on progression. You can ask your instructor about the class pathway when you arrive.</p>
          <CTAButton to="/beginners" variant="secondary">What happens in a first class?</CTAButton>
        </div>
      </section>
      <TrainingFocus id="children-training" label="Learning beyond the belt" title="Small skills. Steady practice." intro="Every child starts somewhere. Traditional karate gives them a routine in which to practise concentration, movement and consideration for other people." items={trainingFocus} />

      <section id="confidence-and-bullying" className="editorial-band bleed-full">
        <div className="container editorial-band__inner">
          <div><p className="kicker">Confidence / Respect / Self-control</p><h2>Confidence, with<br />consideration.</h2><p>Karate is not about looking for a fight. Children practise listening, working with others and controlling their movements.</p></div>
          <div><h3>If bullying is part of the picture</h3><p>Tell us why you are considering karate for your child. We can discuss the class and what training involves, without promising a quick fix.</p><p>Karate does not replace support from a school or a trusted adult. A child does not have to deal with bullying alone, and learning techniques is not a reason to seek confrontation.</p><CTAButton to="/contact?interest=Kids">Ask about a class for your child</CTAButton></div>
        </div>
      </section>

      <section className="pathway-split">
        <article>
          <p className="kicker">Wroughton / Swindon</p>
          <h2>Junior and mixed sessions.</h2>
          <p>The Thursday juniors class welcomes ages 7+. Saturday brings juniors and adults together in a mixed session at Ellendune Community Centre.</p>
          <CTAButton to="/classes/kids" variant="secondary">Junior session details</CTAButton>
        </article>
        <article>
          <p className="kicker">Mevagissey / Cornwall</p>
          <h2>A family class from age 7.</h2>
          <p>The Tuesday family and adults session at Mevagissey Activity Centre welcomes students aged 7+. Arrive a few minutes early; no booking needed. Contact us if you would like help choosing.</p>
          <CTAButton to="/locations/mevagissey" variant="secondary">Explore Mevagissey dojo</CTAButton>
        </article>
      </section>
      <DojoSchedule title="Junior, mixed and family classes" types={juniorSessionTypes} />
      <FAQ title="Questions from parents" items={parentQuestions} />
      <JoinBand title="Their first class starts with a conversation." />
    </>
  )
}
