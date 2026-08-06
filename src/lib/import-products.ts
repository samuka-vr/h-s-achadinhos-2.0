export type ParsedImportProduct = {
  sourceIndex: number;
  name: string;
  categoryName: string;
  description: string;
  priceText: string;
  externalUrl: string;
  affiliateNetwork: string;
};

export type ImportParseError = {
  sourceIndex: number;
  message: string;
};

export type ImportParseResult = {
  items: ParsedImportProduct[];
  errors: ImportParseError[];
};

function clean(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

export function normalizeCategoryKey(value: string) {
  return clean(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function detectNetwork(url: string) {
  try {
    const host = new URL(url).hostname.toLowerCase();
    if (host.includes("shopee")) return "Shopee";
    if (host.includes("amazon")) return "Amazon";
    if (host.includes("mercadolivre") || host.includes("mercadolibre")) return "Mercado Livre";
    if (host.includes("magalu")) return "Magalu";
    if (host.includes("aliexpress")) return "AliExpress";
    return host.replace(/^www\./, "");
  } catch {
    return "";
  }
}

function parseJsonInput(raw: string): ImportParseResult | null {
  if (!raw.trim().startsWith("[")) return null;
  try {
    const input = JSON.parse(raw) as unknown;
    if (!Array.isArray(input)) return null;

    const items: ParsedImportProduct[] = [];
    const errors: ImportParseError[] = [];

    input.forEach((value, index) => {
      if (!value || typeof value !== "object") {
        errors.push({ sourceIndex: index + 1, message: "Item JSON inválido." });
        return;
      }
      const record = value as Record<string, unknown>;
      const name = clean(String(record.name ?? ""));
      const categoryName = clean(String(record.category_name ?? record.category ?? ""));
      const description = clean(String(record.description ?? record.short_description ?? ""));
      const priceText = clean(String(record.price_text ?? record.value ?? ""));
      const externalUrl = clean(String(record.external_url ?? record.link ?? ""));

      if (!name) errors.push({ sourceIndex: index + 1, message: "Nome ausente." });
      if (!externalUrl || !/^https?:\/\//i.test(externalUrl)) errors.push({ sourceIndex: index + 1, message: "Link ausente ou inválido." });
      if (!name || !externalUrl || !/^https?:\/\//i.test(externalUrl)) return;

      items.push({
        sourceIndex: index + 1,
        name,
        categoryName,
        description,
        priceText,
        externalUrl,
        affiliateNetwork: clean(String(record.affiliate_network ?? "")) || detectNetwork(externalUrl),
      });
    });

    return { items, errors };
  } catch {
    return null;
  }
}

export function parseStructuredProducts(raw: string): ImportParseResult {
  const json = parseJsonInput(raw);
  if (json) return json;

  const normalized = raw.replace(/\r\n?/g, "\n").trim();
  if (!normalized) return { items: [], errors: [] };

  const blocks: Array<{ index: number; lines: string[] }> = [];
  let current: { index: number; lines: string[] } | null = null;

  for (const rawLine of normalized.split("\n")) {
    const line = rawLine.trim();
    const start = line.match(/^(\d+)\s*[.)-]\s*(.+)$/);
    if (start) {
      if (current) blocks.push(current);
      current = { index: Number(start[1]!), lines: [start[2]!.trim()] };
      continue;
    }
    if (!current) {
      if (line) current = { index: blocks.length + 1, lines: [line] };
      continue;
    }
    current.lines.push(line);
  }
  if (current) blocks.push(current);

  const items: ParsedImportProduct[] = [];
  const errors: ImportParseError[] = [];

  for (const block of blocks) {
    const fields: Record<string, string> = {};
    const nameParts: string[] = [];
    let activeField = "";

    for (let i = 0; i < block.lines.length; i += 1) {
      const line = block.lines[i];
      if (!line) continue;
      const match = line.match(/^(categoria|descri[cç][aã]o|valor|pre[cç]o|link|url)\s*:\s*(.*)$/i);
      if (match) {
        const label = normalizeCategoryKey(match[1]!);
        const key = label.startsWith("categoria")
          ? "category"
          : label.startsWith("descr")
            ? "description"
            : label === "valor" || label.startsWith("preco")
              ? "price"
              : "link";
        fields[key] = clean(match[2] ?? "");
        activeField = key;
        continue;
      }

      if (i === 0 || !activeField) {
        nameParts.push(line);
      } else {
        fields[activeField] = clean(`${fields[activeField] ?? ""} ${line}`);
      }
    }

    const name = clean(nameParts.join(" "));
    const externalUrl = clean(fields.link ?? "");

    if (!name) errors.push({ sourceIndex: block.index, message: "Nome do produto não encontrado." });
    if (!externalUrl) errors.push({ sourceIndex: block.index, message: "Campo Link não encontrado." });
    else if (!/^https?:\/\//i.test(externalUrl)) errors.push({ sourceIndex: block.index, message: "O link precisa começar com http:// ou https://." });

    if (!name || !externalUrl || !/^https?:\/\//i.test(externalUrl)) continue;

    items.push({
      sourceIndex: block.index,
      name,
      categoryName: clean(fields.category ?? ""),
      description: clean(fields.description ?? ""),
      priceText: clean(fields.price ?? ""),
      externalUrl,
      affiliateNetwork: detectNetwork(externalUrl),
    });
  }

  return { items, errors };
}
