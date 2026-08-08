import Link from "next/link";
import { ArrowRight, Search, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { ProductCard } from "@/components/site/product-card";
import { CategoryIcon } from "@/components/site/category-icon";
import { EmptyState } from "@/components/site/empty-state";
import { getActiveBanners, getCategories, getFeaturedProducts, getLatestProducts, getSiteSettings } from "@/server/queries/public";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [settings, categories, featured, latest, banners] = await Promise.all([
    getSiteSettings(),
    getCategories(),
    getFeaturedProducts(8),
    getLatestProducts(12),
    getActiveBanners(),
  ]);

  const heroTitle = typeof settings.homepage.hero_title === "string" ? settings.homepage.hero_title : settings.tagline;
  const heroSubtitle = typeof settings.homepage.hero_subtitle === "string" ? settings.homepage.hero_subtitle : settings.description;
  const heroCta = typeof settings.homepage.hero_cta === "string" ? settings.homepage.hero_cta : "Ver ofertas do dia";
  const showCategories = settings.homepage.show_categories !== false;
  const showFeatured = settings.homepage.show_featured !== false;
  const showLatest = settings.homepage.show_latest !== false;
  const mainBanner = banners[0];

  return (
    <>
      <section className="hero-new">
        <div className="container hero-new-grid">
          <div className="hero-copy">
            <span className="hero-pill"><Sparkles size={15}/> Curadoria feita para você</span>
            <h1>{heroTitle}</h1>
            <p>{heroSubtitle}</p>
            <form action="/buscar" className="hero-search">
              <Search size={20}/>
              <input name="q" placeholder="Busque por produto, categoria ou ideia..." aria-label="Buscar achadinho"/>
              <button type="submit">Buscar</button>
            </form>
            <div className="hero-links">
              <Link href="/produtos" className="button light">{heroCta} <ArrowRight size={18}/></Link>
              <span><ShieldCheck size={17}/> Links verificados e compra na loja parceira</span>
            </div>
          </div>

          <aside className="hero-promo">
            {mainBanner ? (
              <a href={mainBanner.target_url || "/produtos"} className="hero-banner-card">
                <img src={mainBanner.image_url} alt={mainBanner.title}/>
                <div className="hero-banner-overlay">
                  <span>Seleção especial</span>
                  <strong>{mainBanner.title}</strong>
                  {mainBanner.subtitle ? <p>{mainBanner.subtitle}</p> : null}
                  <em>Conferir agora <ArrowRight size={16}/></em>
                </div>
              </a>
            ) : (
              <div className="hero-trust-card">
                <div className="trust-icon"><TrendingUp size={28}/></div>
                <span>Achados selecionados</span>
                <strong>Produtos que estão chamando atenção nas redes</strong>
                <p>Você descobre aqui e finaliza sua compra diretamente na plataforma parceira.</p>
                <Link href="/produtos">Explorar catálogo <ArrowRight size={16}/></Link>
              </div>
            )}
          </aside>
        </div>
      </section>

      {showCategories ? (
        <section className="section category-section">
          <div className="container">
            <div className="section-head modern">
              <div><span className="section-kicker">Explore do seu jeito</span><h2>Categorias populares</h2><p>Encontre rapidamente o tipo de achadinho que você procura.</p></div>
              <Link href="/categorias" className="text-link">Ver todas <ArrowRight size={16}/></Link>
            </div>
            <div className="category-scroll">
              {categories.slice(0, 10).map((category) => (
                <Link key={category.id} href={`/categorias/${category.slug}`} className="category-chip-card">
                  <span className="category-icon"><CategoryIcon name={category.name}/></span>
                  <strong>{category.name}</strong>
                  <small>{category.description || "Ver produtos"}</small>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {showFeatured ? (
        <section className="section surface-section">
          <div className="container">
            <div className="section-head modern">
              <div><span className="section-kicker"><TrendingUp size={15}/> Em alta</span><h2>Achadinhos que merecem destaque</h2><p>Uma seleção especial para você conferir primeiro.</p></div>
            </div>
            {featured.length ? <div className="product-grid">{featured.map((product) => <ProductCard key={product.id} product={product}/>)}</div> : <EmptyState title="Os destaques estão sendo preparados" text="Confira os produtos mais recentes enquanto isso."/>}
          </div>
        </section>
      ) : null}

      {banners.length > 1 ? (
        <section className="section compact-section">
          <div className="container promo-strip-grid">
            {banners.slice(1, 3).map((banner) => (
              <a key={banner.id} href={banner.target_url || "/produtos"} className="promo-strip">
                <img src={banner.image_url} alt={banner.title}/>
                <div><span>Oferta selecionada</span><strong>{banner.title}</strong><p>{banner.subtitle}</p></div>
                <ArrowRight size={22}/>
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {showLatest ? (
        <section className="section">
          <div className="container">
            <div className="section-head modern">
              <div><span className="section-kicker">Acabaram de chegar</span><h2>Últimos achadinhos</h2><p>Novidades adicionadas recentemente ao catálogo.</p></div>
              <Link href="/produtos" className="text-link">Ver catálogo completo <ArrowRight size={16}/></Link>
            </div>
            {latest.length ? <div className="product-grid">{latest.map((product) => <ProductCard key={product.id} product={product}/>)}</div> : <EmptyState title="Catálogo em preparação" text="Novos achadinhos aparecerão aqui em breve."/>}
          </div>
        </section>
      ) : null}

      <section className="affiliate-band">
        <div className="container affiliate-band-inner">
          <ShieldCheck size={26}/>
          <div><strong>Compra segura na plataforma parceira</strong><p>{settings.brand_name} não realiza pagamentos. Você será redirecionado à loja para conferir preço, disponibilidade e finalizar a compra.</p></div>
        </div>
      </section>
    </>
  );
}
