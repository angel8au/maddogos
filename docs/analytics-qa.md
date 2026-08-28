# Analytics — QA y validación

> Parte del plan de medición. Contexto completo: [`analytics-measurement.md`](./analytics-measurement.md)

Checklist para validar la instrumentación del funnel Mad Dogos.

## Pre-requisitos locales

```bash
# .env.local
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
```

## 1. dataLayer (GTM Preview)

| Acción | Evento esperado en dataLayer |
|--------|------------------------------|
| Cargar cualquier página | `page_view`, `session_attribution` (solo 1ª vez) |
| Landing `/?src=qr` | `landing_src: qr` en eventos subsecuentes |
| Cambiar tab de categoría | `menu_category_view` |
| Abrir detalle de producto | `product_view` |
| Agregar al carrito | `add_to_cart` |
| Abrir carrito | `cart_open` |
| Continuar paso 1 → 2 | `cart_checkout_start` |
| Continuar paso 2 → 3 | `cart_checkout_details` |
| Elegir pickup/delivery | `cart_fulfillment_select` |
| Enviar pedido (desktop) | `whatsapp_click` → `/gracias` → `conversion_page_view` → tap WA → `whatsapp_redirect` + `whatsapp_open` |
| Enviar pedido (mobile) | `whatsapp_click` → `whatsapp_redirect` + `whatsapp_open` (sin /gracias) |
| Footer WhatsApp | `whatsapp_click` → `/gracias` → `conversion_page_view` → `whatsapp_redirect` |
| Eventos → Cotizar | `rental_inquiry_click` + `whatsapp_click` |

## 2. PostHog Live Events

- Confirmar que `$pageview` incluye URL completa con query params
- Confirmar un solo `whatsapp_redirect` por conversión (no duplicado en desktop cart)
- Breakdown de `whatsapp_redirect` por `source` funciona
- `rental_inquiry` legacy sigue emitiéndose en `/gracias?src=eventos` (compatibilidad)

## 3. GA4 DebugView

- `view_item` al abrir producto
- `add_to_cart` al agregar
- `begin_checkout` al iniciar checkout
- `generate_lead` en `whatsapp_redirect`

## 4. Deduplicación crítica

| Escenario | whatsapp_redirect esperados |
|-----------|----------------------------|
| Desktop cart checkout | 1 (solo al tap en /gracias) |
| Mobile cart checkout | 1 (al enviar pedido) |
| Android auto-open en /gracias | 1 (auto, no duplicar en tap) |

## 5. Atribución

1. Visitar `https://maddogos.com/?src=qr&utm_source=instagram`
2. Navegar a /menu y agregar producto
3. Verificar en PostHog que `add_to_cart` incluye `landing_src: qr` y `utm_source: instagram`

## Funnels PostHog recomendados

Crear manualmente en PostHog → Insights → Funnel:

1. **Pedido completo:** `add_to_cart` → `cart_checkout_start` → `whatsapp_click` → `whatsapp_redirect`
2. **Abandono carrito:** `add_to_cart` → `cart_open` → (drop-off)
3. **Renta:** `rental_inquiry_click` → `whatsapp_redirect` (filter: type = rental)
4. **Intención vs conversión:** Trends de `whatsapp_click` vs `whatsapp_redirect` breakdown by `source`
