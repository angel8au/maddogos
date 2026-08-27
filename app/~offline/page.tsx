import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <p className="font-display text-primary text-4xl uppercase">Sin conexión</p>
      <p className="text-muted-foreground max-w-sm text-sm">
        No hay internet ahora mismo. Si ya visitaste el sitio antes, puedes seguir
        viendo el menú y armar tu pedido. Para enviarlo por WhatsApp necesitas señal
        celular.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/" className={cn(buttonVariants({ variant: "default" }))}>
          Ir al inicio
        </Link>
        <Link href="/menu" className={cn(buttonVariants({ variant: "outline" }))}>
          Ver menú
        </Link>
      </div>
    </main>
  );
}
