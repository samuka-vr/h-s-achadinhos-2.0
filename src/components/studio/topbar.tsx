"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, Import, ShieldCheck } from "lucide-react";
import type { UserRole } from "@/types/domain";

const labels: Array<{ prefix: string; label: string }> = [
  { prefix: "/studio/produtos", label: "Produtos" },
  { prefix: "/studio/categorias", label: "Categorias" },
  { prefix: "/studio/importacao", label: "Importação" },
  { prefix: "/studio/banners", label: "Mídia e banners" },
  { prefix: "/studio/analytics", label: "Analytics" },
  { prefix: "/studio/configuracoes", label: "Personalização" },
  { prefix: "/studio/usuarios", label: "Equipe e acessos" },
];

const roleLabels: Record<UserRole, string> = {
  owner: "Proprietário",
  admin: "Administrador",
  editor: "Editor",
  analyst: "Analista",
};

export function StudioTopbar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const current = labels.find(({ prefix }) => pathname.startsWith(prefix))?.label ?? "Visão geral";

  return (
    <div className="studio-topbar">
      <div className="studio-topbar-path"><span>H&amp;S Studio</span><strong>{current}</strong></div>
      <div className="studio-topbar-actions">
        <span className="studio-security-chip"><ShieldCheck size={15} /> {roleLabels[role]}</span>
        <Link href="/studio/importacao" className="studio-topbar-link"><Import size={16} /> Importar produtos</Link>
        <a href="/" target="_blank" rel="noreferrer" className="studio-topbar-link"><ExternalLink size={16} /> Abrir site</a>
      </div>
    </div>
  );
}
