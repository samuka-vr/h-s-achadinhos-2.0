import { notFound } from "next/navigation";
import { ProductCard } from "@/components/site/product-card";
import { EmptyState } from "@/components/site/empty-state";
import { getCategoryBySlug, getProductsByCategory } from "@/server/queries/public";

type Props={params:Promise<{slug:string}>};
export const dynamic="force-dynamic";
export default async function CategoryPage({params}:Props){const {slug}=await params;const category=await getCategoryBySlug(slug);if(!category)notFound();const products=await getProductsByCategory(category.id);return <><section className="page-hero"><div className="container"><span className="eyebrow">Categoria</span><h1>{category.name}</h1><p className="muted">{category.description}</p></div></section><section className="section"><div className="container">{products.length?<div className="product-grid">{products.map(p=><ProductCard key={p.id} product={p}/>)}</div>:<EmptyState title="Nenhum produto nesta categoria" text="Novos achadinhos serão adicionados em breve."/>}</div></section></>}
