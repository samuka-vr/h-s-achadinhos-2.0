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

type Section = "overview" | "catalog" | "insights" | "system";
type NavigationItem = {
  href: string;
  label: string;
  description: string;
  icon: typeof LayoutDashboard;
  roles: UserRole[];
  section: Section;
};

const allRoles: UserRole[] = ["owner", "admin", "editor", "analyst"];
const editorRoles: UserRole[] = ["owner", "admin", "editor"];
const navigation: NavigationItem[] = [
  { href: "/studio", label: "Visão geral", description: "Resumo e tarefas", icon: LayoutDashboard, roles: allRoles, section: "overview" },
  { href: "/studio/produtos", label: "Produtos", description: "Catálogo e imagens", icon: Boxes, roles: editorRoles, section: "catalog" },
  { href: "/studio/categorias", label: "Categorias", description: "Organização automática", icon: FolderTree, roles: editorRoles, section: "catalog" },
  { href: "/studio/importacao", label: "Importar produtos", description: "Listas em massa", icon: Import, roles: editorRoles, section: "catalog" },
  { href: "/studio/banners", label: "Mídia e banners", description: "Destaques do site", icon: Image, roles: editorRoles, section: "catalog" },
  { href: "/studio/analytics", label: "Analytics", description: "Visitas e cliques", icon: BarChart3, roles: allRoles, section: "insights" },
  { href: "/studio/configuracoes", label: "Personalização", description: "Marca e aparência", icon: Settings, roles: ["owner", "admin"], section: "system" },
  { href: "/studio/usuarios", label: "Equipe e acessos", description: "Permissões do painel", icon: Users, roles: ["owner"], section: "system" },
];

const roleLabels: Record<UserRole, string> = {
  owner: "Proprietário",
  admin: "Administrador",
  editor: "Editor",
  analyst: "Analista",
};

const sectionLabels: Record<Section, string> = {
  overview: "Início",
  catalog: "Catálogo",
  insights: "Relatórios",
  system: "Administração",
};

export function StudioSidebar({ role }: { role: UserRole }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = navigation.filter((item) => item.roles.includes(role));

  function isActive(href: string) {
    return href === "/studio" ? pathname === href : pathname.startsWith(href);
  }

  function renderSection(section: Section) {
    const sectionItems = items.filter((item) => item.section === section);
    if (!sectionItems.length) return null;
    return (
      <div className="studio-nav-section" key={section}>
        <span className="nav-label">{sectionLabels[section]}</span>
        {sectionItems.map(({ href, label, description, icon: Icon }) => (
          <Link key={href} href={href} className={isActive(href) ? "active" : ""} onClick={() => setOpen(false)}>
            <span className="studio-nav-icon"><Icon size={19} /></span>
            <span className="studio-nav-copy"><strong>{label}</strong><small>{description}</small></span>
          </Link>
        ))}
      </div>
    );
  }

  return (
    <>
      <header className="studio-mobile-header">
        <Link href="/studio" className="studio-brand"><span>H&amp;S</span><strong>Studio</strong></Link>
        <button type="button" onClick={() => setOpen(true)} aria-label="Abrir menu"><Menu size={23} /></button>
      </header>
      {open ? <button className="studio-overlay" aria-label="Fechar menu" onClick={() => setOpen(false)} /> : null}
      <aside className={open ? "studio-sidebar open" : "studio-sidebar"}>
        <div className="studio-sidebar-head">
          <Link href="/studio" className="studio-brand" onClick={() => setOpen(false)}>
            <span>H&amp;S</span>
            <div><strong>Studio</strong><small>Central de gestão</small></div>
          </Link>
          <button className="studio-close" type="button" onClick={() => setOpen(false)} aria-label="Fechar menu"><X size={21} /></button>
        </div>

        <div className="studio-sidebar-status"><span className="status-dot" /><div><strong>Painel conectado</strong><small>Supabase e Vercel ativos</small></div></div>

        <nav>
          {(["overview", "catalog", "insights", "system"] as Section[]).map(renderSection)}
        </nav>

        <div className="sidebar-bottom">
          <a href="/" target="_blank" rel="noreferrer" className="sidebar-public-link">Abrir site público <ExternalLink size={16} /></a>
          <div className="sidebar-user">
            <div className="avatar">{roleLabels[role].slice(0, 1)}</div>
            <div><strong>{roleLabels[role]}</strong><small>Sessão protegida</small></div>
          </div>
          <form action={logoutAction}><button className="sidebar-logout" type="submit"><LogOut size={17} /> Sair da conta</button></form>
        </div>
      </aside>
    </>
  );
}
