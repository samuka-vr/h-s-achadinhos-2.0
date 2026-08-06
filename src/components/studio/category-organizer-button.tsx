"use client";

import { useRef, useState } from "react";
import { LoaderCircle, Sparkles } from "lucide-react";
import { organizeCatalogCategoriesAction } from "@/server/actions/category-actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

export function CategoryOrganizerButton() {
  const [pending, setPending] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const confirmedRef = useRef(false);

  return (
    <>
      <form
        ref={formRef}
        action={organizeCatalogCategoriesAction}
        onSubmit={(event) => {
          if (!confirmedRef.current) {
            event.preventDefault();
            setConfirmOpen(true);
            return;
          }
          confirmedRef.current = false;
          setPending(true);
        }}
      >
        <button className="button secondary" type="submit" disabled={pending}>
          {pending ? <LoaderCircle className="spin" size={18} /> : <Sparkles size={18} />}
          {pending ? "Organizando…" : "Organizar automaticamente"}
        </button>
      </form>
      <ConfirmDialog
        open={confirmOpen}
        tone="primary"
        title="Organizar o catálogo automaticamente?"
        description="O sistema moverá os produtos para categorias principais e ocultará categorias antigas que ficarem vazias. Nada será apagado."
        confirmLabel="Organizar catálogo"
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          confirmedRef.current = true;
          setConfirmOpen(false);
          formRef.current?.requestSubmit();
        }}
      />
    </>
  );
}
