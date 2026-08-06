"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import {
  CheckSquare2,
  Copy,
  Edit3,
  Eye,
  EyeOff,
  ImagePlus,
  LoaderCircle,
  MoreHorizontal,
  PackageCheck,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import {
  bulkProductsAction,
  duplicateProductAction,
  setProductStatusAction,
  toggleProductFeaturedAction,
  updateProductCoverAction,
} from "@/server/actions/product-actions";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CustomSelect, type CustomSelectOption } from "@/components/ui/custom-select";
import { StudioCheckbox } from "@/components/ui/studio-checkbox";
import type { Category, Product, UserRole } from "@/types/domain";


const productBulkOptions: CustomSelectOption[] = [
  { value: "published", label: "Publicar produtos", description: "Exibe no site" },
  { value: "draft", label: "Mover para rascunhos", description: "Mantém salvo sem publicar" },
  { value: "archived", label: "Arquivar produtos", description: "Retira do catálogo ativo" },
  { value: "feature", label: "Adicionar aos destaques", description: "Mostra na seleção principal" },
  { value: "unfeature", label: "Remover dos destaques", description: "Mantém o produto publicado" },
  { value: "category", label: "Alterar categoria", description: "Move todos para a mesma categoria" },
  { value: "delete", label: "Excluir produtos", description: "Remove permanentemente", danger: true },
];

function statusLabel(status: Product["status"]) {
  if (status === "published") return "Publicado";
  if (status === "draft") return "Rascunho";
  return "Arquivado";
}

function ProductImage({ product, onEdit }: { product: Product; onEdit: () => void }) {
  return (
    <button type="button" className="quick-cover-button" onClick={onEdit} aria-label={`Alterar imagem de ${product.name}`}>
      <span className="table-product-image">
        {product.cover_url ? <img src={product.cover_url} alt="" /> : <span>H&amp;S</span>}
      </span>
      <span className="quick-cover-overlay"><ImagePlus size={16} /> Alterar</span>
    </button>
  );
}

function ProductRowActions({ product }: { product: Product }) {
  return (
    <div className="row-actions professional-row-actions">
      {product.status === "published" ? (
        <a href={`/produtos/${product.slug}`} target="_blank" rel="noreferrer" className="icon-action" title="Ver no site">
          <Eye size={17} />
        </a>
      ) : null}
      <Link href={`/studio/produtos/${product.id}/editar`} className="icon-action" title="Editar produto">
        <Edit3 size={17} />
      </Link>
      <form action={duplicateProductAction}>
        <input type="hidden" name="id" value={product.id} />
        <button className="icon-action" title="Duplicar produto"><Copy size={17} /></button>
      </form>
      <form action={setProductStatusAction}>
        <input type="hidden" name="id" value={product.id} />
        <input type="hidden" name="status" value={product.status === "published" ? "draft" : "published"} />
        <button className="icon-action" title={product.status === "published" ? "Tirar do ar" : "Publicar"}>
          {product.status === "published" ? <EyeOff size={17} /> : <PackageCheck size={17} />}
        </button>
      </form>
    </div>
  );
}

