import type { MenuCategory } from "@/lib/types";

const pexels = (id: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop`;

const unsplash = (id: string) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=800&h=600&q=80`;

/** Imagen por categoría cuando no hay foto en Sanity */
export const categoryMenuImages: Record<MenuCategory, string> = {
  "hot-dogs": pexels(1199960),
  hamburguesas: pexels(70497),
  alitas: pexels(106343),
  boneless: pexels(4106483),
  papas: pexels(1583884),
  conos: pexels(1279330),
  charolas: pexels(1640777),
  combos: pexels(1639562),
  extras: unsplash("photo-1563599175592-c58dc214deff"),
  bebidas: unsplash("photo-1554866585-cd94860890b7"),
};

/** Fotos específicas para productos destacados (por slug) */
const slugMenuImages: Record<string, string> = {
  "maddogo-especial": pexels(1199957),
  "mad-burguer": pexels(1893556),
  "orden-de-alitas": pexels(2338407),
  "madcono-grande": pexels(1279330),
};

export function getMenuImageUrl(category: MenuCategory, slug?: string): string {
  if (slug && slugMenuImages[slug]) return slugMenuImages[slug];
  return categoryMenuImages[category];
}
