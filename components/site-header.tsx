import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { buildGraciasUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  return (
    <header className="bg-background/95 sticky top-0 z-50 border-b backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="font-display text-primary text-2xl tracking-wide uppercase">
          Mad Dogos
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
          <a href="#hot-dogs" className="hover:text-primary">
            Hot Dogs
          </a>
          <a href="#hamburguesas" className="hover:text-primary">
            Burgers
          </a>
          <a href="#alitas" className="hover:text-primary">
            Alitas
          </a>
        </nav>
        <Link
          href={buildGraciasUrl(undefined, "header")}
          className={cn(buttonVariants(), "text-sm")}
        >
          Pedir ahora
        </Link>
      </div>
    </header>
  );
}
