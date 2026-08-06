"use client";

import { useMemo, useRef, useState } from "react";
import { ChevronDown, Image as ImageIcon, Power, Save, Trash2 } from "lucide-react";
import { bulkBannersAction, deleteBannerAction, saveBannerAction } from "@/server/actions/banner-actions";
import { UploadField } from "@/components/studio/upload-field";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CustomSelect, type CustomSelectOption } from "@/components/ui/custom-select";
import { StudioCheckbox } from "@/components/ui/studio-checkbox";
import type { Banner } from "@/types/domain";

const bulkOptions: CustomSelectOption[] = [
  { value: "activate", label: "Ativar banners", description: "Exibe no site" },
  { value: "deactivate", label: "Desativar banners", description: "Oculta sem apagar" },
  { value: "delete", label: "Excluir banners", description: "Remove permanentemente", danger: true },
];

export function BannerAdminList({ banners }: { banners: Banner[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [bulkAction, setBulkAction] = useState("");
  const [confirmMode, setConfirmMode] = useState<"bulk" | "single" | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Banner | null>(null);
  const bulkFormRef = useRef<HTMLFormElement>(null);
  const deleteFormRef = useRef<HTMLFormElement>(null);
  const bypassConfirmRef = useRef(false);
  const ids = useMemo(() => banners.map((banner) => banner.id), [banners]);
  const allSelected = ids.length > 0 && ids.every((id) => selected.includes(id));

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

  if (!banners.length) {
    return <div className="empty-inline"><ImageIcon size={25} /><span>Nenhum banner criado ainda.</span></div>;
  }

  return (
    <>
      <div className="admin-list-toolbar">
        <label className="select-all-control">
          <StudioCheckbox checked={allSelected} onChange={toggleAll} ariaLabel="Selecionar todos os banners" />
          <span>{allSelected ? "Todos selecionados" : "Selecionar todos"}</span>
        </label>
        <span className="admin-list-count">{banners.length} banner{banners.length === 1 ? "" : "s"}</span>
      </div>

      <div className={selected.length ? "studio-bulk-bar visible" : "studio-bulk-bar"}>
        <div className="bulk-selection-summary">
          <strong>{selected.length}</strong><span>selecionado{selected.length === 1 ? "" : "s"}</span>
          <button type="button" onClick={() => setSelected([])}>Limpar seleção</button>
        </div>
        <form ref={bulkFormRef} action={bulkBannersAction} onSubmit={submitBulk} className="studio-bulk-form">
          <input type="hidden" name="ids" value={selected.join(",")} />
          <CustomSelect
            name="bulk_action"
            value={bulkAction}
            onValueChange={setBulkAction}
            options={bulkOptions}
            placeholder="Escolha o que fazer"
            ariaLabel="Ação para banners selecionados"
          />
          <button className={bulkAction === "delete" ? "button danger" : "button primary"} disabled={!bulkAction || !selected.length}>
            {bulkAction === "delete" ? <Trash2 size={17} /> : <Power size={17} />} Aplicar
          </button>
        </form>
      </div>

      <div className="managed-card-list banner-managed-list">
        {banners.map((banner) => {
          const isExpanded = expanded === banner.id;
          return (
            <article key={banner.id} className={`managed-card ${selected.includes(banner.id) ? "selected" : ""}`}>
              <div className="managed-card-summary banner-summary-row">
                <StudioCheckbox checked={selected.includes(banner.id)} onChange={() => toggle(banner.id)} ariaLabel={`Selecionar ${banner.title}`} />
                <div className="banner-thumb">{banner.image_url ? <img src={banner.image_url} alt="" /> : <ImageIcon size={24} />}</div>
                <div className="grow managed-card-copy"><strong>{banner.title}</strong><small>Ordem {banner.sort_order} · {banner.target_url ? "Com link" : "Sem link"}</small></div>
                <span className={banner.active ? "status-pill published" : "status-pill archived"}>{banner.active ? "Ativo" : "Inativo"}</span>
                <button
                  type="button"
                  className={`managed-card-toggle ${isExpanded ? "open" : ""}`}
                  aria-expanded={isExpanded}
                  onClick={() => setExpanded(isExpanded ? null : banner.id)}
                >
                  <span>{isExpanded ? "Fechar" : "Editar"}</span><ChevronDown size={17} />
                </button>
              </div>

              {isExpanded ? (
                <form action={saveBannerAction} className="accordion-form managed-card-editor">
                  <input type="hidden" name="id" value={banner.id} />
                  <label>Título<input name="title" defaultValue={banner.title} required /></label>
                  <label>Texto complementar<textarea name="subtitle" rows={3} defaultValue={banner.subtitle ?? ""} placeholder="Uma frase curta para acompanhar o título." /></label>
                  <UploadField name="image_url" label="Imagem do banner" defaultValue={banner.image_url} />
                  <label>Link de destino<input type="url" name="target_url" defaultValue={banner.target_url ?? ""} placeholder="https://..." /></label>
                  <div className="form-grid two">
                    <label>Ordem<input name="sort_order" type="number" min={0} defaultValue={banner.sort_order} /></label>
                    <label className="switch-row compact"><input type="checkbox" name="active" defaultChecked={banner.active} /><span><strong>Exibir este banner</strong><small>Quando desativado, ele continua salvo no painel.</small></span></label>
                  </div>
                  <div className="form-actions split">
                    <button
                      className="button danger"
                      type="button"
                      onClick={() => {
                        setPendingDelete(banner);
                        setConfirmMode("single");
                      }}
                    ><Trash2 size={16} /> Excluir</button>
                    <button className="button primary" type="submit"><Save size={16} /> Salvar</button>
                  </div>
                </form>
              ) : null}
            </article>
          );
        })}
      </div>

      <form ref={deleteFormRef} action={deleteBannerAction} className="hidden-action-form">
        <input type="hidden" name="id" value={pendingDelete?.id ?? ""} />
      </form>

      <ConfirmDialog
        open={confirmMode === "bulk"}
        title={`Excluir ${selected.length} banner${selected.length === 1 ? "" : "s"}?`}
        description="Os banners selecionados serão removidos de forma permanente."
        confirmLabel="Excluir banners"
        onClose={() => setConfirmMode(null)}
        onConfirm={confirmBulk}
      />
      <ConfirmDialog
        open={confirmMode === "single" && Boolean(pendingDelete)}
        title={`Excluir “${pendingDelete?.title ?? "este banner"}”?`}
        description="Essa ação remove o banner do painel e do site."
        confirmLabel="Excluir banner"
        onClose={() => {
          setConfirmMode(null);
          setPendingDelete(null);
        }}
        onConfirm={() => {
          setConfirmMode(null);
          deleteFormRef.current?.requestSubmit();
        }}
      />
    </>
  );
}
