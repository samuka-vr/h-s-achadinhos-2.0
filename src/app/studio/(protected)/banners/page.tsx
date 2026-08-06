import { Plus } from "lucide-react";
import { saveBannerAction } from "@/server/actions/banner-actions";
import { UploadField } from "@/components/studio/upload-field";
import { BannerAdminList } from "@/components/studio/banner-admin-list";
import { listStudioBanners } from "@/server/queries/studio";
import { requireRole } from "@/server/auth";

type Props = { searchParams: Promise<{ erro?: string; sucesso?: string; quantidade?: string }> };
export const dynamic = "force-dynamic";

export default async function BannersPage({ searchParams }: Props) {
  await requireRole(["owner", "admin", "editor"]);
  const [banners, sp] = await Promise.all([listStudioBanners(), searchParams]);

  return (
    <>
      <div className="studio-page-header">
        <div>
          <span className="section-kicker">Destaques do site</span>
          <h1>Mídia e banners</h1>
          <p>Crie banners objetivos e controle quais aparecem na página inicial.</p>
        </div>
      </div>
      {sp.erro ? <div className="message error">{sp.erro}</div> : null}
      {sp.sucesso === "salvo" ? <div className="message success">Banner salvo.</div> : null}
      {sp.sucesso === "lote" ? <div className="message success">{sp.quantidade ?? "Os"} banner(s) foram atualizados.</div> : null}

      <section className="banner-manager-grid refined-manager-grid">
        <form action={saveBannerAction} className="panel form-section banner-create-card sticky-create-card">
          <div className="form-section-heading"><span><Plus size={18} /></span><div><h2>Novo banner</h2><p>Use uma imagem horizontal e uma mensagem curta.</p></div></div>
          <label>Título<input name="title" required placeholder="Ex.: Ofertas para deixar a casa mais prática" /></label>
          <label>Texto complementar<textarea name="subtitle" rows={3} placeholder="Uma frase curta, sem exageros." /></label>
          <UploadField name="image_url" label="Imagem do banner" accept="image/jpeg,image/png,image/webp" />
          <label>Link de destino<input type="url" name="target_url" placeholder="https://..." /></label>
          <div className="form-grid two">
            <label>Ordem<input name="sort_order" type="number" min={0} defaultValue={banners.length} /></label>
            <label className="switch-row compact"><input type="checkbox" name="active" defaultChecked /><span><strong>Exibir no site</strong><small>Você pode ocultar depois.</small></span></label>
          </div>
          <button className="button primary wide"><Plus size={18} /> Criar banner</button>
        </form>

        <div className="panel banner-list-panel refined-list-panel">
          <div className="panel-heading compact"><div><span className="section-kicker">Campanhas</span><h2>Gerenciar banners</h2><p>Selecione vários banners para ativar, ocultar ou excluir de uma vez.</p></div></div>
          <BannerAdminList banners={banners} />
        </div>
      </section>
    </>
  );
}
