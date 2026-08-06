import { CheckCircle2, Clock3, FileWarning } from "lucide-react";
import { ImportWorkbench } from "@/components/studio/import-workbench";
import { listImportJobs, listStudioCategories } from "@/server/queries/studio";
import { requireRole } from "@/server/auth";

type Props = {
  searchParams: Promise<{
    erro?: string;
    importados?: string;
    duplicados?: string;
    categorias?: string;
    invalidos?: string;
    semCategoria?: string;
    categorizados?: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function ImportPage({ searchParams }: Props) {
  await requireRole(["owner", "admin", "editor"]);
  const [sp, jobs, categories] = await Promise.all([searchParams, listImportJobs().catch(() => []), listStudioCategories()]);
  const imported = Number(sp.importados ?? 0);
  const hasReport = Object.values(sp).some(Boolean) && !sp.erro;

  return (
    <>
      <div className="studio-page-header">
        <div>
          <span className="section-kicker">Catálogo</span>
          <h1>Importação em massa</h1>
          <p>Cadastre dezenas de achadinhos de uma vez usando o formato de texto que você já utiliza.</p>
        </div>
      </div>

      {sp.erro ? <div className="message error"><FileWarning size={18}/><span>{sp.erro}</span></div> : null}
      {hasReport ? (
        <section className="import-report success-card">
          <div><CheckCircle2 size={24}/><strong>Importação concluída</strong><span>{imported} produto{imported === 1 ? "" : "s"} cadastrado{imported === 1 ? "" : "s"}.</span></div>
          <dl>
            <div><dt>Importados</dt><dd>{sp.importados ?? 0}</dd></div>
            <div><dt>Duplicados ignorados</dt><dd>{sp.duplicados ?? 0}</dd></div>
            <div><dt>Categorizados automaticamente</dt><dd>{sp.categorizados ?? 0}</dd></div>
            <div><dt>Categorias principais criadas</dt><dd>{sp.categorias ?? 0}</dd></div>
            <div><dt>Itens inválidos</dt><dd>{sp.invalidos ?? 0}</dd></div>
            <div><dt>Sem categoria correspondente</dt><dd>{sp.semCategoria ?? 0}</dd></div>
          </dl>
        </section>
      ) : null}

      <ImportWorkbench categories={categories.map(({ id, name, active }) => ({ id, name, active }))} />

      <section className="panel section-panel">
        <div className="panel-heading compact">
          <div><span className="section-kicker">Histórico</span><h2>Importações recentes</h2></div>
        </div>
        {jobs.length ? (
          <div className="table-wrap flat">
            <table className="data-table">
              <thead><tr><th>Data</th><th>Origem</th><th>Itens</th><th>Status</th><th>Detalhes</th></tr></thead>
              <tbody>{jobs.map((job) => (
                <tr key={job.id}>
                  <td>{new Date(job.created_at).toLocaleString("pt-BR")}</td>
                  <td>{job.source.startsWith("texto_estruturado") ? "Lista estruturada inteligente" : job.source}</td>
                  <td>{job.item_count}</td>
                  <td><span className={`status-pill ${job.status}`}>{job.status === "completed" ? <CheckCircle2 size={13}/> : <Clock3 size={13}/>} {job.status}</span></td>
                  <td className="muted">{job.error_message || "—"}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : <div className="empty-inline">Nenhuma importação realizada ainda.</div>}
      </section>
    </>
  );
}
