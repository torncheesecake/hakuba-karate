import ClubImage from './ClubImage'
import CTAButton from './CTAButton'

export default function EditorialHero({ label, title, children, image, alt, fullFrame = false, imageWidth, imageHeight, imageCaption, cta = 'Ask about a free class', to = '/contact' }) {
  return (
    <section className={`editorial-hero bleed-full${image ? ' editorial-hero--image' : ''}`}>
      <div className="container editorial-hero__inner">
        <div className="editorial-hero__copy">
          <p className="kicker">{label}</p>
          <h1>{title}</h1>
          <div className="editorial-hero__intro">{children}</div>
          <CTAButton to={to}>{cta}</CTAButton>
        </div>
        {image && <figure className={`editorial-hero__image${fullFrame ? ' editorial-hero__image--full-frame' : ''}`}><ClubImage src={image} sizes="(min-width: 1200px) 560px, (min-width: 860px) 46vw, 92vw" alt={alt} width={imageWidth} height={imageHeight} fetchPriority="high" />{imageCaption && <figcaption>{imageCaption}</figcaption>}</figure>}
      </div>
    </section>
  )
}
