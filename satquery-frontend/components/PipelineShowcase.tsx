"use client";

import React, { useState } from "react";
import { GlowCard } from "@/components/ui/spotlight-card";
import { LiquidButton } from "@/components/ui/liquid-glass-button";
import { 
  Image as ImageIcon, 
  Map, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck,
} from "lucide-react";

export type PipelineMode = "single" | "bitemporal" | "optical_sar";

interface PipelineStep {
  name: string;
  node: string;
  desc: string;
  detail: string;
}

interface WorkflowExample {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  badge: string;
  sampleQuestion: string;
  sampleInputDescription: string;
  steps: PipelineStep[];
  expectedOutput: {
    answer: string;
    confidence: number;
    detectedTask: string;
    traceSummary: string[];
  };
}

const WORKFLOWS: Record<PipelineMode, WorkflowExample> = {
  single: {
    title: "Single Image Intelligence",
    subtitle: "VQA, Grounding & Object Localisation",
    icon: <ImageIcon className="w-5 h-5 text-white" />,
    badge: "1 Optical Scene",
    sampleQuestion: "Count aircraft parked on tarmac and detect runway surface condition.",
    sampleInputDescription: "High-resolution optical scene (0.5m GSD RGB)",
    steps: [
      {
        name: "Input & Ingestion",
        node: "api/routes_query",
        desc: "Upload validation & storage allocation",
        detail: "Allocates query UUID, uploads optical scene, extracts image dimensions.",
      },
      {
        name: "Agent Router",
        node: "router_node",
        desc: "Classifies question intent & selects specialist",
        detail: "Determined intent: 'grounding' / 'vqa' based on question keywords.",
      },
      {
        name: "Preprocessing",
        node: "preprocess_node",
        desc: "Normalizes dynamic range & aspect ratio",
        detail: "Standardizes image resolution for multi-modal VLM ingestion.",
      },
      {
        name: "Specialist Reasoning",
        node: "grounding_node",
        desc: "Zero-shot visual grounding & VLM reasoning",
        detail: "Identifies target objects, estimates bounding box coordinates [ymin, xmin, ymax, xmax].",
      },
      {
        name: "Validation & Evidence",
        node: "validation_node",
        desc: "Confidence calibration & bounding box verification",
        detail: "Validates coordinate bounding within [0..1000] and checks heuristic confidence.",
      },
      {
        name: "Output Formatter",
        node: "output_formatter_node",
        desc: "Constructs markdown response & execution trace",
        detail: "Synthesizes final answer with highlighted targets and step-by-step trace.",
      },
    ],
    expectedOutput: {
      answer: "Detected 4 commercial airliners on the northern apron (bounding boxes [0.24, 0.41, 0.38, 0.52]). Runway surface appears clear with no debris or standing water.",
      confidence: 0.94,
      detectedTask: "grounding",
      traceSummary: [
        "Router: Identified task as grounding",
        "Preprocess: Normalized optical input (1024x1024)",
        "Grounding: Extracted 4 object coordinates",
        "Validation: High confidence score (0.94) verified",
      ],
    },
  },
  bitemporal: {
    title: "Bi-Temporal Change Detection",
    subtitle: "T1 vs T2 Differential Analysis",
    icon: <Map className="w-5 h-5 text-white" />,
    badge: "2 Temporal Passes",
    sampleQuestion: "Analyze flood water inundation between pre-monsoon and post-monsoon imagery.",
    sampleInputDescription: "Registered pre-event (T1) and post-event (T2) scenes",
    steps: [
      {
        name: "Dual Ingestion",
        node: "api/routes_query",
        desc: "Ingests T1 (Baseline) and T2 (Comparison)",
        detail: "Verifies matching spatial reference systems and temporal order.",
      },
      {
        name: "Agent Router",
        node: "router_node",
        desc: "Dispatches to Change Detection specialist",
        detail: "Triggers bi-temporal comparison mode in the state machine.",
      },
      {
        name: "Differencing Node",
        node: "preprocess_node",
        desc: "Computes pixel-wise difference map",
        detail: "Generates absolute difference matrix and highlighted change mask preview.",
      },
      {
        name: "Change Specialist",
        node: "change_detection_node",
        desc: "Semantic change interpretation via VLM",
        detail: "Distinguishes seasonal vegetation variance from actual floodwater inundation.",
      },
      {
        name: "Validation & Audit",
        node: "validation_node",
        desc: "Audit check on false-positive cloud shadows",
        detail: "Cross-checks reflectance thresholds and flags confidence level.",
      },
      {
        name: "Output Synthesis",
        node: "output_formatter_node",
        desc: "Generates quantitative change summary",
        detail: "Outputs estimated inundated acreage, critical infrastructure impact, and trace.",
      },
    ],
    expectedOutput: {
      answer: "Bi-temporal comparison indicates ~14.2% land surface inundation in the river basin between T1 and T2. Agricultural zones to the east are severely affected, while residential levees held intact.",
      confidence: 0.89,
      detectedTask: "change_detection",
      traceSummary: [
        "Router: Bi-temporal input confirmed",
        "Differencing: 14.2% pixel shift detected",
        "Specialist: Water spectrum signature matched",
        "Validation: Cloud shadow false positives ruled out",
      ],
    },
  },
  optical_sar: {
    title: "Optical + SAR Multi-Modal Fusion",
    subtitle: "All-Weather Spectral & Radar Synergy",
    icon: <Layers className="w-5 h-5 text-white" />,
    badge: "Optical + SAR Pair",
    sampleQuestion: "Assess maritime shipping activity through persistent cloud cover.",
    sampleInputDescription: "Sentinel-2 Optical (clouded) + Sentinel-1 SAR (VV/VH backscatter)",
    steps: [
      {
        name: "Multi-Sensor Ingestion",
        node: "api/routes_query",
        desc: "Ingests optical RGB bands and SAR polarimetric matrix",
        detail: "Extracts radar backscatter intensity (dB) alongside optical imagery.",
      },
      {
        name: "Agent Router",
        node: "router_node",
        desc: "Identifies multi-modal fusion requirement",
        detail: "Directs query to specialized sensor fusion graph branch.",
      },
      {
        name: "SAR Preprocessing",
        node: "preprocess_node",
        desc: "Despeckling & radiometric calibration",
        detail: "Applies Lee filter to mitigate radar speckle noise and normalizes intensity.",
      },
      {
        name: "Fusion Specialist",
        node: "fusion_node",
        desc: "Cross-modal attention reasoning",
        detail: "Leverages SAR penetration for cloud-piercing metal vessel returns + optical shoreline context.",
      },
      {
        name: "Validation Node",
        node: "validation_node",
        desc: "Confidence weighting between modalities",
        detail: "Weights radar higher in cloud-covered quadrants and optical in clear zones.",
      },
      {
        name: "Final Intelligence Report",
        node: "output_formatter_node",
        desc: "Comprehensive fused operational picture",
        detail: "Delivers composite detection coordinates with sensor contribution breakdown.",
      },
    ],
    expectedOutput: {
      answer: "SAR backscatter successfully penetrated 85% stratus cloud cover, detecting 7 high-reflectance metallic vessels in the anchorage zone. Optical data corroborated calm sea state outside cloud bank.",
      confidence: 0.92,
      detectedTask: "fusion",
      traceSummary: [
        "Router: Dispatched to fusion specialist",
        "SAR Preprocessing: Lee filter applied",
        "Fusion Node: Detected 7 double-bounce radar targets",
        "Validation: High metallic signature confidence (0.92)",
      ],
    },
  },
};

