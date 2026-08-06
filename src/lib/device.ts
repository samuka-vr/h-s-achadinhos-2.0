export type DeviceType = "mobile" | "tablet" | "desktop" | "unknown";

export function detectDevice(userAgent: string): DeviceType {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|kindle/.test(ua)) return "tablet";
  if (/mobile|android|iphone|ipod/.test(ua)) return "mobile";
  if (ua) return "desktop";
  return "unknown";
}
