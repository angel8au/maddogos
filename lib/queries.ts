import type { SanityImageSource } from "@sanity/image-url";
import { fallbackMenuItems } from "@/lib/menu-data";
import { isSanityConfigured, sanityClient, urlForImage } from "@/lib/sanity";
import type { MenuCategory, MenuItem } from "@/lib/types";

type SanityMenuItem = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  category: MenuCategory;
  badge?: string;
  featured?: boolean;
  order?: number;
  image?: SanityImageSource;
};

const menuQuery = `*[_type == "menuItem" && available == true] | order(category asc, order asc) {
  _id,
  name,
  "slug": slug.current,
  description,
  price,
  category,
  badge,
  featured,
  order,
  image
}`;

export async function getMenuItems(): Promise<MenuItem[]> {
  if (!isSanityConfigured) {
    return fallbackMenuItems;
  }

  try {
    const items = await sanityClient.fetch<SanityMenuItem[]>(menuQuery);

    if (!items.length) {
      return fallbackMenuItems;
    }

    return items.map((item) => ({
      _id: item._id,
      name: item.name,
      slug: item.slug,
      description: item.description,
      price: item.price,
      category: item.category,
      badge: item.badge,
      featured: item.featured ?? false,
      order: item.order ?? 0,
      imageUrl: item.image ? urlForImage(item.image).width(800).height(600).fit("crop").url() : undefined,
    }));
  } catch (error) {
    console.error("Error fetching menu from Sanity:", error);
    return fallbackMenuItems;
  }
}
