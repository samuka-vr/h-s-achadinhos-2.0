"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, FileText, Sparkles, Upload } from "lucide-react";
import { parseStructuredProducts } from "@/lib/import-products";
import { suggestProductCategory } from "@/lib/category-intelligence";
import { importProductsAction } from "@/server/actions/import-actions";
import { CustomSelect } from "@/components/ui/custom-select";
import type { Category } from "@/types/domain";

const example = `1. Mini Máquina Seladora Recarregável Para Embalagens Plásticas
Categoria: Cozinha
Descrição: Mini seladora portátil para fechar embalagens e conservar alimentos.
Valor: R$12,99
Link: https://s.shopee.com.br/exemplo

2. Organizador de Maquiagem Acrílico Giratório 360º
Categoria: Organização e Beleza
Descrição: Organizador giratório para maquiagem, perfumes e pincéis.
Valor: R$39,90
Link: https://s.shopee.com.br/exemplo2`;

export function ImportWorkbench({ categories }: { categories: Pick<Category, "id" | "name" | "active">[] }) {
  const [raw, setRaw] = useState("");
  const result = useMemo(() => parseStructuredProducts(raw), [raw]);
  const previews = useMemo(
    () =>
      result.items.map((item) => ({
        item,
        suggestion: suggestProductCategory(
          {
            name: item.name,
            description: item.description,
            sourceCategory: item.categoryName,
          },
          categories,
        ),
      })),
    [categories, result.items],
  );
  const reviewCount = previews.filter(({ suggestion }) => !suggestion.canonicalName).length;

  return (
    <form action={importProductsAction} className="import-workbench">
      <section className="panel import-editor-panel">
        <div className="panel-heading">
          <div>
            <span className="section-kicker">Importação inteligente</span>
            <h2>Cole sua lista exatamente como você já usa</h2>
            <p>O sistema lê o produto inteiro e escolhe uma categoria principal, mesmo que o nome informado esteja diferente.</p>
          </div>
          <button className="button ghost" type="button" onClick={() => setRaw(example)}>
            <FileText size={17} /> Usar exemplo
          </button>
        </div>

        <label className="field-label" htmlFor="raw-import">Lista de produtos</label>
        <textarea
          id="raw-import"
          name="raw"
          className="import-textarea"
          rows={22}
          value={raw}
          onChange={(event) => setRaw(event.target.value)}
          placeholder={example}
          required
        />

        <div className="import-options">
          <label>
            <span>Status dos produtos</span>
            <CustomSelect
              name="status"
              defaultValue="published"
              ariaLabel="Status dos produtos importados"
              options={[
                { value: "published", label: "Publicar imediatamente", description: "Os produtos entram no site após a importação" },
                { value: "draft", label: "Salvar como rascunho", description: "Revise antes de publicar" },
              ]}
            />
          </label>
          <label className="switch-row">
            <input type="checkbox" name="create_categories" defaultChecked />
            <span>
              <strong>Criar categoria principal quando necessário</strong>
              <small>Nunca cria variações pequenas; apenas categorias amplas e reutilizáveis.</small>
            </span>
          </label>
          <label className="switch-row">
            <input type="checkbox" name="skip_duplicates" defaultChecked />
            <span><strong>Ignorar links repetidos</strong><small>Evita cadastrar o mesmo produto duas vezes.</small></span>
          </label>
        </div>
      </section>

      <aside className="panel import-preview-panel">
        <div className="preview-summary">
          <div className="preview-count"><Sparkles size={20} /><strong>{result.items.length}</strong><span>produtos reconhecidos</span></div>
          <div className={result.errors.length || reviewCount ? "preview-alert warning" : "preview-alert success"}>
            {result.errors.length || reviewCount ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            {result.errors.length
              ? `${result.errors.length} item(ns) precisam de correção`
              : reviewCount
                ? `${reviewCount} item(ns) ficarão para revisar categoria`
                : "Categorias reconhecidas automaticamente"}
          </div>
        </div>

        <div className="preview-list smart-category-preview">
          {previews.slice(0, 12).map(({ item, suggestion }) => (
            <article key={`${item.sourceIndex}-${item.externalUrl}`} className="preview-item">
              <span className="preview-index">{item.sourceIndex}</span>
              <div>
                <strong>{item.name}</strong>
                <p>{item.priceText || "Sem preço informado"}</p>
                <div className="category-routing-line">
                  <span className="category-source">{item.categoryName || "Sem categoria informada"}</span>
                  <span aria-hidden="true">→</span>
                  <span className={suggestion.canonicalName ? "category-target" : "category-target review"}>
                    {suggestion.canonicalName || "Revisar categoria"}
                  </span>
                </div>
              </div>
            </article>
          ))}
          {result.items.length > 12 ? <p className="muted center">+ {result.items.length - 12} produtos na lista</p> : null}
          {!raw ? <div className="preview-empty"><Upload size={26}/><strong>A prévia aparecerá aqui</strong><span>Cole a sua lista no campo ao lado.</span></div> : null}
        </div>

        {result.errors.length ? (
          <div className="import-errors">
            {result.errors.slice(0, 6).map((error) => <p key={`${error.sourceIndex}-${error.message}`}><strong>Item {error.sourceIndex}:</strong> {error.message}</p>)}
          </div>
        ) : null}

        <button className="button primary wide" type="submit" disabled={!result.items.length}>
          <Upload size={18} /> Importar {result.items.length || ""} produto{result.items.length === 1 ? "" : "s"}
        </button>
        <p className="form-help">A categoria informada ajuda, mas o nome e a descrição do produto têm prioridade na decisão.</p>
      </aside>
    </form>
  );
}
