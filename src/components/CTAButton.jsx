import { Link } from 'react-router-dom'

function CTAButton({ to, href, children, variant = 'primary' }) {
  if (href) {
    return (
      <a href={href} className={`cta-button cta-button--${variant}`}>
        {children}
      </a>
    )
  }

  return (
    <Link to={to} className={`cta-button cta-button--${variant}`}>
      {children}
    </Link>
  )
}

export default CTAButton
