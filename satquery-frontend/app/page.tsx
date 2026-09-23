"use client";

import React from "react";
import BlackHoleHeroSectionDemo from "@/components/ui/blackhole-hero-demo";
import { VercelV0Chat } from "@/components/ui/v0-ai-chat";
import { PipelineShowcase } from "@/components/PipelineShowcase";
import { ProjectDeepDive } from "@/components/ProjectDeepDive";
import { FloatingNavbar } from "@/components/ui/floating-navbar";
import { GlowCard } from "@/components/ui/spotlight-card";
import { Eye, Map, Layers } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col selection:bg-white/20 selection:text-white relative">
      
      {/* Floating Pill Navigation Bar (matching reference images) */}
      <FloatingNavbar />

      {/* Brand Watermark / Minimal Header */}
      <header className="absolute top-5 left-6 sm:left-10 z-40 pointer-events-auto">
        <a href="#hero" className="group flex flex-col">
          <span className="text-xl sm:text-2xl font-light tracking-[-0.03em] text-white group-hover:text-neutral-300 transition-colors">
            SatQuery
          </span>
          <span className="text-[10px] text-neutral-400 font-light tracking-widest uppercase">
            Earth Observation Intelligence
          </span>
        </a>
      </header>

      {/* Hero Section with Black Hole Raymarching WebGL Canvas */}
      <BlackHoleHeroSectionDemo />

      {/* Conversational AI Command Center */}
      <section id="command-center" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-neutral-900 bg-black">
        <VercelV0Chat />
      </section>

      {/* Pipeline Architecture Showcase */}
      <PipelineShowcase
        onSelectSample={() => {
          const el = document.getElementById("command-center");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
      />

      {/* Project Deep Dive (Repurposed from old workspace) */}
      <ProjectDeepDive />

      {/* Modality Specifications Section */}
      <section id="specs" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-neutral-900 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h3 className="text-3xl sm:text-5xl font-light tracking-[-0.03em] text-white">
              Supported Sensors & Modalities
            </h3>
            <p className="text-sm sm:text-base text-neutral-400 font-light mt-3">
              Ingests diverse Earth observation constellations with calibrated resolution pipelines and sub-pixel co-registration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <GlowCard glowColor="blue" customSize className="!aspect-auto !p-0">
              <div className="p-7">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white mb-4">
                  <Eye className="w-5 h-5 text-neutral-200" />
                </div>
                <h4 className="text-base font-medium tracking-tight text-white">High-Res Optical (RGB / NIR)</h4>
                <p className="text-xs text-neutral-400 font-light mt-2.5 leading-relaxed">
                  PlanetScope (3m), Sentinel-2 (10m), Maxar WorldView (0.3m). Ideal for fine feature identification, asset counting, and spectral vegetation monitoring.
                </p>
                <div className="mt-6 pt-4 border-t border-neutral-900 text-[11px] font-mono text-neutral-400">
                  Sub-meter GSD Grounding
                </div>
              </div>
            </GlowCard>

            <GlowCard glowColor="green" customSize className="!aspect-auto !p-0">
              <div className="p-7">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white mb-4">
                  <Map className="w-5 h-5 text-neutral-200" />
                </div>
                <h4 className="text-base font-medium tracking-tight text-white">Bi-Temporal Pass Differencing</h4>
                <p className="text-xs text-neutral-400 font-light mt-2.5 leading-relaxed">
                  Co-registered temporal pairs over days, months, or years. Employs structural pixel-diff heuristics paired with semantic VLM description for verifiable impact reports.
                </p>
                <div className="mt-6 pt-4 border-t border-neutral-900 text-[11px] font-mono text-neutral-400">
                  OpenCV Heatmap Differencing
                </div>
              </div>
            </GlowCard>

            <GlowCard glowColor="orange" customSize className="!aspect-auto !p-0">
              <div className="p-7">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white mb-4">
                  <Layers className="w-5 h-5 text-neutral-200" />
                </div>
                <h4 className="text-base font-medium tracking-tight text-white">Synthetic Aperture Radar (SAR)</h4>
                <p className="text-xs text-neutral-400 font-light mt-2.5 leading-relaxed">
                  Sentinel-1 C-Band (VV/VH polarizations). Cloud-penetrating microwave backscatter reveals metallic vessels, water boundary delineation, and surface roughness day or night.
                </p>
                <div className="mt-6 pt-4 border-t border-neutral-900 text-[11px] font-mono text-neutral-400">
                  Lee Despeckling & Cross-Sensor
                </div>
              </div>
            </GlowCard>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neutral-900 py-10 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-light text-neutral-400">
          <div className="flex items-center gap-3">
            <span className="text-sm font-light tracking-[-0.03em] text-white">SatQuery</span>
            <span className="text-neutral-700">|</span>
            <span>Autonomous Planetary Vision Intelligence</span>
          </div>
          <div className="flex items-center gap-6 text-[11px] font-mono text-neutral-400">
            <span>FastAPI + LangGraph</span>
            <span>Next.js 14 + Tailwind</span>
            <span>Multi-modal Vision Models</span>
          </div>
        </div>
      </footer>
    </div>
  );
}