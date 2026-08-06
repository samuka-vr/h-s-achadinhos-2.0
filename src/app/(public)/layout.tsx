import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { AnalyticsTracker } from "@/components/site/analytics-tracker";
import { getSiteSettings } from "@/server/queries/public";

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
  const style = {
    "--brand": settings.theme.primary_color || "#4f46e5",
    "--brand-strong": settings.theme.primary_dark || "#3730a3",
    "--accent": settings.theme.accent_color || "#8b5cf6",
  } as CSSProperties;

  return <div className="public-app" style={style}><Header settings={settings}/><main>{children}</main><Footer settings={settings}/><Suspense><AnalyticsTracker/></Suspense></div>;
}
