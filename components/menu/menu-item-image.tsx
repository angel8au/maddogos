"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getMenuImageUrl } from "@/lib/menu-images";
import type { MenuCategory } from "@/lib/types";
import { cn } from "@/lib/utils";

type MenuItemImageProps = {
  src?: string;
  alt: string;
  category: MenuCategory;
  slug?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  className?: string;
  priority?: boolean;
};

export function MenuItemImage({
  src,
  alt,
  category,
  slug,
  fill = true,
  width,
  height,
  sizes,
  className,
  priority,
}: MenuItemImageProps) {
  const fallback = getMenuImageUrl(category, slug);
  const [imgSrc, setImgSrc] = useState(src || fallback);

  useEffect(() => {
    setImgSrc(src || fallback);
  }, [src, fallback]);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill={fill && !width && !height}
      width={width}
      height={height}
      sizes={sizes}
      className={cn(fill && "object-cover", className)}
      priority={priority}
      onError={() => setImgSrc(fallback)}
    />
  );
}
