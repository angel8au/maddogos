import { getWhatsAppNumber } from '@/lib/whatsapp'
import { BUSINESS_ADDRESS, GOOGLE_MAPS_URL } from '@/lib/site-info'

export function LocalBusinessJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'Restaurant'],
    name: 'Mad Dogos Hotdogs',
    description:
      'Hot dogs estilo Sinaloa, hamburguesas, alitas y boneless a domicilio en Culiacán.',
    telephone: `+${getWhatsAppNumber()}`,
    sameAs: [
      'https://www.instagram.com/MadDogosHotdogs',
      'https://www.facebook.com/MadDogosHotdogs',
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: BUSINESS_ADDRESS.street,
      addressLocality: BUSINESS_ADDRESS.city,
      addressRegion: 'Sinaloa',
      postalCode: BUSINESS_ADDRESS.postalCode,
      addressCountry: 'MX',
    },
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'], opens: '17:00', closes: '23:00' },
    ],
    hasMap: GOOGLE_MAPS_URL,
    servesCuisine: ['Hot Dogs', 'American', 'Mexican'],
    priceRange: '$',
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
