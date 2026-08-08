import { Eye, Globe2, Palette, Save, Share2, Sparkles } from "lucide-react";
import { saveSettingsAction } from "@/server/actions/settings-actions";
import { ColorField } from "@/components/studio/color-field";
import { getStudioSettings } from "@/server/queries/studio";
import { requireRole } from "@/server/auth";
import { resolveSiteTheme } from "@/lib/theme";

type Props = { searchParams: Promise<{ erro?: string; sucesso?: string }> };
export const dynamic = "force-dynamic";

function stringSetting(value: unknown, fallback: string) {
  return typeof value === "string" && value ? value : fallback;
}

export default async function SettingsPage({ searchParams }: Props) {
  await requireRole(["owner", "admin"]);
  const [settings, sp] = await Promise.all([getStudioSettings(), searchParams]);
  const heroTitle = stringSetting(settings.homepage.hero_title, settings.tagline);
  const heroSubtitle = stringSetting(settings.homepage.hero_subtitle, settings.description);
  const heroCta = stringSetting(settings.homepage.hero_cta, "Ver ofertas do dia");
  const footerNotice = stringSetting(settings.homepage.footer_notice, "Fazemos curadoria de produtos e podemos receber comissão por compras realizadas pelos nossos links, sem custo adicional para você.");
  const theme = resolveSiteTheme(settings.theme);
  const primary = theme.primary_color;
  const primaryDark = theme.primary_dark;
  const accent = theme.accent_color;
  const background = theme.background_color;
  const surface = theme.surface_color;
  const text = theme.text_color;

  return (
    <>
      <div className="studio-page-header"><div><span className="section-kicker">Identidade e conteúdo</span><h1>Personalização</h1><p>Altere a marca, a página inicial, as cores e os links sociais sem editar código.</p></div><a href="/" target="_blank" className="button secondary"><Eye size={18}/> Visualizar site</a></div>
      {sp.erro ? <div className="message error">{sp.erro}</div> : null}
      {sp.sucesso ? <div className="message success">Configurações salvas e site atualizado.</div> : null}

      <form action={saveSettingsAction} className="settings-layout">
        <div className="settings-main">
          <section className="panel form-section">
            <div className="form-section-heading"><span><Sparkles size={18}/></span><div><h2>Marca</h2><p>Informações principais exibidas no cabeçalho, rodapé e mecanismos de busca.</p></div></div>
            <div className="form-grid two"><label>Nome da marca<input name="brand_name" defaultValue={settings.brand_name} required/></label><label>Slogan<input name="tagline" defaultValue={settings.tagline} required/></label></div>
            <label>Descrição da marca<textarea name="description" rows={4} defaultValue={settings.description}/></label>
            <label>URL da logo<input type="url" name="logo_url" defaultValue={settings.logo_url ?? ""} placeholder="https://..."/><small>Deixe vazio para usar o símbolo H&amp;S padrão.</small></label>
          </section>

          <section className="panel form-section">
            <div className="form-section-heading"><span><Globe2 size={18}/></span><div><h2>Página inicial</h2><p>Personalize o conteúdo principal que aparece para os visitantes.</p></div></div>
            <label>Título principal<input name="hero_title" defaultValue={heroTitle} required/></label>
            <label>Texto de apoio<textarea name="hero_subtitle" rows={3} defaultValue={heroSubtitle}/></label>
            <label>Texto do botão principal<input name="hero_cta" defaultValue={heroCta} required/></label>
            <label>Aviso de afiliado no rodapé<textarea name="footer_notice" rows={4} defaultValue={footerNotice}/></label>
            <div className="settings-switch-grid">
              <label className="switch-row"><input type="checkbox" name="show_categories" defaultChecked={settings.homepage.show_categories !== false}/><span><strong>Mostrar categorias</strong><small>Seção de categorias populares.</small></span></label>
              <label className="switch-row"><input type="checkbox" name="show_featured" defaultChecked={settings.homepage.show_featured !== false}/><span><strong>Mostrar destaques</strong><small>Produtos marcados como destaque.</small></span></label>
              <label className="switch-row"><input type="checkbox" name="show_latest" defaultChecked={settings.homepage.show_latest !== false}/><span><strong>Mostrar novidades</strong><small>Últimos produtos publicados.</small></span></label>
            </div>
          </section>

          <section className="panel form-section">
            <div className="form-section-heading"><span><Share2 size={18}/></span><div><h2>Redes sociais</h2><p>Adicione os links oficiais da marca.</p></div></div>
            <div className="form-grid three"><label>Instagram<input type="url" name="instagram" defaultValue={settings.social_links.instagram ?? ""}/></label><label>TikTok<input type="url" name="tiktok" defaultValue={settings.social_links.tiktok ?? ""}/></label><label>WhatsApp<input type="url" name="whatsapp" defaultValue={settings.social_links.whatsapp ?? ""}/></label></div>
          </section>
        </div>

        <aside className="settings-side">
          <section className="panel form-section color-settings-card">
            <div className="form-section-heading"><span><Palette size={18}/></span><div><h2>Cores do site</h2><p>Use códigos hexadecimais.</p></div></div>
            <ColorField name="primary_color" label="Cor principal" defaultValue={primary}/>
            <ColorField name="primary_dark" label="Tom mais escuro" defaultValue={primaryDark}/>
            <ColorField name="accent_color" label="Cor de destaque" defaultValue={accent}/>
            <ColorField name="background_color" label="Fundo do site" defaultValue={background}/>
            <ColorField name="surface_color" label="Cartões e painéis" defaultValue={surface}/>
            <ColorField name="text_color" label="Texto principal" defaultValue={text}/>
            <div className="theme-preview" style={{ color: text, background }}>
              <span style={{ color: primaryDark }}>Prévia da identidade</span>
              <strong>{settings.brand_name}</strong>
              <button type="button" style={{ color: "#fff", background: `linear-gradient(135deg, ${primary}, ${accent})` }}>{heroCta}</button>
            </div>
          </section>

          <section className="panel form-section indexing-card">
            <label className="switch-row"><input type="checkbox" name="indexing_enabled" defaultChecked={settings.indexing_enabled}/><span><strong>Permitir indexação</strong><small>Também depende da variável SITE_INDEXING_ENABLED na Vercel.</small></span></label>
          </section>
          <button className="button primary wide sticky-save" type="submit"><Save size={18}/> Salvar personalização</button>
        </aside>
      </form>
    </>
  );
}
