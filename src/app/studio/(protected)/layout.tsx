import type { Metadata } from "next";
import { StudioSidebar } from "@/components/studio/sidebar";
import { StudioTopbar } from "@/components/studio/topbar";
import { requireRole } from "@/server/auth";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const viewer = await requireRole(["owner", "admin", "editor", "analyst"]);
  return (
    <div className="studio-shell">
      <StudioSidebar role={viewer.role} />
      <main className="studio-main">
        <StudioTopbar role={viewer.role} />
        <div className="studio-content">{children}</div>
      </main>
    </div>
  );
}
