# Mad Dogos — Contexto del proyecto

## Qué es esto
Sitio web de Mad Dogos Hotdogs, negocio en Culiacán, Sinaloa. Vende hot dogs estilo Sinaloa, hamburguesas, alitas, boneless y más — con delivery propio, local físico y renta de carrito para eventos. El sitio tiene un objetivo principal: convertir visitas en pedidos por WhatsApp.

## Stack
- **Framework:** Next.js 15 App Router + TypeScript
- **UI:** shadcn/ui con tokens de Mad Dogos
- **CMS:** Sanity v3 (Studio embebido en /studio)
- **Estilos:** Tailwind CSS
- **Analytics:** PostHog Cloud + Google Tag Manager
- **Tracking ads:** Meta Pixel vía GTM
- **Deploy:** Vercel
- **Fuente display:** Bebas Neue (Google Fonts)
- **Fuente body:** Inter o system-ui

## Brand tokens (globals.css)
```css
--primary: 0 73% 45%;            /* #CC1717 rojo brand */
--primary-foreground: 0 0% 100%;
--accent: 48 100% 48%;           /* #F5C800 amarillo */
--accent-foreground: 25 100% 5%; /* #1A0A00 negro brand */
--background: 0 0% 100%;
--foreground: 25 100% 5%;
--muted: 20 30% 96%;
--radius: 0.75rem;
```
> ⚠️ Hex aproximados extraídos de material gráfico — pendiente confirmar con cliente.

---

## Estructura de páginas completa

### MVP (construir ahora)
```
/              → Home
/menu          → Menú completo
/renta         → Renta de carrito para eventos
/gracias       → Página intermedia antes del redirect a wa.me (medir conversión real)
/studio/[...]  → Sanity Studio (admin)
```

### V2 (no construir ahora)
```
/nosotros      → Historia de la marca
/driver        → Vista repartidor con PIN
```

### Técnicas (automáticas)
```
/sitemap.xml   → next-sitemap
/robots.txt
```

---

## Layout global

### Header
- Logo Mad Dogos (izquierda)
- Nav: Menú / Renta de carrito / Nosotros (V2)
- CTA botón WhatsApp (siempre visible, esquina derecha)
- Mobile: hamburger menu con sheet de shadcn
- Sticky en scroll, fondo blanco con sombra sutil

### Footer
- Logo + tagline: "Hot dogs estilo Sinaloa en Culiacán"
- Links: Menú / Renta / Nosotros
- Redes sociales: Instagram + Facebook (@MadDogosHotdogs)
- WhatsApp CTA
- Dirección y horario (desde siteConfig de Sanity)
- Copyright

---

## Páginas — detalle por página

### / — Home
**SEO H1 (keyword principal):** "Hot dogs a domicilio en Culiacán"
**Meta title:** "Mad Dogos | Hot Dogs y Hamburguesas a Domicilio en Culiacán"
**Meta description:** "Pide tus hot dogs, hamburguesas, alitas y boneless a domicilio en Culiacán. Mad Dogos Hotdogs — entrega rápida directo por WhatsApp."

**Secciones en orden:**
1. **Hero** — Foto hero del producto, H1 con keyword, subtítulo, CTA WhatsApp primario + CTA Ver menú secundario
2. **Categorías rápidas** — Grid de íconos/chips: Hot Dogs / Burgers / Alitas / Boneless / Conos / Charolas — cada uno linkea a /menu?cat=X
3. **Productos destacados** — 4 cards de productos (Lo más pedido: Maddogo Especial, Mad Burguer, Orden de Alitas, MadCono Grande)
4. **Renta de carrito** — Banner/sección con foto del carrito, texto "¿Tienes un evento?" CTA a /renta
5. **Zona de cobertura** — Texto simple de zona de entrega en Culiacán
6. **CTA final** — Banda roja con "¿Tienes hambre? Ordena ahora" + botón WhatsApp grande

### /menu — Menú completo
**SEO H1:** "Menú Mad Dogos — Hot Dogs, Burgers, Alitas y más en Culiacán"
**Meta title:** "Menú | Mad Dogos Hotdogs Culiacán"

