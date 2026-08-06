import Link from "next/link";
import { ArrowLeft, ExternalLink, Image as ImageIcon, Info, Save, Sparkles } from "lucide-react";
import { UploadField } from "@/components/studio/upload-field";
import type { Category, Product } from "@/types/domain";
import { saveProductAction } from "@/server/actions/product-actions";

export function ProductForm({ product, categories, error }: { product?: Product; categories: Category[]; error?: string }) {
  return (
    <form action={saveProductAction} className="product-editor-grid">
      {product ? <input type="hidden" name="id" value={product.id}/> : null}
      <div className="product-editor-main">
        {error ? <div className="message error"><Info size={18}/><span>{error}</span></div> : null}

        <section className="panel form-section">
          <div className="form-section-heading"><span>1</span><div><h2>Informações principais</h2><p>Dados que aparecem no card e na página do produto.</p></div></div>
          <div className="form-grid two">
            <label>Nome do produto<input name="name" required minLength={3} maxLength={160} defaultValue={product?.name} placeholder="Ex.: Mini seladora portátil recarregável"/></label>
            <label>Categoria<select name="category_id" defaultValue={product?.category_id ?? ""}><option value="">Sem categoria</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          </div>
          <label>Descrição curta <small>Até 280 caracteres; aparece no card.</small><textarea name="short_description" rows={3} maxLength={280} defaultValue={product?.short_description ?? ""} placeholder="Explique rapidamente por que este produto é útil."/></label>
          <label>Descrição completa<textarea name="description" rows={7} maxLength={8000} defaultValue={product?.description ?? ""} placeholder="Detalhes, benefícios, usos e outras informações importantes."/></label>
        </section>

        <section className="panel form-section">
          <div className="form-section-heading"><span>2</span><div><h2>Oferta e redirecionamento</h2><p>Preço exibido e link afiliado da plataforma parceira.</p></div></div>
          <div className="form-grid two">
            <label>Preço exibido<input name="price_text" placeholder="R$ 19,90 - R$ 29,90" defaultValue={product?.price_text ?? ""}/></label>
            <label>Plataforma parceira<input name="affiliate_network" placeholder="Shopee" defaultValue={product?.affiliate_network ?? "Shopee"}/></label>
          </div>
          <label>Link afiliado externo<div className="input-with-icon"><ExternalLink size={18}/><input type="url" name="external_url" required defaultValue={product?.external_url} placeholder="https://s.shopee.com.br/..."/></div><small>O visitante será redirecionado para este endereço ao clicar em “Ver na loja”.</small></label>
        </section>

        <section className="panel form-section">
          <div className="form-section-heading"><span>3</span><div><h2>Imagens e vídeo</h2><p>Use arquivos leves e imagens quadradas para melhorar o catálogo.</p></div></div>
          <div className="form-grid two"><UploadField name="cover_url" label="Imagem de capa" defaultValue={product?.cover_url ?? ""} accept="image/jpeg,image/png,image/webp"/><UploadField name="video_url" label="Vídeo opcional" defaultValue={product?.video_url ?? ""} accept="video/mp4,video/webm"/></div>
        </section>
      </div>

      <aside className="product-editor-side">
        <section className="panel publish-card">
          <div className="publish-card-head"><Sparkles size={19}/><h2>Publicação</h2></div>
          <label>Status<select name="status" defaultValue={product?.status ?? "draft"}><option value="draft">Rascunho</option><option value="published">Publicado</option><option value="archived">Arquivado</option></select></label>
          <label>Ordem de exibição<input type="number" name="sort_order" min={0} max={9999} defaultValue={product?.sort_order ?? 0}/><small>Números menores aparecem primeiro.</small></label>
          <label className="switch-row"><input type="checkbox" name="featured" defaultChecked={product?.featured}/><span><strong>Produto em destaque</strong><small>Exibir na seleção principal da página inicial.</small></span></label>
          <button className="button primary wide" type="submit"><Save size={18}/> {product ? "Salvar alterações" : "Criar produto"}</button>
          <Link href="/studio/produtos" className="button ghost wide"><ArrowLeft size={17}/> Voltar aos produtos</Link>
        </section>

        <section className="panel editor-tip-card">
          <span><ImageIcon size={20}/></span>
          <div><strong>Dica de apresentação</strong><p>Uma boa imagem, um título direto e uma descrição curta aumentam a chance de clique.</p></div>
        </section>
      </aside>
    </form>
  );
}
