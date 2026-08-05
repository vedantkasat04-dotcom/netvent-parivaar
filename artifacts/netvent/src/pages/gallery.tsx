import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const TEAL = "#3FA796";
const NAVY = "#0E1B2A";
const LIGHT_BLUE = "#EAF4F4";

// Add more photos here as you upload them: gallery-07.jpg, gallery-08.jpg, etc.
const PHOTOS = [
  "/gallery/gallery-01.jpg",
  "/gallery/gallery-02.jpg",
  "/gallery/gallery-03.jpg",
  "/gallery/gallery-04.jpg",
  "/gallery/gallery-05.jpg",
  "/gallery/gallery-06.jpg",
];

export default function Gallery() {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const open = useCallback((i: number) => setLightboxIdx(i), []);
  const close = useCallback(() => setLightboxIdx(null), []);
  const next = useCallback(() => {
    setLightboxIdx((idx) => (idx === null ? null : (idx + 1) % PHOTOS.length));
  }, []);
  const prev = useCallback(() => {
    setLightboxIdx((idx) => (idx === null ? null : (idx - 1 + PHOTOS.length) % PHOTOS.length));
  }, []);

  // Keyboard support for lightbox
  useEffect(() => {
    if (lightboxIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handler);
    // Lock body scroll while lightbox is open
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxIdx, close, next, prev]);

  return (
    <AppLayout>
      {/* Header */}
      <div className="py-14 md:py-16 px-4 text-center" style={{ background: LIGHT_BLUE }}>
        <h1
          className="font-heading font-bold mb-3"
          style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: NAVY }}
        >
          Gallery
        </h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: "#4A5568" }}>
          Real moments from real events. This is what Parivaar looks like.
        </p>
      </div>

      {/* Grid */}
      <section className="py-14 md:py-16 px-4" style={{ background: LIGHT_BLUE }}>
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {PHOTOS.map((src, i) => (
              <button
                key={src}
                onClick={() => open(i)}
                className="group relative overflow-hidden rounded-2xl cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 gallery-tile"
                style={{
                  aspectRatio: "1 / 1",
                  background: "#e0eeed",
                  border: "1px solid rgba(63,167,150,0.15)",
                  boxShadow: "0 2px 12px rgba(14,27,42,0.06)",
                  animation: `gallery-fade-in 0.6s ease ${i * 80}ms both`,
                }}
                aria-label={`Open photo ${i + 1}`}
              >
                <img
                  src={src}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                />
                {/* Subtle overlay wash on hover */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ background: "linear-gradient(to top, rgba(14,27,42,0.15), transparent 60%)" }}
                />
              </button>
            ))}
          </div>

          {/* Coming soon block */}
          <div
            className="mt-14 text-center rounded-2xl py-10 px-6"
            style={{ background: "rgba(63,167,150,0.06)", border: `1.5px dashed rgba(63,167,150,0.3)` }}
          >
            <p className="font-heading font-bold text-xl mb-2" style={{ color: NAVY }}>
              More memories on the way 📸
            </p>
            <p style={{ color: "#4A5568" }}>
              Follow us on Instagram{" "}
              <a
                href="https://instagram.com/netvent_parivaar"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold hover:underline"
                style={{ color: TEAL }}
              >
                @netvent_parivaar
              </a>{" "}
              for the latest from our events.
            </p>
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIdx !== null && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={close}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(10, 22, 40, 0.94)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 16px",
            animation: "gallery-lightbox-fade 0.3s ease",
          }}
        >
          {/* Close */}
          <button
            onClick={(e) => { e.stopPropagation(); close(); }}
            aria-label="Close"
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              width: 42,
              height: 42,
              borderRadius: "9999px",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#fff",
              backdropFilter: "blur(8px)",
            }}
          >
            <X className="w-5 h-5" />
          </button>

          {/* Prev */}
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Previous"
            style={{
              position: "absolute",
              left: 20,
              top: "50%",
              transform: "translateY(-50%)",
              width: 48,
              height: 48,
              borderRadius: "9999px",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#fff",
              backdropFilter: "blur(8px)",
            }}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          {/* Next */}
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Next"
            style={{
              position: "absolute",
              right: 20,
              top: "50%",
              transform: "translateY(-50%)",
              width: 48,
              height: 48,
              borderRadius: "9999px",
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#fff",
              backdropFilter: "blur(8px)",
            }}
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Image */}
          <img
            src={PHOTOS[lightboxIdx]}
            alt=""
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "min(1100px, 92vw)",
              maxHeight: "86vh",
              width: "auto",
              height: "auto",
              objectFit: "contain",
              borderRadius: "8px",
              boxShadow: "0 30px 90px rgba(0,0,0,0.5)",
              animation: "gallery-lightbox-zoom 0.35s ease",
            }}
          />

          {/* Counter */}
          <div
            style={{
              position: "absolute",
              bottom: 20,
              left: "50%",
              transform: "translateX(-50%)",
              color: "rgba(255,255,255,0.7)",
              fontSize: "0.85rem",
              fontWeight: 500,
              letterSpacing: "0.08em",
            }}
          >
            {lightboxIdx + 1} / {PHOTOS.length}
          </div>
        </div>
      )}

      <style>{`
        @keyframes gallery-fade-in {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes gallery-lightbox-fade {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes gallery-lightbox-zoom {
          from { transform: scale(0.95); opacity: 0; }
          to   { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </AppLayout>
  );
}
