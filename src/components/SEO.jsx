import { createContext, useContext, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { getPageMetadata } from '../data/seo'

// Build rendering collects the metadata also used by client navigation.
export const SEOContext = createContext(null)

function SEO({ title, description, noIndex = false }) {
  const { pathname } = useLocation()
  const collect = useContext(SEOContext)
  if (collect) collect(getPageMetadata(pathname, title, description, noIndex))
  useEffect(() => {
    document.title = title
    const values = getPageMetadata(pathname, title, description, noIndex)
    const upsert = (selector, attributes) => {
      let element = document.head.querySelector(selector)
      if (!element) {
        element = document.createElement(attributes.rel ? 'link' : 'meta')
        document.head.appendChild(element)
      }
      Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value))
    }
    upsert('meta[name="description"]', { name: 'description', content: description })
    upsert('meta[name="robots"]', { name: 'robots', content: values.robots })
    upsert('link[rel="canonical"]', { rel: 'canonical', href: values.url })
    Object.entries(values.social).forEach(([property, content]) => {
      const key = property.startsWith('twitter:') ? 'name' : 'property'
      upsert(`meta[${key}="${property}"]`, { [key]: property, content })
    })
    let schema = document.head.querySelector('#club-schema')
    if (!schema) {
      schema = document.createElement('script')
      schema.id = 'club-schema'
      schema.type = 'application/ld+json'
      document.head.appendChild(schema)
    }
    schema.textContent = JSON.stringify(values.schema)
  }, [title, description, noIndex, pathname])

  return null
}

export default SEO
