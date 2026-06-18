"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { buildWhatsAppUrl } from "@/lib/whatsapp";

export function GraciasRedirect() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const item = searchParams.get("item") ?? undefined;
    const url = buildWhatsAppUrl(item);

    const timer = window.setTimeout(() => {
      window.location.href = url;
    }, 200);

    return () => window.clearTimeout(timer);
  }, [searchParams]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="font-display text-primary text-4xl uppercase">¡Gracias!</p>
      <p className="text-muted-foreground">Te estamos redirigiendo a WhatsApp...</p>
      <div className="border-primary size-8 animate-spin rounded-full border-4 border-t-transparent" />
    </main>
  );
}
