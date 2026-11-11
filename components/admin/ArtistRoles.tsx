"use client";

import { useState } from "react";
import { jobsRequest, type JobRole } from "@/lib/api/jobs";
import ArtistRolePicker from "./ArtistRolePicker";
import { buttonStyle } from "@/components/jobs/JobFields";

export default function ArtistRoles({ artistId, roles, savedIds, onSave, unavailable, onOpenRoles }: {
  artistId: number;
  unavailable: boolean;
  onOpenRoles: () => void;
  roles: JobRole[];
  savedIds: string[];
  onSave: (artistId: number, roleIds: string[]) => void;
}) {
  const [selected, setSelected] = useState(savedIds);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const changed = selected.length !== savedIds.length || selected.some(id => !savedIds.includes(id));

  async function save() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await jobsRequest({ action: "set-artist-roles", artist_id: artistId, role_ids: selected }, true);
      onSave(artistId, selected);
      setMessage("Ruoli aggiornati.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Salvataggio non riuscito.");
    } finally {
      setBusy(false);
    }
  }

  return <fieldset disabled={busy} className="mt-5 space-y-3">
    <ArtistRolePicker
      roles={roles}
      selected={selected}
      unavailable={unavailable}
      onOpenRoles={onOpenRoles}
      onChange={ids => {
        setSelected(ids);
        setMessage("");
      }}
    />
    {!unavailable && roles.length > 0 && (
      <button type="button" className={buttonStyle} disabled={!changed} onClick={save}>
        {busy ? "Salvataggio…" : "Salva ruoli"}
      </button>
    )}
    {error && <p role="alert" className="text-red-700">{error}</p>}
    {message && <p role="status">{message}</p>}
  </fieldset>;
}
