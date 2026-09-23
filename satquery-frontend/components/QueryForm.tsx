"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { 
  Upload, 
  X, 
  Image as ImageIcon, 
  Map, 
  Layers, 
  Search, 
  Loader2, 
  Satellite,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

export type InputType = "single" | "bitemporal" | "optical_sar";

export interface QueryFormProps {
  onSubmit: (data: {
    question: string;
    input_type: InputType;
    files: Record<string, File>;
  }) => void;
  isLoading?: boolean;
  presetQuestion?: string;
  presetInputType?: InputType;
}

const INPUT_TYPE_CONFIG: Record<InputType, { label: string; description: string; icon: React.ReactNode; fields: string[] }> = {
  single: {
    label: "Single Image",
    description: "Visual Question Answering & Object Grounding on an optical scene",
    icon: <ImageIcon className="w-4 h-4" />,
    fields: ["image_single"],
  },
  bitemporal: {
    label: "Bi-temporal (T1/T2)",
    description: "Compare baseline & post-event passes for differential change detection",
    icon: <Map className="w-4 h-4" />,
    fields: ["image_t1", "image_t2"],
  },
  optical_sar: {
    label: "Optical + SAR Fusion",
    description: "Multi-sensor analysis combining spectral imagery with radar backscatter",
    icon: <Layers className="w-4 h-4" />,
    fields: ["image_optical", "image_sar"],
  },
};

const FIELD_LABELS: Record<string, string> = {
  image_single: "Optical Satellite Scene (0.5m GSD)",
  image_t1: "Pass 1: Baseline Scene (T1)",
  image_t2: "Pass 2: Subsequent Scene (T2)",
  image_optical: "Optical Spectrum Pass (RGB/NIR)",
  image_sar: "SAR Radar Backscatter (Sentinel-1 VV/VH)",
};

// Stock satellite scenes from Unsplash
const STOCK_SATELLITE_ASSETS: Record<string, { url: string; fallbackLabel: string }> = {
  image_single: {
    url: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=1000&q=80",
    fallbackLabel: "Optical_Tarmac_Satellite.png",
  },
  image_t1: {
    url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80",
    fallbackLabel: "Temporal_Pass_T1_PreEvent.png",
  },
  image_t2: {
    url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1000&q=80",
    fallbackLabel: "Temporal_Pass_T2_PostEvent.png",
  },
  image_optical: {
    url: "https://images.unsplash.com/photo-1524334228333-0f6db392f8a1?auto=format&fit=crop&w=1000&q=80",
    fallbackLabel: "Optical_Pass_Sentinel2.png",
  },
  image_sar: {
    url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1000&q=80",
    fallbackLabel: "SAR_Backscatter_Sentinel1.png",
  },
};

const SAMPLE_QUESTIONS: Record<InputType, string[]> = {
  single: [
    "Identify and count aircraft or vehicles visible on the tarmac.",
    "Describe the predominant land cover and identify water bodies in this scene.",
    "Locate commercial storage tanks and assess their roof conditions.",
  ],
  bitemporal: [
    "Identify floodwater expansion or inundation between T1 and T2 passes.",
    "Detect new construction and infrastructure development between the two dates.",
    "Quantify loss of forest or vegetative canopy between T1 and T2.",
  ],
  optical_sar: [
    "Detect metallic vessels and ship traffic through the cloud cover using SAR.",
    "Fuse SAR surface roughness with optical vegetation indices.",
    "Assess road passability and standing water using radar penetration.",
  ],
};

/** Generates a quick synthetic satellite image fallback blob if network fetch is blocked */
function createSyntheticSatelliteBlob(title: string): Blob {
  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 480;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const grad = ctx.createLinearGradient(0, 0, 640, 480);
    grad.addColorStop(0, "#0a0a0a");
    grad.addColorStop(0.5, "#000000");
    grad.addColorStop(1, "#111111");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 640, 480);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    for (let i = 0; i < 640; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 480);
      ctx.stroke();
    }
    for (let j = 0; j < 480; j += 40) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(640, j);
      ctx.stroke();
    }

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 18px monospace";
    ctx.fillText(`SAT-OBS: ${title.toUpperCase()}`, 30, 50);
    ctx.fillStyle = "#666666";
    ctx.font = "14px monospace";
    ctx.fillText("LAT: 37\u00B046'29\"N | LON: 122\u00B025'10\"W | BAND: B04/B03/B02", 30, 80);

    ctx.fillStyle = "rgba(255, 255, 255, 0.1)";
    ctx.strokeStyle = "rgba(255, 255, 255, 0.3)";
    ctx.lineWidth = 2;
    ctx.fillRect(180, 160, 140, 90);
    ctx.strokeRect(180, 160, 140, 90);
    ctx.fillRect(360, 220, 160, 110);
    ctx.strokeRect(360, 220, 160, 110);
  }

  const dataUrl = canvas.toDataURL("image/png");
  const byteString = atob(dataUrl.split(",")[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: "image/png" });
}

