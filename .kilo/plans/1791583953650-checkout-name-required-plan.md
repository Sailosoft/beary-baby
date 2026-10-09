# Checkout: require customer name + add "remove name"

## Goal
1. When a customer opens `/checkout` without a saved name, immediately force the
   `CustomerMetaModal` (non-dismissable) so a name is set before they can order.
2. In the checkout "Ordering as" panel, add a **Remove** button that clears the
   saved customer name.

## Decisions (confirmed)
- Enforcement point: **on checkout page load** (covers cart page, cart drawer, and
  direct URL visits with a single change). The existing `placeOrder` guard at
  `src/app/(shop)/checkout/page.tsx:22` stays as a fallback.
- The auto-prompt fires **once** on load. If the user later removes the name
  intentionally, the modal does **not** auto-reopen; clicking "Place order" still
  re-triggers the required modal via the existing guard.
- The auto-prompt only fires when the cart has items (`items.length > 0`), so an
  empty-cart screen is not blocked by the name modal.
- The modal is forced only while no name exists (`required = !customerName`).
  Reopening it via "Change" (when a name exists stays dismissable).

## Files to change
- `src/components/cart/cart-provider.tsx`
- `src/components/cart/customer-meta-modal.tsx`
- `src/app/(shop)/checkout/page.tsx`

## Tasks (ordered)

### 1. `cart-provider.tsx` — add load flag + clear method
- Change the `customerMeta` live query so `undefined` means "still loading" and
  `null` means "loaded, no record":
  ```ts
  const customerMeta = useLiveQuery(
    async () => {
      if (typeof window === "undefined") return null;
      return (await getLocalDB().customerMeta.get(1)) ?? null;
    },
    [],
    undefined,
  );
  ```
- Add to `CartContextValue`:
  - `customerNameLoaded: boolean;`
  - `clearCustomerName: () => Promise<void>;`
- Implement:
  ```ts
  const clearCustomerName = useCallback(async () => {
    await getLocalDB().customerMeta.delete(1);
  }, []);
  ```
- Expose in `value`:
  - `customerNameLoaded: customerMeta !== undefined,`
  - keep `customerName: customerMeta?.name ?? "",`
  - `clearCustomerName,`

### 2. `customer-meta-modal.tsx` — support a required mode
- Add optional prop `required?: boolean`.
- Backdrop click should only close when **not** required:
  ```ts
  onClick={required ? undefined : () => onClose?.()}
  ```
- Keep the Save button; it is already disabled while the trimmed name is empty, so
  a required modal cannot be dismissed without entering a name.
- No other markup change.

### 3. `checkout/page.tsx` — auto-prompt on load + Remove button
- Import `useEffect`, `useRef` from `react`.
- Pull new values from `useCart()`: add `clearCustomerName` and `customerNameLoaded`.
- Add a one-shot auto-prompt effect:
  ```ts
  const namePrompted = useRef(false);
  useEffect(() => {
    if (!customerNameLoaded || items.length === 0 || namePrompted.current) return;
    namePrompted.current = true;
    if (!customerName) setMetaOpen(true);
  }, [customerNameLoaded, customerName, items.length]);
  ```
- In the "Ordering as" panel, add a **Remove** button next to "Change" that calls
  `clearCustomerName()`; render it only when `customerName` is truthy. Group the
  two buttons in a flex container (`gap-1`) so layout stays aligned.
- Pass `required={!customerName}` to `CustomerMetaModal`:
  ```tsx
  <CustomerMetaModal
    required={!customerName}
    onClose={() => setMetaOpen(false)}
    onSaved={() => setMetaOpen(false)}
  />
  ```
  (When auto-opened with no name, `required` blocks backdrop dismissal; after save
  the name is set and normal "Change" reopen stays dismissable.)

## Behavior summary
- Open `/checkout` with items + no name → required modal appears; only Save (with a
  non-empty name) dismisses it. Cart page and drawer paths are covered automatically.
- "Ordering as" shows name + **Change** + **Remove** (Remove only when a name exists).
- Remove clears the record; the modal does not auto-reopen, but "Place order" still
  forces it again if the name is empty.
- Empty cart → no forced modal.

## Risks / notes
- `customerNameLoaded` relies on the query returning `null` for "no record" vs
  `undefined` for "loading"; do not pass a non-`undefined` default.
- `useEffect` deps include `customerName`; the `namePrompted` ref guarantees the
  prompt only fires once even when the name later becomes empty.
- No Next.js API changes; only React client logic, matching existing patterns.

## Validation
- `npm run lint`
- Manual (`npm run dev`, port 3099):
  1. Clear `customerMeta` (or fresh browser storage) → add an item → open `/checkout`
     → required name modal shows, backdrop click does nothing, Save disabled until a
     name is typed.
  2. Save name → modal closes; panel shows name + Change + Remove.
  3. Click **Remove** → name cleared to "No name set", Remove button hidden; no
     auto-reopen.
  4. Click **Place order** with no name → required modal reappears.
  5. Reopen via **Change** with a name set → modal is dismissable via backdrop.
  6. Empty cart `/checkout` with no name → no modal.
