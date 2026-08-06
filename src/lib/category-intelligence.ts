import { normalizeCategoryKey } from "@/lib/import-products";

export type ExistingCategoryRef = {
  id: string;
  name: string;
  active?: boolean;
};

export type CategorySuggestion = {
  canonicalName: string | null;
  existingCategoryId: string | null;
  existingCategoryName: string | null;
  confidence: "high" | "medium" | "low";
  score: number;
  reason: string;
  shouldCreate: boolean;
};

type CategoryRule = {
  name: string;
  aliases: string[];
  nameKeywords: string[];
  descriptionKeywords?: string[];
};

export const CATEGORY_RULES: CategoryRule[] = [
  {
    name: "Automotivo",
    aliases: ["automotivo", "automotivo e organizacao", "limpeza e automotivo"],
    nameKeywords: [
      "automotivo",
      "veicular",
      "carro",
      "para carro",
      "banco de carro",
      "uber",
      "99",
      "gps veicular",
    ],
  },
  {
    name: "Pet",
    aliases: ["pet", "lavanderia e pet"],
    nameKeywords: ["pet", "cachorro", "gato", "animal", "bebedouro pet", "pelo de pet"],
  },
  {
    name: "Beleza & Bem-estar",
    aliases: [
      "beleza",
      "beleza masculina",
      "beleza e cabelo",
      "beleza e cuidados pessoais",
      "saude e bem-estar",
      "organizacao e beleza",
      "decoracao e beleza",
    ],
    nameKeywords: [
      "barbeador",
      "barba",
      "aparador",
      "maquiagem",
      "cosmetico",
      "cosmeticos",
      "cabelo",
      "escova secadora",
      "alisador",
      "lixador de pe",
      "pedicure",
      "massageador",
      "massagem muscular",
      "saude",
      "bem-estar",
      "perfume",
    ],
  },
  {
    name: "Decoração & Iluminação",
    aliases: [
      "decoracao",
      "decoracao e iluminacao",
      "decoracao e beleza",
      "casa e iluminacao",
      "casa e aromaterapia",
      "iluminacao",
    ],
    nameKeywords: [
      "luminaria",
      "luminária",
      "fita led",
      "led neon",
      "luz noturna",
      "projetor aurora",
      "ceu estrelado",
      "céu estrelado",
      "espelho organico",
      "espelho orgânico",
      "umidificador",
      "difusor de ar",
      "aromatizador",
      "decoracao",
      "decoração",
      "iluminacao",
      "iluminação",
    ],
  },
  {
    name: "Eletrônicos",
    aliases: [
      "eletronicos",
      "eletronicos e audio",
      "eletronicos e carregadores",
      "eletronicos e cabos",
      "eletronicos e limpeza",
      "seguranca e eletronicos",
      "audio",
      "tecnologia",
    ],
    nameKeywords: [
      "fone",
      "bluetooth",
      "tws",
      "microfone",
      "power bank",
      "carregador",
      "cabo tipo-c",
      "cabo usb",
      "usb",
      "magsafe",
      "camera de seguranca",
      "câmera de segurança",
      "camera wifi",
      "câmera wifi",
      "teclado",
      "airpods",
      "eletronico",
      "eletrônico",
      "smart",
    ],
  },
  {
    name: "Casa & Cozinha",
    aliases: [
      "casa e cozinha",
      "cozinha",
      "organizacao de cozinha",
      "cozinha e organizacao",
      "casa",
    ],
    nameKeywords: [
      "cozinha",
      "geladeira",
      "porta frios",
      "porta ovos",
      "fatiador",
      "vegetais",
      "legumes",
      "borrifador azeite",
      "pulverizador azeite",
      "galheteiro",
      "forma de gelo",
      "conjunto de gelo",
      "potes hermeticos",
      "potes herméticos",
      "marmita",
      "mantimentos",
      "porta detergente",
      "organizador de pia",
      "seladora",
      "embalagens plasticas",
      "embalagens plásticas",
    ],
  },
  {
    name: "Limpeza & Organização",
    aliases: [
      "limpeza",
      "organizacao",
      "organizacao e escritorio",
      "limpeza e lavanderia",
      "lavanderia e casa",
      "lavanderia",
    ],
    nameKeywords: [
      "limpeza",
      "limpar",
      "tira manchas",
      "percarbonato",
      "esfregao",
      "esfregão",
      "escova de limpeza",
      "aspirador",
      "pastilha de maquina de lavar",
      "pastilha de máquina de lavar",
      "varal",
      "vassoura",
      "rodo",
      "organizador de fios",
      "clip fixador",
      "armazenamento",
      "organizador",
      "tirar pelos",
      "tira pelo",
    ],
  },
  {
    name: "Moda & Acessórios",
    aliases: ["moda", "roupas", "acessorios", "moda e acessorios", "moda & lazer", "moda e lazer"],
    nameKeywords: [
      "camiseta",
      "camisa",
      "calca",
      "calça",
      "vestido",
      "tenis",
      "tênis",
      "bolsa",
      "mochila",
      "relogio",
      "relógio",
      "oculos",
      "óculos",
      "colar",
      "pulseira",
      "moda",
    ],
  },
  {
    name: "Bebê & Infantil",
    aliases: ["bebe", "bebê", "infantil", "bebe e infantil"],
    nameKeywords: [
      "bebe",
      "bebê",
      "mamadeira",
      "fralda",
      "carrinho de bebe",
      "carrinho de bebê",
      "brinquedo infantil",
      "crianca",
      "criança",
    ],
  },
  {
    name: "Esporte & Lazer",
    aliases: ["esporte", "lazer", "fitness", "esporte e lazer"],
    nameKeywords: [
      "academia",
      "fitness",
      "halter",
      "bola",
      "futebol",
      "ciclismo",
      "camping",
      "pesca",
      "esporte",
    ],
  },
  {
    name: "Ferramentas & Utilidades",
    aliases: ["ferramentas", "utilidades", "ferramentas e utilidades"],
    nameKeywords: [
      "furadeira",
      "parafusadeira",
      "chave de fenda",
      "alicate",
      "martelo",
      "ferramenta",
      "kit de ferramentas",
      "trena",
    ],
  },
];

