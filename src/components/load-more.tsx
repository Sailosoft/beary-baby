"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export function LoadMore({ hasMore, page }: { hasMore: boolean; page: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  if (!hasMore) return null;

  function loadMore() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page + 1));
    startTransition(() => router.push(`${pathname}?${params}`));
  }

  return (
    <div className="flex justify-center py-8">
      <button
        onClick={loadMore}
        className="beary-btn btn rounded-full px-10"
        disabled={pending}
      >
        {pending ? (
          <span className="loading loading-spinner loading-sm" />
        ) : (
          "Load more"
        )}
      </button>
    </div>
  );
}
