"use client";

import { useRef, useState } from "react";
import type { JobRole } from "@/lib/api/jobs";
import { buttonStyle, inputStyle } from "@/components/jobs/JobFields";

export default function ArtistRolePicker({ roles, selected, onChange, unavailable, onOpenRoles }: {
  roles: JobRole[];
  selected: string[];
  onChange: (ids: string[]) => void;
  unavailable: boolean;
  onOpenRoles: () => void;
}) {
  const searchInput = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const search = query.trim().toLocaleLowerCase("it");
  const matches = search ? roles.filter(role =>
    !selected.includes(role.id) && role.name.toLocaleLowerCase("it").includes(search)
  ) : [];

  return <fieldset className="space-y-3">
    <legend className="text-xs uppercase tracking-wider">Ruoli professionali</legend>
    {unavailable ? (
      <p role="alert" className="text-sm text-red-700">
        Impossibile caricare i ruoli. Ricarica la pagina per riprovare.
      </p>
    ) : roles.length === 0 ? (
      <button type="button" className={buttonStyle} onClick={onOpenRoles}>Vai a Ruoli</button>
    ) : (
      <>
        {selected.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {roles.filter(role => selected.includes(role.id)).map(role => (
              <li key={role.id}>
                <button
                  type="button"
                  className="rounded-full border border-black/25 px-3 py-1 text-sm"
                  aria-label={`Rimuovi ${role.name}`}
                  onClick={() => onChange(selected.filter(id => id !== role.id))}
                >
                  {role.name} <span aria-hidden="true">×</span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <label className="block text-sm">
          Cerca un ruolo da aggiungere
          <input
            ref={searchInput}
            className={inputStyle}
            value={query}
            onChange={event => setQuery(event.target.value)}
            onKeyDown={event => {
              if (event.key !== "Enter" || event.nativeEvent.isComposing) return;
              event.preventDefault();
              if (matches.length === 1) {
                onChange([...selected, matches[0].id]);
                setQuery("");
              }
            }}
          />
        </label>
        {search && (matches.length > 0 ? (
          <ul className="max-h-48 overflow-y-auto border border-black/15">
            {matches.map(role => (
              <li key={role.id}>
                <button
                  type="button"
                  className="w-full px-3 py-2 text-left text-sm hover:bg-neutral-100"
                  onClick={() => {
                    onChange([...selected, role.id]);
                    setQuery("");
                    searchInput.current?.focus();
                  }}
                >
                  {role.name}
                </button>
              </li>
            ))}
          </ul>
        ) : <p role="status" className="text-sm">Nessun ruolo disponibile per questa ricerca.</p>)}
      </>
    )}
  </fieldset>;
}
