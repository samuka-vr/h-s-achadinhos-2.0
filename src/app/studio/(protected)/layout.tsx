import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { StudioSidebar } from "@/components/studio/sidebar";
import { StudioTopbar } from "@/components/studio/topbar";
import { requireRole } from "@/server/auth";
import { getStudioSettings } from "@/server/queries/studio";
import { resolveSiteTheme } from "@/lib/theme";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function StudioLayout({ children }: { children: React.ReactNode }) {
  const [viewer, settings] = await Promise.all([
    requireRole(["owner", "admin", "editor", "analyst"]),
    getStudioSettings(),
  ]);
  const theme = resolveSiteTheme(settings.theme);
  const style = {
    "--brand": theme.primary_color,
    "--brand-strong": theme.primary_dark,
    "--accent": theme.accent_color,
    "--bg": theme.background_color,
    "--surface": theme.surface_color,
    "--text": theme.text_color,
  } as CSSProperties;

  return (
    <div className="studio-shell" style={style}>
      <StudioSidebar role={viewer.role} />
      <main className="studio-main">
        <StudioTopbar role={viewer.role} />
        <div className="studio-content">{children}</div>
      </main>
    </div>
  );
}
