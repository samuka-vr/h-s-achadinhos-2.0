"use client";

import Link from "next/link";
import { Menu, Search, X } from "lucide-react";
import { useState } from "react";
import type { SiteSettings } from "@/types/domain";

export function Header({ settings }: { settings: SiteSettings }) {
  const [open, setOpen] = useState(false);
  const showBrandName = settings.homepage.show_brand_name !== false;
  const showTagline = settings.homepage.show_header_tagline !== false;

  return (
    <header className="site-header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="Página inicial" onClick={() => setOpen(false)}>
          {settings.logo_url ? <img src={settings.logo_url} alt={settings.brand_name} className="brand-logo" /> : <span className="brand-mark">H&amp;S</span>}
          {showBrandName || showTagline ? (
            <span className="brand-copy">
              {showBrandName ? <strong>{settings.brand_name}</strong> : null}
              {showTagline ? <small>{settings.tagline}</small> : null}
            </span>
          ) : null}
        </Link>

        <form action="/buscar" className="header-search">
          <Search size={18} />
          <input name="q" placeholder="Qual achadinho você procura?" aria-label="Buscar produtos" />
        </form>

        <nav className={open ? "main-nav open" : "main-nav"} aria-label="Navegação principal">
          <Link href="/" onClick={() => setOpen(false)}>Início</Link>
          <Link href="/produtos" onClick={() => setOpen(false)}>Achadinhos</Link>
          <Link href="/categorias" onClick={() => setOpen(false)}>Categorias</Link>
          <Link href="/sobre" onClick={() => setOpen(false)}>Sobre</Link>
          <Link href="/buscar" className="mobile-search-link" onClick={() => setOpen(false)}><Search size={17}/> Buscar</Link>
        </nav>

        <button className="menu-button" type="button" aria-label={open ? "Fechar menu" : "Abrir menu"} onClick={() => setOpen((value) => !value)}>
          {open ? <X size={23}/> : <Menu size={23}/>} 
        </button>
      </div>
    </header>
  );
}
