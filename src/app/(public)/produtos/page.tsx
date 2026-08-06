import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/site/product-card";
import { EmptyState } from "@/components/site/empty-state";
import { getCategories, getLatestProducts } from "@/server/queries/public";

export const metadata = { title: "Achadinhos" };
export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ categoria?: string }> };

export default async function ProductsPage({ searchParams }: Props) {
  const [{ categoria = "" }, products, categories] = await Promise.all([searchParams, getLatestProducts(200), getCategories()]);
  const filtered = categoria ? products.filter((product) => product.category?.slug === categoria) : products;

  return (
    <>
      <section className="catalog-hero">
        <div className="container catalog-hero-inner">
          <div><span className="section-kicker">Catálogo completo</span><h1>Achadinhos para facilitar seu dia</h1><p>Produtos selecionados em diversas categorias, reunidos em um só lugar.</p></div>
          <form action="/buscar" className="catalog-search"><Search size={19}/><input name="q" placeholder="Pesquisar no catálogo"/><button>Buscar</button></form>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div className="catalog-toolbar">
            <div className="category-filter-row">
              <Link href="/produtos" className={!categoria ? "active" : ""}>Todos</Link>
              {categories.map((category) => <Link key={category.id} href={`/produtos?categoria=${category.slug}`} className={categoria === category.slug ? "active" : ""}>{category.name}</Link>)}
            </div>
            <span className="result-count"><SlidersHorizontal size={16}/>{filtered.length} produto{filtered.length === 1 ? "" : "s"}</span>
          </div>
          {filtered.length ? <div className="product-grid">{filtered.map((product) => <ProductCard key={product.id} product={product}/>)}</div> : <EmptyState title="Nenhum produto nesta categoria" text="Escolha outra categoria ou volte em breve."/>}
        </div>
      </section>
    </>
  );
}