**Funcionalidad:**
- Filtro por categoría (tabs o chips): Todos / Hot Dogs / Hamburguesas / Alitas / Boneless / Conos / Charolas / Combos / Extras / Bebidas
- Grid de MenuCards con: foto, nombre, descripción, precio, badge (opcional), botón "Pedir"
- Botón WhatsApp flotante fijo en mobile (bottom-right)
- ISR revalidate: 60 segundos

### /renta — Renta de carrito
**SEO H1:** "Renta el carrito de Mad Dogos para tu evento en Culiacán"
**Meta title:** "Renta de Carrito para Eventos | Mad Dogos Culiacán"

**Secciones:**
1. Hero con foto del carrito
2. Qué incluye (lista visual)
3. Tipos de eventos (bodas, XV años, corporativos, fiestas)
4. CTA WhatsApp para cotizar — dispara evento PostHog `rental_inquiry`

### /gracias — Página de conversión
Página intermedia que se muestra antes del redirect final a `wa.me`. Sirve para medir conversión real (no solo intención de clic).

**Flujo:** CTA WhatsApp → `/gracias?item=X&src=Y` → dispara `whatsapp_redirect` en PostHog → redirect a `wa.me` con delay de 200ms.

**Contenido:** "¡Gracias! Te estamos redirigiendo a WhatsApp..." + spinner. No indexable (`noindex`).

---

## Schema de Sanity

### menuItem
```ts
defineType({
  name: 'menuItem',
  title: 'Producto del menú',
  type: 'document',
  fields: [
    defineField({ name: 'name', type: 'string', title: 'Nombre', validation: Rule => Rule.required() }),
    defineField({ name: 'slug', type: 'slug', options: { source: 'name' } }),
    defineField({ name: 'description', type: 'text', title: 'Descripción', rows: 2 }),
    defineField({ name: 'price', type: 'number', title: 'Precio (MXN)', validation: Rule => Rule.required().min(0) }),
    defineField({ name: 'image', type: 'image', options: { hotspot: true }, fields: [{ name: 'alt', type: 'string', title: 'Texto alternativo', validation: Rule => Rule.required() }] }),
    defineField({
      name: 'category',
      type: 'string',
      title: 'Categoría',
      options: {
        list: [
          { title: 'Hot Dogs', value: 'hot-dogs' },
          { title: 'Hamburguesas', value: 'hamburguesas' },
          { title: 'Alitas', value: 'alitas' },
          { title: 'Boneless', value: 'boneless' },
          { title: 'Conos', value: 'conos' },
          { title: 'Charolas', value: 'charolas' },
          { title: 'Combos', value: 'combos' },
          { title: 'Orden de Papas', value: 'papas' },
          { title: 'Extras', value: 'extras' },
          { title: 'Bebidas', value: 'bebidas' },
        ]
      },
      validation: Rule => Rule.required()
    }),
    defineField({
      name: 'badge',
      type: 'string',
      title: 'Badge (opcional)',
      options: { list: ['Lo más pedido', 'Nuevo', 'Promo', 'Picante', 'Sin papas'] }
    }),
    defineField({ name: 'available', type: 'boolean', title: 'Disponible', initialValue: true }),
    defineField({ name: 'featured', type: 'boolean', title: 'Destacado en Home', initialValue: false }),
    defineField({ name: 'order', type: 'number', title: 'Orden en el menú' }),
  ],
  orderings: [{ title: 'Categoría', name: 'categoryAsc', by: [{ field: 'category', direction: 'asc' }, { field: 'order', direction: 'asc' }] }],
  preview: { select: { title: 'name', subtitle: 'category', media: 'image' } }
})
```

### siteConfig (singleton)
Singleton: usar `_id: 'siteConfig'` fijo en desk structure y limitar acciones a solo `update` y `publish` (no crear ni borrar).

