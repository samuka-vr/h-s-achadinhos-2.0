"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export function AnalyticsTracker() {
  const pathname = usePathname();
  const search = useSearchParams();
  useEffect(() => {
    const path = `${pathname}${search.size ? `?${search.toString()}` : ""}`;
    const body = JSON.stringify({ event_type: "page_view", path });
    if (navigator.sendBeacon) navigator.sendBeacon("/api/analytics", new Blob([body], { type: "application/json" }));
    else void fetch("/api/analytics", { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true });
  }, [pathname, search]);
  return null;
}
