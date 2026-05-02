// app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Grainient from "@/components/Grainient";

const launchDate = new Date("2026-06-08T00:00:00").getTime();

function getTimeLeft() {
  const now = new Date().getTime();
  const difference = launchDate - now;

  //TODO: fare check serverside se il valore di launchdate è buono
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
  const [timeLeft, setTimeLeft] = useState(getTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
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

      <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
        {/*
        <div className="mb-6 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 backdrop-blur-md">
          Something new is coming
        </div>
        */}

        <h1 className="max-w-4xl text-5xl font-bold tracking-tight md:text-7xl">
          Cooming Soooon....
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

        <form className="mt-12 flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <input
            type="email"
            placeholder="Enter your email"
            className="min-h-12 flex-1 rounded-full border border-white/10 bg-white/10 px-5 text-white outline-none backdrop-blur-md placeholder:text-white/40 focus:border-white/30"
          />
          {/* TODO: add functionality to the form */}
          <button type="submit" className="min-h-12 rounded-full bg-white px-6 font-medium text-black transition hover:bg-white/90">
            Notify me
          </button>
        </form>
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
      <span className="text-4xl font-bold md:text-5xl">
        {String(value).padStart(2, "0")}
      </span>
      <span className="mt-2 text-sm uppercase tracking-widest text-white/50">
        {label}
      </span>
    </div>
  );
}