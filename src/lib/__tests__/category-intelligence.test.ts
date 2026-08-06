import { describe, expect, it } from "vitest";
import { suggestProductCategory } from "@/lib/category-intelligence";

const categories = [
  "Casa & Cozinha",
  "Limpeza & Organização",
  "Eletrônicos",
  "Decoração & Iluminação",
  "Beleza & Bem-estar",
  "Automotivo",
  "Pet",
].map((name, index) => ({ id: String(index + 1), name, active: true }));

describe("inteligência de categorias", () => {
  it.each([
    ["Mini Máquina Seladora Recarregável", "Organização de Cozinha", "Casa & Cozinha"],
    ["Kit Limpador de Máquina de Lavar", "Limpeza e Lavanderia", "Limpeza & Organização"],
    ["Fone TWS Bluetooth", "Eletrônicos e Áudio", "Eletrônicos"],
    ["Luminária LED com Sensor", "Casa e Iluminação", "Decoração & Iluminação"],
    ["Mini Barbeador Elétrico", "Beleza Masculina", "Beleza & Bem-estar"],
    ["Suporte Celular Veicular", "Automotivo e Organização", "Automotivo"],
    ["Garrafa de Água para Cachorro", "Pet", "Pet"],
  ])("classifica %s", (name, sourceCategory, expected) => {
    expect(suggestProductCategory({ name, sourceCategory }, categories).canonicalName).toBe(expected);
  });

  it("não cria uma categoria específica quando não há correspondência segura", () => {
    const result = suggestProductCategory({ name: "Produto experimental sem contexto", sourceCategory: "Diversos especiais" }, categories);
    expect(result.canonicalName).toBeNull();
    expect(result.shouldCreate).toBe(false);
  });
});
