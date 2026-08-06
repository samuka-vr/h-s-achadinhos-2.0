import { test, expect } from "@playwright/test";
test("home abre e possui marca",async({page})=>{await page.goto("/");await expect(page.getByText("H&S Achadinhos").first()).toBeVisible()});
test("login do Studio abre",async({page})=>{await page.goto("/studio/login");await expect(page.getByRole("heading",{name:"H&S Studio"})).toBeVisible()});