interface PipelineShowcaseProps {
  onSelectSample?: (sample: { question: string; input_type: PipelineMode }) => void;
}

export function PipelineShowcase({ onSelectSample }: PipelineShowcaseProps) {
  const [activeMode, setActiveMode] = useState<PipelineMode>("single");
  const workflow = WORKFLOWS[activeMode];

  return (
    <section id="pipeline" className="py-20 px-4 sm:px-6 lg:px-8 border-t border-neutral-900 bg-black">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-5xl font-light tracking-[-0.03em] text-white">
            How SatQuery Classifies & Executes Queries
          </h2>
          <p className="mt-4 text-neutral-400 font-light text-base sm:text-lg leading-relaxed">
            Our multi-agent pipeline routes queries dynamically across specialized vision-language models,
            heuristic diff algorithms, and multi-sensor fusion graphs.
          </p>
        </div>


        {/* Mode Selector Tabs using GlowCard */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10 max-w-4xl mx-auto">
          {(Object.keys(WORKFLOWS) as PipelineMode[]).map((mode) => {
            const item = WORKFLOWS[mode];
            const isActive = activeMode === mode;
            return (
              <GlowCard
                key={mode}
                glowColor={isActive ? "blue" : "purple"}
                customSize
                className={`cursor-pointer transition-all !aspect-auto !p-0 ${
                  isActive ? "ring-1 ring-white/20" : "opacity-70 hover:opacity-100"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setActiveMode(mode)}
                  className="flex items-center gap-3.5 p-4 w-full text-left"
                >
                  <div className="p-2.5 rounded-lg border border-neutral-700 bg-neutral-900">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-sm font-semibold tracking-tight text-white">
                      {item.title}
                    </div>
                    <div className="text-xs text-neutral-500 mt-0.5">{item.badge}</div>
                  </div>
                </button>
              </GlowCard>
            );
          })}
        </div>

        {/* Pipeline Details Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Step-by-Step Flow */}
          <div className="lg:col-span-7 bg-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8">
            <div className="flex items-center justify-between pb-6 border-b border-neutral-800">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-neutral-500">Pipeline Workflow</span>
                <h3 className="text-xl font-bold text-white mt-1">{workflow.title}</h3>
                <p className="text-xs text-neutral-500 mt-1">{workflow.subtitle}</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full border border-neutral-700 bg-neutral-900 text-neutral-400 font-medium">
                {workflow.badge}
              </span>
            </div>

            {/* Stepper list */}
            <div className="mt-6 space-y-4">
              {workflow.steps.map((step, idx) => (
                <div
                  key={idx}
                  className="group relative flex items-start gap-4 p-3.5 rounded-xl border border-neutral-800 bg-black hover:border-neutral-700 transition-colors"
                >
                  <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-neutral-900 border border-neutral-700 text-xs font-mono font-bold text-white mt-0.5">
                    {idx + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-neutral-200">{step.name}</span>
                      <span className="text-[11px] font-mono text-neutral-600 bg-neutral-900 px-2 py-0.5 rounded border border-neutral-800">
                        {step.node}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-0.5">{step.desc}</p>
                    <p className="text-[11px] text-neutral-600 mt-1 leading-normal">{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Mock Execution Trace & Sample Output */}
          <div className="lg:col-span-5 space-y-6">
            {/* Sample Input Card */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-500 mb-3">
                <span>Example Query & Spec</span>
              </div>
              <div className="p-3.5 rounded-xl bg-black border border-neutral-800 text-sm text-neutral-300 font-medium italic">
                &ldquo;{workflow.sampleQuestion}&rdquo;
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
                <span>Input Modality:</span>
                <span className="text-neutral-400 font-mono">{workflow.sampleInputDescription}</span>
              </div>

              {onSelectSample && (
                <div className="mt-4">
                  <LiquidButton
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      onSelectSample({
                        question: workflow.sampleQuestion,
                        input_type: activeMode,
                      });
                      const el = document.getElementById("command-center");
                      if (el) el.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Use This Sample in Command Center
                  </LiquidButton>
                </div>
              )}
            </div>

            {/* Expected Result Preview */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-neutral-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Agent Output Preview</span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-300 bg-neutral-900 px-2.5 py-0.5 rounded-full border border-neutral-700">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{(workflow.expectedOutput.confidence * 100).toFixed(0)}% Confidence</span>
                </div>
              </div>

              <div className="text-sm text-neutral-400 leading-relaxed bg-black p-4 rounded-xl border border-neutral-800">
                {workflow.expectedOutput.answer}
              </div>

              {/* Execution Trace Snippet */}
              <div className="mt-4 pt-4 border-t border-neutral-800">
                <span className="text-xs font-mono text-neutral-600 block mb-2">Verified Trace Audit:</span>
                <div className="space-y-1.5 font-mono text-[11px] text-neutral-500">
                  {workflow.expectedOutput.traceSummary.map((t, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-neutral-600">{idx + 1}.</span>
                      <span>{t}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PipelineShowcase;
