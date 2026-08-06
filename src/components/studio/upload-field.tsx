"use client";

import { CheckCircle2, FileUp, LoaderCircle, Upload } from "lucide-react";
import { useRef, useState } from "react";

export function UploadField({
  name,
  label,
  defaultValue = "",
  accept = "image/*,video/mp4,video/webm",
}: {
  name: string;
  label: string;
  defaultValue?: string;
  accept?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [status, setStatus] = useState("");
  const [fileName, setFileName] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setStatus("Escolha um arquivo primeiro.");
      return;
    }

    setUploading(true);
    setStatus("Enviando arquivo…");
    try {
      const body = new FormData();
      body.set("file", file);
      const response = await fetch("/api/studio/upload", { method: "POST", body });
      const result = (await response.json()) as { url?: string; error?: string };
      if (!response.ok || !result.url) {
        setStatus(result.error ?? "Não foi possível enviar o arquivo.");
        return;
      }
      setValue(result.url);
      setStatus("Arquivo enviado com sucesso.");
    } catch {
      setStatus("A conexão falhou durante o envio.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <label>
      {label}
      <input
        type="url"
        name={name}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Cole uma URL ou envie um arquivo"
      />
      <div className="custom-upload-control">
        <input
          ref={fileRef}
          className="custom-upload-input"
          type="file"
          accept={accept}
          onChange={(event) => {
            const file = event.target.files?.[0];
            setFileName(file?.name ?? "");
            setStatus("");
          }}
        />
        <button type="button" className="custom-upload-picker" onClick={() => fileRef.current?.click()}>
          <FileUp size={17} />
          <span>{fileName || "Escolher arquivo"}</span>
        </button>
        <button className="button secondary" type="button" onClick={upload} disabled={uploading || !fileName}>
          {uploading ? <LoaderCircle className="spin" size={17} /> : <Upload size={17} />}
          {uploading ? "Enviando" : "Enviar"}
        </button>
      </div>
      {status ? <small className={status.includes("sucesso") ? "upload-status success" : "upload-status"}>{status.includes("sucesso") ? <CheckCircle2 size={14} /> : null}{status}</small> : null}
    </label>
  );
}
