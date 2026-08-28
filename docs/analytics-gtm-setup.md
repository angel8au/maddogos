# GTM — Configuración de tags para Mad Dogos

> Parte del plan de medición. Contexto completo: [`analytics-measurement.md`](./analytics-measurement.md)

Este documento describe la configuración del contenedor Google Tag Manager para consumir el `dataLayer` emitido por [`lib/analytics.ts`](../lib/analytics.ts).

## Prerrequisitos

1. Contenedor GTM creado en [tagmanager.google.com](https://tagmanager.google.com)
2. Propiedad GA4 vinculada al contenedor
3. Meta Pixel configurado (opcional) vía GTM
4. Variable de entorno `NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX` en Vercel y `.env.local`

## Variables del dataLayer ( crear en GTM → Variables → Data Layer Variable )

| Nombre GTM | Clave dataLayer |
|------------|-----------------|
| `dl - event` | `event` |
| `dl - source` | `source` |
| `dl - type` | `type` |
| `dl - product_id` | `product_id` |
| `dl - product_name` | `product_name` |
| `dl - category` | `category` |
| `dl - price` | `price` |
| `dl - quantity` | `quantity` |
| `dl - cart_value` | `cart_value` |
| `dl - cart_items` | `cart_items` |
| `dl - fulfillment` | `fulfillment` |
| `dl - utm_source` | `utm_source` |
| `dl - utm_medium` | `utm_medium` |
| `dl - utm_campaign` | `utm_campaign` |
| `dl - landing_src` | `landing_src` |
| `dl - page_path` | `page_path` |
| `dl - page_location` | `page_location` |

## Triggers ( crear en GTM → Triggers → Custom Event )

| Trigger | Event name |
|---------|------------|
| CE - page_view | `page_view` |
| CE - product_view | `product_view` |
| CE - add_to_cart | `add_to_cart` |
| CE - remove_from_cart | `remove_from_cart` |
| CE - begin_checkout | `cart_checkout_start` |
| CE - add_shipping_info | `cart_fulfillment_select` |
| CE - whatsapp_click | `whatsapp_click` |
| CE - generate_lead | `whatsapp_redirect` |
| CE - rental_inquiry | `rental_inquiry_click` |

## Tags GA4 ( Google Tag → GA4 Event )

### GA4 Configuration (base)

- Tag type: Google Tag
- Tag ID: `G-XXXXXXXXXX`
- Trigger: All Pages

### view_item

- Event name: `view_item`
- Trigger: CE - product_view
- Parameters:
  - `currency`: `MXN`
  - `value`: `{{dl - price}}`
  - `items`: (Custom JavaScript variable o manual)
    ```javascript
    [{
      item_id: {{dl - product_id}},
      item_name: {{dl - product_name}},
      item_category: {{dl - category}},
      price: {{dl - price}}
    }]
    ```

### add_to_cart

- Event name: `add_to_cart`
- Trigger: CE - add_to_cart
- Parameters: `currency`, `value` (`{{dl - cart_value}}`), `items[]`

### remove_from_cart

- Event name: `remove_from_cart`
- Trigger: CE - remove_from_cart

### begin_checkout

- Event name: `begin_checkout`
- Trigger: CE - begin_checkout
- Parameters: `value` = `{{dl - cart_value}}`

### add_shipping_info

- Event name: `add_shipping_info`
- Trigger: CE - add_shipping_info
- Parameters: `shipping_tier` = `{{dl - fulfillment}}`

### generate_lead (conversión principal)

- Event name: `generate_lead`
- Trigger: CE - generate_lead
- Parameters:
  - `lead_type`: `whatsapp_order` (usar Lookup según `{{dl - type}}`)
  - `source`: `{{dl - source}}`
  - `value`: `{{dl - cart_value}}`

### whatsapp_click (custom)

- Event name: `whatsapp_click`
- Trigger: CE - whatsapp_click
- Parameters: `source`, `type`, `fulfillment`

### rental_inquiry

- Event name: `generate_lead`
- Trigger: CE - rental_inquiry
- Parameters: `lead_type` = `rental_inquiry`

## Tags Meta Pixel

| Evento app | Meta Standard Event | Trigger |
|------------|---------------------|---------|
| `product_view` | ViewContent | CE - product_view |
| `add_to_cart` | AddToCart | CE - add_to_cart |
| `whatsapp_redirect` | Lead | CE - generate_lead |
| `rental_inquiry_click` | Lead | CE - rental_inquiry |

## Validación

1. Abrir GTM Preview mode
2. Navegar el sitio en staging/producción
3. Verificar en Tag Assistant que cada evento dispara el tag correcto
4. Confirmar en GA4 DebugView los eventos mapeados
5. Confirmar en Meta Events Manager (Test Events) si aplica

## Notas

- No usar evento `purchase` — no hay confirmación de pedido en backend
- `whatsapp_redirect` es la métrica de conversión proxy
- La atribución (`utm_*`, `landing_src`) viaja en todos los eventos del dataLayer
