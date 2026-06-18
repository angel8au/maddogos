"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { SiteLogo } from "@/components/site-logo";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/menu", label: "Menú" },
  { href: "/eventos", label: "Eventos" },
  { href: "/ubicacion", label: "Ubicación" },
] as const;

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <>
      <header className="bg-background/95 sticky top-0 z-50 border-b backdrop-blur">
        <div className="mx-auto flex h-[4.5rem] w-full max-w-6xl items-center justify-between gap-4 px-4 md:px-6">
          <SiteLogo onClick={closeMenu} />

          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-primary">
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/menu"
              className={cn(buttonVariants(), "hidden shrink-0 text-sm sm:inline-flex")}
            >
              Ordenar
            </Link>
            <button
              type="button"
              aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="hover:bg-muted flex size-10 items-center justify-center rounded-lg transition-colors md:hidden"
            >
              {menuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
            </button>
          </div>
        </div>
      </header>

      {menuOpen ? (
        <div
          className="bg-background fixed inset-0 z-[60] flex flex-col md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menú de navegación"
        >
          <div className="mx-auto flex h-[4.5rem] w-full max-w-6xl items-center justify-between gap-4 border-b px-4">
            <SiteLogo onClick={closeMenu} />
            <button
              type="button"
              aria-label="Cerrar menú"
              onClick={closeMenu}
              className="hover:bg-muted flex size-10 items-center justify-center rounded-lg transition-colors"
            >
              <X className="size-6" />
            </button>
          </div>

          <nav className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-2 px-6 py-10">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenu}
                className="font-display hover:text-primary py-3 text-5xl tracking-wide uppercase transition-colors"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/menu"
              onClick={closeMenu}
              className={cn(
                buttonVariants({ size: "lg" }),
                "mt-8 w-full text-lg sm:w-auto sm:self-start",
              )}
            >
              Ordenar ahora
            </Link>
          </nav>
        </div>
      ) : null}
    </>
  );
}