```ts
defineType({
  name: 'siteConfig',
  title: 'Configuración del sitio',
  type: 'document',
  __experimental_actions: ['update', 'publish'],
  fields: [
    defineField({ name: 'whatsappNumber', type: 'string', title: 'Número WhatsApp', description: 'Formato: 526671900771', validation: Rule => Rule.regex(/^52\d{10}$/, { name: 'E.164 MX' }) }),
    defineField({ name: 'whatsappMessage', type: 'string', title: 'Mensaje default WA', initialValue: 'Hola, quiero hacer un pedido' }),
    defineField({ name: 'address', type: 'string', title: 'Dirección' }),
    defineField({ name: 'deliveryZone', type: 'text', title: 'Zona de cobertura delivery', rows: 2 }),
    defineField({ name: 'openingHours', type: 'string', title: 'Horario' }),
    defineField({ name: 'instagramUrl', type: 'url', title: 'Instagram URL' }),
    defineField({ name: 'facebookUrl', type: 'url', title: 'Facebook URL' }),
  ]
})
```

---

## Datos del menú para cargar en Sanity

### HOT DOGS
| Nombre | Precio | Descripción |
|---|---|---|
| Easy Dog | $70 | Salchicha de pavo con tocino |
| Easy Dog Especial | $80 | Easy Dog envuelto en queso manchego y jamón de pavo |
| Easy Dog Especial Jumbo | $100 | Salchicha jumbo de pavo envuelta en tocino, queso manchego y jamón de pavo |
| Chilli Dog | $95 | Salchicha de puerco con queso y chile jalapeño, envuelto en queso manchego y jamón de pavo |
| Perro Bacon | $95 | Salchicha de puerco con queso y tocino, envuelto en queso manchego y jamón de pavo |
| Beef Dog | $100 | Salchicha de res con queso y perejil, envuelto en queso manchego y jamón de pavo |
| Maddogo Especial | $100 | Salchicha de mezcla especial de carne de res y tocino, envuelta en tocino, queso manchego, jamón de pavo y cebolla asada |

### HAMBURGUESAS
| Nombre | Precio | Descripción |
|---|---|---|
| Mad Burguer | $155 | Mezcla especial de carne con salsa, queso gouda, jamón, lechuga, tomate y cebolla |
| MadBon Burguer | $155 | Boneless bañados en salsa con queso gouda, jamón, lechuga, tomate y cebolla |
| MadDouble Burguer | $185 | Mezcla especial doble con salsa, queso gouda, jamón, lechuga, tomate y cebolla |
| MadBurguer Hawaiana | $185 | Carne y tocino con salsa, piña, guacamole, queso manchego, jamón, lechuga, tomate y cebolla asada |
| MadBurguer Camarón | $180 | Camarones asados al pastor en costra de queso, lechuga, tomate, cebolla asada, pan brioche, aderezo chipotle spicy |
| Smash MadBurger | $180 | Doble carne 200gr estilo smash, queso americano, tocino, pepinillos, pan brioche, aderezo especial |
| LowCarb Burguer | $155 | Sin papas. Lechuga romana con carne y tocino, queso manchego, jamón, lechuga, tomate, cebolla asada, vegetales y guacamole |
| LowCarb Double Burguer | $185 | Sin papas. LowCarb con doble carne, doble queso, doble jamón, vegetales y guacamole |
| Mad Cheese Burguer | $185 | 200gr carne rellena de queso americano, jamón, tocino, lechuga, tomate y cebolla |
| Mad West Burguer | $185 | Carne y tocino con BBQ, queso manchego, jamón, 4 aros de cebolla, tocino frito en BBQ |
| IN-N-OUT Burguer | $180 | Pan brioche, mayonesa, lechuga romana, carne, queso americano, tomate, cebolla cruda, pepinillos, aderezo style |

### ALITAS
| Nombre | Precio | Descripción |
|---|---|---|
| Orden de Alitas | $155 | 10 pzas con salsa de elección y vegetales |
| Orden de Alitas Especiales | $175 | Orden de alitas con papas gratinadas |
| Alitas Salvajes | $195 | 10 pzas con papas salvajes |

**Salsas disponibles:** BBQ / Red Hot / Teriyaki / MadDogos Sauce / Mango Habanero

