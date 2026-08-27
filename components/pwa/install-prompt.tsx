"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

const DISMISS_KEY = "maddogos-install-dismissed";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIos(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosHint, setShowIosHint] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    if (isStandalone()) return;
    if (localStorage.getItem(DISMISS_KEY)) return;

    setDismissed(false);

    if (isIos()) {
      setShowIosHint(true);
      return;
    }

    const handler = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setDismissed(true);
    setDeferredPrompt(null);
    setShowIosHint(false);
  };

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    dismiss();
  };

  if (dismissed) return null;
  if (!deferredPrompt && !showIosHint) return null;

  return (
    <div
      role="dialog"
      aria-label="Instalar app Mad Dogos"
      className="border-border bg-background fixed inset-x-4 bottom-20 z-50 mx-auto max-w-md rounded-xl border p-4 shadow-lg md:bottom-6 md:left-auto md:right-6"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold">Instala Mad Dogos en tu cel</p>
          {deferredPrompt ? (
            <p className="text-muted-foreground text-xs">
              Accede al menú más rápido desde tu pantalla de inicio, incluso sin internet.
            </p>
          ) : (
            <p className="text-muted-foreground text-xs">
              Toca Compartir en Safari y elige &quot;Agregar a pantalla de inicio&quot;.
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={dismiss}
          className="text-muted-foreground hover:text-foreground shrink-0 rounded p-1"
          aria-label="Cerrar"
        >
          <X className="size-4" />
        </button>
      </div>
      {deferredPrompt ? (
        <Button type="button" size="sm" className="mt-3 w-full" onClick={install}>
          Instalar app
        </Button>
      ) : null}
    </div>
  );
}
