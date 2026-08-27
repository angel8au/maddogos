import Link from "next/link";

export function SkipToContent() {
  return (
    <Link
      href="#contenido-principal"
      className="bg-accent text-accent-foreground focus:ring-ring sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:ring-2 focus:outline-none"
    >
      Saltar al contenido
    </Link>
  );
}