### BONELESS
| Nombre | Precio | Descripción |
|---|---|---|
| Orden de Boneless | $155 | 10 pzas con salsa de elección y vegetales |
| Orden de Boneless Especiales | $175 | Boneless con papas gratinadas |
| Boneless Salvajes | $195 | 10 pzas con papas salvajes |

### ORDEN DE PAPAS
| Nombre | Precio | Descripción |
|---|---|---|
| Papas a la Francesa | $80 | Papas naturales a la francesa |
| Papas Curly Lemonpepper | $80 | Papas curly con pimienta y limón |
| Orden de Papas Animal Fries | $100 | Papas con queso manchego, tocino frito y aderezo IN-N-OUT |
| Papas Salvajes | $100 | Papas con jamón de pavo, queso manchego y salchicha de jalapeño |
| Orden de Aros de Cebolla | $110 | 8 aros de cebolla con papas a la francesa |

### CONOS
| Nombre | Precio | Descripción |
|---|---|---|
| MadCono Chico | $125 | Media orden de boneless en papas curly lemonpepper, queso de nachos y ranch |
| MadCono Grande | $175 | Orden de boneless en papas curly lemonpepper, queso de nachos y ranch |
| MadCono Salvaje | $200 | Orden de boneless en papas curly lemonpepper, queso de nachos, ranch y topping de papas salvajes |

### CHAROLAS
| Nombre | Precio | Descripción |
|---|---|---|
| Charola MadCombo Burguer | $450 | 1 MadBurguer, alitas, boneless, vegetales, papas y 2 bebidas |
| Charola MadCombo Dogos | $450 | 2 Hot Dogs (no BeefDog), alitas, boneless, vegetales, papas y 2 bebidas |
| Charola Especial MadDogos | $480 | 1 Hawaiana/MadWest/MadDouble, alitas, boneless, vegetales, papas y 2 bebidas |

### COMBOS
| Nombre | Precio | Descripción |
|---|---|---|
| Combo Dr Alitas | $160 | 1 Hot Dog + papas + ½ orden de alitas |
| Combo Dr Boneless | $160 | 1 Hot Dog + papas + ½ orden de boneless |
| Combo 2 Perro Bacon | $160 | 2 Perro Bacon (sin papas) |
| Combo 2 Chilli Dog | $160 | 2 Chilli Dog (sin papas) |
| Combo Perro Bacon + Chilli Dog | $160 | 1 Perro Bacon + 1 Chilli Dog (sin papas) |
| Combo 3 Easy Dog | $160 | 3 Easy Dog (sin papas) |

### EXTRAS
| Nombre | Precio |
|---|---|
| Aderezo Animal Style | $15 |
| Chile Amarillo 3 pzas | $15 |
| Guacamole 2 oz | $15 |
| Gratinado de Papas | $25 |
| Aderezo Ranch | $15 |
| Salsa BBQ | $15 |
| Salsa Red Hot | $15 |
| Salsa Teriyaki | $15 |
| MadDogos Sauce | $15 |
| Queso de Nachos | $15 |
| Salsa Mango Habanero | $15 |
| Aro de Cebolla 1 pza | $15 |
| Papas Salvajes o Animal Style | $65 |
| Combo DR | $75 |

### BEBIDAS
| Nombre | Precio |
|---|---|
| Fresa Limón | $25 |
| Naranjita | $25 |
| Té de Jazmín | $25 |
| Coca-Cola 500ml | $25 |
| Coca-Cola 600ml | $30 |
| Limonada | $25 |
| Jamaica | $25 |
| Vaso con Hielo | $5 |

---

## CTA de WhatsApp — patrón estándar
Los CTAs no redirigen directo a `wa.me` — van a `/gracias?item=X&src=Y` que dispara el evento PostHog y luego hace el redirect.

```ts
// utils/whatsapp.ts
export function buildWhatsAppUrl(item?: string) {
  const number = process.env.NEXT_PUBLIC_WA_NUMBER // 526671900771
  const message = item
    ? `Hola, quiero pedir: ${item}`
    : `Hola, quiero hacer un pedido`
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

export function buildGraciasUrl(item?: string, source?: string) {
  const params = new URLSearchParams()
  if (item) params.set('item', item)
  if (source) params.set('src', source)
  return `/gracias?${params}`
}
```

