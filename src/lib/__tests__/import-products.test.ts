import { describe, expect, it } from "vitest";
import { parseStructuredProducts } from "@/lib/import-products";

describe("parseStructuredProducts", () => {
  it("interpreta o formato numerado usado pelo painel", () => {
    const result = parseStructuredProducts(`1. Mini Seladora Recarregável\nCategoria: Cozinha\nDescrição: Fecha embalagens.\nValor: R$12,99\nLink: https://s.shopee.com.br/abc`);
    expect(result.errors).toEqual([]);
    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      name: "Mini Seladora Recarregável",
      categoryName: "Cozinha",
      priceText: "R$12,99",
      affiliateNetwork: "Shopee",
    });
  });

  it("preserva títulos que começam com quantidade e valores a partir de", () => {
    const result = parseStructuredProducts(`23. 1/2/3 Peças Borrifador Azeite Pulverizador Premium
Categoria: Cozinha
Descrição: Pulverizador culinário.
Valor: A partir de R$11,88
Link: https://s.shopee.com.br/teste`);
    expect(result.items[0]?.name).toBe("1/2/3 Peças Borrifador Azeite Pulverizador Premium");
    expect(result.items[0]?.priceText).toBe("A partir de R$11,88");
  });

  it("informa item sem link", () => {
    const result = parseStructuredProducts(`1. Produto sem link\nCategoria: Casa`);
    expect(result.items).toHaveLength(0);
    expect(result.errors[0]?.message).toContain("Link");
  });
});
