"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";

const slides = [
  { id: 1, color: "bg-purple-700" },
  { id: 2, color: "bg-blue-600" },
  { id: 3, color: "bg-gray-300" },
  { id: 4, color: "bg-red-700" },
  { id: 5, color: "bg-black" },
  { id: 6, color: "bg-green-700" },
  { id: 7, color: "bg-teal-600" },
  { id: 8, color: "bg-red-800" },
  { id: 9, color: "bg-blue-700" },
  { id: 10, color: "bg-yellow-600" },

];

export default function InfiniteDiagonalCarousel() {
  const [position, setPosition] = useState(4);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; position: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSettling, setIsSettling] = useState(false);

  const lastPointerRef = useRef({ time: 0, projection: 0 });
  const velocityRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const pendingClickPositionRef = useRef<number | null>(null);
  const currentLoop = Math.round(position / slides.length);
  const loopBuffer = 4;
  const renderedSlides = Array.from(
    { length: loopBuffer * 2 + 1 },
    (_, loopOffset) => currentLoop - loopBuffer + loopOffset,
  ).flatMap((loop) =>
    slides.map((slide, index) => ({
      ...slide,
      originalIndex: index,
      virtualIndex: index + loop * slides.length,
    })),
  );

  const goToSlide = (targetPosition: number) => {
    setIsSettling(true);
    setPosition(targetPosition);
  };

  useEffect(() => {
    if (isDragging) return;

    const interval = window.setInterval(() => {
      setIsSettling(true);
      setPosition((prev) => prev + 1);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [isDragging]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const clickedSlide = target.closest<HTMLElement>("[data-carousel-slide]");
    const clickedPosition = clickedSlide?.dataset.carouselPosition;

    pendingClickPositionRef.current =
      clickedPosition !== undefined ? Number(clickedPosition) : null;

    setDragStart({ x: event.clientX, y: event.clientY, position });
    setIsDragging(true);
    setIsSettling(false);

    lastPointerRef.current = {
      time: performance.now(),
      projection: 0,
    };
    velocityRef.current = 0;
    hasDraggedRef.current = false;

    if (event.pointerType !== "mouse" || event.buttons === 1) {
      event.currentTarget.setPointerCapture(event.pointerId);
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragStart) return;

    const deltaX = event.clientX - dragStart.x;
    const deltaY = event.clientY - dragStart.y;
    const projection = deltaX - deltaY * 0.45;

    if (Math.abs(projection) > 8) {
      hasDraggedRef.current = true;
    }

    const now = performance.now();
    const elapsed = now - lastPointerRef.current.time;

    if (elapsed > 0) {
      velocityRef.current =
        (projection - lastPointerRef.current.projection) / elapsed;
    }

    lastPointerRef.current = { time: now, projection };
    setPosition(dragStart.position - projection / 155);
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!dragStart) return;

    if (!hasDraggedRef.current) {
      const clickedPosition = pendingClickPositionRef.current;

      setDragStart(null);
      setIsDragging(false);
      pendingClickPositionRef.current = null;

      if (clickedPosition !== null) {
        goToSlide(clickedPosition);
      }

      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      return;
    }

    const maxMomentum = 155 * 10;
    const projectedMomentum = Math.max(
      -maxMomentum,
      Math.min(maxMomentum, velocityRef.current * 420),
    );
    const dragProjection = lastPointerRef.current.projection;
    const projectedPosition =
      dragStart.position - (dragProjection + projectedMomentum) / 155;

    setPosition(Math.round(projectedPosition));
    setDragStart(null);
    setIsDragging(false);
    setIsSettling(true);
    pendingClickPositionRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  };

  return (
    <section className="relative min-h-screen overflow-hidden bg-white">
      <div
        className="absolute z-10 h-screen w-full cursor-grab touch-none select-none active:cursor-grabbing"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onTransitionEnd={() => setIsSettling(false)}
      >
        {renderedSlides.map((slide) => {
          const offset = slide.virtualIndex - position;

          const visibleRange = 7;
          const isVisible = Math.abs(offset) <= visibleRange;
          const depth = Math.abs(offset);
          const scale = Math.max(0.76, 1 - depth * 0.035);

          return (
            <div
              key={`${slide.id}-${slide.virtualIndex}`}
              data-carousel-slide="true"
              data-carousel-position={slide.virtualIndex}
              className={`
                absolute cursor-pointer transition-[transform,opacity,filter] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform
                ${slide.color}
                ${isDragging ? "duration-0" : isSettling ? "duration-[1400ms]" : "duration-1000"}
              `}
              style={{
                width: "460px",
                height: "520px",

                left: "50%",
                top: "50%",

                transform: `
                  translate(-50%, -50%)
                  translateX(${offset * 155}px)
                  translateY(${offset * -70}px)
                  scale(${scale})
                `,

                zIndex: 100 - Math.abs(offset),
                //opacity: isVisible ? Math.max(0.18, 1 - depth * 0.08) : 0,
                opacity: isVisible ? 1 : 0,
                filter: `blur(${depth * 0.15}px)`,
                pointerEvents: isVisible ? "auto" : "none",
              }}
            />
          );
        })}
      </div>

    </section>
  );
}