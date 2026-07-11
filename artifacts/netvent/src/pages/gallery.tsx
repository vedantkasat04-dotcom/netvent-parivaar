import { AppLayout } from "@/components/layout/AppLayout";

import img1 from "@assets/Screenshot_2026-06-23_at_12.41.51_PM_1782198733607.png";
import img2 from "@assets/Screenshot_2026-06-23_at_1.58.28_PM_1782203312315.png";
import img3 from "@assets/Screenshot_2026-06-23_at_2.01.09_PM_1782203472868.png";

const TEAL = "#3FA796";
const NAVY = "#0E1B2A";
const LIGHT_BLUE = "#EAF4F4";

const GALLERY_ITEMS = [
  { src: img1, caption: "NetVent at Navrachana University", objectPosition: "50% 20%" },
  { src: img2, caption: "Rooftop gathering — city vibes, Parivaar feels", objectPosition: "50% 25%" },
  { src: img3, caption: "Outdoors with the crew — where bonds are built", objectPosition: "50% 20%" },
];

export default function Gallery() {
  return (
    <AppLayout>
      {/* Header */}
      <div className="py-16 px-4 text-center" style={{ background: LIGHT_BLUE }}>
        <h1 className="font-heading font-bold mb-3" style={{ fontSize: "clamp(2rem, 4vw, 3rem)", color: NAVY }}>
          Gallery
        </h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: "#4A5568" }}>
          Real moments from real events. This is what Parivaar looks like.
        </p>
      </div>

      {/* Grid */}
      <section className="py-16 px-4" style={{ background: LIGHT_BLUE }}>
        <div className="container mx-auto max-w-5xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First image spans full width */}
            <div className="md:col-span-2 overflow-hidden rounded-2xl group shadow-md hover:shadow-xl transition-all duration-400"
              style={{ border: "1px solid rgba(63,167,150,0.15)" }}>
              <div className="relative" style={{ aspectRatio: "21/9" }}>
                <img src={GALLERY_ITEMS[0].src} alt={GALLERY_ITEMS[0].caption}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  style={{ objectPosition: GALLERY_ITEMS[0].objectPosition }} />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: "linear-gradient(to top, rgba(14,27,42,0.6), transparent)" }}>
                  <p className="absolute bottom-4 left-6 text-white font-medium text-sm">{GALLERY_ITEMS[0].caption}</p>
                </div>
              </div>
            </div>

            {/* Remaining images */}
            {GALLERY_ITEMS.slice(1).map((item, i) => (
              <div key={i} className="overflow-hidden rounded-2xl group shadow-md hover:shadow-xl transition-all duration-400"
                style={{ border: "1px solid rgba(63,167,150,0.15)" }}>
                <div className="relative" style={{ aspectRatio: "4/3" }}>
                  <img src={item.src} alt={item.caption}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    style={{ objectPosition: item.objectPosition }} />
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: "linear-gradient(to top, rgba(14,27,42,0.6), transparent)" }}>
                    <p className="absolute bottom-4 left-4 text-white font-medium text-sm">{item.caption}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Coming soon notice */}
          <div className="mt-14 text-center rounded-2xl py-12 px-6"
            style={{ background: "rgba(63,167,150,0.06)", border: `1.5px dashed rgba(63,167,150,0.3)` }}>
            <p className="font-heading font-bold text-xl mb-2" style={{ color: NAVY }}>More memories on the way 📸</p>
            <p style={{ color: "#4A5568" }}>
              Follow us on Instagram{" "}
              <a href="https://instagram.com/netvent_parivaar" target="_blank" rel="noopener noreferrer"
                className="font-semibold hover:underline" style={{ color: TEAL }}>
                @netvent_parivaar
              </a>{" "}
              for the latest from our events.
            </p>
          </div>
        </div>
      </section>
    </AppLayout>
  );
}
