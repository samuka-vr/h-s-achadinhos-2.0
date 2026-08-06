import Link from "next/link";
import { BarChart3, CalendarDays, Eye, MousePointerClick, TrendingUp, Users } from "lucide-react";
import { AnalyticsChart } from "@/components/studio/analytics-chart";
import { getAnalytics } from "@/server/queries/studio";

export const dynamic = "force-dynamic";
type Props = { searchParams: Promise<{ dias?: string }> };

export default async function AnalyticsPage({ searchParams }: Props) {
  const { dias } = await searchParams;
  const days = [7, 30, 90].includes(Number(dias)) ? Number(dias) : 30;
  const data = await getAnalytics(days).catch(() => ({ sessions: 0, page_views: 0, outbound_clicks: 0, top_products: [], daily: [] }));
  const ctr = data.page_views ? Math.round((data.outbound_clicks / data.page_views) * 100) : 0;
  const viewsPerSession = data.sessions ? (data.page_views / data.sessions).toFixed(1) : "0";

  return (
    <>
      <div className="studio-page-header"><div><span className="section-kicker">Desempenho</span><h1>Analytics</h1><p>Entenda como os visitantes navegam e quais achadinhos recebem mais atenção.</p></div><div className="period-tabs"><CalendarDays size={17}/>{[7,30,90].map((value) => <Link key={value} href={`/studio/analytics?dias=${value}`} className={days === value ? "active" : ""}>{value} dias</Link>)}</div></div>

      <section className="studio-stat-grid">
        <article className="studio-stat-card indigo"><span className="stat-icon"><Users size={20}/></span><div><small>Sessões</small><strong>{data.sessions.toLocaleString("pt-BR")}</strong><em>Nos últimos {days} dias</em></div></article>
        <article className="studio-stat-card violet"><span className="stat-icon"><Eye size={20}/></span><div><small>Visualizações</small><strong>{data.page_views.toLocaleString("pt-BR")}</strong><em>{viewsPerSession} por sessão</em></div></article>
        <article className="studio-stat-card emerald"><span className="stat-icon"><MousePointerClick size={20}/></span><div><small>Cliques externos</small><strong>{data.outbound_clicks.toLocaleString("pt-BR")}</strong><em>Saídas para lojas parceiras</em></div></article>
        <article className="studio-stat-card amber"><span className="stat-icon"><TrendingUp size={20}/></span><div><small>Taxa de clique</small><strong>{ctr}%</strong><em>Cliques ÷ visualizações</em></div></article>
      </section>

      <section className="analytics-grid">
        <div className="panel analytics-chart-panel"><div className="panel-heading compact"><div><span className="section-kicker">Evolução diária</span><h2>Visualizações e cliques</h2></div><BarChart3 size={22}/></div><AnalyticsChart data={data.daily}/></div>
        <aside className="panel analytics-insight-card"><span className="section-kicker">Leitura rápida</span><h2>{data.outbound_clicks ? "Seu catálogo já está gerando interesse" : "Aguardando os primeiros dados"}</h2><p>{data.outbound_clicks ? `A cada 100 visualizações, aproximadamente ${ctr} resultam em um clique para uma loja parceira.` : "Quando os visitantes começarem a navegar e clicar nas ofertas, os indicadores aparecerão aqui."}</p><Link href="/studio/produtos" className="button secondary wide">Otimizar catálogo</Link></aside>
      </section>

      <section className="panel section-panel">
        <div className="panel-heading compact"><div><span className="section-kicker">Ranking</span><h2>Produtos mais clicados</h2></div></div>
        <div className="table-wrap flat"><table className="data-table"><thead><tr><th>Posição</th><th>Produto</th><th>Código</th><th>Cliques</th><th>Participação</th></tr></thead><tbody>{data.top_products.map((product, index) => {
          const share = data.outbound_clicks ? Math.round((product.clicks / data.outbound_clicks) * 100) : 0;
          return <tr key={product.public_code}><td><span className="rank-badge">{index + 1}</span></td><td><strong>{product.name}</strong></td><td>{product.public_code}</td><td><strong>{product.clicks}</strong></td><td><div className="progress-cell"><span style={{ width: `${Math.min(share, 100)}%` }}/><em>{share}%</em></div></td></tr>;
        })}</tbody></table>{!data.top_products.length ? <div className="empty-table"><BarChart3 size={28}/><strong>Nenhum clique registrado</strong><span>Os produtos mais acessados aparecerão neste ranking.</span></div> : null}</div>
      </section>
    </>
  );
}
