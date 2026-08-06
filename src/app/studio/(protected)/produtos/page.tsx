import Link from "next/link";
import { Filter, Plus, Search, Sparkles, Upload } from "lucide-react";
import { ProductAdminList } from "@/components/studio/product-admin-list";
import { CustomSelect } from "@/components/ui/custom-select";
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
          <p>Encontre, revise e publique seus produtos sem sair desta tela.</p>
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
          <div className="filter-custom-select"><Filter size={17} /><CustomSelect
            name="status"
            defaultValue={sp.status ?? "all"}
            ariaLabel="Filtrar por status"
            options={[
              { value: "all", label: "Todos os status" },
              { value: "published", label: "Publicados" },
              { value: "draft", label: "Rascunhos" },
              { value: "archived", label: "Arquivados" },
            ]}
          /></div>
          <div className="filter-custom-select"><CustomSelect
            name="categoria"
            defaultValue={sp.categoria ?? "all"}
            ariaLabel="Filtrar por categoria"
            options={[
              { value: "all", label: "Todas as categorias" },
              { value: "uncategorized", label: "Sem categoria" },
              ...categories.map((category) => ({ value: category.id, label: category.name })),
            ]}
          /></div>
          <button className="button primary" type="submit">Filtrar</button>
          {(sp.q || sp.status || sp.categoria) ? <Link href="/studio/produtos" className="button ghost">Limpar</Link> : null}
        </form>

        <ProductAdminList products={filtered} categories={categories} role={viewer.role} />
      </section>
    </>
  );
}
