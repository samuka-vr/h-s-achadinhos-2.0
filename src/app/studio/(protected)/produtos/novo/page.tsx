import { ProductForm } from "@/components/studio/product-form";
import { listStudioCategories } from "@/server/queries/studio";
import { requireRole } from "@/server/auth";

type Props = { searchParams: Promise<{ erro?: string }> };
export default async function NewProduct({ searchParams }: Props) {
  await requireRole(["owner", "admin", "editor"]);
  const [categories, { erro }] = await Promise.all([listStudioCategories(), searchParams]);
  return <><div className="studio-page-header"><div><span className="section-kicker">Catálogo</span><h1>Novo produto</h1><p>Cadastre um achadinho manualmente e escolha como ele aparecerá no site.</p></div></div><ProductForm categories={categories} error={erro}/></>;
}
