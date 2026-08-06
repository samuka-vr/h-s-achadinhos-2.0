import { Plus } from "lucide-react";
import { saveCategoryAction } from "@/server/actions/category-actions";
import { CategoryOrganizerButton } from "@/components/studio/category-organizer-button";
import { CategoryAdminList } from "@/components/studio/category-admin-list";
import { listStudioCategories, listStudioProducts } from "@/server/queries/studio";
import { requireRole } from "@/server/auth";

type Props = {
  searchParams: Promise<{
    erro?: string;
    sucesso?: string;
    organizados?: string;
    criadas?: string;
    desativadas?: string;
    quantidade?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function CategoriesStudio({ searchParams }: Props) {
  const viewer = await requireRole(["owner", "admin", "editor"]);
  const [categories, products, sp] = await Promise.all([listStudioCategories(), listStudioProducts(), searchParams]);
  const counts: Record<string, number> = {};
  for (const product of products) {
    if (product.category_id) counts[product.category_id] = (counts[product.category_id] ?? 0) + 1;
  }

  return (
    <>
      <div className="studio-page-header">
        <div>
          <span className="section-kicker">Organização do catálogo</span>
          <h1>Categorias</h1>
          <p>Agrupe produtos parecidos em categorias claras. Use ações em massa para manter a estrutura enxuta.</p>
        </div>
        {viewer.role !== "editor" ? <CategoryOrganizerButton /> : null}
      </div>

      {sp.erro ? <div className="message error">{sp.erro}</div> : null}
      {sp.sucesso === "salva" ? <div className="message success">Categoria salva.</div> : null}
      {sp.sucesso === "lote" ? <div className="message success">{sp.quantidade ?? "As"} categoria(s) foram atualizadas.</div> : null}
      {sp.organizados !== undefined ? (
        <div className="message success">
          Organização concluída: {sp.organizados} produto(s) movido(s), {sp.criadas ?? 0} categoria(s) criada(s) e {sp.desativadas ?? 0} categoria(s) vazia(s) ocultada(s).
        </div>
      ) : null}

      <section className="category-manager-grid refined-manager-grid">
        <form action={saveCategoryAction} className="panel form-section category-create-card sticky-create-card">
          <div className="form-section-heading">
            <span><Plus size={18} /></span>
            <div><h2>Nova categoria</h2><p>Crie apenas quando nenhuma categoria atual servir.</p></div>
          </div>
          <label>Nome<input name="name" required placeholder="Ex.: Moda e Acessórios" /></label>
          <label>Descrição<textarea name="description" rows={4} placeholder="Explique de forma simples quais produtos entram aqui." /></label>
          <label>Imagem opcional<input type="url" name="image_url" placeholder="https://..." /></label>
          <div className="form-grid two">
            <label>Ordem<input name="sort_order" type="number" min={0} defaultValue={categories.length} /></label>
            <label className="switch-row compact"><input type="checkbox" name="active" defaultChecked /><span><strong>Exibir no site</strong><small>Você pode ocultar depois sem apagar.</small></span></label>
          </div>
          <button className="button primary wide"><Plus size={18} /> Criar categoria</button>
        </form>

        <div className="panel category-list-panel refined-list-panel">
          <div className="panel-heading compact">
            <div><span className="section-kicker">Estrutura atual</span><h2>Gerenciar categorias</h2><p>Selecione uma ou várias para ativar, ocultar ou excluir.</p></div>
          </div>
          <CategoryAdminList categories={categories} counts={counts} role={viewer.role} />
        </div>
      </section>
    </>
  );
}
