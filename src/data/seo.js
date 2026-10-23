import { contact, venues } from './siteData.js'

export const siteUrl = 'https://hakuba-karate.co.uk'
export const publicRoutes = ['/', '/classes', '/classes/kids', '/classes/adults', '/classes/beginners', '/beginners', '/kids-karate', '/adult-karate', '/locations', '/locations/wroughton', '/locations/mevagissey', '/about', '/news', '/contact', '/app']

export function getPageMetadata(pathname, title, description, noIndex = false) {
  const url = `${siteUrl}${pathname === '/' ? '/' : pathname.replace(/\/$/, '') + '/'}`
  const image = `${siteUrl}/images/hakuba-course-september-2026.jpg`
  const organisation = {
    '@type': 'SportsOrganization', '@id': `${siteUrl}/#club`, name: 'Hakuba Karate', url: `${siteUrl}/`,
    logo: `${siteUrl}/hakuba-logo.png`, sport: 'Wado-Ryu karate', email: contact.email, telephone: contact.phone,
    areaServed: ['Wroughton', 'Swindon', 'Mevagissey'],
    sameAs: ['https://www.facebook.com/profile.php?id=61586031931783', 'https://www.facebook.com/profile.php?id=100090005253077'],
    location: venues.filter((venue) => venue.primary).map((venue) => ({
      '@type': 'Place', name: venue.name,
      address: { '@type': 'PostalAddress', streetAddress: venue.street, addressLocality: venue.area, postalCode: venue.postcode, addressCountry: 'GB' },
    })),
  }
  return {
    title, description, url, robots: noIndex ? 'noindex, nofollow' : 'index, follow',
    social: { 'og:type': 'website', 'og:site_name': 'Hakuba Karate', 'og:locale': 'en_GB', 'og:title': title, 'og:description': description, 'og:url': url, 'og:image': image, 'og:image:alt': 'Hakuba students training together in Mevagissey', 'twitter:card': 'summary_large_image', 'twitter:title': title, 'twitter:description': description, 'twitter:image': image },
    schema: noIndex ? {} : { '@context': 'https://schema.org', '@graph': [organisation, { '@type': 'WebPage', '@id': `${url}#page`, url, name: title, description, inLanguage: 'en-GB', about: { '@id': `${siteUrl}/#club` } }] },
  }
}
