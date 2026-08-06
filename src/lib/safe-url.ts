export function parseSafeHttpUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url : null;
  } catch {
    return null;
  }
}

export function getReferrerHost(value: string | null): string | null {
  if (!value) return null;
  try {
    return new URL(value).hostname.slice(0, 255);
  } catch {
    return null;
  }
}
