import type { Metadata } from "next";
import { Suspense } from "react";
import { GraciasRedirect } from "@/components/gracias-redirect";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function GraciasPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="font-display text-primary text-4xl uppercase">¡Gracias!</p>
          <p className="text-muted-foreground">Cargando...</p>
        </main>
      }
    >
      <GraciasRedirect />
    </Suspense>
  );
}
