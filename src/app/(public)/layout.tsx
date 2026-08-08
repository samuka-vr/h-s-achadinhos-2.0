import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { AnalyticsTracker } from "@/components/site/analytics-tracker";
import { getSiteSettings } from "@/server/queries/public";
import { resolveSiteTheme } from "@/lib/theme";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const enabled = process.env.SITE_INDEXING_ENABLED === "true" && settings.indexing_enabled;
  return {
    title: { default: settings.brand_name, template: `%s | ${settings.brand_name}` },
    description: settings.description,
    robots: { index: enabled, follow: enabled },
  };
}

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSiteSettings();
  const theme = resolveSiteTheme(settings.theme);
  const style = {
    "--brand": theme.primary_color,
    "--brand-strong": theme.primary_dark,
    "--accent": theme.accent_color,
    "--bg": theme.background_color,
    "--surface": theme.surface_color,
    "--text": theme.text_color,
  } as CSSProperties;

  return <div className="public-app" style={style}><Header settings={settings}/><main>{children}</main><Footer settings={settings}/><Suspense><AnalyticsTracker/></Suspense></div>;
}