function text(value: string) {
  return normalizeCategoryKey(value);
}

function includesPhrase(haystack: string, phrase: string) {
  return haystack.includes(text(phrase));
}

function findExistingForRule(rule: CategoryRule, categories: ExistingCategoryRef[]) {
  const exact = categories.find((category) => text(category.name) === text(rule.name));
  if (exact) return exact;

  return categories.find((category) => {
    const normalized = text(category.name);
    return rule.aliases.some((alias) => normalized === text(alias));
  });
}

export function suggestProductCategory(
  input: {
    name: string;
    description?: string | null;
    sourceCategory?: string | null;
  },
  existingCategories: ExistingCategoryRef[] = [],
): CategorySuggestion {
  const normalizedName = text(input.name ?? "");
  const normalizedDescription = text(input.description ?? "");
  const normalizedSource = text(input.sourceCategory ?? "");
  const combined = `${normalizedName} ${normalizedDescription}`.trim();

  const ranked = CATEGORY_RULES.map((rule, index) => {
    let score = 0;
    const reasons: string[] = [];
    const ruleName = text(rule.name);
    const aliases = [rule.name, ...rule.aliases].map(text);

    if (normalizedSource) {
      if (normalizedSource === ruleName || aliases.includes(normalizedSource)) {
        score += 24;
        reasons.push("categoria informada compatível");
      } else if (aliases.some((alias) => normalizedSource.includes(alias) || alias.includes(normalizedSource))) {
        score += 12;
        reasons.push("categoria informada semelhante");
      }
    }

    for (const keyword of rule.nameKeywords) {
      const normalizedKeyword = text(keyword);
      if (!normalizedKeyword) continue;
      if (normalizedName.includes(normalizedKeyword)) {
        score += normalizedKeyword.includes(" ") ? 12 : 8;
        reasons.push(`nome contém “${keyword}”`);
      } else if (combined.includes(normalizedKeyword)) {
        score += normalizedKeyword.includes(" ") ? 6 : 4;
        reasons.push(`descrição contém “${keyword}”`);
      }
    }

    for (const keyword of rule.descriptionKeywords ?? []) {
      if (includesPhrase(combined, keyword)) {
        score += 4;
        reasons.push(`contexto contém “${keyword}”`);
      }
    }

    return { rule, score, reasons, index };
  }).sort((a, b) => b.score - a.score || a.index - b.index);

  const best = ranked[0];
  const runnerUp = ranked[1];
  const margin = best ? best.score - (runnerUp?.score ?? 0) : 0;

  if (!best || best.score < 8) {
    return {
      canonicalName: null,
      existingCategoryId: null,
      existingCategoryName: null,
      confidence: "low",
      score: best?.score ?? 0,
      reason: "Nenhuma categoria ampla teve correspondência segura.",
      shouldCreate: false,
    };
  }

  const existing = findExistingForRule(best.rule, existingCategories);
  const confidence: CategorySuggestion["confidence"] =
    best.score >= 20 && margin >= 4 ? "high" : best.score >= 12 ? "medium" : "low";

  return {
    canonicalName: best.rule.name,
    existingCategoryId: existing?.id ?? null,
    existingCategoryName: existing?.name ?? null,
    confidence,
    score: best.score,
    reason: best.reasons.slice(0, 2).join("; ") || "Correspondência pelo contexto do produto.",
    shouldCreate: !existing && confidence !== "low",
  };
}

export function isCanonicalCategoryName(name: string) {
  const normalized = text(name);
  return CATEGORY_RULES.some((rule) => text(rule.name) === normalized);
}
