const ALPHABET = "0123456789ABCDEFGHJKLMNPQRSTUVWXYZ";
export const PUBLIC_CODE_PATTERN = /^HS-[0-9A-HJ-NP-Z]{5}$/;

export function isPublicCode(value: string): boolean {
  return PUBLIC_CODE_PATTERN.test(value);
}

export function generatePublicCode(random = crypto.getRandomValues.bind(crypto)): string {
  const bytes = new Uint8Array(5);
  random(bytes);
  const token = Array.from(bytes, (value) => ALPHABET[value % ALPHABET.length]).join("");
  return `HS-${token}`;
}

export function buildProductSlug(name: string, code: string): string {
  if (!isPublicCode(code)) throw new Error("Código público inválido.");
  const base = name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
  return `${base || "achadinho"}-${code.toLowerCase()}`;
}
