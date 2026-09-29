import type { Metadata } from "next";
import { Suspense } from "react";
import { GraciasRedirect } from "@/components/gracias-redirect";

const title = "Gracias | Mad Dogos Culiacán";
const description = "Te estamos redirigiendo a WhatsApp para completar tu pedido.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  robots: { index: false, follow: false },
  openGraph: { title, description },
  twitter: { title, description },
};

export default function GraciasPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="font-display text-primary text-4xl tracking-tight">¡Gracias!</p>
          <p className="text-muted-foreground">Cargando...</p>
        </main>
      }
    >
      <GraciasRedirect />
    </Suspense>
  );
}
