import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'

function SiteLayout() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <SiteHeader />
      <main id="main" className={`container${pathname !== '/' ? ' editorial-page' : ''}`}>
        <Outlet />
      </main>
      <SiteFooter />
    </>
  )
}

export default SiteLayout
