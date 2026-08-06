import { Search } from "lucide-react";
import { ProductCard } from "@/components/site/product-card";
import { EmptyState } from "@/components/site/empty-state";
import { searchProducts } from "@/server/queries/public";

type Props = { searchParams: Promise<{ q?: string }> };
export const metadata = { title: "Buscar" };
export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }: Props) {
  const { q = "" } = await searchParams;
  const products = q ? await searchProducts(q) : [];
  return (
    <>
      <section className="search-page-hero">
        <div className="container search-page-inner">
          <span className="section-kicker">Busca inteligente</span>
          <h1>O que você está procurando?</h1>
          <p>Busque pelo nome, utilidade, categoria ou qualquer palavra relacionada ao produto.</p>
          <form className="big-search"><Search size={22}/><input name="q" defaultValue={q} placeholder="Ex.: luminária, cozinha, organização..." autoFocus/><button>Buscar</button></form>
        </div>
      </section>
      <section className="section"><div className="container">
        {q ? <div className="search-result-title"><div><span>Resultados para</span><h2>“{q}”</h2></div><strong>{products.length} encontrado{products.length === 1 ? "" : "s"}</strong></div> : null}
        {q ? (products.length ? <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product}/>)}</div> : <EmptyState title="Nada encontrado" text="Tente usar um nome mais curto, uma categoria ou outra palavra-chave."/>) : <EmptyState title="Digite o que procura" text="A busca considera nome, descrição e categoria."/>}
      </div></section>
    </>
  );
}
