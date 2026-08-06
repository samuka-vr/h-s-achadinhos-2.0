import { ProductCard } from "@/components/site/product-card";
import { EmptyState } from "@/components/site/empty-state";
import { getLatestProducts } from "@/server/queries/public";

export const metadata = { title: "Achadinhos" };
export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await getLatestProducts(100);
  return <><section className="page-hero"><div className="container"><span className="eyebrow">Catálogo</span><h1>Todos os achadinhos</h1><p className="muted">Produtos selecionados para facilitar sua descoberta.</p></div></section><section className="section"><div className="container">{products.length ? <div className="product-grid">{products.map((p)=><ProductCard key={p.id} product={p}/>)}</div> : <EmptyState title="Nenhum produto publicado" text="O catálogo está sendo preparado."/>}</div></section></>;
}
