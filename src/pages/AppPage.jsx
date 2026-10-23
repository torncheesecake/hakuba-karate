import MemberAccess from '../components/MemberAccess'
import SEO from '../components/SEO'
import SyllabusLibrary from '../components/SyllabusLibrary'
import { resources } from '../data/siteData'

export default function AppPage() {
  return <>
    <SEO title="Hakuba Member App and Training Resources" description="Read Hakuba's karate syllabus by belt grade, open original PDFs and explore terminology, kata and the club-approved members app." />
    <section className="resource-hero bleed-full"><div className="container"><p className="kicker">Hakuba / Training resources</p><h1>From the dojo.<br />Into your practice.</h1><p>Your syllabus, a word you want to remember, your next step. Find the reference you need and bring your questions to class.</p><nav aria-label="On this page"><a href="#syllabus">Find your syllabus ↓</a><a href="#member-app-preview">Explore the members app ↓</a><a href="#reference-library">Terminology &amp; kata ↓</a></nav></div></section>
    <SyllabusLibrary />
    <section className="resource-app bleed-full" id="member-app-preview" aria-labelledby="resource-app-title"><div className="container resource-app__inner">
      <div><p className="kicker">For approved members</p><h2 id="resource-app-title">Your practice.<br />All together.</h2><p>The same Hakuba feel, with the tools to support your training between classes. Pick a syllabus, keep track of what you have learnt and revisit the things you want to practise.</p><ul><li><strong>Find your focus.</strong> Belt syllabus, stances, terminology and search.</li><li><strong>Make it stick.</strong> Study mode, practice quizzes, counting and belt tying.</li><li><strong>Prepare your next step.</strong> Track your syllabus progress, collect achievements and keep up with the club calendar.</li></ul><MemberAccess /><p className="resource-app__note">The app supports practice. Your instructor guides your progress.</p></div>
      <figure><img src="/images/member-app-dashboard-current.png" alt="Example of the redesigned Hakuba app with a syllabus selector, training panel and icon menu" width="1100" height="980" loading="lazy" /><figcaption>Example interface. No personal progress or live class information is shown.</figcaption></figure>
    </div></section>
    <section className="resource-reference" id="reference-library"><div><p className="kicker">Understand the foundations</p><h2>The words.<br />The forms. The values.</h2><p>Use the club&apos;s existing reference library alongside your syllabus. Ask your instructor if a movement or explanation is unfamiliar.</p></div><ul className="resource-index">{resources.filter(resource => resource.name !== 'Grading syllabus').map(resource => <li key={resource.href}><a href={resource.href}>{resource.name}<span aria-hidden="true">↗</span></a></li>)}</ul></section>
  </>
}
