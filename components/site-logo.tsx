import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/images/logo-maddogos.png";

type SiteLogoProps = {
  className?: string;
  imageClassName?: string;
  onClick?: () => void;
  size?: "header" | "footer";
  /** Header only: shrinks logo to fit the bar (used while scrolling). */
  compact?: boolean;
};

export function SiteLogo({
  className,
  imageClassName,
  onClick,
  size = "header",
  compact = false,
}: SiteLogoProps) {
  const isFooter = size === "footer";
  const isExpanded = size === "header" && !compact;

  return (
    <Link
      href="/"
      className={cn(
        "inline-flex shrink-0 items-center",
        // Sit at the top with a small inset so the circle isn’t clipped; overflow hangs below the bar.
        isExpanded && "relative z-10 self-start mt-1.5 -mb-7",
        className,
      )}
      onClick={onClick}
      aria-label="Mad Dogos — Inicio"
    >
      <Image
        src={LOGO_SRC}
        alt=""
        width={isFooter ? 80 : isExpanded ? 96 : 64}
        height={isFooter ? 80 : isExpanded ? 96 : 64}
        className={cn(
          "rounded-full object-contain shadow-sm transition-[width,height,margin] duration-300 ease-out",
          isFooter && "h-20 w-20",
          !isFooter && isExpanded && "h-24 w-24",
          !isFooter && !isExpanded && "h-14 w-14",
          imageClassName,
        )}
        priority={size === "header"}
      />
    </Link>
  );
}
