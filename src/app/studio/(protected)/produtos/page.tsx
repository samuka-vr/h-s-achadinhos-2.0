import Link from "next/link";
import { archiveProductAction } from "@/server/actions/product-actions";
import { listStudioProducts } from "@/server/queries/studio";

export const dynamic="force-dynamic";
export default async function StudioProducts(){const products=await listStudioProducts();return <><div className="studio-top"><div><span className="eyebrow">Catálogo</span><h1>Produtos</h1></div><Link href="/studio/produtos/novo" className="button primary">Novo produto</Link></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Produto</th><th>Código</th><th>Status</th><th>Categoria</th><th>Ações</th></tr></thead><tbody>{products.map(p=><tr key={p.id}><td><strong>{p.name}</strong></td><td>{p.public_code}</td><td><span className="status">{p.status}</span></td><td>{p.category?.name ?? "—"}</td><td><Link href={`/studio/produtos/${p.id}/editar`}>Editar</Link> · <form action={archiveProductAction} style={{display:"inline"}}><input type="hidden" name="id" value={p.id}/><button className="sidebar-link" style={{display:"inline",width:"auto",color:"var(--danger)"}}>Arquivar</button></form></td></tr>)}</tbody></table></div></>}
