import { notFound } from "next/navigation";
import { ProductForm } from "@/components/studio/product-form";
import { getStudioProduct, listStudioCategories } from "@/server/queries/studio";
import { requireRole } from "@/server/auth";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ erro?: string; duplicado?: string }> };
export default async function EditProduct({ params, searchParams }: Props) {
  await requireRole(["owner", "admin", "editor"]);
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [product, categories] = await Promise.all([getStudioProduct(id), listStudioCategories()]);
  if (!product) notFound();
  return <><div className="studio-page-header"><div><span className="section-kicker">Catálogo</span><h1>Editar produto</h1><p>{sp.duplicado ? "A cópia foi criada como rascunho. Revise os dados antes de publicar." : `Atualize as informações de ${product.name}.`}</p></div></div>{sp.duplicado ? <div className="message success"><SparklesMessage/></div> : null}<ProductForm product={product} categories={categories} error={sp.erro}/></>;
}

function SparklesMessage() {
  return <span>Produto duplicado com sucesso. Esta cópia ainda não está publicada.</span>;
}
