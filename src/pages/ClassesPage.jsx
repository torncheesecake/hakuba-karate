import ClubImage from '../components/ClubImage'
import SEO from '../components/SEO'
import CTAButton from '../components/CTAButton'
import DojoSchedule from '../components/DojoSchedule'
import EditorialHero from '../components/EditorialHero'
import FAQ from '../components/FAQ'
import TrainingReasons from '../components/TrainingReasons'
import JoinBand from '../components/JoinBand'

export default function ClassesPage() {
  return (
    <>
      <SEO title="Karate Classes in Wroughton, Swindon & Mevagissey | Hakuba" description="Find weekly Wado-Ryu karate classes for children aged 7+, teens and adults in Wroughton, Swindon and Mevagissey. Beginners welcome; ask about a free trial." />
      <EditorialHero label="Classes / Wroughton & Mevagissey" title="Find your class." image="/images/mixed-class-training.png" alt="Children and adults lined up for Hakuba karate training, some wearing gis and others comfortable sportswear" fullFrame imageWidth={2048} imageHeight={1536} imageCaption="Children and adults. Gis and comfortable sportswear. Everyone starts somewhere.">
        <p>Traditional Wado-Ryu for children aged 7+, teenagers and adults. Choose a dojo and a weekly session; no previous experience needed.</p>
      </EditorialHero>

      <DojoSchedule title="Current timetable" />

      <TrainingReasons />

      <section className="pathway-split">
        <article>
          <h2>Kids karate Swindon and Wroughton</h2>
          <p>Wroughton has a Thursday juniors class and a mixed Saturday session. Children aged 7+ learn respect, movement and core techniques through structured practice.</p>
          <div className="button-row">
            <CTAButton to="/kids-karate">Explore kids karate</CTAButton>
            <CTAButton to="/classes/kids" variant="secondary">Junior session details</CTAButton>
          </div>
        </article>
        <article>
          <h2>Adult karate Swindon and Cornwall</h2>
          <p>Teen and adult classes run on Monday and Thursday in Wroughton. Mevagissey has a Tuesday family and adults session, welcoming students aged 7+.</p>
          <div className="button-row">
            <CTAButton to="/adult-karate">Explore adult karate</CTAButton>
            <CTAButton to="/classes/adults" variant="secondary">Adult session details</CTAButton>
          </div>
        </article>
      </section>
      <section className="editorial-split editorial-split--reverse">
        <figure className="editorial-split__image">
          <ClubImage src="/images/mevagissey.jpg" alt="The indoor sports hall at Mevagissey Activity Centre" loading="lazy" />
        </figure>
        <div className="editorial-split__copy">
          <p className="kicker">Your first visit</p>
          <h2>Choose the session before you arrive.</h2>
          <p>Wroughton trains at Ellendune Community Centre. In Cornwall, you will find us at Mevagissey Activity Centre.</p>
          <p>Tell us the student&apos;s age and preferred dojo. We will help you find a suitable class and explain what to expect.</p>
          <div className="button-row">
            <CTAButton to="/beginners">Your first class</CTAButton>
            <CTAButton to="/locations" variant="secondary">Venue information</CTAButton>
          </div>
        </div>
      </section>
      <FAQ />
      <JoinBand title="Make room for karate." />
    </>
  )
}
