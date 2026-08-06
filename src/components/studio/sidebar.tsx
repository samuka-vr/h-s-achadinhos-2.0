"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  BarChart3,
  Boxes,
  ExternalLink,
  FolderTree,
  Image,
  Import,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
  X,
} from "lucide-react";
import { logoutAction } from "@/server/actions/auth-actions";
import type { UserRole } from "@/types/domain";

type NavigationItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: UserRole[];
  section: "management" | "system";
};

const allRoles: UserRole[] = ["owner", "admin", "editor", "analyst"];
const editorRoles: UserRole[] = ["owner", "admin", "editor"];
const navigation: NavigationItem[] = [
  { href: "/studio", label: "Visão geral", icon: LayoutDashboard, roles: allRoles, section: "management" },
  { href: "/studio/produtos", label: "Produtos", icon: Boxes, roles: editorRoles, section: "management" },
  { href: "/studio/categorias", label: "Categorias", icon: FolderTree, roles: editorRoles, section: "management" },
  { href: "/studio/banners", label: "Mídia e banners", icon: Image, roles: editorRoles, section: "management" },
  { href: "/studio/importacao", label: "Importação", icon: Import, roles: editorRoles, section: "management" },
  { href: "/studio/analytics", label: "Analytics", icon: BarChart3, roles: allRoles, section: "system" },
  { href: "/studio/configuracoes", label: "Personalização", icon: Settings, roles: ["owner", "admin"], section: "system" },
  { href: "/studio/usuarios", label: "Equipe e acessos", icon: Users, roles: ["owner"], section: "system" },
];

const roleLabels: Record<UserRole, string> = {
  owner: "Proprietário",
  admin: "Administrador",
  editor: "Editor",
  analyst: "Analista",
};

export function StudioSidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = navigation.filter((item) => item.roles.includes(role));

  function isActive(href: string) {
    return href === "/studio" ? pathname === href : pathname.startsWith(href);
  }

  function renderSection(section: NavigationItem["section"], label: string) {
    const sectionItems = items.filter((item) => item.section === section);
    if (!sectionItems.length) return null;
    return (
      <>
        <span className={section === "system" ? "nav-label nav-label-spaced" : "nav-label"}>{label}</span>
        {sectionItems.map(({ href, label: itemLabel, icon: Icon }) => (
          <Link key={href} href={href} className={isActive(href) ? "active" : ""} onClick={() => setOpen(false)}>
            <Icon size={19}/><span>{itemLabel}</span>
          </Link>
        ))}
      </>
    );
  }

  return (
    <>
      <header className="studio-mobile-header">
        <Link href="/studio" className="studio-brand"><span>H&amp;S</span><strong>Studio</strong></Link>
        <button type="button" onClick={() => setOpen(true)} aria-label="Abrir menu"><Menu size={23}/></button>
      </header>
      {open ? <button className="studio-overlay" aria-label="Fechar menu" onClick={() => setOpen(false)}/> : null}
      <aside className={open ? "studio-sidebar open" : "studio-sidebar"}>
        <div className="studio-sidebar-head">
          <Link href="/studio" className="studio-brand" onClick={() => setOpen(false)}><span>H&amp;S</span><div><strong>Studio</strong><small>Central de gestão</small></div></Link>
          <button className="studio-close" type="button" onClick={() => setOpen(false)} aria-label="Fechar menu"><X size={21}/></button>
        </div>

        <nav>
          {renderSection("management", "Gerenciamento")}
          {renderSection("system", "Sistema")}
        </nav>

        <div className="sidebar-bottom">
          <a href="/" target="_blank" className="sidebar-public-link">Abrir site público <ExternalLink size={16}/></a>
          <div className="sidebar-user">
            <div className="avatar">{roleLabels[role].slice(0, 1)}</div>
            <div><strong>{roleLabels[role]}</strong><small>Acesso ativo</small></div>
          </div>
          <form action={logoutAction}><button className="sidebar-logout" type="submit"><LogOut size={17}/> Sair da conta</button></form>
        </div>
      </aside>
    </>
  );
}
