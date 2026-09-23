"use client";

import { useEffect, useState } from "react";
import { BlackHoleHeroSection } from "@/components/ui/blackhole-hero-section";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { ArrowDown } from "lucide-react";

function useNarrow(query = "(max-width: 767px)") {
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const m = window.matchMedia(query);
    const sync = () => setNarrow(m.matches);
    sync();
    m.addEventListener("change", sync);
    return () => m.removeEventListener("change", sync);
  }, [query]);
  return narrow;
}

export default function BlackHoleHeroSectionDemo() {
  const narrow = useNarrow();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="hero" className="relative h-[92vh] min-h-[720px] max-h-[960px] w-full overflow-hidden bg-black">
      <BlackHoleHeroSection
        focus={narrow ? [0.5, 0.76] : [0.72, 0.46]}
        scrim={narrow ? "top" : "left"}
        scrimStrength={0.92}
        distance={24}
        elevation={narrow ? -7 : -5.5}
        fov={narrow ? 58 : 42}
        glow={narrow ? 0.85 : 1}
        steps={narrow ? 200 : 300}
        resolution={narrow ? 0.6 : 0.7}
        className="h-full w-full"
      >
        <div className="flex h-full items-start px-6 pt-28 sm:px-10 md:items-center md:pt-0 lg:px-20">
          <div className="max-w-[38rem] z-10">
            <h1 className="text-[2.6rem] font-light leading-[1.08] tracking-[-0.03em] text-white sm:text-6xl lg:text-[4.5rem]">
              Query Earth.
              <br />
              <span className="font-normal bg-gradient-to-r from-neutral-200 via-white to-neutral-400 bg-clip-text text-transparent">
                From Orbit.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-[0.98rem] leading-relaxed text-neutral-400 font-light md:mt-7">
              Autonomous satellite imagery intelligence. Ask plain-language questions across
              single imagery, bi-temporal change detection, and Optical + SAR radar fusion with
              verifiable pixel evidence and confidence scoring.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4 md:mt-10">
              <LiquidButton
                size="lg"
                onClick={() => scrollToSection("command-center")}
              >
                Start Querying
              </LiquidButton>

              <button
                type="button"
                onClick={() => scrollToSection("pipeline")}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur-md px-6 py-3 text-sm font-light text-white/80 transition-all hover:border-white/30 hover:bg-white/10 hover:text-white"
              >
                Pipeline Architecture
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-4 border-t border-white/10 pt-6 max-w-md">
              <div>
                <div className="text-xl font-light text-white tracking-tight">VQA & Ground</div>
                <div className="text-xs text-neutral-400 font-light mt-0.5">Single Optical Image</div>
              </div>
              <div>
                <div className="text-xl font-light text-neutral-300 tracking-tight">Bi-Temporal</div>
                <div className="text-xs text-neutral-400 font-light mt-0.5">Change Detection T1/T2</div>
              </div>
              <div>
                <div className="text-xl font-light text-neutral-400 tracking-tight">SAR + Optic</div>
                <div className="text-xs text-neutral-400 font-light mt-0.5">Cloud-Penetrating Fusion</div>
              </div>
            </div>
          </div>
        </div>
      </BlackHoleHeroSection>
    </section>
  );

}

export { BlackHoleHeroSectionDemo };
