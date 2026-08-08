import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import { getSiteSettings } from "@/server/queries/public";
import "./globals.css";

function stringSetting(value: unknown) {
  return typeof value === "string" && value ? value : undefined;
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const favicon = stringSetting(settings.homepage.favicon_url);
  const shareImage = stringSetting(settings.homepage.share_image_url);

  return {
    title: { default: settings.brand_name, template: `%s | ${settings.brand_name}` },
    description: settings.description,
    icons: favicon ? { icon: favicon, apple: favicon } : undefined,
    openGraph: shareImage ? {
      title: settings.brand_name,
      description: settings.description,
      images: [{ url: shareImage }],
    } : undefined,
  };
}

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#F2554F" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body><Toaster richColors position="top-right"/>{children}</body></html>;
}
