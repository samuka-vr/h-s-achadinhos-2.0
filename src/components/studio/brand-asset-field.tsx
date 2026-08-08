"use client";

import { ImagePlus, Link2, LoaderCircle, Trash2, UploadCloud } from "lucide-react";
import { useRef, useState } from "react";

type Props = {
  name: string;
  label: string;
  description: string;
  defaultValue?: string;
  recommended?: string;
  previewMode?: "square" | "wide";
};

export function BrandAssetField({
  name,
  label,
  description,
  defaultValue = "",
  recommended,
  previewMode = "square",
}: Props) {
  const [value, setValue] = useState(defaultValue);
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;
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
      setStatus("Imagem pronta para salvar.");
    } catch {
      setStatus("A conexão falhou durante o envio.");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function remove() {
    setValue("");
    setStatus("Imagem removida. Salve a personalização para aplicar.");
  }

  return (
    <div className="brand-asset-field">
      <div className="brand-asset-copy">
        <strong>{label}</strong>
        <p>{description}</p>
        {recommended ? <small>{recommended}</small> : null}
      </div>

      <input type="hidden" name={name} value={value} />
      <input
        ref={fileRef}
        className="custom-upload-input"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(event) => void handleFile(event.target.files?.[0])}
      />

      <button
        type="button"
        className={`brand-asset-preview ${previewMode}`}
        onClick={() => fileRef.current?.click()}
        disabled={uploading}
        aria-label={`Escolher ${label.toLowerCase()} na galeria`}
      >
        {value ? (
          <img src={value} alt={`Prévia de ${label.toLowerCase()}`} />
        ) : (
          <span className="brand-asset-empty"><ImagePlus size={24} /><b>Escolher da galeria</b><small>PNG, JPG ou WEBP</small></span>
        )}
        {uploading ? <span className="brand-asset-loading"><LoaderCircle className="spin" size={22} /> Enviando…</span> : null}
      </button>

      <div className="brand-asset-actions">
        <button type="button" className="button secondary" onClick={() => fileRef.current?.click()} disabled={uploading}>
          <UploadCloud size={17} /> {value ? "Trocar imagem" : "Enviar imagem"}
        </button>
        {value ? <button type="button" className="button ghost" onClick={remove}><Trash2 size={17} /> Remover</button> : null}
      </div>

      <details className="brand-asset-url">
        <summary><Link2 size={15} /> Usar uma URL</summary>
        <input
          type="url"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="https://..."
          aria-label={`URL de ${label.toLowerCase()}`}
        />
      </details>

      {status ? <small className="brand-asset-status">{status}</small> : null}
    </div>
  );
}
