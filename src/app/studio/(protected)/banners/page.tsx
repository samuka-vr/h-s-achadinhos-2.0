import { Image as ImageIcon, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteBannerAction, saveBannerAction } from "@/server/actions/banner-actions";
import { UploadField } from "@/components/studio/upload-field";
import { listStudioBanners } from "@/server/queries/studio";
import { requireRole } from "@/server/auth";

type Props = { searchParams: Promise<{ erro?: string; sucesso?: string }> };
export const dynamic = "force-dynamic";

export default async function BannersPage({ searchParams }: Props) {
  await requireRole(["owner", "admin", "editor"]);
  const [banners, sp] = await Promise.all([listStudioBanners(), searchParams]);
  return (
    <>
      <div className="studio-page-header"><div><span className="section-kicker">Conteúdo visual</span><h1>Mídia e banners</h1><p>Crie campanhas visuais para destacar produtos, categorias e ofertas na página inicial.</p></div></div>
      {sp.erro ? <div className="message error">{sp.erro}</div> : null}
      {sp.sucesso ? <div className="message success">Banner salvo com sucesso.</div> : null}

      <section className="banner-manager-grid">
        <form action={saveBannerAction} className="panel form-section banner-create-card">
          <div className="form-section-heading"><span><Plus size={18}/></span><div><h2>Novo banner</h2><p>Use uma imagem horizontal e um texto curto.</p></div></div>
          <label>Título<input name="title" required placeholder="Ex.: Ofertas para deixar sua casa mais prática"/></label>
          <label>Subtítulo<textarea name="subtitle" rows={3} placeholder="Texto complementar opcional"/></label>
          <UploadField name="image_url" label="Imagem do banner" accept="image/jpeg,image/png,image/webp"/>
          <label>Link de destino opcional<input type="url" name="target_url" placeholder="https://... ou link do seu produto"/></label>
          <div className="form-grid two"><label>Ordem<input name="sort_order" type="number" min={0} defaultValue={banners.length}/></label><label className="switch-row compact"><input type="checkbox" name="active" defaultChecked/><span><strong>Banner ativo</strong><small>Exibir no site.</small></span></label></div>
          <button className="button primary wide"><Plus size={18}/> Criar banner</button>
        </form>

        <div className="panel banner-list-panel">
          <div className="panel-heading compact"><div><span className="section-kicker">Campanhas</span><h2>{banners.length} banner{banners.length === 1 ? "" : "s"}</h2></div></div>
          <div className="banner-manage-list">
            {banners.map((banner) => (
              <details key={banner.id} className="banner-manage-card">
                <summary>
                  <div className="banner-thumb">{banner.image_url ? <img src={banner.image_url} alt=""/> : <ImageIcon size={24}/>}</div>
                  <div className="grow"><strong>{banner.title}</strong><small>Ordem {banner.sort_order} · {banner.target_url ? "Com link" : "Sem link"}</small></div>
                  <span className={banner.active ? "status-pill published" : "status-pill archived"}>{banner.active ? "Ativo" : "Inativo"}</span>
                  <Pencil size={17}/>
                </summary>
                <form action={saveBannerAction} className="accordion-form">
                  <input type="hidden" name="id" value={banner.id}/>
                  <label>Título<input name="title" defaultValue={banner.title} required/></label>
                  <label>Subtítulo<textarea name="subtitle" rows={3} defaultValue={banner.subtitle ?? ""}/></label>
                  <UploadField name="image_url" label="Imagem" defaultValue={banner.image_url}/>
                  <label>Link de destino<input type="url" name="target_url" defaultValue={banner.target_url ?? ""}/></label>
                  <div className="form-grid two"><label>Ordem<input name="sort_order" type="number" min={0} defaultValue={banner.sort_order}/></label><label className="switch-row compact"><input type="checkbox" name="active" defaultChecked={banner.active}/><span><strong>Banner ativo</strong><small>Exibir no site.</small></span></label></div>
                  <div className="form-actions split"><button className="button danger" type="submit" formAction={deleteBannerAction}><Trash2 size={16}/> Excluir</button><button className="button primary" type="submit">Salvar alterações</button></div>
                </form>
              </details>
            ))}
            {!banners.length ? <div className="empty-inline"><ImageIcon size={25}/><span>Nenhum banner criado ainda.</span></div> : null}
          </div>
        </div>
      </section>
    </>
  );
}
