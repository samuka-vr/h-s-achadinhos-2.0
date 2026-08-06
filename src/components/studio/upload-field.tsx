"use client";

import { useRef, useState } from "react";

export function UploadField({ name, label, defaultValue = "", accept = "image/*,video/mp4,video/webm" }: { name: string; label: string; defaultValue?: string; accept?: string }) {
  const [value, setValue] = useState(defaultValue);
  const [status, setStatus] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function upload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setStatus("Enviando…");
    const body = new FormData();
    body.set("file", file);
    const response = await fetch("/api/studio/upload", { method: "POST", body });
    const result = (await response.json()) as { url?: string; error?: string };
    if (!response.ok || !result.url) { setStatus(result.error ?? "Falha no upload."); return; }
    setValue(result.url);
    setStatus("Upload concluído.");
  }

  return <label>{label}<input type="url" name={name} value={value} onChange={(event) => setValue(event.target.value)} placeholder="URL ou envie um arquivo abaixo"/><div className="upload-row"><input ref={fileRef} type="file" accept={accept}/><button className="button secondary" type="button" onClick={upload}>Enviar</button></div>{status ? <small className="muted">{status}</small> : null}</label>;
}
