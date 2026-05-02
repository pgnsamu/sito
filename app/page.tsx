"use client";

import Grainient from "@/app/components/Grainient";

export default function LiquidBackground() {
  return (
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
      <h1 className="absolute z-20 top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-4xl font-bold">COMING SOOOOON...</h1>
      
    </div>
  );
}