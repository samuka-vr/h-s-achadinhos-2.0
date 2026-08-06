import { MailPlus, ShieldCheck, UserCog, Users } from "lucide-react";
import { inviteUserAction, setUserRoleAction } from "@/server/actions/user-actions";
import { listUsers } from "@/server/queries/studio";
import { requireRole } from "@/server/auth";

const roleLabel: Record<string, string> = { owner: "Proprietário", admin: "Administrador", editor: "Editor", analyst: "Analista" };
type Props = { searchParams: Promise<{ erro?: string }> };
export const dynamic = "force-dynamic";

export default async function UsersPage({ searchParams }: Props) {
  await requireRole(["owner"]);
  const [users, { erro }] = await Promise.all([listUsers(), searchParams]);
  return (
    <>
      <div className="studio-page-header"><div><span className="section-kicker">Segurança</span><h1>Equipe e acessos</h1><p>Convide pessoas e defina o nível de permissão de cada integrante.</p></div></div>
      {erro ? <div className="message error">{erro}</div> : null}

      <section className="access-summary"><div><Users size={20}/><strong>{users.length}</strong><span>usuários</span></div><div><ShieldCheck size={20}/><strong>{users.filter((user) => user.role === "owner" || user.role === "admin").length}</strong><span>administradores</span></div><p>Somente proprietários podem alterar papéis e convidar novos integrantes.</p></section>

      <section className="users-manager-grid">
        <form action={inviteUserAction} className="panel form-section">
          <div className="form-section-heading"><span><MailPlus size={18}/></span><div><h2>Convidar integrante</h2><p>A pessoa receberá um convite por e-mail.</p></div></div>
          <label>E-mail<input name="email" type="email" required placeholder="pessoa@exemplo.com"/></label>
          <label>Nível de acesso<select name="role"><option value="analyst">Analista — apenas visualização e métricas</option><option value="editor">Editor — produtos, categorias e banners</option><option value="admin">Administrador — gestão completa, exceto equipe</option></select></label>
          <button className="button primary wide"><MailPlus size={17}/> Enviar convite</button>
        </form>

        <div className="panel users-list-panel">
          <div className="panel-heading compact"><div><span className="section-kicker">Usuários cadastrados</span><h2>Equipe atual</h2></div></div>
          <div className="users-list">{users.map((user) => (
            <article key={user.user_id} className="user-card-row">
              <div className="user-avatar">{user.email.slice(0,1).toUpperCase()}</div>
              <div className="grow"><strong>{user.email}</strong><small>Adicionado em {new Date(user.created_at).toLocaleDateString("pt-BR")}</small></div>
              <form action={setUserRoleAction} className="role-form"><input type="hidden" name="user_id" value={user.user_id}/><select name="role" defaultValue={user.role ?? "analyst"}><option value="analyst">Analista</option><option value="editor">Editor</option><option value="admin">Administrador</option><option value="owner">Proprietário</option></select><button className="icon-action" title="Salvar papel"><UserCog size={17}/></button></form>
              <span className={`role-chip ${user.role ?? "none"}`}>{roleLabel[user.role ?? ""] ?? "Sem papel"}</span>
            </article>
          ))}</div>
        </div>
      </section>
    </>
  );
}
