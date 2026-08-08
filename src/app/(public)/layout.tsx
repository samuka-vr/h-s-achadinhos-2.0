import type { CSSProperties } from "react";
import type { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { AnalyticsTracker } from "@/components/site/analytics-tracker";
import { getSiteSettings } from "@/server/queries/public";
import { resolveSiteTheme } from "@/lib/theme";

function stringSetting(value: unknown) {
  return typeof value === "string" && value ? value : undefined;
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const enabled = process.env.SITE_INDEXING_ENABLED === "true" && settings.indexing_enabled;
  const favicon = stringSetting(settings.homepage.favicon_url);
  const shareImage = stringSetting(settings.homepage.share_image_url);

  return {
    title: { default: settings.brand_name, template: `%s | ${settings.brand_name}` },
    description: settings.description,
    robots: { index: enabled, follow: enabled },
    icons: favicon ? { icon: favicon, apple: favicon } : undefined,
    openGraph: shareImage ? {
      title: settings.brand_name,
      description: settings.description,
      images: [{ url: shareImage }],
    } : undefined,
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
