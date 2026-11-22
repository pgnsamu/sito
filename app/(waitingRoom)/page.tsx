"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Grainient from "@/components/Grainient";

//TODO: fare check serverside se il valore di launchdate è buono
const launchDate = new Date("2026-12-01T12:00:00").getTime();
const unavailableMessage = "Sign-ups are temporarily unavailable. Please try again later.";

function validateEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail) {
    return { valid: false, message: "Please enter your email." };
  }

  if (normalizedEmail.length > 254) {
    return { valid: false, message: "Email is too long." };
  }

  if (/\s/.test(normalizedEmail)) {
    return { valid: false, message: "Email cannot contain spaces." };
  }

  if (/[<>{}()[\]"'`;\\]/.test(normalizedEmail)) {
    return { valid: false, message: "Email contains invalid characters." };
  }

  const emailRegex = /^[a-zA-Z0-9.!#$%&*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/;

  if (!emailRegex.test(normalizedEmail)) {
    return { valid: false, message: "Please enter a valid email address." };
  }

  const [localPart, domain] = normalizedEmail.split("@");

  if (!localPart || !domain) {
    return { valid: false, message: "Please enter a valid email address." };
  }

  if (localPart.length > 64) {
    return { valid: false, message: "Email local part is too long." };
  }

  if (domain.length > 253) {
    return { valid: false, message: "Email domain is too long." };
  }

  if (domain.startsWith("-") || domain.endsWith("-") || domain.includes("..")) {
    return { valid: false, message: "Please enter a valid email address." };
  }

  return { valid: true, message: "", email: normalizedEmail };
}

function getTimeLeft() {
  const now = new Date().getTime();
  const difference = launchDate - now;

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
  };
}

export default function ComingSoonPage() {

  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validation = validateEmail(email);

    if (!validation.valid) {
      setStatus("error");
      setMessage(validation.message);
      return;
    }

    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: validation.email }),
      });

      const contentType = response.headers.get("content-type");
      const data = contentType?.includes("application/json") ? await response.json() : null;

      if (!response.ok || data?.success !== true) {
        setStatus("error");
        setMessage(typeof data?.error === "string" ? data.error : unavailableMessage);
        return;
      }

      setStatus("success");
      setMessage("Thanks! We'll notify you when we launch.");
      setEmail("");
    } catch {
      setStatus("error");
      setMessage(unavailableMessage);
    }
  }

  //const [timeLeft, setTimeLeft] = useState(getTimeLeft());
  useEffect(() => {

    const updateTimeLeft = () => {

      setTimeLeft(getTimeLeft());

    };

    updateTimeLeft();

    const timer = setInterval(updateTimeLeft, 1000);

    const handlePageShow = () => {
      updateTimeLeft();
    };

    window.addEventListener("pageshow", handlePageShow);

    return () => {

      clearInterval(timer);

      window.removeEventListener("pageshow", handlePageShow);

    };

  }, []);

  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white">
      {/* Background blobs */}
      <div className="absolute inset-0 z-10">
        <Grainient
          color1="#b8b8b8"
          color2="#5e5e5e"
          color3="#000000"
          timeSpeed={0.75}
          colorBalance={0}
          warpStrength={0.55}
          warpFrequency={5}
          warpSpeed={2}
          warpAmplitude={50}
          blendAngle={0}
          blendSoftness={0.12}
          rotationAmount={360}
          noiseScale={2}
          grainAmount={0.1}
          grainScale={2}
          grainAnimated={false}
          contrast={1.5}
          gamma={1}
          saturation={1}
          centerX={0}
          centerY={0}
          zoom={0.6}
        />
      </div>

      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-[env(safe-area-inset-top)] pb-[calc(env(safe-area-inset-bottom)+1.5rem)] text-center">
        {/*
        <div className="mb-6 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 backdrop-blur-md">
          Something new is coming
        </div>
        */}

        <h1 className="max-w-4xl text-5xl font-semibold tracking-tight md:text-7xl">
          COMING SOON
        </h1>
        {/*
        <p className="mt-6 max-w-xl text-base leading-7 text-white/60 md:text-lg">
          Our website is under construction. We are working hard to bring you
          something beautiful, fast and useful.
        </p>
        */}
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          <CountdownBox value={timeLeft.days} label="Days" />
          <CountdownBox value={timeLeft.hours} label="Hours" />
          <CountdownBox value={timeLeft.minutes} label="Minutes" />
          <CountdownBox value={timeLeft.seconds} label="Seconds" />
        </div>

        <form onSubmit={handleSubmit} aria-describedby="launch-privacy" className="mt-12 flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <input
            type="email"
            inputMode="email"
            autoComplete="email"
            maxLength={254}
            pattern="^[a-zA-Z0-9.!#$%&*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)+$"
            placeholder="Enter your email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            disabled={status === "loading"}
            required
            className="min-h-12 flex-1 rounded-full border border-white/10 bg-white/10 px-5 text-white outline-none backdrop-blur-md placeholder:text-white/40 focus:border-white/30"
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="min-h-12 rounded-full bg-white px-10 font-light text-black transition hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status === "loading" ? "Saving..." : "Notify me"}
          </button>
        </form>
        <p id="launch-privacy" className="mt-3 max-w-md text-sm text-white/80">
          By selecting Notify me, you agree to receive the launch email. You can withdraw your consent at any time.
          {" "}<Link href="/privacy-policy" className="underline underline-offset-4">Privacy Policy</Link>
        </p>
        <p
          aria-live="polite"
          className={`mt-4 min-h-5 text-sm transition-opacity ${
            message ? "opacity-100" : "opacity-0"
          } ${status === "success" ? "text-white/70" : "text-red-300"}`}
        >
          {message || "\u00A0"}
        </p>
      </section>
    </main>
  );
}

function CountdownBox({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="flex h-28 w-32 flex-col items-center justify-center rounded-3xl border border-white/10 bg-white/10 backdrop-blur-md md:h-32 md:w-36">
      <span className="text-4xl font-light md:text-5xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-2 text-sm uppercase tracking-widest text-white/50">
        {label}
      </span>
    </div>
  );
}
