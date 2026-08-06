import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/site/product-card";
import { EmptyState } from "@/components/site/empty-state";
import { getCategoryBySlug, getProductsByCategory } from "@/server/queries/public";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();
  const products = await getProductsByCategory(category.id);
  return (
    <>
      <section className="catalog-hero"><div className="container"><Link href="/categorias" className="back-link"><ArrowLeft size={16}/> Todas as categorias</Link><span className="section-kicker">Categoria</span><h1>{category.name}</h1><p>{category.description || "Confira os achadinhos selecionados desta categoria."}</p></div></section>
      <section className="section"><div className="container"><div className="category-result-head"><strong>{products.length} produto{products.length === 1 ? "" : "s"}</strong><span>Produtos publicados nesta categoria</span></div>{products.length ? <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product}/>)}</div> : <EmptyState title="Nenhum produto nesta categoria" text="Novos achadinhos serão adicionados em breve."/>}</div></section>
    </>
  );
}
