import { describe, expect, it } from "vitest";
import { buildProductSlug, generatePublicCode, isPublicCode } from "@/lib/public-code";

describe("código público",()=>{it("gera HS-XXXXX",()=>{expect(generatePublicCode()).toMatch(/^HS-[0-9A-HJ-NP-Z]{5}$/)});it("valida formato",()=>{expect(isPublicCode("HS-4K9ZT")).toBe(true);expect(isPublicCode("HS-ABCIO")).toBe(false)});it("monta slug",()=>{expect(buildProductSlug("Caneca Térmica","HS-4K9ZT")).toBe("caneca-termica-hs-4k9zt")})});
