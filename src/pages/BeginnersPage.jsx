import ClubImage from '../components/ClubImage'
import SEO from '../components/SEO'
import CTAButton from '../components/CTAButton'
import EditorialHero from '../components/EditorialHero'
import DojoSchedule from '../components/DojoSchedule'
import FAQ from '../components/FAQ'
import JoinBand from '../components/JoinBand'
import { firstClassSteps } from '../data/siteData'

export default function BeginnersPage() {
  return (
    <>
      <SEO title="Your First Karate Class | Hakuba Wroughton & Mevagissey" description="New to karate? Find out what to wear, bring and expect at your first Hakuba Wado-Ryu class in Wroughton, Swindon or Mevagissey. Children 7+ and adults welcome." />
      <EditorialHero label="Beginners / Your first class" title="Start as you are." image="/images/club-course-group.jpg" alt="A group of Hakuba students with different belt grades gathered together at a club course" fullFrame imageWidth={1280} imageHeight={960} imageCaption="Different grades. A shared place to train.">
        <p>You do not need karate experience to begin. Children aged 7+, teenagers and adults are welcome in Wroughton and Mevagissey.</p>
        <p>No booking needed. Choose a suitable class from the timetable and arrive a few minutes early to meet your instructor. Contact us if you would like help choosing.</p>
      </EditorialHero>

      <section className="editorial-band bleed-full">
        <div className="container editorial-band__inner">
          <div>
            <p className="kicker">From first hello to dojo</p>
            <h2>Your first class, step by step.</h2>
            <p>A little preparation leaves you free to concentrate on the basics.</p>
          </div>
          <ol>{firstClassSteps.map((step) => <li key={step}><span>{step}</span></li>)}</ol>
        </div>
      </section>

      <section className="editorial-split">
        <figure className="editorial-split__image">
          <ClubImage src="/images/no-gi-training.png" alt="A Hakuba student in a T-shirt and training trousers practising a partner technique with a student wearing a gi" width="2048" height="1536" loading="lazy" />
        </figure>
        <div className="editorial-split__copy">
          <p className="kicker">What to wear and bring</p>
          <h2>No gi? No problem.</h2>
          <p>Wear comfortable training clothing and bring water. You can start before buying a gi, the traditional karate uniform.</p>
          <p>Arrive a few minutes early to meet the instructor. Your first session introduces core basics and dojo etiquette.</p>
          <CTAButton to="/contact">Ask about your first visit</CTAButton>
        </div>
      </section>

      <DojoSchedule title="Find a time for your first class" />
      <section>
        <h2>After your first session</h2>
        <p>We discuss the right weekly class and explain how to continue. Your instructor can guide you towards syllabus and resource support as you learn.</p>
        <div className="button-row">
          <CTAButton to="/classes/beginners">Beginner session details</CTAButton>
          <CTAButton to="/kids-karate" variant="secondary">For children aged 7+</CTAButton>
          <CTAButton to="/adult-karate" variant="secondary">For teens and adults</CTAButton>
        </div>
      </section>
      <FAQ />
      <JoinBand title="Take the first step." />
    </>
  )
}
