import { useState, useEffect, useCallback } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { X, ChevronLeft, ChevronRight, Play } from "lucide-react";

const TEAL = "#3FA796";
const NAVY = "#0E1B2A";
const LIGHT_BLUE = "#EAF4F4";

// -----------------------------------------------------------------------------
// MEDIA LIST — Just list the filenames as you upload them. The gallery
// auto-detects photos vs. videos from the file extension.
//
// Currently uploaded: gallery-01.jpg to gallery-06.jpg
// Slots 07–20 are placeholders — they'll appear automatically as soon as you
// upload the actual file with that exact name (jpg / jpeg / png / webp / mp4).
//
// To swap one of these with a video, just change the extension to .mp4:
//   e.g. "gallery-07.mp4"  →  will render as an autoplaying video tile.
// -----------------------------------------------------------------------------
const MEDIA: string[] = [
  "gallery-01.jpg",
  "gallery-02.jpg",
  "gallery-03.jpg",
  "gallery-04.jpg",
  "gallery-05.jpg",
  "gallery-06.jpg",
  "gallery-07.mp4",
  "gallery-08.jpg",
  "gallery-09.jpg",
  "gallery-10.jpg",
  "gallery-11.jpg",
  "gallery-12.jpg",
  "gallery-13.jpg",
  "gallery-14.jpg",
  "gallery-15.jpg",
  "gallery-16.jpg",
  "gallery-17.jpg",
  "gallery-18.jpg",
  "gallery-19.jpg",
  "gallery-20.jpg",
];

const isVideo = (file: string) => /\.(mp4|mov|webm)$/i.test(file);

// -----------------------------------------------------------------------------
// Tile: a single photo or video card. If the file doesn't exist on the server,
// the tile hides itself (no broken icons).
// -----------------------------------------------------------------------------
function MediaTile({
  file,
  onOpen,
  animationDelay,
}: {
  file: string;
  onOpen: () => void;
  animationDelay: number;
}) {
  const [failed, setFailed] = useState(false);
  const video = isVideo(file);
  const src = `/gallery/${file}`;

  if (failed) return null;

  return (
    <button
      onClick={onOpen}
      className="group relative w-full overflow-hidden rounded-2xl cursor-pointer focus:outline-none block gallery-tile mb-4 md:mb-5"
      style={{
        background: "#e0eeed",
        border: "1px solid rgba(63,167,150,0.15)",
        boxShadow: "0 2px 12px rgba(14,27,42,0.06)",
        animation: `gallery-fade-in 0.6s ease ${animationDelay}ms both`,
        breakInside: "avoid",
        WebkitColumnBreakInside: "avoid",
      }}
      aria-label="Open media"
    >
      {video ? (
        <video
          src={src}
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          className="w-full h-auto block transition-transform duration-500 ease-out group-hover:scale-105"
          onError={() => setFailed(true)}
        />
      ) : (
        <img
          src={src}
          alt=""
          loading="lazy"
          className="w-full h-auto block transition-transform duration-500 ease-out group-hover:scale-105"
          onError={() => setFailed(true)}
        />
      )}

      {/* Play badge on videos */}
      {video && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-70 group-hover:opacity-100 transition-opacity"
        >
          <div
            className="flex items-center justify-center rounded-full"
            style={{
              width: 56,
              height: 56,
              background: "rgba(14,27,42,0.55)",
              backdropFilter: "blur(6px)",
              border: "1.5px solid rgba(255,255,255,0.4)",
            }}
          >
            <Play className="w-5 h-5 text-white" style={{ marginLeft: 3 }} fill="currentColor" />
          </div>
        </div>
      )}

      {/* Subtle wash on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(14,27,42,0.15), transparent 60%)" }}
      />
    </button>
  );
}

export default function Gallery() {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const open = useCallback((i: number) => setLightboxIdx(i), []);
  const close = useCallback(() => setLightboxIdx(null), []);
  const next = useCallback(() => {
    setLightboxIdx((idx) => (idx === null ? null : (idx + 1) % MEDIA.length));
  }, []);
  const prev = useCallback(() => {
    setLightboxIdx((idx) => (idx === null ? null : (idx - 1 + MEDIA.length) % MEDIA.length));
  }, []);

  // Keyboard + body scroll lock
  useEffect(() => {
    if (lightboxIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handler);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxIdx, close, next, prev]);

  const activeFile = lightboxIdx !== null ? MEDIA[lightboxIdx] : null;
  const activeIsVideo = activeFile ? isVideo(activeFile) : false;

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

      {/* Masonry Grid */}
      <section className="py-14 md:py-16 px-4" style={{ background: LIGHT_BLUE }}>
        <div className="container mx-auto max-w-6xl">
          <div className="gallery-masonry">
            {MEDIA.map((file, i) => (
              <MediaTile
                key={file}
                file={file}
                onOpen={() => open(i)}
                animationDelay={i * 60}
              />
            ))}
          </div>

          {/* Follow us block */}
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
      {lightboxIdx !== null && activeFile && (
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

          {/* Media */}
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: "min(1100px, 92vw)", maxHeight: "86vh" }}>
            {activeIsVideo ? (
              <video
                key={activeFile}
                src={`/gallery/${activeFile}`}
                controls
                autoPlay
                playsInline
                style={{
                  maxWidth: "min(1100px, 92vw)",
                  maxHeight: "86vh",
                  width: "auto",
                  height: "auto",
                  borderRadius: "8px",
                  boxShadow: "0 30px 90px rgba(0,0,0,0.5)",
                  background: "#000",
                  animation: "gallery-lightbox-zoom 0.35s ease",
                }}
              />
            ) : (
              <img
                key={activeFile}
                src={`/gallery/${activeFile}`}
                alt=""
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
            )}
          </div>

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
            {lightboxIdx + 1} / {MEDIA.length}
          </div>
        </div>
      )}

      <style>{`
        .gallery-masonry {
          column-count: 1;
          column-gap: 1rem;
        }
        @media (min-width: 640px) {
          .gallery-masonry {
            column-count: 2;
            column-gap: 1rem;
          }
        }
        @media (min-width: 1024px) {
          .gallery-masonry {
            column-count: 3;
            column-gap: 1.25rem;
          }
        }
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
