"use client";

import { useState } from "react";

export function ColorField({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  return (
    <label>{label}
      <div className="color-input">
        <input type="color" value={value} onChange={(event) => setValue(event.target.value)} aria-label={`Selecionar ${label.toLowerCase()}`}/>
        <input name={name} value={value} onChange={(event) => setValue(event.target.value)} pattern="#[0-9a-fA-F]{6}" required/>
      </div>
    </label>
  );
}
