import type { Metadata } from "next";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/server/queries/public";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produto não encontrado" };
  return { title: product.name, description: product.short_description ?? product.description ?? undefined, openGraph: { title: product.name, description: product.short_description ?? undefined, images: product.cover_url ? [product.cover_url] : [] } };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const jsonLd = { "@context": "https://schema.org", "@type": "Product", name: product.name, description: product.short_description ?? product.description, image: product.cover_url ? [product.cover_url] : undefined, offers: { "@type": "Offer", url: `/go/${product.public_code}`, availability: "https://schema.org/InStock" } };
  return <section className="section"><div className="container product-detail"><div className="product-detail-media">{product.cover_url ? <img src={product.cover_url} alt={product.name}/> : <div className="image-placeholder">H&amp;S</div>}</div><div><span className="eyebrow">{product.category?.name ?? "Achadinho"}</span><h1>{product.name}</h1>{product.price_text ? <p className="price">{product.price_text}</p> : null}<p>{product.description || product.short_description}</p><p className="disclosure">Ao clicar, você será direcionado para uma plataforma externa. O preço e a disponibilidade podem mudar.</p><div className="hero-actions"><Link href={`/go/${product.public_code}`} className="button primary" rel="nofollow sponsored">Ver oferta <ExternalLink size={18}/></Link><Link href="/produtos" className="button secondary">Voltar ao catálogo</Link></div><p className="muted">Código: {product.public_code}</p></div><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}/></div></section>;
}
