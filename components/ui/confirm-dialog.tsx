"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  className?: string;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Sí, eliminar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
  className,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Cerrar"
        className="absolute inset-0 bg-black/50"
        onClick={onCancel}
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className={cn(
          "bg-background relative z-10 w-full max-w-sm rounded-xl border p-5 shadow-xl",
          className,
        )}
      >
        <h3 id="confirm-dialog-title" className="font-semibold text-lg">
          {title}
        </h3>
        <p id="confirm-dialog-description" className="text-muted-foreground mt-2 text-sm">
          {description}
        </p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function confirmRemoveMessage(itemName: string): string {
  return `¿Seguro que quieres eliminar "${itemName}" del pedido?`;
}
