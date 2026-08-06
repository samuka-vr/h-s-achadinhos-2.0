"use client";

import { useState } from "react";
import { LoaderCircle, Sparkles } from "lucide-react";
import { organizeCatalogCategoriesAction } from "@/server/actions/category-actions";

export function CategoryOrganizerButton() {
  const [pending, setPending] = useState(false);

  return (
    <form
      action={organizeCatalogCategoriesAction}
      onSubmit={(event) => {
        const confirmed = window.confirm(
          "Organizar automaticamente os produtos nas categorias principais? Categorias antigas que ficarem vazias serão apenas desativadas, não apagadas.",
        );
        if (!confirmed) {
          event.preventDefault();
          return;
        }
        setPending(true);
      }}
    >
      <button className="button secondary" type="submit" disabled={pending}>
        {pending ? <LoaderCircle className="spin" size={18} /> : <Sparkles size={18} />}
        {pending ? "Organizando…" : "Organizar catálogo automaticamente"}
      </button>
    </form>
  );
}
