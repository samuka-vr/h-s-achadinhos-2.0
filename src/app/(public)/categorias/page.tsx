import Link from "next/link";
import { getCategories } from "@/server/queries/public";

export const metadata = { title: "Categorias" };
export const dynamic = "force-dynamic";
export default async function CategoriesPage(){const categories=await getCategories();return <><section className="page-hero"><div className="container"><span className="eyebrow">Explore</span><h1>Categorias</h1></div></section><section className="section"><div className="container category-grid">{categories.map(c=><Link key={c.id} href={`/categorias/${c.slug}`} className="category-card"><strong>{c.name}</strong><p className="muted">{c.description}</p></Link>)}</div></section></>}
