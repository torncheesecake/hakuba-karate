import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom'
import App from './App'
import { SEOContext } from './components/SEO'

export function renderPage(path) {
  let metadata
  const html = renderToString(<SEOContext.Provider value={(value) => { metadata = value }}><StaticRouter location={path}><App /></StaticRouter></SEOContext.Provider>)
  return { html, metadata }
}
