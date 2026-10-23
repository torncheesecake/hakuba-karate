import { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const links = [
  ['/classes', 'Classes'],
  ['/beginners', 'First Class'],
  ['/locations', 'Locations'],
  ['/about', 'About'],
  ['/news', 'News'],
  ['/app', 'Resources'],
  ['/contact', 'Contact'],
]

function SiteHeader() {
  const [open, setOpen] = useState(false)
  const toggle = useRef(null)

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 980px)')
    const closeOnDesktop = () => { if (desktop.matches) setOpen(false) }
    desktop.addEventListener('change', closeOnDesktop)
    return () => desktop.removeEventListener('change', closeOnDesktop)
  }, [])

  useEffect(() => {
    if (!open) return
    const onEscape = (event) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      toggle.current?.focus()
    }
    document.addEventListener('keydown', onEscape)
    return () => document.removeEventListener('keydown', onEscape)
  }, [open])

  return (
    <header className="site-header public-header">
      <div className="container site-header__inner">
        <div className="site-header__bar">
          <NavLink to="/" className="brand">
            <img src="/hakuba-logo.png" alt="Hakuba Karate logo" className="brand__logo" />
            <span>Hakuba Karate<small>Traditional Wado-Ryu</small></span>
          </NavLink>
          <button ref={toggle} type="button" className="nav-toggle" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls="main-nav">{open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}{open ? 'Close' : 'Menu'}</button>
        </div>
        <nav id="main-nav" className={open ? 'open' : ''} aria-label="Main navigation">
          <ul>
            {links.map(([to, label]) => (
              <li key={to}><NavLink to={to} className={to === '/contact' ? 'public-nav-trial' : undefined} onClick={() => setOpen(false)}>{label}</NavLink></li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default SiteHeader
