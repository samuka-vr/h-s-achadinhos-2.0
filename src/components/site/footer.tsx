import Link from "next/link";
import type { SiteSettings } from "@/types/domain";

export function Footer({ settings }: { settings: SiteSettings }) {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div><strong>{settings.brand_name}</strong><p>{settings.tagline}</p></div>
        <div><Link href="/privacidade">Privacidade</Link><Link href="/termos">Termos</Link></div>
        <div><p className="muted">Alguns links podem gerar comissão sem custo adicional para você.</p></div>
      </div>
    </footer>
  );
}
