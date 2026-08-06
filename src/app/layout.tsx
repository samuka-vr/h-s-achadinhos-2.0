import type { Metadata, Viewport } from "next";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "H&S Achadinhos", template: "%s | H&S Achadinhos" },
  description: "Descobertas que valem a pena.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0f766e" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="pt-BR"><body><Toaster richColors position="top-right"/>{children}</body></html>;
}
