import { FolderTree, Pencil, Plus, Trash2 } from "lucide-react";
import { deleteCategoryAction, saveCategoryAction } from "@/server/actions/category-actions";
import { listStudioCategories, listStudioProducts } from "@/server/queries/studio";
import { requireRole } from "@/server/auth";

type Props = { searchParams: Promise<{ erro?: string; sucesso?: string }> };
export const dynamic = "force-dynamic";

export default async function CategoriesStudio({ searchParams }: Props) {
  const viewer = await requireRole(["owner", "admin", "editor"]);
  const [categories, products, sp] = await Promise.all([listStudioCategories(), listStudioProducts(), searchParams]);
  const counts = new Map<string, number>();
  for (const product of products) if (product.category_id) counts.set(product.category_id, (counts.get(product.category_id) ?? 0) + 1);

  return (
    <>
      <div className="studio-page-header"><div><span className="section-kicker">Organização</span><h1>Categorias</h1><p>Organize o catálogo e facilite a navegação dos visitantes.</p></div></div>
      {sp.erro ? <div className="message error">{sp.erro}</div> : null}
      {sp.sucesso ? <div className="message success">Categoria salva com sucesso.</div> : null}

      <section className="category-manager-grid">
        <form action={saveCategoryAction} className="panel form-section category-create-card">
          <div className="form-section-heading"><span><Plus size={18}/></span><div><h2>Nova categoria</h2><p>Crie uma seção para agrupar produtos semelhantes.</p></div></div>
          <label>Nome<input name="name" required placeholder="Ex.: Casa e Iluminação"/></label>
          <label>Descrição<textarea name="description" rows={4} placeholder="Explique o que o visitante encontrará nesta categoria."/></label>
          <label>URL da imagem opcional<input type="url" name="image_url" placeholder="https://..."/></label>
          <div className="form-grid two"><label>Ordem<input name="sort_order" type="number" min={0} defaultValue={categories.length}/></label><label className="switch-row compact"><input type="checkbox" name="active" defaultChecked/><span><strong>Categoria ativa</strong><small>Exibir no site público.</small></span></label></div>
          <button className="button primary wide"><Plus size={18}/> Adicionar categoria</button>
        </form>

        <div className="panel category-list-panel">
          <div className="panel-heading compact"><div><span className="section-kicker">Estrutura atual</span><h2>{categories.length} categorias</h2></div></div>
          <div className="category-manage-list">
            {categories.map((category) => (
              <details key={category.id} className="manage-accordion">
                <summary>
                  <span className="manage-icon"><FolderTree size={19}/></span>
                  <div className="grow"><strong>{category.name}</strong><small>{counts.get(category.id) ?? 0} produto{(counts.get(category.id) ?? 0) === 1 ? "" : "s"} · /{category.slug}</small></div>
                  <span className={category.active ? "status-pill published" : "status-pill archived"}>{category.active ? "Ativa" : "Inativa"}</span>
                  <Pencil size={17}/>
                </summary>
                <form action={saveCategoryAction} className="accordion-form">
                  <input type="hidden" name="id" value={category.id}/>
                  <div className="form-grid two"><label>Nome<input name="name" defaultValue={category.name} required/></label><label>Ordem<input name="sort_order" type="number" min={0} defaultValue={category.sort_order}/></label></div>
                  <label>Descrição<textarea name="description" rows={3} defaultValue={category.description ?? ""}/></label>
                  <label>URL da imagem<input type="url" name="image_url" defaultValue={category.image_url ?? ""}/></label>
                  <label className="switch-row compact"><input type="checkbox" name="active" defaultChecked={category.active}/><span><strong>Categoria ativa</strong><small>Disponível no site público.</small></span></label>
                  <div className="form-actions split">{viewer.role === "editor" ? <span/> : <button className="button danger" type="submit" formAction={deleteCategoryAction}><Trash2 size={16}/> Excluir</button>}<button className="button primary" type="submit">Salvar alterações</button></div>
                </form>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
