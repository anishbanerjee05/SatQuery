"use client";

import React from "react";
import { 
  Image as ImageIcon, 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  ShieldCheck,
  ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface ResultsProps {
  answer: string;
  evidenceImageUrl: string | null;
  confidence: number | null;
  detectedTask: "vqa" | "change_detection" | "grounding" | "fusion";
  trace: Array<{ node: string; summary: string }>;
  queryId: string;
}

const TASK_LABELS: Record<string, string> = {
  vqa: "Visual QA",
  change_detection: "Bi-Temporal Change",
  grounding: "Object Grounding",
  fusion: "Optical+SAR Fusion",
};

const TASK_ICONS: Record<string, React.ReactNode> = {
  vqa: <ImageIcon className="w-3.5 h-3.5" />,
  change_detection: <Target className="w-3.5 h-3.5" />,
  grounding: <Target className="w-3.5 h-3.5" />,
  fusion: <ImageIcon className="w-3.5 h-3.5" />,
};

export function Results({ answer, evidenceImageUrl, confidence, detectedTask, trace, queryId }: ResultsProps) {
  const [expandedTrace, setExpandedTrace] = React.useState(true);

  const confidenceColor = confidence !== null
    ? confidence >= 0.7 ? "text-white" : confidence >= 0.4 ? "text-neutral-400" : "text-red-400"
    : "text-neutral-500";

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card className="border border-neutral-800 bg-neutral-950 shadow-xl shadow-black/40">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-neutral-900 border border-neutral-800 text-white">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-white tracking-tight">Intelligence Report</CardTitle>
              <span className="text-xs font-mono text-neutral-600">Query ID: {queryId.slice(0, 8)}...</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="gap-1.5 border-neutral-700 bg-neutral-900 text-neutral-300 font-medium py-1">
              {TASK_ICONS[detectedTask]} {TASK_LABELS[detectedTask]}
            </Badge>

            {confidence !== null && (
              <div className="flex items-center gap-2.5 bg-neutral-900 px-3 py-1.5 rounded-full border border-neutral-800">
                <ShieldCheck className={cn("w-4 h-4", confidenceColor)} />
                <span className={cn("text-xs font-mono font-bold", confidenceColor)}>
                  {(confidence * 100).toFixed(0)}%
                </span>
                <Progress value={confidence * 100} className="w-20 h-1.5 bg-neutral-800" />
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6 pt-6">
          {/* Main Answer Text */}
          <div className="rounded-xl bg-black border border-neutral-800 p-5">
            <h4 className="text-xs font-mono uppercase tracking-wider text-neutral-500 mb-2.5 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-neutral-400" />
              <span>Synthesized Answer</span>
            </h4>
            <div className="prose prose-invert prose-sm max-w-none text-neutral-300 leading-relaxed font-sans">
              <p className="whitespace-pre-wrap">{answer}</p>
            </div>
          </div>

          {/* Visual Evidence Image */}
          {evidenceImageUrl && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-neutral-400" />
                  <span>Grounding & Evidence Overlay</span>
                </h4>
                <a
                  href={evidenceImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-neutral-500 hover:text-white flex items-center gap-1"
                >
                  <span>Full Resolution</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="relative aspect-video max-h-[520px] rounded-xl overflow-hidden border border-neutral-800 bg-black shadow-lg">
                <img
                  src={evidenceImageUrl}
                  alt="Evidence visualization"
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
            </div>
          )}

          {/* Execution Trace Accordion */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between border-t border-neutral-800 pt-4">
              <h4 className="text-sm font-semibold text-neutral-200 flex items-center gap-2">
                <Target className="h-4 w-4 text-neutral-400" />
                <span>Execution Trace</span>
                <span className="text-xs text-neutral-600 font-mono">({trace.length} nodes)</span>
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpandedTrace(!expandedTrace)}
                className="gap-1.5 text-xs text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg"
              >
                {expandedTrace ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                {expandedTrace ? "Hide Trace" : "Show Trace"}
              </Button>
            </div>

            {expandedTrace && (
              <div className="space-y-2.5">
                {trace.map((step, index) => (
                  <div 
                    key={index} 
                    className="flex items-start gap-3 p-3 rounded-xl bg-black border border-neutral-800 hover:border-neutral-700 transition-colors"
                  >
                    <div className="flex items-center justify-center w-7 h-7 rounded-full bg-neutral-900 border border-neutral-700 text-white text-xs font-mono font-bold mt-0.5">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-xs text-neutral-300 uppercase tracking-wide font-mono">
                          {step.node.replace("_", " ")}
                        </p>
                      </div>
                      <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{step.summary}</p>
                    </div>
                    {step.node === "validation" && confidence !== null && confidence < 0.5 && (
                      <AlertTriangle className="h-4 w-4 text-neutral-500 flex-shrink-0 mt-0.5" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default Results;