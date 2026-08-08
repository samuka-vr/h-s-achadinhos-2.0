import { Eye, Globe2, Image as ImageIcon, Palette, Save, Share2, Sparkles } from "lucide-react";
import { saveSettingsAction } from "@/server/actions/settings-actions";
import { ColorField } from "@/components/studio/color-field";
import { BrandAssetField } from "@/components/studio/brand-asset-field";
import { getStudioSettings } from "@/server/queries/studio";
import { requireRole } from "@/server/auth";
import { resolveSiteTheme } from "@/lib/theme";

type Props = { searchParams: Promise<{ erro?: string; sucesso?: string }> };
export const dynamic = "force-dynamic";

function stringSetting(value: unknown, fallback = "") {
  return typeof value === "string" && value ? value : fallback;
}

export default async function SettingsPage({ searchParams }: Props) {
  await requireRole(["owner", "admin"]);
  const [settings, sp] = await Promise.all([getStudioSettings(), searchParams]);
  const heroTitle = stringSetting(settings.homepage.hero_title, settings.tagline);
  const heroSubtitle = stringSetting(settings.homepage.hero_subtitle, settings.description);
  const heroCta = stringSetting(settings.homepage.hero_cta, "Ver ofertas do dia");
  const footerNotice = stringSetting(settings.homepage.footer_notice, "Fazemos curadoria de produtos e podemos receber comissão por compras realizadas pelos nossos links, sem custo adicional para você.");
  const faviconUrl = stringSetting(settings.homepage.favicon_url);
  const shareImageUrl = stringSetting(settings.homepage.share_image_url);
  const showBrandName = settings.homepage.show_brand_name !== false;
  const showHeaderTagline = settings.homepage.show_header_tagline !== false;
  const theme = resolveSiteTheme(settings.theme);

  return (
    <>
      <div className="studio-page-header">
        <div>
          <span className="section-kicker">Identidade e conteúdo</span>
          <h1>Personalização</h1>
          <p>Cuide da marca, das imagens, das cores e dos textos do site em um só lugar.</p>
        </div>
        <a href="/" target="_blank" className="button secondary"><Eye size={18}/> Visualizar site</a>
      </div>
      {sp.erro ? <div className="message error">{sp.erro}</div> : null}
      {sp.sucesso ? <div className="message success">Personalização salva. As mudanças já estão no site.</div> : null}

      <form action={saveSettingsAction} className="settings-layout">
        <div className="settings-main">
          <section className="panel form-section">
            <div className="form-section-heading"><span><Sparkles size={18}/></span><div><h2>Marca</h2><p>Nome e textos que identificam o H&amp;S Achadinhos.</p></div></div>
            <div className="form-grid two">
              <label>Nome da marca<input name="brand_name" defaultValue={settings.brand_name} required/></label>
              <label>Slogan<input name="tagline" defaultValue={settings.tagline} required/></label>
            </div>
            <label>Descrição da marca<textarea name="description" rows={4} defaultValue={settings.description}/></label>
            <div className="settings-switch-grid">
              <label className="switch-row"><input type="checkbox" name="show_brand_name" defaultChecked={showBrandName}/><span><strong>Mostrar nome ao lado da logo</strong><small>Útil quando a logo não contém o nome completo.</small></span></label>
              <label className="switch-row"><input type="checkbox" name="show_header_tagline" defaultChecked={showHeaderTagline}/><span><strong>Mostrar slogan no cabeçalho</strong><small>Exibe uma linha curta abaixo do nome da marca.</small></span></label>
            </div>
          </section>

          <section className="panel form-section brand-assets-section">
            <div className="form-section-heading"><span><ImageIcon size={18}/></span><div><h2>Imagens da marca</h2><p>Toque na imagem para escolher direto da galeria do celular. O envio é automático.</p></div></div>
            <div className="brand-assets-grid">
              <BrandAssetField
                name="logo_url"
                label="Logo principal"
                description="Usada no site público, rodapé, login e no H&S Studio."
                recommended="Prefira PNG ou WEBP quadrado, com boa leitura em tamanho pequeno."
                defaultValue={settings.logo_url ?? ""}
              />
              <BrandAssetField
                name="favicon_url"
                label="Ícone do site"
                description="Aparece na aba do navegador e nos favoritos."
                recommended="Recomendado: imagem quadrada de 512 × 512 px."
                defaultValue={faviconUrl}
              />
              <BrandAssetField
                name="share_image_url"
                label="Imagem de compartilhamento"
                description="Usada quando o link do site é compartilhado em redes sociais."
                recommended="Recomendado: 1200 × 630 px."
                defaultValue={shareImageUrl}
                previewMode="wide"
              />
            </div>
          </section>

          <section className="panel form-section">
            <div className="form-section-heading"><span><Globe2 size={18}/></span><div><h2>Página inicial</h2><p>Edite os principais textos que o visitante encontra primeiro.</p></div></div>
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
            <div className="form-section-heading"><span><Share2 size={18}/></span><div><h2>Redes sociais</h2><p>Adicione somente os canais oficiais que você realmente usa.</p></div></div>
            <div className="form-grid three"><label>Instagram<input type="url" name="instagram" defaultValue={settings.social_links.instagram ?? ""}/></label><label>TikTok<input type="url" name="tiktok" defaultValue={settings.social_links.tiktok ?? ""}/></label><label>WhatsApp<input type="url" name="whatsapp" defaultValue={settings.social_links.whatsapp ?? ""}/></label></div>
          </section>
        </div>

        <aside className="settings-side">
          <section className="panel form-section color-settings-card">
            <div className="form-section-heading"><span><Palette size={18}/></span><div><h2>Cores do site</h2><p>Ajuste a identidade visual sem mexer no código.</p></div></div>
            <ColorField name="primary_color" label="Cor principal" defaultValue={theme.primary_color}/>
            <ColorField name="primary_dark" label="Tom mais escuro" defaultValue={theme.primary_dark}/>
            <ColorField name="accent_color" label="Cor de destaque" defaultValue={theme.accent_color}/>
            <ColorField name="background_color" label="Fundo do site" defaultValue={theme.background_color}/>
            <ColorField name="surface_color" label="Cartões e painéis" defaultValue={theme.surface_color}/>
            <ColorField name="text_color" label="Texto principal" defaultValue={theme.text_color}/>
            <div className="theme-preview" style={{ color: theme.text_color, background: theme.background_color }}>
              <span style={{ color: theme.primary_dark }}>Prévia da identidade</span>
              <div className="theme-preview-brand">
                {settings.logo_url ? <img src={settings.logo_url} alt=""/> : <b>H&amp;S</b>}
                <strong>{settings.brand_name}</strong>
              </div>
              <button type="button" style={{ color: "#fff", background: `linear-gradient(135deg, ${theme.primary_color}, ${theme.accent_color})` }}>{heroCta}</button>
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
