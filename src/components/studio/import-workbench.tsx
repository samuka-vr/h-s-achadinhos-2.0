"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, FileText, Sparkles, Upload } from "lucide-react";
import { parseStructuredProducts } from "@/lib/import-products";
import { importProductsAction } from "@/server/actions/import-actions";

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

export function ImportWorkbench() {
  const [raw, setRaw] = useState("");
  const result = useMemo(() => parseStructuredProducts(raw), [raw]);

  return (
    <form action={importProductsAction} className="import-workbench">
      <section className="panel import-editor-panel">
        <div className="panel-heading">
          <div>
            <span className="section-kicker">Importação inteligente</span>
            <h2>Cole sua lista exatamente como você já usa</h2>
            <p>O sistema identifica nome, categoria, descrição, valor e link de cada item.</p>
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
            <select name="status" defaultValue="published">
              <option value="published">Publicar imediatamente</option>
              <option value="draft">Salvar como rascunho</option>
            </select>
          </label>
          <label className="switch-row">
            <input type="checkbox" name="create_categories" defaultChecked />
            <span><strong>Criar categorias ausentes</strong><small>Novas categorias são criadas automaticamente.</small></span>
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
          <div className={result.errors.length ? "preview-alert warning" : "preview-alert success"}>
            {result.errors.length ? <AlertTriangle size={18} /> : <CheckCircle2 size={18} />}
            {result.errors.length ? `${result.errors.length} item(ns) precisam de correção` : "Formato pronto para importar"}
          </div>
        </div>

        <div className="preview-list">
          {result.items.slice(0, 12).map((item) => (
            <article key={`${item.sourceIndex}-${item.externalUrl}`} className="preview-item">
              <span className="preview-index">{item.sourceIndex}</span>
              <div>
                <strong>{item.name}</strong>
                <p>{item.categoryName || "Sem categoria"} · {item.priceText || "Sem preço informado"}</p>
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
        <p className="form-help">Os itens válidos serão importados. Erros e duplicados serão informados no relatório final.</p>
      </aside>
    </form>
  );
}
