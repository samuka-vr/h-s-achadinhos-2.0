import { UploadField } from "@/components/studio/upload-field";
import type { Category, Product } from "@/types/domain";
import { saveProductAction } from "@/server/actions/product-actions";

export function ProductForm({ product, categories, error }: { product?: Product; categories: Category[]; error?: string }) {
  return <form action={saveProductAction} className="form-card">
    {error ? <div className="message error">{error}</div> : null}
    {product ? <input type="hidden" name="id" value={product.id}/> : null}
    <div className="form-grid two">
      <label>Nome<input name="name" required minLength={3} defaultValue={product?.name}/></label>
      <label>Categoria<select name="category_id" defaultValue={product?.category_id ?? ""}><option value="">Sem categoria</option>{categories.map((c)=><option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
    </div>
    <label>Descrição curta<textarea name="short_description" rows={2} maxLength={280} defaultValue={product?.short_description ?? ""}/></label>
    <label>Descrição completa<textarea name="description" rows={7} maxLength={8000} defaultValue={product?.description ?? ""}/></label>
    <div className="form-grid two"><label>Preço exibido<input name="price_text" placeholder="R$ 19,90 - R$ 29,90" defaultValue={product?.price_text ?? ""}/></label><label>Plataforma/rede<input name="affiliate_network" placeholder="Shopee" defaultValue={product?.affiliate_network ?? ""}/></label></div>
    <label>Link afiliado externo<input type="url" name="external_url" required defaultValue={product?.external_url}/></label>
    <div className="form-grid two"><UploadField name="cover_url" label="Imagem de capa" defaultValue={product?.cover_url ?? ""} accept="image/jpeg,image/png,image/webp"/><UploadField name="video_url" label="Vídeo" defaultValue={product?.video_url ?? ""} accept="video/mp4,video/webm"/></div>
    <div className="form-grid three"><label>Status<select name="status" defaultValue={product?.status ?? "draft"}><option value="draft">Rascunho</option><option value="published">Publicado</option><option value="archived">Arquivado</option></select></label><label>Ordem<input type="number" name="sort_order" min={0} max={9999} defaultValue={product?.sort_order ?? 0}/></label><label className="check"><input type="checkbox" name="featured" defaultChecked={product?.featured}/>Destaque</label></div>
    <div className="form-actions"><button className="button primary" type="submit">Salvar produto</button></div>
  </form>;
}
