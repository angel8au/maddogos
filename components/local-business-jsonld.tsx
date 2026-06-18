export function LocalBusinessJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'Restaurant'],
    name: 'Mad Dogos Hotdogs',
    description:
      'Hot dogs estilo Sinaloa, hamburguesas, alitas y boneless a domicilio en Culiacán.',
    telephone: '+526671900771',
    sameAs: [
      'https://www.instagram.com/MadDogosHotdogs',
      'https://www.facebook.com/MadDogosHotdogs',
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Culiacán',
      addressRegion: 'Sinaloa',
      addressCountry: 'MX',
    },
    servesCuisine: ['Hot Dogs', 'American', 'Mexican'],
    priceRange: '$',
    hasMap: 'https://maps.google.com/?q=Mad+Dogos+Hotdogs+Culiacan',
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
