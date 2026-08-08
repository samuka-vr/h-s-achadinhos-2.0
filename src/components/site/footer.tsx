import Link from "next/link";
import { Instagram, MessageCircle, ShieldCheck } from "lucide-react";
import type { SiteSettings } from "@/types/domain";

export function Footer({ settings }: { settings: SiteSettings }) {
  const footerNotice = typeof settings.homepage.footer_notice === "string"
    ? settings.homepage.footer_notice
    : "Fazemos curadoria de produtos e podemos receber comissão por compras realizadas pelos nossos links, sem custo adicional para você.";

  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <div className="brand">
            {settings.logo_url ? <img src={settings.logo_url} alt={settings.brand_name} className="brand-logo footer-brand-logo"/> : <span className="brand-mark">H&amp;S</span>}
            <strong>{settings.brand_name}</strong>
          </div>
          <p>{settings.description}</p>
          <div className="social-row">
            {settings.social_links.instagram ? <a href={settings.social_links.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><Instagram size={18}/></a> : null}
            {settings.social_links.tiktok ? <a href={settings.social_links.tiktok} target="_blank" rel="noreferrer" aria-label="TikTok">TikTok</a> : null}
            {settings.social_links.whatsapp ? <a href={settings.social_links.whatsapp} target="_blank" rel="noreferrer" aria-label="WhatsApp"><MessageCircle size={18}/></a> : null}
          </div>
        </div>
        <div className="footer-links">
          <strong>Navegação</strong>
          <Link href="/produtos">Todos os achadinhos</Link>
          <Link href="/categorias">Categorias</Link>
          <Link href="/buscar">Buscar</Link>
          <Link href="/sobre">Sobre</Link>
        </div>
        <div className="footer-links">
          <strong>Transparência</strong>
          <Link href="/privacidade">Privacidade</Link>
          <Link href="/termos">Termos de uso</Link>
          <p className="affiliate-note"><ShieldCheck size={17}/><span>{footerNotice}</span></p>
        </div>
      </div>
      <div className="container footer-bottom"><span>© {new Date().getFullYear()} {settings.brand_name}</span><span>Preços e disponibilidade podem mudar na loja parceira.</span></div>
    </footer>
  );
}