function QuickCoverEditor({ product, onClose }: { product: Product; onClose: () => void }) {
  const [value, setValue] = useState(product.cover_url ?? "");
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setStatus("Escolha uma imagem primeiro.");
      return;
    }
    setUploading(true);
    setStatus("Enviando imagem…");
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch("/api/studio/upload", { method: "POST", body });
      const result = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !result.url) {
        setStatus(result.error ?? "Não foi possível enviar a imagem.");
        return;
      }
      setValue(result.url);
      setStatus("Imagem enviada. Agora toque em salvar.");
    } catch {
      setStatus("Falha de conexão durante o envio.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="studio-modal-layer" role="dialog" aria-modal="true" aria-label="Alterar imagem do produto">
      <button type="button" className="studio-modal-backdrop" aria-label="Fechar" onClick={onClose} />
      <form action={updateProductCoverAction} className="studio-modal quick-cover-modal">
        <input type="hidden" name="id" value={product.id} />
        <div className="studio-modal-head">
          <div>
            <span className="section-kicker">Edição rápida</span>
            <h2>Imagem do produto</h2>
          </div>
          <button type="button" className="icon-action" onClick={onClose} aria-label="Fechar"><X size={19} /></button>
        </div>

        <div className="quick-cover-product-name">
          <strong>{product.name}</strong>
          <span>{product.public_code}</span>
        </div>

        <div className="quick-cover-preview">
          {value ? <img src={value} alt="Prévia da imagem" /> : <div><ImagePlus size={30} /><span>Nenhuma imagem definida</span></div>}
        </div>

        <label>
          URL da imagem
          <input type="url" name="cover_url" value={value} onChange={(event) => setValue(event.target.value)} placeholder="https://..." />
        </label>

        <div className="quick-cover-upload-box">
          <input
            ref={fileRef}
            className="custom-upload-input"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => {
              setFileName(event.target.files?.[0]?.name ?? "");
              setStatus("");
            }}
          />
          <button type="button" className="custom-upload-picker" onClick={() => fileRef.current?.click()}>
            <ImagePlus size={17} /> <span>{fileName || "Escolher imagem"}</span>
          </button>
          <button type="button" className="button secondary" onClick={upload} disabled={uploading || !fileName}>
            {uploading ? <LoaderCircle className="spin" size={17} /> : <Upload size={17} />}
            {uploading ? "Enviando" : "Enviar"}
          </button>
        </div>
        {status ? <p className="form-help quick-cover-status">{status}</p> : null}

        <div className="studio-modal-actions">
          <button type="button" className="button ghost" onClick={onClose}>Cancelar</button>
          <button type="submit" className="button primary">Salvar imagem</button>
        </div>
      </form>
    </div>
  );
}

