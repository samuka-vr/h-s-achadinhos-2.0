import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/site/product-card";
import { EmptyState } from "@/components/site/empty-state";
import { getCategories, getFeaturedProducts, getLatestProducts, getSiteSettings } from "@/server/queries/public";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, categories, featured, latest] = await Promise.all([getSiteSettings(), getCategories(), getFeaturedProducts(8), getLatestProducts(8)]);
  return <>
    <section className="hero"><div className="container hero-grid"><div className="hero-main"><span className="eyebrow"><Sparkles size={14}/> Curadoria H&amp;S</span><h1>{settings.tagline}</h1><p>{settings.description}</p><div className="hero-actions"><Link href="/produtos" className="button primary">Ver achadinhos <ArrowRight size={18}/></Link><Link href="/buscar" className="button secondary">Buscar produto</Link></div></div><aside className="hero-side"><span className="eyebrow">Como funciona</span><h2>Você encontra. A plataforma parceira vende.</h2><p className="muted">Não há checkout aqui. Ao abrir uma oferta, você é direcionado para o produto na loja parceira.</p></aside></div></section>
    <section className="section"><div className="container"><div className="section-head"><div><span className="eyebrow">Explore</span><h2>Categorias</h2></div><Link href="/categorias">Ver todas</Link></div><div className="category-grid">{categories.map((category)=><Link key={category.id} href={`/categorias/${category.slug}`} className="category-card"><strong>{category.name}</strong><p className="muted">{category.description || "Confira os achadinhos desta categoria."}</p></Link>)}</div></div></section>
    <section className="section"><div className="container"><div className="section-head"><div><span className="eyebrow">Seleção</span><h2>Destaques</h2></div></div>{featured.length ? <div className="product-grid">{featured.map((product)=><ProductCard key={product.id} product={product}/>)}</div> : <EmptyState title="Nenhum destaque publicado" text="Os produtos aparecerão aqui após serem publicados pelo H&S Studio."/>}</div></section>
    <section className="section"><div className="container"><div className="section-head"><div><span className="eyebrow">Novidades</span><h2>Últimos achadinhos</h2></div><Link href="/produtos">Ver catálogo</Link></div>{latest.length ? <div className="product-grid">{latest.map((product)=><ProductCard key={product.id} product={product}/>)}</div> : <EmptyState title="Catálogo vazio" text="Adicione o primeiro produto pelo painel administrativo."/>}</div></section>
  </>;
}
