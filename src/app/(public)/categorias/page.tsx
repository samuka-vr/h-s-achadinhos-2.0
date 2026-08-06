import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CategoryIcon } from "@/components/site/category-icon";
import { getCategories } from "@/server/queries/public";

export const metadata = { title: "Categorias" };
export const dynamic = "force-dynamic";

export default async function CategoriesPage() {
  const categories = await getCategories();
  return (
    <>
      <section className="catalog-hero"><div className="container"><span className="section-kicker">Explore</span><h1>Categorias</h1><p>Escolha um tema e encontre os produtos certos mais rápido.</p></div></section>
      <section className="section"><div className="container category-page-grid">{categories.map((category) => (
        <Link key={category.id} href={`/categorias/${category.slug}`} className="category-page-card">
          <span className="category-icon large"><CategoryIcon name={category.name} size={28}/></span>
          <div><strong>{category.name}</strong><p>{category.description || "Confira os achadinhos desta categoria."}</p></div>
          <ArrowRight size={20}/>
        </Link>
      ))}</div></section>
    </>
  );
}
