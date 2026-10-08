import { requireAdmin } from "@/app/actions/auth-actions";
import { AdminHeader } from "@/components/admin/admin-header";

// Admin area is session-gated; allow blocking on the server instead of
// prerendering a static shell (per the auth-with-cache-components guide).
export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const username = await requireAdmin();

  return (
    <div className="flex flex-col min-h-screen">
      <AdminHeader username={username} />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}
