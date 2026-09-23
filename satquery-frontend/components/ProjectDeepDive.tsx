"use client";

import React from "react";
import { 
  Cpu, 
  ShieldCheck, 
  Workflow, 
  Radar, 
  Satellite, 
  Network, 
  Eye, 
  Compass, 
  ArrowRight,
  Database,
  Layers,
  Sparkles
} from "lucide-react";
import { GlowCard } from "@/components/ui/spotlight-card";

export function ProjectDeepDive() {
  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-black relative border-t border-neutral-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Header with Unified Typography */}
        <div className="text-left mb-16 max-w-3xl">
          <h2 className="text-[2.2rem] font-light leading-[1.12] tracking-[-0.03em] text-white sm:text-5xl lg:text-6xl">
            Autonomous Planetary Vision.
            <br />
            <span className="font-normal bg-gradient-to-r from-neutral-200 via-white to-neutral-400 bg-clip-text text-transparent">
              Engineered for Ground Truth.
            </span>
          </h2>

          <p className="mt-6 text-base sm:text-lg text-neutral-400 font-light leading-relaxed">
            Earth observation constellations generate petabytes of multi-spectral and microwave telemetry each day.
            SatQuery replaces fragmented manual GIS workflows with an autonomous multi-agent graph—routing queries,
            filtering radar speckle, isolating temporal changes, and grounding physical evidence with calibrated confidence.
          </p>
        </div>

        {/* 4 Core Architectural Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-16">
          <GlowCard glowColor="blue" customSize className="!aspect-auto !p-0">
            <div className="p-6 h-full flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white mb-4">
                  <Workflow className="w-5 h-5 text-neutral-200" />
                </div>
                <h3 className="text-base font-medium tracking-tight text-white">LangGraph DAG Router</h3>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed font-light">
                  Dynamically inspects natural language intent and sensor modalities, selecting optimal subgraphs across VQA, object grounding, bi-temporal differencing, and SAR fusion.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-900 text-[11px] font-mono text-neutral-400">
                Deterministic + VLM Routing
              </div>
            </div>
          </GlowCard>

          <GlowCard glowColor="purple" customSize className="!aspect-auto !p-0">
            <div className="p-6 h-full flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white mb-4">
                  <Radar className="w-5 h-5 text-neutral-200" />
                </div>
                <h3 className="text-base font-medium tracking-tight text-white">Radar & Optical Fusion</h3>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed font-light">
                  Overcomes tropospheric cloud obstruction and nighttime darkness by synthesizing Sentinel-1 C-band synthetic aperture radar with high-res optical multi-spectral bands.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-900 text-[11px] font-mono text-neutral-400">
                VV/VH Backscatter Co-registration
              </div>
            </div>
          </GlowCard>

          <GlowCard glowColor="green" customSize className="!aspect-auto !p-0">
            <div className="p-6 h-full flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white mb-4">
                  <ShieldCheck className="w-5 h-5 text-neutral-200" />
                </div>
                <h3 className="text-base font-medium tracking-tight text-white">Validation Guardrails</h3>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed font-light">
                  Every specialist output passes through an adversarial QA reviewer node that bounds coordinate geometries, filters hallucinations, and computes verifiable confidence scores.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-900 text-[11px] font-mono text-neutral-400">
                Normalized Confidence Scoring
              </div>
            </div>
          </GlowCard>

          <GlowCard glowColor="orange" customSize className="!aspect-auto !p-0">
            <div className="p-6 h-full flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-white mb-4">
                  <Compass className="w-5 h-5 text-neutral-200" />
                </div>
                <h3 className="text-base font-medium tracking-tight text-white">Pixel Differential Engine</h3>
                <p className="text-xs text-neutral-400 mt-2 leading-relaxed font-light">
                  Computes calibrated pixel-magnitude difference heatmaps across co-registered temporal passes (T1 and T2) to isolate floodwaters, road cuts, and urban expansion.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-neutral-900 text-[11px] font-mono text-neutral-400">
                Sub-pixel Temporal Delta
              </div>
            </div>
          </GlowCard>
        </div>

        {/* Pipeline Execution Flow Diagram */}
        <div className="bg-neutral-950 border border-neutral-800/80 rounded-3xl p-8 sm:p-10 mb-16 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/[0.02] rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl mb-8">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-400">
              Execution Lifecycle
            </span>
            <h3 className="text-2xl sm:text-3xl font-light tracking-[-0.03em] text-white mt-1">
              From Raw Orbit Telemetry to Actionable Intelligence
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800/60">
              <span className="text-[10px] font-mono text-neutral-400">STAGE 01</span>
              <h4 className="text-sm font-medium text-white mt-1">Ingest & Despeckle</h4>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed font-light">
                Multimodal file upload, radiometric calibration, Lanczos rescaling, and Lee noise despeckling.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800/60">
              <span className="text-[10px] font-mono text-neutral-400">STAGE 02</span>
              <h4 className="text-sm font-medium text-white mt-1">Graph Routing</h4>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed font-light">
                Semantic classifier maps intent to specialized subgraphs with modality-constrained guardrails.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800/60">
              <span className="text-[10px] font-mono text-neutral-400">STAGE 03</span>
              <h4 className="text-sm font-medium text-white mt-1">Specialist Reasoning</h4>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed font-light">
                Target localization with normalized coordinates, OpenCV diff heatmap, or cross-sensor composite.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800/60">
              <span className="text-[10px] font-mono text-neutral-400">STAGE 04</span>
              <h4 className="text-sm font-medium text-white mt-1">Dual-Reviewer QA</h4>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed font-light">
                Geometric coordinate validation, confidence score bounds [0.0 - 1.0], and prompt injection safety.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-neutral-900/50 border border-neutral-800/60">
              <span className="text-[10px] font-mono text-neutral-400">STAGE 05</span>
              <h4 className="text-sm font-medium text-white mt-1">Evidence Synthesis</h4>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed font-light">
                Generates high-res visual artifact overlay, audit execution trace, and Markdown briefing.
              </p>
            </div>
          </div>
        </div>

        {/* Operational Applications Grid */}
        <div id="applications" className="pt-6">
          <div className="text-center max-w-xl mx-auto mb-10">
            <h3 className="text-xl sm:text-2xl font-light tracking-[-0.03em] text-white">
              Mission-Critical Operational Applications
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400 font-light mt-1">
              Field-proven capabilities across enterprise, defense, and environmental conservation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-900 hover:border-neutral-800 transition-colors">
              <div className="text-sm font-medium text-white tracking-tight">Maritime Domain Awareness</div>
              <p className="text-xs text-neutral-400 font-light mt-2 leading-relaxed">
                Persistent all-weather vessel tracking through cloud cover. Detect dark vessels operating with disabled AIS transponders via radar backscatter.
              </p>
              <div className="mt-4 flex items-center gap-2 text-[11px] font-mono text-neutral-400">
                <span>Modality: Optical + SAR Fusion</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-900 hover:border-neutral-800 transition-colors">
              <div className="text-sm font-medium text-white tracking-tight">Disaster Impact & Flood Mapping</div>
              <p className="text-xs text-neutral-400 font-light mt-2 leading-relaxed">
                Rapid temporal pass differencing before and after hurricane landfall. Maps inundation perimeter shifts and structural levee integrity.
              </p>
              <div className="mt-4 flex items-center gap-2 text-[11px] font-mono text-neutral-400">
                <span>Modality: Bi-Temporal T1/T2 Passes</span>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-900 hover:border-neutral-800 transition-colors">
              <div className="text-sm font-medium text-white tracking-tight">Critical Infrastructure Auditing</div>
              <p className="text-xs text-neutral-400 font-light mt-2 leading-relaxed">
                High-resolution object localization. Counts commercial aircraft on airport aprons, measures petroleum tank roof heights, and tracks rail yards.
              </p>
              <div className="mt-4 flex items-center gap-2 text-[11px] font-mono text-neutral-400">
                <span>Modality: Sub-meter High-Res Optical</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

export default ProjectDeepDive;
