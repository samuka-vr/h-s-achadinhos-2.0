"use client";

import { useMemo, useState } from "react";
import { ShieldCheck, UserCog } from "lucide-react";
import { bulkUserRolesAction, setUserRoleAction } from "@/server/actions/user-actions";
import { CustomSelect, type CustomSelectOption } from "@/components/ui/custom-select";
import { StudioCheckbox } from "@/components/ui/studio-checkbox";
import type { StudioUser, UserRole } from "@/types/domain";

const roleLabels: Record<string, string> = {
  owner: "Proprietário",
  admin: "Administrador",
  editor: "Editor",
  analyst: "Analista",
};

const roleOptions: CustomSelectOption[] = [
  { value: "analyst", label: "Analista", description: "Visualiza o painel e as métricas" },
  { value: "editor", label: "Editor", description: "Gerencia catálogo e banners" },
  { value: "admin", label: "Administrador", description: "Acesso completo, exceto equipe" },
  { value: "owner", label: "Proprietário", description: "Controle total do projeto" },
];

export function UserAdminList({ users, currentUserId }: { users: StudioUser[]; currentUserId: string }) {
  const selectableIds = useMemo(() => users.filter((user) => user.user_id !== currentUserId).map((user) => user.user_id), [currentUserId, users]);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkRole, setBulkRole] = useState<UserRole | "">("");
  const allSelected = selectableIds.length > 0 && selectableIds.every((id) => selected.includes(id));

  function toggle(id: string) {
    setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  function toggleAll() {
    setSelected(allSelected ? [] : selectableIds);
  }

  return (
    <>
      <div className="admin-list-toolbar">
        <label className="select-all-control">
          <StudioCheckbox checked={allSelected} onChange={toggleAll} ariaLabel="Selecionar todos os integrantes" disabled={!selectableIds.length} />
          <span>{allSelected ? "Todos selecionados" : "Selecionar todos"}</span>
        </label>
        <span className="admin-list-count">{users.length} integrante{users.length === 1 ? "" : "s"}</span>
      </div>

      <div className={selected.length ? "studio-bulk-bar visible" : "studio-bulk-bar"}>
        <div className="bulk-selection-summary">
          <strong>{selected.length}</strong><span>selecionado{selected.length === 1 ? "" : "s"}</span>
          <button type="button" onClick={() => setSelected([])}>Limpar seleção</button>
        </div>
        <form action={bulkUserRolesAction} className="studio-bulk-form">
          <input type="hidden" name="ids" value={selected.join(",")} />
          <CustomSelect
            name="role"
            value={bulkRole}
            onValueChange={(value) => setBulkRole(value as UserRole)}
            options={roleOptions}
            placeholder="Definir nível de acesso"
            ariaLabel="Novo nível de acesso dos integrantes"
          />
          <button className="button primary" disabled={!bulkRole || !selected.length}><UserCog size={17} /> Atualizar acessos</button>
        </form>
      </div>

      <div className="users-list professional-users-list">
        {users.map((user) => {
          const isCurrent = user.user_id === currentUserId;
          return (
            <article key={user.user_id} className={`user-card-row ${selected.includes(user.user_id) ? "selected" : ""}`}>
              <StudioCheckbox
                checked={selected.includes(user.user_id)}
                onChange={() => toggle(user.user_id)}
                ariaLabel={`Selecionar ${user.email}`}
                disabled={isCurrent}
              />
              <div className="user-avatar">{user.email.slice(0, 1).toUpperCase()}</div>
              <div className="grow user-row-copy">
                <strong>{user.email}</strong>
                <small>{isCurrent ? "Sua conta" : `Adicionado em ${new Date(user.created_at).toLocaleDateString("pt-BR")}`}</small>
              </div>
              {isCurrent ? (
                <div className="current-user-role"><ShieldCheck size={16} /><span>{roleLabels[user.role ?? ""] ?? "Sem acesso"}</span></div>
              ) : (
                <form action={setUserRoleAction} className="role-form professional-role-form">
                  <input type="hidden" name="user_id" value={user.user_id} />
                  <CustomSelect name="role" defaultValue={user.role ?? "analyst"} options={roleOptions} ariaLabel={`Nível de acesso de ${user.email}`} />
                  <button className="icon-action" title="Salvar nível de acesso"><UserCog size={17} /></button>
                </form>
              )}
              <span className={`role-chip ${user.role ?? "none"}`}>{roleLabels[user.role ?? ""] ?? "Sem papel"}</span>
            </article>
          );
        })}
      </div>
    </>
  );
}
