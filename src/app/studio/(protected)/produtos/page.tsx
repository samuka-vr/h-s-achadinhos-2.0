import Link from "next/link";
import { Copy, Edit3, Eye, EyeOff, Filter, Plus, Search, Sparkles, Star, Upload } from "lucide-react";
import { duplicateProductAction, setProductStatusAction, toggleProductFeaturedAction } from "@/server/actions/product-actions";
import { listStudioCategories, listStudioProducts } from "@/server/queries/studio";
import { requireRole } from "@/server/auth";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ q?: string; status?: string; categoria?: string; sucesso?: string }> };

export default async function StudioProducts({ searchParams }: Props) {
  await requireRole(["owner", "admin", "editor"]);
  const [products, categories, sp] = await Promise.all([listStudioProducts(), listStudioCategories(), searchParams]);
  const q = (sp.q ?? "").trim().toLowerCase();
  const filtered = products.filter((product) => {
    const matchesQuery = !q || product.name.toLowerCase().includes(q) || product.public_code.toLowerCase().includes(q) || product.external_url.toLowerCase().includes(q);
    const matchesStatus = !sp.status || sp.status === "all" || product.status === sp.status;
    const matchesCategory = !sp.categoria || sp.categoria === "all" || product.category_id === sp.categoria;
    return matchesQuery && matchesStatus && matchesCategory;
  });
  const published = products.filter((product) => product.status === "published").length;
  const drafts = products.filter((product) => product.status === "draft").length;
  const archived = products.filter((product) => product.status === "archived").length;

  return (
    <>
      <div className="studio-page-header">
        <div><span className="section-kicker">Catálogo</span><h1>Produtos</h1><p>Gerencie os achadinhos, links, preços, imagens e status de publicação.</p></div>
        <div className="header-actions"><Link href="/studio/importacao" className="button secondary"><Upload size={18}/> Importar</Link><Link href="/studio/produtos/novo" className="button primary"><Plus size={18}/> Novo produto</Link></div>
      </div>
      {sp.sucesso ? <div className="message success"><Sparkles size={18}/> Produto salvo com sucesso.</div> : null}

      <section className="catalog-summary-row">
        <div><strong>{products.length}</strong><span>Total</span></div>
        <div><strong>{published}</strong><span>Publicados</span></div>
        <div><strong>{drafts}</strong><span>Rascunhos</span></div>
        <div><strong>{archived}</strong><span>Arquivados</span></div>
      </section>

      <section className="panel products-panel">
        <form className="studio-filter-bar">
          <label className="filter-search"><Search size={18}/><input name="q" defaultValue={sp.q} placeholder="Buscar por nome, código ou link..."/></label>
          <label><Filter size={17}/><select name="status" defaultValue={sp.status ?? "all"}><option value="all">Todos os status</option><option value="published">Publicados</option><option value="draft">Rascunhos</option><option value="archived">Arquivados</option></select></label>
          <label><select name="categoria" defaultValue={sp.categoria ?? "all"}><option value="all">Todas as categorias</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <button className="button primary" type="submit">Filtrar</button>
          {(sp.q || sp.status || sp.categoria) ? <Link href="/studio/produtos" className="button ghost">Limpar</Link> : null}
        </form>

        <div className="table-wrap flat">
          <table className="data-table product-admin-table">
            <thead><tr><th>Produto</th><th>Preço</th><th>Categoria</th><th>Status</th><th>Destaque</th><th className="right">Ações</th></tr></thead>
            <tbody>{filtered.map((product) => (
              <tr key={product.id}>
                <td><div className="table-product"><div className="table-product-image">{product.cover_url ? <img src={product.cover_url} alt=""/> : <span>H&amp;S</span>}</div><div><strong>{product.name}</strong><small>{product.public_code} · Atualizado em {new Date(product.updated_at).toLocaleDateString("pt-BR")}</small></div></div></td>
                <td><strong>{product.price_text || "—"}</strong></td>
                <td>{product.category?.name ?? <span className="muted">Sem categoria</span>}</td>
                <td><span className={`status-pill ${product.status}`}>{product.status === "published" ? "Publicado" : product.status === "draft" ? "Rascunho" : "Arquivado"}</span></td>
                <td>
                  <form action={toggleProductFeaturedAction}><input type="hidden" name="id" value={product.id}/><input type="hidden" name="featured" value={String(product.featured)}/><button className={product.featured ? "icon-action active" : "icon-action"} title={product.featured ? "Remover dos destaques" : "Colocar em destaque"}><Star size={17} fill={product.featured ? "currentColor" : "none"}/></button></form>
                </td>
                <td className="right"><div className="row-actions">
                  {product.status === "published" ? <a href={`/produtos/${product.slug}`} target="_blank" className="icon-action" title="Ver no site"><Eye size={17}/></a> : null}
                  <Link href={`/studio/produtos/${product.id}/editar`} className="icon-action" title="Editar"><Edit3 size={17}/></Link>
                  <form action={duplicateProductAction}><input type="hidden" name="id" value={product.id}/><button className="icon-action" title="Duplicar"><Copy size={17}/></button></form>
                  <form action={setProductStatusAction}><input type="hidden" name="id" value={product.id}/><input type="hidden" name="status" value={product.status === "published" ? "draft" : "published"}/><button className="icon-action" title={product.status === "published" ? "Tirar do ar" : "Publicar"}>{product.status === "published" ? <EyeOff size={17}/> : <Eye size={17}/>}</button></form>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
          {!filtered.length ? <div className="empty-table"><Search size={28}/><strong>Nenhum produto encontrado</strong><span>Ajuste os filtros ou cadastre um novo produto.</span></div> : null}
        </div>
      </section>
    </>
  );
}
