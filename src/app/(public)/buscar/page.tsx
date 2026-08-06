import { ProductCard } from "@/components/site/product-card";
import { EmptyState } from "@/components/site/empty-state";
import { searchProducts } from "@/server/queries/public";

type Props={searchParams:Promise<{q?:string}>};
export const metadata={title:"Buscar"};export const dynamic="force-dynamic";
export default async function SearchPage({searchParams}:Props){const {q=""}=await searchParams;const products=q?await searchProducts(q):[];return <><section className="page-hero"><div className="container"><span className="eyebrow">Busca</span><h1>Encontre um achadinho</h1><form className="search-form"><input name="q" defaultValue={q} placeholder="Ex.: mini seladora" aria-label="Termo de busca"/><button className="button primary">Buscar</button></form></div></section><section className="section"><div className="container">{q?(products.length?<div className="product-grid">{products.map(p=><ProductCard key={p.id} product={p}/>)}</div>:<EmptyState title="Nada encontrado" text="Tente outro nome, categoria ou palavra-chave."/>):<EmptyState title="Digite o que procura" text="A busca considera nome, descrição e categoria."/>}</div></section></>}