## Pixel events — PostHog
```ts
posthog.capture('$pageview')                                          // automático
posthog.capture('product_viewed', { name, price, category })          // al ver un producto
posthog.capture('whatsapp_click', { name, price, source })            // al tocar CTA (intención)
posthog.capture('whatsapp_redirect', { name, price, source })         // en /gracias (conversión real)
posthog.capture('menu_filter', { category })                          // al filtrar menú
posthog.capture('rental_inquiry')                                     // CTA de /renta
```

`whatsapp_click` = intención. `whatsapp_redirect` = conversión. Usar `whatsapp_redirect` como métrica principal de conversión en PostHog.

## Variables de entorno (.env.local)
```
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
NEXT_PUBLIC_WA_NUMBER=526671900771
NEXT_PUBLIC_GTM_ID=
```

## SEO / Schema
- `LocalBusiness` JSON-LD en layout.tsx
- `Restaurant` type dentro del LocalBusiness
- OG tags por página (title, description, image)
- `sitemap.xml` con next-sitemap
- `robots.txt`
- Canonical URLs

## Reglas de desarrollo
- Siempre App Router — nunca pages/
- Componentes del menú: RSC por default, `'use client'` solo si necesita interactividad
- Imágenes de Sanity: siempre `next/image` + `urlFor()` de `@sanity/image-url`; incluir `alt` del campo `image.alt`
- ISR en /menu: `revalidate: 60` + webhook de Sanity para on-demand revalidation (`/api/revalidate`)
- Todos los CTAs de WhatsApp redirigen a `/gracias` (no directo a `wa.me`) para trackear conversión real
- Tipografía display: Bebas Neue para h1 y hero
- No usar colores hardcoded — siempre CSS variables
- shadcn components para UI base, custom solo para componentes de negocio

## GROQ queries

```ts
// Productos destacados para home (featured: true, available: true)
const featuredQuery = `*[_type == "menuItem" && featured == true && available == true] | order(order asc) [0...4] {
  _id, name, slug, description, price, category, badge,
  image { asset, hotspot, crop, alt }
}`

// Menú completo filtrado por categoría (null = todos)
const menuQuery = `*[_type == "menuItem" && available == true ${category ? '&& category == $category' : ''}] | order(category asc, order asc) {
  _id, name, slug, description, price, category, badge,
  image { asset, hotspot, crop, alt }
}`

// Configuración global del sitio
const siteConfigQuery = `*[_type == "siteConfig" && _id == "siteConfig"][0] {
  whatsappNumber, whatsappMessage, address, deliveryZone, openingHours,
  instagramUrl, facebookUrl
}`
```

## Prioridad de construcción
0. **Setup previo** — Crear proyecto Sanity (sanity.io), dataset `production`, agregar CORS origin de localhost y dominio Vercel, configurar `.env.local` con todas las variables
1. `globals.css` (tokens Mad Dogos) + Bebas Neue en `layout.tsx` + PostHog provider + JSON-LD LocalBusiness
2. Schemas de Sanity (`menuItem` + `siteConfig`) + singleton enforcement en desk structure
3. Seed mínimo — cargar 5 productos representativos en Sanity Studio para poder probar la UI
4. Header + Footer (con datos dinámicos de `siteConfig`)
5. Componente `MenuCard`
6. Página `/menu`
7. Página `/` (home)
8. Página `/renta`
9. Página `/gracias` (conversión tracking)
10. Webhook on-demand revalidation (`/api/revalidate`)
11. Cargar menú completo en Sanity Studio

## Info del negocio
- Nombre: Mad Dogos Hotdogs
- Ciudad: Culiacán, Sinaloa, México
- WhatsApp: +52 667 190 0771
- Redes: @MadDogosHotdogs (Instagram y Facebook)
- El negocio ya tiene clientes y ventas activas por redes sociales
- El QR del local apunta a `/?src=qr`
- Pendiente del cliente: logo SVG, hex exactos, fotos de productos