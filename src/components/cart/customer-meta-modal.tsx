"use client";

import { useState } from "react";
import { useCart } from "./cart-provider";

export function CustomerMetaModal({
  onClose,
  onSaved,
  required,
}: {
  onClose?: () => void;
  onSaved?: (name: string) => void;
  required?: boolean;
}) {
  const { customerName, setCustomerName } = useCart();
  const [name, setName] = useState(customerName);
  const [pending, setPending] = useState(false);

  async function save() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setPending(true);
    try {
      await setCustomerName(trimmed);
      onSaved?.(trimmed);
      onClose?.();
    } finally {
      setPending(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
      onClick={required ? undefined : () => onClose?.()}
    >
      <div
        className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="mb-1 font-extrabold text-pink-900">Your name</h3>
        <p className="mb-4 text-xs text-pink-500">
          We use this to label your order. No account needed.
        </p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Juan D."
          className="input input-bordered bg-white w-full"
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
          }}
        />
        <button
          type="button"
          className="beary-btn btn mt-4 w-full rounded-full"
          disabled={pending || !name.trim()}
          onClick={save}
        >
          {pending ? <span className="loading loading-spinner loading-sm" /> : "Save"}
        </button>
      </div>
    </div>
  );
}
