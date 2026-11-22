import { AwsClient } from "npm:aws4fetch@1.0.20";

export const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
export const PHOTO_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export class PhotoError extends Error {
  constructor(message: string, public status = 400) { super(message); }
}

export function photoConfig() {
  const required = (name: string) => {
    const value = Deno.env.get(name);
    if (!value) throw new PhotoError("Configurazione foto incompleta. Contatta l’amministratore.", 503);
    return value;
  };
  const endpoint = new URL(required("R2_ENDPOINT"));
  const publicUrl = new URL(required("R2_PUBLIC_URL"));
  if (endpoint.protocol !== "https:" || !endpoint.hostname.endsWith(".r2.cloudflarestorage.com") ||
      publicUrl.protocol !== "https:" || publicUrl.search || publicUrl.hash || publicUrl.username || publicUrl.password) {
    throw new PhotoError("Configurazione R2 non valida.", 503);
  }
  return {
    endpoint: endpoint.origin,
    publicUrl: publicUrl.toString().replace(/\/$/, ""),
    bucket: required("R2_BUCKET_NAME"),
    client: new AwsClient({
      accessKeyId: required("R2_ACCESS_KEY_ID"),
      secretAccessKey: required("R2_SECRET_ACCESS_KEY"),
      service: "s3",
      region: "auto",
    }),
  };
}

export function objectUrl(config: ReturnType<typeof photoConfig>, key: string) {
  return `${config.endpoint}/${encodeURIComponent(config.bucket)}/${key.split("/").map(encodeURIComponent).join("/")}`;
}

// Check the bytes too: the file extension and browser-provided MIME type are not sufficient.
export function matchesPhotoType(bytes: Uint8Array, type: string) {
  if (type === "image/jpeg") return bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (type === "image/png") return bytes.length >= 24 && [137, 80, 78, 71, 13, 10, 26, 10].every((n, i) => bytes[i] === n) &&
    String.fromCharCode(...bytes.slice(12, 16)) === "IHDR";
  if (type === "image/webp") return bytes.length >= 16 && String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  return false;
}

export async function readPhoto(response: Response, expectedSize: number, type: string) {
  if (!response.ok || !response.body) throw new PhotoError("Foto non trovata. Riprova il caricamento.", 409);
  const length = response.headers.get("Content-Length");
  if (length !== null && Number(length) !== expectedSize) {
    await response.body.cancel();
    throw new PhotoError("La dimensione della foto non corrisponde.");
  }
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > expectedSize || size > MAX_PHOTO_BYTES) {
      await reader.cancel();
      throw new PhotoError("La foto supera la dimensione consentita.");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  if (size !== expectedSize || !matchesPhotoType(bytes, type)) throw new PhotoError("Il file non è una foto del formato dichiarato.");
  return bytes;
}
