"use client";

import { AlertTriangle, X } from "lucide-react";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  tone = "danger",
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "danger" | "primary";
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="studio-modal-layer" role="dialog" aria-modal="true" aria-labelledby="confirm-dialog-title">
      <button type="button" className="studio-modal-backdrop" aria-label="Fechar confirmação" onClick={onClose} />
      <div className="studio-modal hs-confirm-dialog">
        <div className={`hs-confirm-icon ${tone}`}><AlertTriangle size={22} /></div>
        <button type="button" className="icon-action hs-confirm-close" onClick={onClose} aria-label="Fechar"><X size={18} /></button>
        <div className="hs-confirm-copy">
          <h2 id="confirm-dialog-title">{title}</h2>
          <p>{description}</p>
        </div>
        <div className="studio-modal-actions">
          <button type="button" className="button ghost" onClick={onClose}>{cancelLabel}</button>
          <button type="button" className={tone === "danger" ? "button danger" : "button primary"} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
