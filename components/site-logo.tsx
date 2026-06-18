import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

const LOGO_SRC = "/images/logo-maddogso.png";

type SiteLogoProps = {
  className?: string;
  imageClassName?: string;
  onClick?: () => void;
  size?: "header" | "footer";
};

const sizeMap = {
  header: { width: 64, height: 64, className: "h-16 w-16" },
  footer: { width: 80, height: 80, className: "h-20 w-20" },
} as const;

export function SiteLogo({
  className,
  imageClassName,
  onClick,
  size = "header",
}: SiteLogoProps) {
  const dimensions = sizeMap[size];

  return (
    <Link
      href="/"
      className={cn("inline-flex shrink-0 items-center", className)}
      onClick={onClick}
      aria-label="Mad Dogos — Inicio"
    >
      <Image
        src={LOGO_SRC}
        alt="Mad Dogos Hotdogs"
        width={dimensions.width}
        height={dimensions.height}
        className={cn(dimensions.className, "object-contain", imageClassName)}
        priority={size === "header"}
      />
    </Link>
  );
}
