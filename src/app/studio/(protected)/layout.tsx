import type { Metadata } from "next";
import { StudioSidebar } from "@/components/studio/sidebar";
import { requireRole } from "@/server/auth";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function StudioLayout({children}:{children:React.ReactNode}){const viewer=await requireRole(["owner","admin","editor","analyst"]);return <div className="studio-shell"><StudioSidebar role={viewer.role}/><main className="studio-main">{children}</main></div>}
