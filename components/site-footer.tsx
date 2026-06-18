export function SiteFooter() {
  return (
    <footer className="bg-foreground text-background mt-16">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-8 md:px-6">
        <p className="font-display text-2xl tracking-wide uppercase">Mad Dogos</p>
        <p className="text-sm opacity-80">Hot dogs estilo Sinaloa en Culiacán</p>
        <p className="text-xs opacity-60">© {new Date().getFullYear()} Mad Dogos Hotdogs</p>
      </div>
    </footer>
  );
}
