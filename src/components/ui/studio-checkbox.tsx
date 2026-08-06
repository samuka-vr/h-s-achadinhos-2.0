"use client";

import type { ChangeEventHandler } from "react";

export function StudioCheckbox({
  checked,
  onChange,
  ariaLabel,
  disabled = false,
  name,
  defaultChecked,
}: {
  checked?: boolean;
  onChange?: ChangeEventHandler<HTMLInputElement>;
  ariaLabel: string;
  disabled?: boolean;
  name?: string;
  defaultChecked?: boolean;
}) {
  return (
    <input
      type="checkbox"
      className="studio-check"
      checked={checked}
      defaultChecked={checked === undefined ? defaultChecked : undefined}
      onChange={onChange}
      aria-label={ariaLabel}
      disabled={disabled}
      name={name}
    />
  );
}
