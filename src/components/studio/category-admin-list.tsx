"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronDown, FolderTree, Power, Save, Trash2 } from "lucide-react";
import { bulkCategoriesAction, deleteCategoryAction, saveCategoryAction } from "@/server/actions/category-actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CustomSelect, type CustomSelectOption } from "@/components/ui/custom-select";
import { StudioCheckbox } from "@/components/ui/studio-checkbox";
import type { Category, UserRole } from "@/types/domain";

const bulkOptions: CustomSelectOption[] = [
  { value: "activate", label: "Ativar categorias", description: "Volta a exibi-las no site" },
  { value: "deactivate", label: "Desativar categorias", description: "Oculta sem apagar" },
  { value: "delete", label: "Excluir categorias", description: "Remove de forma permanente", danger: true },
];

export function CategoryAdminList({
  categories,
  counts,
  role,
}: {
  categories: Category[];
  counts: Record<string, number>;
  role: UserRole;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [bulkAction, setBulkAction] = useState("");
  const [confirmMode, setConfirmMode] = useState<"bulk" | "single" | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const bulkFormRef = useRef<HTMLFormElement>(null);
  const deleteFormRef = useRef<HTMLFormElement>(null);
  const bypassConfirmRef = useRef(false);
  const ids = useMemo(() => categories.map((category) => category.id), [categories]);
  const allSelected = ids.length > 0 && ids.every((id) => selected.includes(id));

  const availableBulkOptions = role === "editor"
    ? bulkOptions.filter((option) => option.value !== "delete")
    : bulkOptions;

  function toggle(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function toggleAll() {
    setSelected(allSelected ? [] : ids);
  }

  function submitBulk(event: React.FormEvent<HTMLFormElement>) {
    if (!selected.length || !bulkAction) {
      event.preventDefault();
      return;
    }
    if (bulkAction === "delete" && !bypassConfirmRef.current) {
      event.preventDefault();
      setConfirmMode("bulk");
    }
    bypassConfirmRef.current = false;
  }

  function confirmBulk() {
    bypassConfirmRef.current = true;
    setConfirmMode(null);
    bulkFormRef.current?.requestSubmit();
  }

  function confirmSingleDelete() {
    setConfirmMode(null);
    deleteFormRef.current?.requestSubmit();
  }

  if (!categories.length) {
    return (
      <div className="empty-table">
        <FolderTree size={28} />
        <strong>Nenhuma categoria criada</strong>
        <span>Crie a primeira categoria usando o formulário ao lado.</span>
      </div>
    );
  }

  return (
    <>
      <div className="admin-list-toolbar">
        <label className="select-all-control">
          <StudioCheckbox checked={allSelected} onChange={toggleAll} ariaLabel="Selecionar todas as categorias" />
          <span>{allSelected ? "Todas selecionadas" : "Selecionar todas"}</span>
        </label>
        <span className="admin-list-count">{categories.length} categoria{categories.length === 1 ? "" : "s"}</span>
      </div>

      <div className={selected.length ? "studio-bulk-bar visible" : "studio-bulk-bar"}>
        <div className="bulk-selection-summary">
          <strong>{selected.length}</strong>
          <span>selecionada{selected.length === 1 ? "" : "s"}</span>
          <button type="button" onClick={() => setSelected([])}>Limpar seleção</button>
        </div>
        <form ref={bulkFormRef} action={bulkCategoriesAction} onSubmit={submitBulk} className="studio-bulk-form">
          <input type="hidden" name="ids" value={selected.join(",")} />
          <CustomSelect
            name="bulk_action"
            value={bulkAction}
            onValueChange={setBulkAction}
            options={availableBulkOptions}
            placeholder="Escolha o que fazer"
            ariaLabel="Ação para categorias selecionadas"
          />
          <button className={bulkAction === "delete" ? "button danger" : "button primary"} disabled={!bulkAction || !selected.length}>
            {bulkAction === "delete" ? <Trash2 size={17} /> : <Power size={17} />}
            Aplicar
          </button>
        </form>
      </div>

      <div className="managed-card-list">
        {categories.map((category) => {
          const isExpanded = expanded === category.id;
          const productCount = counts[category.id] ?? 0;
          return (
            <article key={category.id} className={`managed-card ${selected.includes(category.id) ? "selected" : ""}`}>
              <div className="managed-card-summary">
                <StudioCheckbox checked={selected.includes(category.id)} onChange={() => toggle(category.id)} ariaLabel={`Selecionar ${category.name}`} />
                <span className="manage-icon"><FolderTree size={19} /></span>
                <div className="grow managed-card-copy">
                  <strong>{category.name}</strong>
                  <small>{productCount} produto{productCount === 1 ? "" : "s"} · /{category.slug}</small>
                </div>
                <span className={category.active ? "status-pill published" : "status-pill archived"}>{category.active ? "Ativa" : "Inativa"}</span>
                <button
                  type="button"
                  className={`managed-card-toggle ${isExpanded ? "open" : ""}`}
                  aria-expanded={isExpanded}
                  aria-label={isExpanded ? `Fechar edição de ${category.name}` : `Editar ${category.name}`}
                  onClick={() => setExpanded(isExpanded ? null : category.id)}
                >
                  <span>{isExpanded ? "Fechar" : "Editar"}</span>
                  <ChevronDown size={17} />
                </button>
              </div>

              {isExpanded ? (
                <form action={saveCategoryAction} className="accordion-form managed-card-editor">
                  <input type="hidden" name="id" value={category.id} />
                  <div className="form-grid two">
                    <label>Nome<input name="name" defaultValue={category.name} required /></label>
                    <label>Ordem<input name="sort_order" type="number" min={0} defaultValue={category.sort_order} /></label>
                  </div>
                  <label>Descrição<textarea name="description" rows={3} defaultValue={category.description ?? ""} placeholder="Uma frase curta explicando quais produtos entram aqui." /></label>
                  <label>Imagem da categoria<input type="url" name="image_url" defaultValue={category.image_url ?? ""} placeholder="https://..." /></label>
                  <label className="switch-row compact">
                    <input type="checkbox" name="active" defaultChecked={category.active} />
                    <span><strong>Exibir esta categoria</strong><small>Quando desativada, ela continua salva, mas não aparece no site.</small></span>
                  </label>
                  <div className="form-actions split">
                    {role === "editor" ? <span /> : (
                      <button
                        className="button danger"
                        type="button"
                        onClick={() => {
                          setPendingDelete(category);
                          setConfirmMode("single");
                        }}
                      >
                        <Trash2 size={16} /> Excluir
                      </button>
                    )}
                    <button className="button primary" type="submit"><Save size={16} /> Salvar</button>
                  </div>
                </form>
              ) : null}
            </article>
          );
        })}
      </div>

      <form ref={deleteFormRef} action={deleteCategoryAction} className="hidden-action-form">
        <input type="hidden" name="id" value={pendingDelete?.id ?? ""} />
      </form>

      <ConfirmDialog
        open={confirmMode === "bulk"}
        title={`Excluir ${selected.length} categoria${selected.length === 1 ? "" : "s"}?`}
        description="Os produtos não serão apagados, mas ficarão sem categoria. Essa ação não pode ser desfeita."
        confirmLabel="Excluir categorias"
        onClose={() => setConfirmMode(null)}
        onConfirm={confirmBulk}
      />
      <ConfirmDialog
        open={confirmMode === "single" && Boolean(pendingDelete)}
        title={`Excluir “${pendingDelete?.name ?? "esta categoria"}”?`}
        description="Os produtos vinculados continuarão salvos, mas ficarão sem categoria."
        confirmLabel="Excluir categoria"
        onClose={() => {
          setConfirmMode(null);
          setPendingDelete(null);
        }}
        onConfirm={confirmSingleDelete}
      />
    </>
  );
}
