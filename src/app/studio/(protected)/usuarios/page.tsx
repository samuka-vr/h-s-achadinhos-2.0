import { MailPlus, ShieldCheck, Users } from "lucide-react";
import { inviteUserAction } from "@/server/actions/user-actions";
import { UserAdminList } from "@/components/studio/user-admin-list";
import { CustomSelect, type CustomSelectOption } from "@/components/ui/custom-select";
import { listUsers } from "@/server/queries/studio";
import { requireRole } from "@/server/auth";

const inviteRoleOptions: CustomSelectOption[] = [
  { value: "analyst", label: "Analista", description: "Visualiza o painel e as métricas" },
  { value: "editor", label: "Editor", description: "Gerencia produtos, categorias e banners" },
  { value: "admin", label: "Administrador", description: "Acesso completo, exceto equipe" },
];

type Props = { searchParams: Promise<{ erro?: string; sucesso?: string; quantidade?: string }> };
export const dynamic = "force-dynamic";

export default async function UsersPage({ searchParams }: Props) {
  const viewer = await requireRole(["owner"]);
  const [users, sp] = await Promise.all([listUsers(), searchParams]);
  const administrators = users.filter((user) => user.role === "owner" || user.role === "admin").length;

  return (
    <>
      <div className="studio-page-header">
        <div>
          <span className="section-kicker">Acesso ao painel</span>
          <h1>Equipe e permissões</h1>
          <p>Convide pessoas e ajuste o que cada uma pode ver ou editar.</p>
        </div>
      </div>
      {sp.erro ? <div className="message error">{sp.erro}</div> : null}
      {sp.sucesso === "lote" ? <div className="message success">Acesso atualizado para {sp.quantidade ?? "os"} integrante(s).</div> : null}

      <section className="access-summary">
        <div><Users size={20} /><strong>{users.length}</strong><span>integrantes</span></div>
        <div><ShieldCheck size={20} /><strong>{administrators}</strong><span>com acesso administrativo</span></div>
        <p>Sua própria conta fica protegida contra alterações em massa.</p>
      </section>

      <section className="users-manager-grid refined-manager-grid">
        <form action={inviteUserAction} className="panel form-section sticky-create-card">
          <div className="form-section-heading"><span><MailPlus size={18} /></span><div><h2>Convidar integrante</h2><p>O convite será enviado por e-mail.</p></div></div>
          <label>E-mail<input name="email" type="email" required placeholder="pessoa@exemplo.com" /></label>
          <label>
            Nível de acesso
            <CustomSelect name="role" defaultValue="analyst" options={inviteRoleOptions} ariaLabel="Nível de acesso do novo integrante" />
          </label>
          <button className="button primary wide"><MailPlus size={17} /> Enviar convite</button>
        </form>

        <div className="panel users-list-panel refined-list-panel">
          <div className="panel-heading compact"><div><span className="section-kicker">Pessoas com acesso</span><h2>Equipe atual</h2><p>Selecione vários integrantes para alterar o nível de acesso de uma vez.</p></div></div>
          <UserAdminList users={users} currentUserId={viewer.user.id} />
        </div>
      </section>
    </>
  );
}
