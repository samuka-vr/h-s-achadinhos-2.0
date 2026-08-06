import Link from "next/link";
import { Filter, Plus, Search, Sparkles, Upload } from "lucide-react";
import { ProductAdminList } from "@/components/studio/product-admin-list";
import { listStudioCategories, listStudioProducts } from "@/server/queries/studio";
import { requireRole } from "@/server/auth";

export const dynamic = "force-dynamic";

type Props = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    categoria?: string;
    sucesso?: string;
    erro?: string;
    quantidade?: string;
  }>;
};

export default async function StudioProducts({ searchParams }: Props) {
  const viewer = await requireRole(["owner", "admin", "editor"]);
  const [products, categories, sp] = await Promise.all([listStudioProducts(), listStudioCategories(), searchParams]);
  const q = (sp.q ?? "").trim().toLowerCase();
  const filtered = products.filter((product) => {
    const matchesQuery = !q
      || product.name.toLowerCase().includes(q)
      || product.public_code.toLowerCase().includes(q)
      || product.external_url.toLowerCase().includes(q);
    const matchesStatus = !sp.status || sp.status === "all" || product.status === sp.status;
    const matchesCategory = !sp.categoria || sp.categoria === "all" || (sp.categoria === "uncategorized" ? !product.category_id : product.category_id === sp.categoria);
    return matchesQuery && matchesStatus && matchesCategory;
  });
  const published = products.filter((product) => product.status === "published").length;
  const drafts = products.filter((product) => product.status === "draft").length;
  const archived = products.filter((product) => product.status === "archived").length;
  const uncategorized = products.filter((product) => !product.category_id).length;

  const successMessage = sp.sucesso === "imagem"
    ? "Imagem atualizada com sucesso."
    : sp.sucesso === "lote"
      ? `${sp.quantidade ?? "Os"} produto(s) foram atualizados em massa.`
      : sp.sucesso
        ? "Produto salvo com sucesso."
        : "";

  return (
    <>
      <div className="studio-page-header">
        <div>
          <span className="section-kicker">Catálogo</span>
          <h1>Produtos</h1>
          <p>Controle imagens, categorias, publicação e ações em massa em uma única tela.</p>
        </div>
        <div className="header-actions">
          <Link href="/studio/importacao" className="button secondary"><Upload size={18} /> Importar lista</Link>
          <Link href="/studio/produtos/novo" className="button primary"><Plus size={18} /> Novo produto</Link>
        </div>
      </div>

      {sp.erro ? <div className="message error"><span>{sp.erro}</span></div> : null}
      {successMessage ? <div className="message success"><Sparkles size={18} /> {successMessage}</div> : null}

      <section className="catalog-summary-row professional-summary-row">
        <div><strong>{products.length}</strong><span>Total</span></div>
        <div><strong>{published}</strong><span>Publicados</span></div>
        <div><strong>{drafts}</strong><span>Rascunhos</span></div>
        <div><strong>{archived}</strong><span>Arquivados</span></div>
        <div className={uncategorized ? "attention" : ""}><strong>{uncategorized}</strong><span>Para revisar</span></div>
      </section>

      <section className="panel products-panel professional-products-panel">
        <form className="studio-filter-bar professional-filter-bar">
          <label className="filter-search"><Search size={18} /><input name="q" defaultValue={sp.q} placeholder="Buscar por nome, código ou link..." /></label>
          <label><Filter size={17} /><select name="status" defaultValue={sp.status ?? "all"}><option value="all">Todos os status</option><option value="published">Publicados</option><option value="draft">Rascunhos</option><option value="archived">Arquivados</option></select></label>
          <label><select name="categoria" defaultValue={sp.categoria ?? "all"}><option value="all">Todas as categorias</option><option value="uncategorized">Sem categoria</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
          <button className="button primary" type="submit">Filtrar</button>
          {(sp.q || sp.status || sp.categoria) ? <Link href="/studio/produtos" className="button ghost">Limpar</Link> : null}
        </form>

        <ProductAdminList products={filtered} categories={categories} role={viewer.role} />
      </section>
    </>
  );
}
