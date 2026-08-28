# PostHog — Dashboards y funnels recomendados

> Parte del plan de medición. Contexto completo: [`analytics-measurement.md`](./analytics-measurement.md)

Crear estos insights en el proyecto PostHog de Mad Dogos (crear proyecto dedicado si aún usa "Bodegom").

## Funnel 1 — Pedido completo (KPI principal)

**Tipo:** Funnel  
**Nombre:** Conversión pedido completo  
**Pasos:**

1. `add_to_cart`
2. `cart_checkout_start`
3. `whatsapp_click` (filter: `type` = `order`)
4. `whatsapp_redirect` (filter: `type` = `order`)

**Breakdown sugerido:** `source`, `landing_src`, `utm_source`

## Funnel 2 — Abandono de carrito

**Tipo:** Funnel  
**Nombre:** Abandono carrito  
**Pasos:**

1. `add_to_cart`
2. `cart_open`
3. `cart_checkout_start`

Analizar drop-off entre pasos 2 y 3.

## Funnel 3 — Renta de carrito

**Tipo:** Funnel  
**Nombre:** Conversión renta eventos  
**Pasos:**

1. `rental_inquiry_click`
2. `conversion_page_view` (filter: `type` = `rental`)
3. `whatsapp_redirect` (filter: `type` = `rental`)

## Funnel 4 — Intención vs conversión WhatsApp

**Tipo:** Trends (2 series)  
**Nombre:** WhatsApp intención vs conversión  
**Series A:** `whatsapp_click` — Total count  
**Series B:** `whatsapp_redirect` — Total count  
**Breakdown:** `source`  
**Formula opcional:** `B / A` para tasa de conversión por fuente

## Insights adicionales

| Nombre | Tipo | Config |
|--------|------|--------|
| Top productos | Trends | Event: `add_to_cart`, breakdown: `product_name` |
| Fuentes WA | Trends | Event: `whatsapp_redirect`, breakdown: `source` |
| Modalidad pedido | Trends | Event: `whatsapp_redirect`, breakdown: `fulfillment` |
| Categorías vistas | Trends | Event: `menu_category_view`, breakdown: `category` |
| Tráfico QR | Trends | Event: `page_view`, filter: `landing_src` = `qr` |

## Dashboard sugerido: "Mad Dogos — Conversión"

Tiles:

1. Conversión pedido completo (funnel)
2. WhatsApp intención vs conversión (trends)
3. Top productos (trends)
4. Fuentes WA (trends)
5. Abandono carrito (funnel)
6. Conversión renta (funnel)

## Eventos legacy

- `rental_inquiry` — sigue emitiéndose en `/gracias?src=eventos` para compatibilidad con dashboards existentes
- `$pageview` — alias de `page_view` para compatibilidad PostHog
