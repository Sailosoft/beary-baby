"use client";

import { useId, useRef, useState } from "react";

export type UrlFieldControl = {
  value: string;
  setValue: (value: string) => void;
};

function usePaste(target: { setValue: (value: string) => void; multiRow?: (lines: string[]) => void }) {
  return async () => {
    try {
      const text = await navigator.clipboard.readText();
      const lines = text
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      if (lines.length === 0) return;
      if (lines.length > 1 && target.multiRow) {
        target.multiRow(lines);
        return;
      }
      target.setValue(lines[0]);
    } catch {
      // Clipboard unavailable (permission/insecure context) — manual paste still works.
    }
  };
}

/**
 * Single URL input with a Paste button. Submits under `name` exactly like the
 * plain input it replaced.
 */
export function UrlField({
  name,
  defaultValue = "",
  required,
  placeholder,
  trailingSlot,
}: {
  name: string;
  defaultValue?: string;
  required?: boolean;
  placeholder?: string;
  trailingSlot?: (field: UrlFieldControl) => React.ReactNode;
}) {
  const [value, setValue] = useState(defaultValue);
  const inputRef = useRef<HTMLInputElement>(null);
  const paste = usePaste({
    setValue: (v) => {
      setValue(v);
      inputRef.current?.focus();
    },
  });

  return (
    <div className="flex w-full items-center gap-2">
      <input
        ref={inputRef}
        name={name}
        type="url"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        required={required}
        placeholder={placeholder}
        className="input input-bordered bg-white flex-1 min-w-0"
      />
      <button
        type="button"
        onClick={paste}
        className="btn btn-ghost btn-sm shrink-0"
        title="Paste from clipboard"
      >
        Paste
      </button>
      {trailingSlot?.({ value, setValue })}
    </div>
  );
}

type UrlRow = { key: string; value: string };

let rowCounter = 0;
function nextRowKey(): string {
  rowCounter += 1;
  return `url-row-${rowCounter}`;
}

/**
 * Expandable list of URL inputs (paste button + remove per row, add button).
 * Serializes to a single newline-joined field under `name`, matching the old
 * gallery textarea so server parsing is unchanged.
 */
export function UrlListField({
  name,
  defaultValue = "",
  trailingSlot,
  footerSlot,
}: {
  name: string;
  defaultValue?: string;
  trailingSlot?: (field: UrlFieldControl) => React.ReactNode;
  footerSlot?: (api: { addValues: (urls: string[]) => void }) => React.ReactNode;
}) {
  const initial = defaultValue
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const [rows, setRows] = useState<UrlRow[]>(() =>
    (initial.length > 0 ? initial : [""]).map((value) => ({
      key: nextRowKey(),
      value,
    })),
  );
  const id = useId();

  function setValueAt(index: number, value: string) {
    setRows((prev) => prev.map((row, i) => (i === index ? { ...row, value } : row)));
  }

  function addRow() {
    setRows((prev) => [...prev, { key: nextRowKey(), value: "" }]);
  }

  function removeRow(index: number) {
    setRows((prev) => prev.filter((_, i) => i !== index));
  }

  function addValues(urls: string[]) {
    const cleaned = urls.map((url) => url.trim()).filter(Boolean);
    if (cleaned.length === 0) return;
    setRows((prev) => [
      ...prev,
      ...cleaned.map((value) => ({ key: nextRowKey(), value })),
    ]);
  }

  async function handlePaste(index: number) {
    try {
      const text = await navigator.clipboard.readText();
      const lines = text
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean);
      if (lines.length === 0) return;
      if (lines.length === 1) {
        setValueAt(index, lines[0]);
        return;
      }
      setRows((prev) => {
        const next = [...prev];
        next.splice(
          index,
          1,
          ...lines.map((value) => ({ key: nextRowKey(), value })),
        );
        return next;
      });
    } catch {
      // Clipboard unavailable — manual paste still works.
    }
  }

  const serialized = rows
    .map((row) => row.value.trim())
    .filter(Boolean)
    .join("\n");

  return (
    <div className="flex flex-col gap-2 w-full min-w-0">
      {rows.map((row, index) => (
        <div key={row.key} className="flex items-center gap-2 min-w-0">
          <input
            id={`${id}-${row.key}`}
            type="url"
            value={row.value}
            onChange={(e) => setValueAt(index, e.target.value)}
            placeholder="https://i.ibb.co/…"
            className="input input-bordered bg-white font-mono text-xs flex-1 min-w-0"
            aria-label="Image URL"
          />
          <button
            type="button"
            onClick={() => handlePaste(index)}
            className="btn btn-ghost btn-xs shrink-0"
            title="Paste from clipboard"
          >
            Paste
          </button>
          <button
            type="button"
            onClick={() => removeRow(index)}
            className="btn btn-ghost btn-xs text-error shrink-0"
            aria-label="Remove URL"
          >
            ✕
          </button>
          {trailingSlot?.({ value: row.value, setValue: (v) => setValueAt(index, v) })}
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={addRow}
          className="btn btn-ghost btn-xs w-fit text-beary-pink-deep"
        >
          + Add URL
        </button>
        {footerSlot?.({ addValues })}
      </div>
      <input type="hidden" name={name} value={serialized} readOnly />
    </div>
  );
}
