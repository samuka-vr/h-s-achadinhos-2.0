import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { Product } from "@/types/domain";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <Link href={`/produtos/${product.slug}`} className="product-image-wrap">
        {product.cover_url ? <img src={product.cover_url} alt={product.name} className="product-image" loading="lazy" /> : <div className="image-placeholder">H&amp;S</div>}
      </Link>
      <div className="product-body">
        {product.category ? <Link href={`/categorias/${product.category.slug}`} className="eyebrow">{product.category.name}</Link> : null}
        <h3><Link href={`/produtos/${product.slug}`}>{product.name}</Link></h3>
        {product.short_description ? <p>{product.short_description}</p> : null}
        <div className="product-footer"><strong>{product.price_text || "Confira o valor"}</strong><Link href={`/go/${product.public_code}`} className="mini-cta" rel="nofollow sponsored">Ver oferta <ExternalLink size={15} /></Link></div>
      </div>
    </article>
  );
}
