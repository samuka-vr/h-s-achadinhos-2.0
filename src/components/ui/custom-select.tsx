"use client";

import { Check, ChevronDown } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

export type CustomSelectOption = {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
  danger?: boolean;
};

type Props = {
  name: string;
  options: CustomSelectOption[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
};

export function CustomSelect({
  name,
  options,
  value,
  defaultValue = "",
  onValueChange,
  placeholder = "Selecione uma opção",
  ariaLabel,
  className = "",
  disabled = false,
  required = false,
}: Props) {
  const generatedId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const currentValue = value ?? internalValue;
  const selected = options.find((option) => option.value === currentValue);

  useEffect(() => {
    if (value === undefined) setInternalValue(defaultValue);
  }, [defaultValue, value]);

  useEffect(() => {
    function handlePointer(event: MouseEvent | TouchEvent) {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("touchstart", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("touchstart", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

  function select(nextValue: string) {
    if (value === undefined) setInternalValue(nextValue);
    onValueChange?.(nextValue);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={`hs-select ${open ? "open" : ""} ${className}`.trim()}>
      <input type="hidden" name={name} value={currentValue} data-required={required ? "true" : undefined} />
      <button
        id={`${generatedId}-button`}
        type="button"
        className="hs-select-trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${generatedId}-listbox`}
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
      >
        <span className={selected ? "hs-select-value" : "hs-select-placeholder"}>{selected?.label ?? placeholder}</span>
        <ChevronDown size={17} aria-hidden="true" />
      </button>

      {open ? (
        <div id={`${generatedId}-listbox`} className="hs-select-menu" role="listbox" aria-labelledby={`${generatedId}-button`}>
          {options.map((option) => {
            const active = option.value === currentValue;
            return (
              <button
                key={`${option.value}-${option.label}`}
                type="button"
                role="option"
                aria-selected={active}
                disabled={option.disabled}
                className={`hs-select-option ${active ? "active" : ""} ${option.danger ? "danger" : ""}`.trim()}
                onClick={() => select(option.value)}
              >
                <span className="hs-select-option-copy">
                  <strong>{option.label}</strong>
                  {option.description ? <small>{option.description}</small> : null}
                </span>
                <span className="hs-select-check">{active ? <Check size={16} /> : null}</span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
