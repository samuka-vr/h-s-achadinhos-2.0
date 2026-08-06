import Link from "next/link";
import { ArrowUpRight, Heart, Sparkles } from "lucide-react";
import type { Product } from "@/types/domain";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <Link href={`/produtos/${product.slug}`} className="product-image-wrap" aria-label={`Ver detalhes de ${product.name}`}>
        {product.cover_url ? <img src={product.cover_url} alt={product.name} className="product-image" loading="lazy" /> : <div className="image-placeholder"><span>H&amp;S</span><small>Imagem em breve</small></div>}
        {product.featured ? <span className="product-badge"><Sparkles size={12}/> Destaque</span> : null}
        <span className="product-heart" aria-hidden="true"><Heart size={17}/></span>
      </Link>
      <div className="product-body">
        {product.category ? <Link href={`/categorias/${product.category.slug}`} className="product-category">{product.category.name}</Link> : <span className="product-category">Achadinho</span>}
        <h3><Link href={`/produtos/${product.slug}`}>{product.name}</Link></h3>
        {product.short_description ? <p className="product-description">{product.short_description}</p> : null}
        <div className="product-price">{product.price_text || "Confira o valor"}</div>
        <div className="product-actions">
          <Link href={`/produtos/${product.slug}`} className="product-detail-link">Detalhes</Link>
          <Link href={`/go/${product.public_code}`} className="store-button" rel="nofollow sponsored">Ver na loja <ArrowUpRight size={15}/></Link>
        </div>
      </div>
    </article>
  );
}
