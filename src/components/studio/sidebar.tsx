import Link from "next/link";
import { BarChart3, Boxes, FolderTree, Image, Import, LayoutDashboard, LogOut, Settings, Users } from "lucide-react";
import { logoutAction } from "@/server/actions/auth-actions";
import type { UserRole } from "@/types/domain";

const links = [
  ["/studio", "Visão geral", LayoutDashboard],
  ["/studio/produtos", "Produtos", Boxes],
  ["/studio/categorias", "Categorias", FolderTree],
  ["/studio/banners", "Banners", Image],
  ["/studio/importacao", "Importação", Import],
  ["/studio/analytics", "Analytics", BarChart3],
  ["/studio/configuracoes", "Configurações", Settings],
  ["/studio/usuarios", "Usuários", Users],
] as const;

export function StudioSidebar({ role }: { role: UserRole }) {
  return <aside className="studio-sidebar"><div className="studio-logo">H&amp;S Studio</div><nav>{links.map(([href,label,Icon]) => <Link key={href} href={href}><Icon size={18}/>{label}</Link>)}</nav><div className="sidebar-bottom"><span className="role-badge">{role}</span><form action={logoutAction}><button className="sidebar-link" type="submit"><LogOut size={18}/>Sair</button></form></div></aside>;
}
