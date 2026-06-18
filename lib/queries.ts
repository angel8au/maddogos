import type { SanityImageSource } from "@sanity/image-url";
import { fallbackMenuItems } from "@/lib/menu-data";
import {
  customizationTypeForFallback,
  DEFAULT_SAUCE_OPTIONS,
  resolveLinkedExtras,
  sauceRequiredForFallback,
} from "@/lib/menu-config";
import { getMenuImageUrl } from "@/lib/menu-images";
import { isSanityConfigured, sanityClient, urlForImage } from "@/lib/sanity";
import type { MenuCategory, MenuItem, SiteConfig } from "@/lib/types";

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
  customizationType?: MenuItem["customizationType"];
  sauceRequired?: boolean;
  ingredients?: { name: string; includedByDefault?: boolean }[];
  linkedExtras?: { _id: string; name: string; price: number }[];
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
  image,
  customizationType,
  sauceRequired,
  ingredients[] {
    name,
    includedByDefault
  },
  "linkedExtras": linkedExtras[]->{
    _id,
    name,
    price
  }
}`;

const siteConfigQuery = `*[_type == "siteConfig" && _id == "siteConfig"][0] {
  whatsappNumber,
  whatsappMessage,
  address,
  deliveryZone,
  openingHours,
  instagramUrl,
  facebookUrl,
  sauceOptions
}`;

function mapMenuItem(item: SanityMenuItem): MenuItem {
  const slug = item.slug;
  const category = item.category;
  const imageUrl = item.image
    ? urlForImage(item.image).width(800).height(600).fit("crop").url()
    : getMenuImageUrl(category, slug);

  return {
    _id: item._id,
    name: item.name,
    slug,
    description: item.description,
    price: item.price,
    category,
    badge: item.badge,
    featured: item.featured ?? false,
    order: item.order ?? 0,
    imageUrl,
    customizationType:
      item.customizationType ??
      customizationTypeForFallback(category, item.name),
    sauceRequired: item.sauceRequired ?? sauceRequiredForFallback(category),
    ingredients: item.ingredients?.map((ing) => ({
      name: ing.name,
      includedByDefault: ing.includedByDefault ?? true,
    })),
    linkedExtras: item.linkedExtras?.filter(Boolean).map((extra) => ({
      _id: extra._id,
      name: extra.name,
      price: extra.price,
    })),
  };
}

export async function getMenuItems(): Promise<MenuItem[]> {
  if (!isSanityConfigured) {
    return enrichFallbackItems(fallbackMenuItems);
  }

  try {
    const items = await sanityClient.fetch<SanityMenuItem[]>(menuQuery);

    if (!items.length) {
      return enrichFallbackItems(fallbackMenuItems);
    }

    const mapped = items.map((item) => mapMenuItem(item));
    return mapped.map((item) => ({
      ...item,
      imageUrl: item.imageUrl ?? getMenuImageUrl(item.category, item.slug),
      linkedExtras: item.linkedExtras?.length
        ? item.linkedExtras
        : resolveLinkedExtras(item, mapped),
    }));
  } catch (error) {
    console.error("Error fetching menu from Sanity:", error);
    return enrichFallbackItems(fallbackMenuItems);
  }
}

function enrichFallbackItems(items: MenuItem[]): MenuItem[] {
  return items.map((item) => {
    const enriched: MenuItem = {
      ...item,
      imageUrl: item.imageUrl ?? getMenuImageUrl(item.category, item.slug),
      customizationType:
        item.customizationType ?? customizationTypeForFallback(item.category, item.name),
      sauceRequired: item.sauceRequired ?? sauceRequiredForFallback(item.category),
    };
    enriched.linkedExtras = resolveLinkedExtras(enriched, items);
    return enriched;
  });
}

export async function getSiteConfig(): Promise<SiteConfig> {
  const fallback: SiteConfig = {
    sauceOptions: [...DEFAULT_SAUCE_OPTIONS],
  };

  if (!isSanityConfigured) return fallback;

  try {
    const config = await sanityClient.fetch<SiteConfig | null>(siteConfigQuery);
    return {
      ...fallback,
      ...config,
      sauceOptions: config?.sauceOptions?.length
        ? config.sauceOptions
        : fallback.sauceOptions,
    };
  } catch (error) {
    console.error("Error fetching site config:", error);
    return fallback;
  }
}

export async function getMenuPageData(): Promise<{
  items: MenuItem[];
  sauceOptions: string[];
}> {
  const [items, config] = await Promise.all([getMenuItems(), getSiteConfig()]);
  return { items, sauceOptions: config.sauceOptions };
}
