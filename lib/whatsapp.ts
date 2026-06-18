export function formatMXN(price: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(price);
}

export function buildWhatsAppUrl(item?: string): string {
  const number = process.env.NEXT_PUBLIC_WA_NUMBER ?? "526671900771";
  const message = item
    ? `Hola, quiero pedir: ${item}`
    : "Hola, quiero hacer un pedido";
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function buildGraciasUrl(item?: string, source?: string): string {
  const params = new URLSearchParams();
  if (item) params.set("item", item);
  if (source) params.set("src", source);
  const query = params.toString();
  return query ? `/gracias?${query}` : "/gracias";
}
