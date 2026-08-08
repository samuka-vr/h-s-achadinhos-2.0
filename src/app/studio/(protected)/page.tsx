import Link from "next/link";
import { ArrowRight, BarChart3, Boxes, Eye, MousePointerClick, PackageCheck, Plus, SearchX, Sparkles, Tag, Upload } from "lucide-react";
import { getAnalytics, getStudioSettings, listStudioCategories, listStudioProducts } from "@/server/queries/studio";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [products, categories, analytics, settings] = await Promise.all([
    listStudioProducts(),
    listStudioCategories(),
    getAnalytics(30).catch(() => ({ sessions: 0, page_views: 0, outbound_clicks: 0, top_products: [], daily: [] })),
    getStudioSettings(),
  ]);

  const published = products.filter((product) => product.status === "published").length;
  const drafts = products.filter((product) => product.status === "draft").length;
  const featured = products.filter((product) => product.featured).length;
  const clickRate = analytics.page_views ? Math.round((analytics.outbound_clicks / analytics.page_views) * 100) : 0;
  const recent = products.slice(0, 6);

  return (
    <>
      <div className="studio-page-header dashboard-header">
        <div>
          <span className="section-kicker">Painel de controle</span>
          <h1>Visão geral</h1>
          <p>Acompanhe o catálogo, o desempenho e as tarefas mais importantes do {settings.brand_name}.</p>
        </div>
        <div className="header-actions">
          <Link href="/studio/importacao" className="button secondary"><Upload size={18}/> Importar lista</Link>
          <Link href="/studio/produtos/novo" className="button primary"><Plus size={18}/> Novo produto</Link>
        </div>
      </div>

      <section className="studio-stat-grid">
        <article className="studio-stat-card indigo"><span className="stat-icon"><Eye size={20}/></span><div><small>Visitas · 30 dias</small><strong>{analytics.sessions.toLocaleString("pt-BR")}</strong><em>{analytics.page_views.toLocaleString("pt-BR")} visualizações</em></div></article>
        <article className="studio-stat-card violet"><span className="stat-icon"><MousePointerClick size={20}/></span><div><small>Cliques em ofertas</small><strong>{analytics.outbound_clicks.toLocaleString("pt-BR")}</strong><em>{clickRate}% de taxa de clique</em></div></article>
        <article className="studio-stat-card emerald"><span className="stat-icon"><PackageCheck size={20}/></span><div><small>Produtos publicados</small><strong>{published}</strong><em>{drafts} rascunho{drafts === 1 ? "" : "s"}</em></div></article>
        <article className="studio-stat-card amber"><span className="stat-icon"><Tag size={20}/></span><div><small>Categorias ativas</small><strong>{categories.filter((category) => category.active).length}</strong><em>{featured} produto{featured === 1 ? "" : "s"} em destaque</em></div></article>
      </section>

      <section className="dashboard-grid">
        <div className="panel dashboard-products-panel">
          <div className="panel-heading compact"><div><span className="section-kicker">Catálogo</span><h2>Produtos recentes</h2></div><Link href="/studio/produtos" className="text-link">Ver todos <ArrowRight size={15}/></Link></div>
          {recent.length ? (
            <div className="dashboard-product-list">
              {recent.map((product) => (
                <Link key={product.id} href={`/studio/produtos/${product.id}/editar`} className="dashboard-product-row">
                  <div className="mini-product-image">{product.cover_url ? <img src={product.cover_url} alt=""/> : settings.logo_url ? <img src={settings.logo_url} alt=""/> : <span>H&amp;S</span>}</div>
                  <div className="grow"><strong>{product.name}</strong><span>{product.category?.name ?? "Sem categoria"}</span></div>
                  <span className={`status-pill ${product.status}`}>{product.status === "published" ? "Publicado" : product.status === "draft" ? "Rascunho" : "Arquivado"}</span>
                  <ArrowRight size={16}/>
                </Link>
              ))}
            </div>
          ) : <div className="empty-inline"><Boxes size={24}/><span>Nenhum produto cadastrado.</span></div>}
        </div>

        <aside className="dashboard-side-stack">
          <section className="panel quick-actions-card">
            <div className="panel-heading compact"><div><span className="section-kicker">Atalhos</span><h2>Ações rápidas</h2></div></div>
            <div className="quick-actions-list">
              <Link href="/studio/produtos/novo"><span><Plus size={18}/></span><div><strong>Novo produto</strong><small>Cadastre manualmente</small></div><ArrowRight size={16}/></Link>
              <Link href="/studio/importacao"><span><Upload size={18}/></span><div><strong>Importar produtos</strong><small>Cole uma lista completa</small></div><ArrowRight size={16}/></Link>
              <Link href="/studio/banners"><span><Sparkles size={18}/></span><div><strong>Criar banner</strong><small>Destaque uma campanha</small></div><ArrowRight size={16}/></Link>
              <Link href="/studio/analytics"><span><BarChart3 size={18}/></span><div><strong>Ver analytics</strong><small>Analise os resultados</small></div><ArrowRight size={16}/></Link>
            </div>
          </section>

          <section className="panel health-card">
            <span className="health-icon"><SearchX size={22}/></span>
            <div><span className="section-kicker">Saúde do catálogo</span><h2>{drafts ? `${drafts} item(ns) aguardando revisão` : "Tudo em dia"}</h2><p>{drafts ? "Revise os rascunhos e publique os produtos que já estão prontos." : "Não há rascunhos pendentes neste momento."}</p></div>
            <Link href="/studio/produtos?status=draft" className="button secondary wide">Revisar catálogo</Link>
          </section>
        </aside>
      </section>

      <section className="panel section-panel">
        <div className="panel-heading compact"><div><span className="section-kicker">Desempenho</span><h2>Produtos mais clicados</h2></div><Link href="/studio/analytics" className="text-link">Abrir relatório <ArrowRight size={15}/></Link></div>
        {analytics.top_products.length ? <div className="top-products-grid">{analytics.top_products.slice(0, 5).map((item, index) => <article key={item.public_code}><span>{index + 1}</span><div><strong>{item.name}</strong><small>{item.public_code}</small></div><em>{item.clicks} cliques</em></article>)}</div> : <div className="empty-inline">Os produtos mais clicados aparecerão aqui quando houver dados.</div>}
      </section>
    </>
  );
}
