"use client";

import { useState } from "react";
import { jobsRequest, type JobRole, type JobRoleAlias } from "@/lib/api/jobs";
import { buttonStyle, inputStyle } from "@/components/jobs/JobFields";

export function RoleOptions({ roles, empty = "Senza ruolo" }: { roles: JobRole[]; empty?: string }) {
  return <>
    <option value="">{empty}</option>
    {roles.map(role => <option key={role.id} value={role.id}>{role.name}</option>)}
  </>;
}

export default function RolesSection({ roles, aliases, onRole, onAlias }: {
  roles: JobRole[];
  aliases: JobRoleAlias[];
  onRole: (role: JobRole) => void;
  onAlias: (alias: JobRoleAlias) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name")).trim();
    const roleId = data.get("role_id");
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (typeof roleId === "string" && roleId) {
        await jobsRequest({ action: "add-role-alias", name, role_id: roleId }, true);
        onAlias({ name, role_id: roleId });
        setMessage("Alias aggiunto.");
      } else {
        const { role } = await jobsRequest<{ role: JobRole }>({ action: "create-role", name }, true);
        onRole(role);
        setMessage("Ruolo creato.");
      }
      form.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Salvataggio non riuscito.");
    } finally {
      setBusy(false);
    }
  }

  return <section>
    <h2 className="mb-8 font-serif text-5xl">Ruoli</h2>
    <form onSubmit={save} className="mb-10 max-w-2xl">
      <fieldset disabled={busy} className="grid gap-5 sm:grid-cols-2">
        <label>Nome o alias<input name="name" required maxLength={160} className={inputStyle} /></label>
        <label>Associa a un ruolo<select name="role_id" className={inputStyle}>
          <RoleOptions roles={roles} empty="Crea un nuovo ruolo" />
        </select></label>
        <button type="submit" className={buttonStyle}>{busy ? "Salvataggio…" : "Aggiungi"}</button>
      </fieldset>
    </form>
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {message && <p role="status">{message}</p>}
    <ul className="divide-y divide-black/15">
      {roles.map(role => {
        const names = aliases.filter(alias => alias.role_id === role.id && alias.name !== role.name);
        return <li key={role.id} className="py-4">
          <h3 className="font-serif text-2xl">{role.name}</h3>
          {names.length > 0 && <p className="text-sm text-black/65">{names.map(alias => alias.name).join(", ")}</p>}
        </li>;
      })}
    </ul>
  </section>;
}
