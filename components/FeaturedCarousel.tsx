"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { PointerEvent } from "react";

type Slide = {
  name: string;
  url_image: string;
};

const visibleRange = 7;

export default function FeaturedCarousel({ slides }: { slides: Slide[] }) {
  const canMove = slides.length > 1;
  const [position, setPosition] = useState(0);
  const [dragStart, setDragStart] = useState<{ x: number; y: number; position: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isSettling, setIsSettling] = useState(false);

  const lastPointerRef = useRef({ time: 0, projection: 0 });
  const velocityRef = useRef(0);
  const hasDraggedRef = useRef(false);
  const pendingClickPositionRef = useRef<number | null>(null);
  const renderedPositions = canMove
    ? Array.from(
        { length: visibleRange * 2 + 3 },
        (_, index) => Math.round(position) - visibleRange - 1 + index,
      )
    : [0];

  const goToSlide = (targetPosition: number) => {
    setIsSettling(true);
    setPosition(targetPosition);
  };

  useEffect(() => {
    if (!canMove || isDragging) return;

    const interval = window.setInterval(() => {
      setIsSettling(true);
      setPosition((prev) => prev + 1);
    }, 2000);

    return () => window.clearInterval(interval);
  }, [canMove, isDragging]);

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!canMove) return;

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
        className={`absolute z-10 h-screen w-full select-none ${canMove ? "cursor-grab touch-none active:cursor-grabbing" : ""}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onTransitionEnd={() => setIsSettling(false)}
      >
        {renderedPositions.map((virtualIndex) => {
          const slideIndex = ((virtualIndex % slides.length) + slides.length) % slides.length;
          const slide = slides[slideIndex];
          const offset = virtualIndex - position;
          const isVisible = Math.abs(offset) <= visibleRange;
          const depth = Math.abs(offset);
          const scale = Math.max(0.76, 1 - depth * 0.035);

          return (
            <div
              key={virtualIndex}
              data-carousel-slide="true"
              data-carousel-position={virtualIndex}
              aria-hidden={virtualIndex !== Math.round(position)}
              className={`
                absolute overflow-hidden bg-neutral-100 transition-[transform,opacity,filter] ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform
                ${canMove ? "cursor-pointer" : ""}
                ${isDragging ? "duration-0" : isSettling ? "duration-[800ms]" : "duration-800"}
              `}
              style={{
                width: "clamp(260px, 32vw, 460px)",
                height: "clamp(300px, 36vw, 520px)",

                left: "50%",
                top: "50%",

                transform: `
                  translate(-50%, -50%)
                  translateX(${offset * 155}px)
                  translateY(${offset * -70}px)
                  scale(${scale})
                `,

                zIndex: 100 - Math.abs(offset),
                opacity: isVisible ? 1 : 0,
                filter: `blur(${depth * 0.15}px)`,
                pointerEvents: isVisible ? "auto" : "none",
              }}
            >
              <Image
                src={slide.url_image.trim()}
                alt={slide.name}
                fill
                unoptimized
                draggable={false}
                className="object-cover"
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