export function ProductAdminList({
  products,
  categories,
  role,
}: {
  products: Product[];
  categories: Category[];
  role: UserRole;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("");
  const [editingImage, setEditingImage] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const bulkFormRef = useRef<HTMLFormElement>(null);
  const bypassConfirmRef = useRef(false);
  const ids = useMemo(() => products.map((product) => product.id), [products]);
  const allSelected = ids.length > 0 && ids.every((id) => selected.includes(id));

  function toggle(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function toggleAll() {
    setSelected(allSelected ? [] : ids);
  }

  function confirmBulkAction(event: React.FormEvent<HTMLFormElement>) {
    if (!selected.length || !bulkAction) {
      event.preventDefault();
      return;
    }
    if (bulkAction === "delete" && !bypassConfirmRef.current) {
      event.preventDefault();
      setConfirmDelete(true);
    }
    bypassConfirmRef.current = false;
  }

  function confirmProductDelete() {
    bypassConfirmRef.current = true;
    setConfirmDelete(false);
    bulkFormRef.current?.requestSubmit();
  }

  if (!products.length) {
    return <div className="empty-table"><PackageCheck size={28} /><strong>Nenhum produto encontrado</strong><span>Ajuste os filtros ou cadastre um novo produto.</span></div>;
  }

  return (
    <>
      <div className={selected.length ? "bulk-product-toolbar visible" : "bulk-product-toolbar"}>
        <div className="bulk-selection-summary">
          <CheckSquare2 size={18} />
          <strong>{selected.length}</strong>
          <span>selecionado{selected.length === 1 ? "" : "s"}</span>
          <button type="button" onClick={() => setSelected([])}>Limpar</button>
        </div>
        <form ref={bulkFormRef} action={bulkProductsAction} onSubmit={confirmBulkAction} className="bulk-actions-form">
          <input type="hidden" name="ids" value={selected.join(",")} />
          <CustomSelect
            name="bulk_action"
            value={bulkAction}
            onValueChange={setBulkAction}
            options={role === "editor" ? productBulkOptions.filter((option) => option.value !== "delete") : productBulkOptions}
            placeholder="Escolha o que fazer"
            ariaLabel="Ação para produtos selecionados"
          />
          {bulkAction === "category" ? (
            <CustomSelect
              name="category_id"
              defaultValue=""
              ariaLabel="Nova categoria dos produtos"
              placeholder="Escolha uma categoria"
              options={[
                { value: "", label: "Sem categoria", description: "Deixa os produtos para revisão" },
                ...categories.map((category) => ({ value: category.id, label: category.name })),
              ]}
            />
          ) : null}
          <button className={bulkAction === "delete" ? "button danger" : "button primary"} disabled={!bulkAction || !selected.length}>
            {bulkAction === "delete" ? <Trash2 size={17} /> : <MoreHorizontal size={17} />} Aplicar
          </button>
        </form>
      </div>

      <div className="product-table-desktop">
        <table className="data-table product-admin-table professional-product-table">
          <thead>
            <tr>
              <th className="selection-column"><StudioCheckbox checked={allSelected} onChange={toggleAll} ariaLabel="Selecionar todos os produtos" /></th>
              <th>Produto</th><th>Preço</th><th>Categoria</th><th>Status</th><th>Destaque</th><th className="right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className={selected.includes(product.id) ? "selected-row" : ""}>
                <td className="selection-column"><StudioCheckbox checked={selected.includes(product.id)} onChange={() => toggle(product.id)} ariaLabel={`Selecionar ${product.name}`} /></td>
                <td>
                  <div className="table-product professional-table-product">
                    <ProductImage product={product} onEdit={() => setEditingImage(product)} />
                    <div><strong>{product.name}</strong><small>{product.public_code} · Atualizado em {new Date(product.updated_at).toLocaleDateString("pt-BR")}</small></div>
                  </div>
                </td>
                <td><strong>{product.price_text || "—"}</strong></td>
                <td>{product.category?.name ?? <span className="category-review-badge">Revisar categoria</span>}</td>
                <td><span className={`status-pill ${product.status}`}>{statusLabel(product.status)}</span></td>
                <td>
                  <form action={toggleProductFeaturedAction}>
                    <input type="hidden" name="id" value={product.id} />
                    <input type="hidden" name="featured" value={String(product.featured)} />
                    <button className={product.featured ? "icon-action active" : "icon-action"} title={product.featured ? "Remover dos destaques" : "Colocar em destaque"}>
                      <Star size={17} fill={product.featured ? "currentColor" : "none"} />
                    </button>
                  </form>
                </td>
                <td className="right"><ProductRowActions product={product} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="product-list-mobile">
        <div className="mobile-select-all-row">
          <label><StudioCheckbox checked={allSelected} onChange={toggleAll} ariaLabel="Selecionar todos os produtos" /> Selecionar todos os resultados</label>
          <span>{products.length} itens</span>
        </div>
        {products.map((product) => (
          <article key={product.id} className={selected.includes(product.id) ? "mobile-product-card selected" : "mobile-product-card"}>
            <div className="mobile-product-select"><StudioCheckbox checked={selected.includes(product.id)} onChange={() => toggle(product.id)} ariaLabel={`Selecionar ${product.name}`} /></div>
            <ProductImage product={product} onEdit={() => setEditingImage(product)} />
            <div className="mobile-product-content">
              <div className="mobile-product-heading">
                <div><strong>{product.name}</strong><small>{product.public_code}</small></div>
                <span className={`status-pill ${product.status}`}>{statusLabel(product.status)}</span>
              </div>
              <div className="mobile-product-meta">
                <span>{product.price_text || "Preço não informado"}</span>
                <span>{product.category?.name ?? "Revisar categoria"}</span>
              </div>
              <div className="mobile-product-actions">
                <button type="button" className="button secondary compact-button" onClick={() => setEditingImage(product)}><ImagePlus size={16} /> Imagem</button>
                <Link href={`/studio/produtos/${product.id}/editar`} className="button secondary compact-button"><Edit3 size={16} /> Editar</Link>
                <ProductRowActions product={product} />
              </div>
            </div>
          </article>
        ))}
      </div>

      {editingImage ? <QuickCoverEditor product={editingImage} onClose={() => setEditingImage(null)} /> : null}
      <ConfirmDialog
        open={confirmDelete}
        title={`Excluir ${selected.length} produto${selected.length === 1 ? "" : "s"}?`}
        description="Os produtos selecionados serão removidos de forma permanente. Essa ação não pode ser desfeita."
        confirmLabel="Excluir produtos"
        onClose={() => setConfirmDelete(false)}
        onConfirm={confirmProductDelete}
      />
    </>
  );
}
