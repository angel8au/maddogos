import Link from "next/link";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { buildGraciasUrl, formatMXN } from "@/lib/whatsapp";
import type { MenuItem } from "@/lib/types";
import { cn } from "@/lib/utils";

type MenuCardProps = {
  item: MenuItem;
};

export function MenuCard({ item }: MenuCardProps) {
  return (
    <article className="bg-card flex h-full flex-col gap-3 rounded-lg border p-4 shadow-sm">
      <div className="bg-muted relative aspect-[4/3] overflow-hidden rounded-md">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
            🌭
          </div>
        )}
      </div>

      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <h3 className="font-semibold leading-tight">{item.name}</h3>
          {item.badge ? (
            <span className="bg-accent text-accent-foreground inline-block rounded-full px-2 py-0.5 text-xs font-semibold">
              {item.badge}
            </span>
          ) : null}
        </div>
        <span className="bg-primary text-primary-foreground shrink-0 rounded-full px-2.5 py-1 text-sm font-bold">
          {formatMXN(item.price)}
        </span>
      </div>

      <p className="text-muted-foreground flex-1 text-sm">{item.description}</p>

      <Link
        href={buildGraciasUrl(item.name, "menu")}
        className={cn(buttonVariants({ size: "lg" }), "w-full")}
      >
        Pedir por WhatsApp
      </Link>
    </article>
  );
}
