"use client";

import Image from "next/image";
import { useState } from "react";

export default function WorkImage({ src, name }: { src?: string; name: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span className="grid h-full place-items-center p-2 text-center text-xs text-neutral-600">
        {name}
      </span>
    );
  }

  return (
    <Image
      src={src}
      alt={name}
      fill
      unoptimized
      onError={() => setFailed(true)}
      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
    />
  );
}
