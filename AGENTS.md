<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Medición digital (leer siempre)

Antes de implementar CTAs, carrito, menú, checkout o cualquier flujo de conversión, lee **`docs/analytics-measurement.md`**.

Reglas rápidas:
- Emitir eventos solo via `track()` en `lib/analytics.ts` — nunca `posthog.capture()` en componentes
- Nuevo CTA WhatsApp → `TrackedWhatsAppLink` o `OrderWhatsAppButton`
- Nuevo CTA navegación → `TrackedCtaLink`
- Nuevo evento → agregar tipo en `lib/analytics-events.ts` + documentar
- `whatsapp_redirect` = conversión principal; debe dispararse **una sola vez** por conversión
- Toda feature que cambie UX de pedido debe verificar el funnel completo (ver checklist en el doc)
