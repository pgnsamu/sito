"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Artist,
  Genre,
  Work,
  createArtist,
  createGenre,
  createWork,
  deleteArtist,
  deleteGenre,
  deleteWork,
  updateArtist,
  updateGenre,
  updateWork,
} from "@/lib/api/admin";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Tab = "works" | "artists" | "genres";

type Props = {
  initialGenres: Genre[];
  initialArtists: Artist[];
  initialWorks: Work[];
};

export default function AdminDashboard({
  initialGenres,
  initialArtists,
  initialWorks,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("works");

  const router = useRouter();

  const [genres, setGenres] = useState<Genre[]>(initialGenres);
  const [artists, setArtists] = useState<Artist[]>(initialArtists);
  const [works, setWorks] = useState<Work[]>(initialWorks);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function showMessage(text: string) {
    setError("");
    setMessage(text);
    setTimeout(() => setMessage(""), 3000);
  }

  function showError(text: string) {
    setMessage("");
    setError(text);
  }

  async function handleSignOut() {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        throw error;
      }

      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Errore durante la disconnessione.");
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f7f4] px-6 py-8 text-[#151515] md:px-12 lg:px-20">
      <header className="mb-14 flex items-start justify-between border-b border-black/15 pb-8">
        <div>
          <p className="mb-4 text-xs uppercase tracking-[0.4em] text-black/45">
            Admin Area
          </p>

          <h1 className="font-serif text-6xl leading-none tracking-[-0.04em] md:text-8xl">
            Dashboard
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-full border border-black/35 px-6 py-3 text-xs uppercase tracking-[0.25em] transition hover:border-black hover:bg-black hover:text-white"
          >
            Disconnetti
          </button>

          <Link
            href="/"
            className="rounded-full border border-black px-6 py-3 text-xs uppercase tracking-[0.25em] transition hover:bg-black hover:text-white"
          >
            Site
          </Link>
        </div>
      </header>

      <nav className="mb-12 flex flex-wrap gap-3">
        <TabButton active={activeTab === "works"} onClick={() => setActiveTab("works")}>
          Works
        </TabButton>

        <TabButton active={activeTab === "artists"} onClick={() => setActiveTab("artists")}>
          Artists
        </TabButton>

        <TabButton active={activeTab === "genres"} onClick={() => setActiveTab("genres")}>
          Genres
        </TabButton>
      </nav>

      {(message || error) && (
        <div
          className={`mb-8 rounded-full border px-5 py-3 text-sm ${
            error
              ? "border-red-500/30 bg-red-500/5 text-red-700"
              : "border-black/15 bg-white text-black/70"
          }`}
        >
          {error || message}
        </div>
      )}

      {activeTab === "works" && (
        <WorksSection
          works={works}
          artists={artists}
          genres={genres}
          setWorks={setWorks}
          showMessage={showMessage}
          showError={showError}
        />
      )}

      {activeTab === "artists" && (
        <ArtistsSection
          artists={artists}
          genres={genres}
          setArtists={setArtists}
          showMessage={showMessage}
          showError={showError}
        />
      )}

      {activeTab === "genres" && (
        <GenresSection
          genres={genres}
          setGenres={setGenres}
          showMessage={showMessage}
          showError={showError}
        />
      )}
    </main>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-7 py-3 text-xs uppercase tracking-[0.28em] transition ${
        active
          ? "border-black bg-black text-white"
          : "border-black/35 bg-transparent text-black hover:border-black"
      }`}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-xs uppercase tracking-[0.28em] text-black/45">
        {label}
      </span>
      {children}
    </label>
  );
}

function inputClass() {
  return "w-full border-b border-black/25 bg-transparent px-0 py-3 font-serif text-3xl outline-none transition placeholder:text-black/25 focus:border-black";
}

function smallInputClass() {
  return "w-full rounded-none border border-black/20 bg-white/40 px-4 py-3 text-sm outline-none transition placeholder:text-black/30 focus:border-black";
}

function selectClass() {
  return "w-full rounded-none border border-black/20 bg-white/40 px-4 py-3 text-sm outline-none transition focus:border-black";
}

function ActionButton({
  children,
  onClick,
  type = "button",
  danger = false,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  danger?: boolean;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`rounded-full border px-5 py-2 text-xs uppercase tracking-[0.22em] transition ${
        danger
          ? "border-red-700 text-red-700 hover:bg-red-700 hover:text-white"
          : "border-black text-black hover:bg-black hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

function SectionTitle({
  kicker,
  title,
}: {
  kicker: string;
  title: string;
}) {
  return (
    <div className="mb-10">
      <p className="mb-3 text-xs uppercase tracking-[0.35em] text-black/40">
        {kicker}
      </p>
      <h2 className="font-serif text-5xl leading-none tracking-[-0.04em] md:text-7xl">
        {title}
      </h2>
    </div>
  );
}

/* ----------------------------- GENRES ----------------------------- */

function GenresSection({
  genres,
  setGenres,
  showMessage,
  showError,
}: {
  genres: Genre[];
  setGenres: React.Dispatch<React.SetStateAction<Genre[]>>;
  showMessage: (text: string) => void;
  showError: (text: string) => void;
}) {
  const [name, setName] = useState("");

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    try {
      const result = await createGenre({ name });
      setGenres((prev) => [...prev, result.genre].sort((a, b) => a.name.localeCompare(b.name)));
      setName("");
      showMessage("Genere creato.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Errore creazione genere.");
    }
  }

  async function handleUpdate(id: number, nextName: string) {
    try {
      const result = await updateGenre({ id, name: nextName });
      setGenres((prev) => prev.map((genre) => (genre.id === id ? result.genre : genre)));
      showMessage("Genere aggiornato.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Errore aggiornamento genere.");
    }
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm("Eliminare questo genere?");
    if (!confirmed) return;

    try {
      await deleteGenre(id);
      setGenres((prev) => prev.filter((genre) => genre.id !== id));
      showMessage("Genere eliminato.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Errore eliminazione genere.");
    }
  }

  return (
    <section>
      <SectionTitle kicker="Taxonomy" title="Genres" />

      <form onSubmit={handleCreate} className="mb-14 max-w-2xl">
        <Field label="New genre">
          <input
            className={inputClass()}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Photography"
            required
          />
        </Field>

        <div className="mt-6">
          <ActionButton type="submit">Add genre</ActionButton>
        </div>
      </form>

      <div className="divide-y divide-black/10 border-y border-black/10">
        {genres.map((genre) => (
          <EditableGenreRow
            key={genre.id}
            genre={genre}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </section>
  );
}

function EditableGenreRow({
  genre,
  onUpdate,
  onDelete,
}: {
  genre: Genre;
  onUpdate: (id: number, name: string) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [name, setName] = useState(genre.name);

  return (
    <div className="grid gap-4 py-6 md:grid-cols-[1fr_auto] md:items-center">
      <input
        className="bg-transparent font-serif text-4xl outline-none"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <div className="flex gap-2">
        <ActionButton onClick={() => onUpdate(genre.id, name)}>Update</ActionButton>
        <ActionButton danger onClick={() => onDelete(genre.id)}>Delete</ActionButton>
      </div>
    </div>
  );
}

/* ----------------------------- ARTISTS ----------------------------- */

function ArtistsSection({
  artists,
  genres,
  setArtists,
  showMessage,
  showError,
}: {
  artists: Artist[];
  genres: Genre[];
  setArtists: React.Dispatch<React.SetStateAction<Artist[]>>;
  showMessage: (text: string) => void;
  showError: (text: string) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    description: "",
    genre_id: "",
  });

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    try {
      const result = await createArtist({
        name: form.name,
        description: form.description,
        genre_id: form.genre_id ? Number(form.genre_id) : null,
      });

      setArtists((prev) => [...prev, result.artist].sort((a, b) => a.name.localeCompare(b.name)));

      setForm({
        name: "",
        description: "",
        genre_id: "",
      });

      showMessage("Artista creato.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Errore creazione artista.");
    }
  }

  async function handleUpdate(input: {
    id: number;
    name: string;
    description: string;
    genre_id: number | null;
  }) {
    try {
      const result = await updateArtist(input);
      setArtists((prev) =>
        prev.map((artist) => (artist.id === input.id ? result.artist : artist))
      );
      showMessage("Artista aggiornato.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Errore aggiornamento artista.");
    }
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm("Eliminare questo artista?");
    if (!confirmed) return;

    try {
      await deleteArtist(id);
      setArtists((prev) => prev.filter((artist) => artist.id !== id));
      showMessage("Artista eliminato.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Errore eliminazione artista.");
    }
  }

  return (
    <section>
      <SectionTitle kicker="People" title="Artists" />

      <form onSubmit={handleCreate} className="mb-14 grid gap-6 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <Field label="Artist name">
            <input
              className={inputClass()}
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Artist name"
              required
            />
          </Field>
        </div>

        <Field label="Description">
          <textarea
            className={smallInputClass() + " min-h-28 resize-none"}
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            placeholder="Short description"
          />
        </Field>

        <Field label="Genre">
          <select
            className={selectClass()}
            value={form.genre_id}
            onChange={(e) => setForm((prev) => ({ ...prev, genre_id: e.target.value }))}
          >
            <option value="">No genre</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="lg:col-span-2">
          <ActionButton type="submit">Add artist</ActionButton>
        </div>
      </form>

      <div className="space-y-5">
        {artists.map((artist) => (
          <EditableArtistCard
            key={artist.id}
            artist={artist}
            genres={genres}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </section>
  );
}

function EditableArtistCard({
  artist,
  genres,
  onUpdate,
  onDelete,
}: {
  artist: Artist;
  genres: Genre[];
  onUpdate: (input: {
    id: number;
    name: string;
    description: string;
    genre_id: number | null;
  }) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [name, setName] = useState(artist.name);
  const [description, setDescription] = useState(artist.description ?? "");
  const [genreId, setGenreId] = useState(artist.genre_id ? String(artist.genre_id) : "");

  return (
    <article className="border border-black/10 bg-white/35 p-5 md:p-7">
      <div className="grid gap-5 lg:grid-cols-2">
        <Field label="Name">
          <input
            className="w-full bg-transparent font-serif text-4xl outline-none"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>

        <Field label="Genre">
          <select
            className={selectClass()}
            value={genreId}
            onChange={(e) => setGenreId(e.target.value)}
          >
            <option value="">No genre</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="lg:col-span-2">
          <Field label="Description">
            <textarea
              className={smallInputClass() + " min-h-24 resize-none"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Field>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        <ActionButton
          onClick={() =>
            onUpdate({
              id: artist.id,
              name,
              description,
              genre_id: genreId ? Number(genreId) : null,
            })
          }
        >
          Update
        </ActionButton>

        <ActionButton danger onClick={() => onDelete(artist.id)}>
          Delete
        </ActionButton>
      </div>
    </article>
  );
}

/* ----------------------------- WORKS ----------------------------- */

function WorksSection({
  works,
  artists,
  genres,
  setWorks,
  showMessage,
  showError,
}: {
  works: Work[];
  artists: Artist[];
  genres: Genre[];
  setWorks: React.Dispatch<React.SetStateAction<Work[]>>;
  showMessage: (text: string) => void;
  showError: (text: string) => void;
}) {
  const [form, setForm] = useState({
    name: "",
    production_date: "",
    url: "",
    description: "",
    artist_id: "",
    genre_id: "",
    featured: false as boolean,
    visible: false as boolean,
  });

  const canCreateWork = artists.length > 0 && genres.length > 0;

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();

    try {
      const supabase = createClient();

      const { data, error } = await supabase.functions.invoke("create-work-with-image", {
        body: {
          name: form.name,
          production_date: form.production_date || null,
          description: form.description,
          artist_id: Number(form.artist_id),
          genre_id: Number(form.genre_id),
          featured: form.featured,
          visible: form.visible,
          image: {
            url_image: form.url,
            used_in: null,
          },
        },
      });

      if (error) {
        throw error;
      }

      const result = data as { work: Work };

      setWorks((prev) => [result.work, ...prev]);

      setForm({
        name: "",
        production_date: "",
        url: "",
        description: "",
        artist_id: "",
        genre_id: "",
        featured: false,
        visible: false,
      });

      showMessage("Opera creata.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Errore creazione opera.");
    }
  }

  async function handleUpdate(input: {
    id: number;
    name: string;
    production_date: string | null;
    url: string;
    description: string;
    artist_id: number;
    genre_id: number;
    featured: boolean | null;
    visible: boolean | null;
  }) {
    try {
      const result = await updateWork({
        ...input,
        featured: input.featured ?? undefined,
        visible: input.visible ?? undefined,
      });
      setWorks((prev) => prev.map((work) => (work.id === input.id ? result.work : work)));
      showMessage("Opera aggiornata.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Errore aggiornamento opera.");
    }
  }

  async function handleDelete(id: number) {
    const confirmed = window.confirm("Eliminare questa opera?");
    if (!confirmed) return;

    try {
      await deleteWork(id);
      setWorks((prev) => prev.filter((work) => work.id !== id));
      showMessage("Opera eliminata.");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Errore eliminazione opera.");
    }
  }

  return (
    <section>
      <SectionTitle kicker="Archive" title="Works" />

      {!canCreateWork && (
        <div className="mb-8 border border-black/15 bg-white/40 p-5 text-sm text-black/60">
          Prima di creare un’opera devi avere almeno un artista e un genere.
        </div>
      )}

      <form onSubmit={handleCreate} className="mb-14 grid gap-6 lg:grid-cols-2">
        <div className="lg:col-span-2">
          <Field label="Work title">
            <input
              className={inputClass()}
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="Work title"
              required
            />
          </Field>
        </div>

        <Field label="Image URL">
          <input
            className={smallInputClass()}
            value={form.url}
            onChange={(e) => setForm((prev) => ({ ...prev, url: e.target.value }))}
            placeholder="https://..."
            required
          />
        </Field>

        <Field label="Production date">
          <input
            className={smallInputClass()}
            type="date"
            value={form.production_date}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, production_date: e.target.value }))
            }
          />
        </Field>

        <Field label="Artist">
          <select
            className={selectClass()}
            value={form.artist_id}
            onChange={(e) => setForm((prev) => ({ ...prev, artist_id: e.target.value }))}
            required
          >
            <option value="">Select artist</option>
            {artists.map((artist) => (
              <option key={artist.id} value={artist.id}>
                {artist.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Genre">
          <select
            className={selectClass()}
            value={form.genre_id}
            onChange={(e) => setForm((prev) => ({ ...prev, genre_id: e.target.value }))}
            required
          >
            <option value="">Select genre</option>
            {genres.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </Field>

        <div className="lg:col-span-2">
          <Field label="Description">
            <textarea
              className={smallInputClass() + " min-h-28 resize-none"}
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="Short description"
            />
          </Field>
        </div>

        <div className="lg:col-span-2 grid gap-4 md:grid-cols-2">
          <BooleanStatusControl
            label="Featured"
            value={form.featured}
            onChange={(value) => setForm((prev) => ({ ...prev, featured: value ?? false }))}
          />

          <BooleanStatusControl
            label="Visible"
            value={form.visible}
            onChange={(value) => setForm((prev) => ({ ...prev, visible: value ?? false }))}
          />
        </div>

        <div className="lg:col-span-2">
          <ActionButton type="submit">Add work</ActionButton>
        </div>
      </form>

      <div className="space-y-5">
        {works.map((work) => (
          <EditableWorkCard
            key={work.id}
            work={work}
            artists={artists} 
            genres={genres}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </section>
  );
}

function EditableWorkCard({
  work,
  artists,
  genres,
  onUpdate,
  onDelete,
}: {
  work: Work;
  artists: Artist[];
  genres: Genre[];
  onUpdate: (input: {
    id: number;
    name: string;
    production_date: string | null;
    url: string;
    description: string;
    artist_id: number;
    genre_id: number;
    featured: boolean | null;
    visible: boolean | null;
  }) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}) {
  const [name, setName] = useState(work.name);
  const imageUrl =
    (work as Work & { images?: { url_image?: string | null } | null }).images?.url_image ??
    (work as Work & { url_image?: string | null }).url_image ??
    "";
  const [url, setUrl] = useState(imageUrl);
  const [description, setDescription] = useState(work.description ?? "");
  const [productionDate, setProductionDate] = useState(work.production_date ?? "");
  const [artistId, setArtistId] = useState(String(work.artist_id));
  const [genreId, setGenreId] = useState(String(work.genre_id));
  const initialFeatured =
    (work as Work & { featured?: boolean | null }).featured === undefined
      ? null
      : (work as Work & { featured?: boolean | null }).featured;
  const initialVisible =
    (work as Work & { visible?: boolean | null }).visible === undefined
      ? null
      : (work as Work & { visible?: boolean | null }).visible;

  const [featured, setFeatured] = useState<boolean | null>(initialFeatured);
  const [visible, setVisible] = useState<boolean | null>(initialVisible);

  const selectedArtistName = useMemo(() => {
    return artists.find((artist) => String(artist.id) === artistId)?.name ?? "Unknown artist";
  }, [artists, artistId]);

  return (
    <article className="grid gap-6 border border-black/10 bg-white/35 p-5 md:grid-cols-[160px_1fr] md:p-7">
      <div className="aspect-[3/4] overflow-hidden bg-black/5">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={name} className="h-full w-full object-cover" />
        ) : null}
      </div>

      <div>
        <div className="mb-6">
          <p className="mb-2 text-xs uppercase tracking-[0.28em] text-black/40">
            {selectedArtistName}
          </p>

          <input
            className="w-full bg-transparent font-serif text-4xl leading-none tracking-[-0.03em] outline-none md:text-5xl"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Image URL">
            <input
              className={smallInputClass()}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </Field>

          <Field label="Production date">
            <input
              className={smallInputClass()}
              type="date"
              value={productionDate}
              onChange={(e) => setProductionDate(e.target.value)}
            />
          </Field>

          <Field label="Artist">
            <select
              className={selectClass()}
              value={artistId}
              onChange={(e) => setArtistId(e.target.value)}
            >
              {artists.map((artist) => (
                <option key={artist.id} value={artist.id}>
                  {artist.name}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Genre">
            <select
              className={selectClass()}
              value={genreId}
              onChange={(e) => setGenreId(e.target.value)}
            >
              {genres.map((genre) => (
                <option key={genre.id} value={genre.id}>
                  {genre.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="lg:col-span-2">
            <Field label="Description">
              <textarea
                className={smallInputClass() + " min-h-24 resize-none"}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
          </div>
          <div className="lg:col-span-2 grid gap-4 md:grid-cols-2">
            <BooleanStatusControl
              label="Featured"
              value={featured}
              onChange={setFeatured}
            />

            <BooleanStatusControl
              label="Visible"
              value={visible}
              onChange={setVisible}
            />
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <ActionButton
            onClick={() =>
              onUpdate({
                id: work.id,
                name,
                production_date: productionDate || null,
                url,
                description,
                artist_id: Number(artistId),
                genre_id: Number(genreId),
                featured,
                visible,
              })
            }
          >
            Update
          </ActionButton>

          <ActionButton danger onClick={() => onDelete(work.id)}>
            Delete
          </ActionButton>
        </div>
      </div>
    </article>
  );
}

function BooleanStatusControl({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (value: boolean | null) => void;
}) {
  function buttonClass(active: boolean) {
    return `rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] transition ${
      active
        ? "border-black bg-black text-white"
        : "border-black/25 text-black/55 hover:border-black hover:text-black"
    }`;
  }

  return (
    <div>
      <p className="mb-2 block text-xs uppercase tracking-[0.28em] text-black/45">
        {label}
      </p>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className={buttonClass(value === true)}
          onClick={() => onChange(true)}
        >
          True
        </button>

        <button
          type="button"
          className={buttonClass(value === false)}
          onClick={() => onChange(false)}
        >
          False
        </button>
      </div>
    </div>
  );
}