export function QueryForm({ onSubmit, isLoading, presetQuestion, presetInputType }: QueryFormProps) {
  const [inputType, setInputType] = useState<InputType>(presetInputType || "single");
  const [question, setQuestion] = useState(presetQuestion || "");
  const [files, setFiles] = useState<Record<string, File>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [loadingSample, setLoadingSample] = useState(false);

  useEffect(() => {
    if (presetQuestion) {
      setQuestion(presetQuestion);
    }
    if (presetInputType) {
      setInputType(presetInputType);
    }
  }, [presetQuestion, presetInputType]);

  const config = INPUT_TYPE_CONFIG[inputType];

  const onDrop = useCallback(
    (field: string) => (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setFiles((prev) => ({ ...prev, [field]: file }));
        setPreviews((prev) => ({ ...prev, [field]: URL.createObjectURL(file) }));
      }
    },
    []
  );

  const removeFile = (field: string) => {
    if (previews[field]) {
      URL.revokeObjectURL(previews[field]);
    }
    setFiles((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setPreviews((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleLoadSampleAssets = async () => {
    setLoadingSample(true);
    try {
      const newFiles: Record<string, File> = { ...files };
      const newPreviews: Record<string, string> = { ...previews };

      for (const field of config.fields) {
        const asset = STOCK_SATELLITE_ASSETS[field];
        if (!asset) continue;

        try {
          const res = await fetch(asset.url, { mode: "cors" });
          if (!res.ok) throw new Error("Fetch failed");
          const blob = await res.blob();
          const file = new File([blob], asset.fallbackLabel, { type: blob.type || "image/jpeg" });
          newFiles[field] = file;
          newPreviews[field] = URL.createObjectURL(file);
        } catch {
          const blob = createSyntheticSatelliteBlob(FIELD_LABELS[field] || field);
          const file = new File([blob], asset.fallbackLabel, { type: "image/png" });
          newFiles[field] = file;
          newPreviews[field] = URL.createObjectURL(file);
        }
      }

      setFiles(newFiles);
      setPreviews(newPreviews);

      if (!question.trim()) {
        const samples = SAMPLE_QUESTIONS[inputType];
        setQuestion(samples[0]);
      }
    } finally {
      setLoadingSample(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const requiredFields = config.fields;
    const missing = requiredFields.filter((f) => !files[f]);
    if (missing.length > 0 || !question.trim()) return;
    onSubmit({ question, input_type: inputType, files });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Mode Selector Tabs */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <Label className="text-sm font-semibold text-neutral-200">Analysis Mode</Label>
          <button
            type="button"
            onClick={handleLoadSampleAssets}
            disabled={loadingSample || isLoading}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-400 hover:text-white transition-colors disabled:opacity-50"
          >
            {loadingSample ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Download className="w-3.5 h-3.5" />
            )}
            <span>Load Sample Imagery</span>
          </button>
        </div>

        <Tabs 
          defaultValue={inputType} 
          onValueChange={(v: string) => {
            setInputType(v as InputType);
          }} 
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 bg-neutral-950 p-1 border border-neutral-800 rounded-xl h-auto">
            {(Object.keys(INPUT_TYPE_CONFIG) as InputType[]).map((type) => (
              <TabsTrigger 
                key={type} 
                value={type} 
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-medium transition-all data-[state=active]:bg-neutral-800 data-[state=active]:text-white data-[state=active]:border data-[state=active]:border-neutral-700"
              >
                {INPUT_TYPE_CONFIG[type].icon}
                <span className="hidden sm:inline">{INPUT_TYPE_CONFIG[type].label}</span>
                <span className="sm:hidden">{type.toUpperCase()}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={inputType} className="pt-2">
            <p className="text-xs text-neutral-500 flex items-center gap-1.5">
              <Satellite className="w-3.5 h-3.5 text-neutral-600" />
              <span>{config.description}</span>
            </p>
          </TabsContent>
        </Tabs>
      </div>

      {/* Image Upload Dropzones */}
      <div className="space-y-4">
        {config.fields.map((field) => (
          <div key={field} className="space-y-1.5">
            <Label className="text-xs font-medium text-neutral-400 flex items-center justify-between">
              <span>{FIELD_LABELS[field]}</span>
              {files[field] && (
                <span className="text-[11px] text-neutral-500 font-mono">
                  {files[field].name} ({(files[field].size / 1024).toFixed(0)} KB)
                </span>
              )}
            </Label>
            <div className="relative">
              <DropzoneField
                field={field}
                onDrop={onDrop(field)}
                file={files[field]}
                preview={previews[field]}
                onRemove={() => removeFile(field)}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Question Input */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="question" className="text-sm font-semibold text-neutral-200">
            Natural Language Query
          </Label>
          <span className="text-[11px] text-neutral-600">English plain-language</span>
        </div>

        <Textarea
          id="question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g., Identify aircraft on runway / Analyze flood zone changes / Detect vessels through clouds with SAR"
          rows={3}
          disabled={isLoading}
          className="bg-neutral-950 border-neutral-800 text-neutral-100 placeholder:text-neutral-600 focus-visible:ring-neutral-600 rounded-xl resize-none text-sm"
        />

        {/* Quick query chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-[11px] text-neutral-600">Suggestions:</span>
          {SAMPLE_QUESTIONS[inputType].map((sample, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setQuestion(sample)}
              className="text-[11px] text-neutral-500 hover:text-white bg-neutral-950 hover:bg-neutral-900 border border-neutral-800 hover:border-neutral-700 px-2.5 py-1 rounded-full transition-colors text-left truncate max-w-[280px]"
              title={sample}
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <Button 
        type="submit" 
        size="lg" 
        className="w-full bg-white hover:bg-neutral-200 text-black font-semibold shadow-lg rounded-xl transition-all" 
        disabled={isLoading || config.fields.some((f) => !files[f]) || !question.trim()}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing through multi-agent pipeline...
          </>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            Analyze Satellite Imagery
          </>
        )}
      </Button>

      {/* Status note */}
      {config.fields.some((f) => !files[f]) && (
        <p className="text-[11px] text-center text-neutral-600">
          Upload required satellite imagery or click &quot;Load Sample Imagery&quot; above to test.
        </p>
      )}
    </form>
  );
}

interface DropzoneFieldProps {
  field: string;
  onDrop: (files: File[]) => void;
  file?: File;
  preview?: string;
  onRemove: () => void;
}

function DropzoneField({ field, onDrop, file, preview, onRemove }: DropzoneFieldProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".png", ".jpg", ".jpeg", ".tif", ".tiff"] },
    maxFiles: 1,
    noClick: false,
    noKeyboard: false,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative border-2 border-dashed rounded-xl p-4 transition-all duration-200 cursor-pointer",
        isDragActive
          ? "border-white/40 bg-white/5 shadow-lg"
          : preview
          ? "border-neutral-800 bg-neutral-950 p-2"
          : "border-neutral-800 bg-neutral-950 hover:border-neutral-700 hover:bg-neutral-900/40"
      )}
    >
      <input {...getInputProps()} />
      {preview ? (
        <div className="relative aspect-video max-h-[180px] rounded-lg overflow-hidden border border-neutral-800 group">
          <img src={preview} alt={field} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300" />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="text-xs text-white bg-neutral-900/80 px-2.5 py-1 rounded-full border border-neutral-700">
              Click or drag to replace
            </span>
          </div>
          <button
            type="button"
            onClick={(e) => { 
              e.preventDefault(); 
              e.stopPropagation(); 
              onRemove(); 
            }}
            className="absolute top-2 right-2 rounded-full bg-neutral-900/80 border border-neutral-700 p-1.5 hover:bg-red-950 hover:border-red-800 text-neutral-300 hover:text-red-300 transition-colors z-10"
            aria-label="Remove image"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-5">
          <div className="p-3 rounded-full bg-neutral-900 border border-neutral-800 mb-2.5 text-neutral-500">
            <Upload className="h-5 w-5" />
          </div>
          <p className="text-xs sm:text-sm font-medium text-neutral-400">
            Click or drag & drop satellite scene
          </p>
          <p className="text-[11px] text-neutral-600 mt-1">
            PNG, JPG, TIFF (up to 50MB)
          </p>
        </div>
      )}
    </div>
  );
}

export default QueryForm;