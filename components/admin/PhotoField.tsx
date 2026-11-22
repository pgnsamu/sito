"use client";

import { useEffect, useId, useRef, useState } from "react";
import { discardPhoto, MAX_PHOTO_BYTES, PHOTO_ACCEPT, PhotoValue, uploadPhoto } from "@/lib/api/photos";

type Props = {
  value: PhotoValue;
  onChange: (photo: PhotoValue) => void;
  scope: "artists" | "works";
  onBusyChange: (busy: boolean) => void;
  required?: boolean;
  allowRemove?: boolean;
};

export default function PhotoField({ value, onChange, scope, onBusyChange, required = false, allowRemove = true }: Props) {
  const id = useId();
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState("");
  const controller = useRef<AbortController | null>(null);
  const draftKey = useRef<string | null>(null);

  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (!preview) return;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  async function selectPhoto(file?: File) {
    if (!file || controller.current) return;
    setError("");
    if (!PHOTO_ACCEPT.split(",").includes(file.type) || file.size < 1 || file.size > MAX_PHOTO_BYTES) {
      setError("Scegli una foto JPEG, PNG o WebP fino a 10 MB.");
      return;
    }
    const active = new AbortController();
    controller.current = active;
    onBusyChange(true);
    try {
      const bitmap = await createImageBitmap(file);
      bitmap.close();
      if (active.signal.aborted) return;
      setPreview(URL.createObjectURL(file));
      const photo = await uploadPhoto(file, scope, setStatus, active.signal);
      if (active.signal.aborted) return;
      const previousDraft = draftKey.current;
      draftKey.current = photo.image_key;
      onChange(photo);
      if (previousDraft) void discardPhoto(previousDraft).catch(() => undefined);
    } catch (err) {
      if (!active.signal.aborted) setError(err instanceof Error ? err.message : "Caricamento della foto non riuscito.");
    } finally {
      if (!active.signal.aborted) {
        setStatus("");
        setPreview("");
        onBusyChange(false);
      }
      controller.current = null;
    }
  }

  function changeValue(photo: PhotoValue) {
    const previousDraft = draftKey.current;
    draftKey.current = null;
    onChange(photo);
    if (previousDraft) void discardPhoto(previousDraft).catch(() => undefined);
  }

  const busy = Boolean(preview || status || controller.current);
  return (
    <div className="space-y-3">
      <label htmlFor={id} className="block text-sm text-black/70">Foto{required ? " *" : ""}</label>
      {(preview || value.url_image) && (
        // Object URLs and existing external URLs also work in the admin preview.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview || value.url_image} alt="Anteprima della foto" className="h-40 w-full border border-black/10 bg-black/5 object-contain" />
      )}
      <input
        id={id}
        type="file"
        accept={PHOTO_ACCEPT}
        disabled={busy}
        aria-describedby={`${id}-help ${id}-status`}
        className="block w-full text-sm file:mr-3 file:border file:border-black/25 file:bg-white file:px-4 file:py-2 disabled:opacity-50"
        onChange={event => { void selectPhoto(event.target.files?.[0]); event.target.value = ""; }}
      />
      <p id={`${id}-help`} className="text-sm text-black/50">JPEG, PNG o WebP · massimo 10 MB. Salva il modulo per associare la foto.</p>
      <p id={`${id}-status`} role={error ? "alert" : "status"} className={`text-sm ${error ? "text-red-700" : "text-black/60"}`}>
        {error || status}
      </p>
      <label className="block text-sm text-black/60">
        Oppure usa un URL esistente
        <input
          type="url"
          value={value.url_image}
          required={required}
          readOnly={Boolean(value.image_key)}
          disabled={busy}
          onChange={event => changeValue({ url_image: event.target.value, image_key: null })}
          placeholder="https://…"
          className="mt-2 w-full border border-black/20 bg-white/40 px-4 py-3 text-sm outline-none focus:border-black"
        />
      </label>
      {value.url_image && allowRemove && (
        <button type="button" disabled={busy} onClick={() => changeValue({ url_image: "", image_key: null })} className="text-sm underline disabled:opacity-50">
          Rimuovi foto
        </button>
      )}
    </div>
  );
}
