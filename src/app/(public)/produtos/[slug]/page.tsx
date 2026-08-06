import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowUpRight, CheckCircle2, ExternalLink, ShieldCheck, Tag } from "lucide-react";
import { notFound } from "next/navigation";
import { getProductBySlug } from "@/server/queries/public";

export const dynamic = "force-dynamic";
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produto não encontrado" };
  return {
    title: product.name,
    description: product.short_description ?? product.description ?? undefined,
    openGraph: { title: product.name, description: product.short_description ?? undefined, images: product.cover_url ? [product.cover_url] : [] },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short_description ?? product.description,
    image: product.cover_url ? [product.cover_url] : undefined,
    offers: { "@type": "Offer", url: `/go/${product.public_code}`, availability: "https://schema.org/InStock" },
  };

  return (
    <>
      <section className="product-breadcrumb"><div className="container"><Link href="/produtos"><ArrowLeft size={16}/> Voltar ao catálogo</Link><span>/</span><span>{product.category?.name ?? "Achadinho"}</span></div></section>
      <section className="section product-page-section">
        <div className="container product-detail">
          <div className="product-detail-media">{product.cover_url ? <img src={product.cover_url} alt={product.name}/> : <div className="image-placeholder"><span>H&amp;S</span><small>Imagem em breve</small></div>}</div>
          <div className="product-detail-copy">
            <div className="product-meta-row"><span className="product-category"><Tag size={13}/>{product.category?.name ?? "Achadinho"}</span>{product.affiliate_network ? <span className="partner-chip">Disponível em {product.affiliate_network}</span> : null}</div>
            <h1>{product.name}</h1>
            {product.short_description ? <p className="product-lead">{product.short_description}</p> : null}
            {product.price_text ? <div className="detail-price"><small>Valor informado</small><strong>{product.price_text}</strong></div> : null}
            <div className="detail-benefits"><span><CheckCircle2 size={17}/> Link direto para a oferta</span><span><ShieldCheck size={17}/> Compra finalizada na loja parceira</span></div>
            <Link href={`/go/${product.public_code}`} className="button primary detail-buy-button" rel="nofollow sponsored">Ver oferta na loja <ArrowUpRight size={19}/></Link>
            <div className="disclosure"><ShieldCheck size={18}/><p>Ao continuar, você será direcionado para uma plataforma externa. Preço, estoque, pagamento e entrega são definidos pela loja parceira e podem mudar.</p></div>
            {product.description ? <div className="product-description-full"><h2>Sobre este achadinho</h2><p>{product.description}</p></div> : null}
            <div className="detail-code"><ExternalLink size={15}/> Código interno: {product.public_code}</div>
          </div>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}/>
        </div>
      </section>
    </>
  );
}
