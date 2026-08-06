import Link from "next/link";
import { Search } from "lucide-react";
import type { SiteSettings } from "@/types/domain";

export function Header({ settings }: { settings: SiteSettings }) {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Página inicial">
          <span className="brand-mark">H&amp;S</span>
          <span>{settings.brand_name}</span>
        </Link>
        <nav className="main-nav" aria-label="Navegação principal">
          <Link href="/">Início</Link>
          <Link href="/produtos">Achadinhos</Link>
          <Link href="/categorias">Categorias</Link>
          <Link href="/sobre">Sobre</Link>
        </nav>
        <Link href="/buscar" className="icon-button" aria-label="Buscar produtos"><Search size={20} /></Link>
      </div>
    </header>
  );
}
