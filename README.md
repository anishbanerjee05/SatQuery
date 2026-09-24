# SatQuery

Agentic satellite imagery analysis platform. Ask plain-language questions about earth observation scenes and receive structured answers accompanied by visual evidence, spatial bounding boxes, and confidence metrics.

Designed for intelligence analysts, environmental researchers, disaster response coordinators, and geospatial developers who need fast, automated visual inspection across optical and radar satellite data without complex GIS software.

---

## Core Value Proposition

- Conversational Geospatial Intelligence: Ask complex natural-language questions directly against high-resolution satellite scenes.
- Multi-Sensor Flexibility: Process single-timestamp optical scenes, multi-temporal observation pairs, or combined optical and synthetic aperture radar (SAR) imagery.
- Structured Evidence: Every answer includes direct visual inspection artifacts, normalized bounding coordinates, and confidence assessments.
- Agentic Automation: Built on LangGraph state graphs that dynamically route requests to task-specific analytical specialists.
- Zero Proprietary Lock-In: Integrates with open foundation vision-language models via OpenRouter with automatic provider fallback.

---
## Query Capability Matrix

SatQuery supports three analytical modalities depending on the sensor payload and temporal dimensions of your task:

| Query Mode | Input Required | Primary Use Cases | Generated Output Evidence |
| :--- | :--- | :--- | :--- |
| **single** | 1 Satellite Image (Optical RGB) | Visual Question Answering (VQA), detailed scene captioning, spatial object detection, infrastructure counting | Normalized bounding boxes `[ymin, xmin, ymax, xmax]`, object labels, confidence score |
| **bitemporal** | 2 Images (Timestamp T1, Timestamp T2) | Environmental change detection, flood inundation tracking, urban expansion, post-disaster damage assessment | Pixel difference heatmap, highlighted regions of change, comparative textual summary |
| **optical_sar** | 2 Images (1 Optical RGB, 1 SAR Amplitude) | All-weather maritime surveillance, cloud penetration, flood delineation through storm cover, foliage-penetrating asset tracking | Multi-band fused RGB composite, structural edge overlays, combined optical-radar narrative |

---

## End-to-End System Architecture

```
+-------------------------------------------------------------------------+
|                        Next.js 14 Frontend                              |
|   - Interactive Command Center & Geospatial Chat Interface              |
|   - Real-time Multi-Sensor Image Uploaders (Optical, T1/T2, SAR)        |
|   - Canvas Bounding Box Overlays & Bi-temporal Comparison Slider        |
+------------------------------------+------------------------------------+
                                     |
                                     | REST API (Multipart Form-Data)
                                     v
+-------------------------------------------------------------------------+
|                         FastAPI Backend                                 |
|  +--------------------+  +--------------------+  +--------------------+ |
|  | Authentication &   |  | Storage Service    |  | Database Layer     | |
|  | Session Manager    |  | (Cloudflare R2 /   |  | (PostgreSQL /      | |
|  |                    |  |  Local Uploads)    |  |  SQLite Fallback)  | |
|  +--------------------+  +--------------------+  +--------------------+ |
|                                    |                                    |
|                                    v                                    |
|  +--------------------------------------------------------------------+ |
|  |                     LangGraph Agent Workflow Engine                | |
|  |                                                                    | |
|  |   [Router] ---> [Preprocess] ---> [Specialist Node]                | |
|  |                                          |                         | |
|  |                                          v                         | |
|  |   [Output Formatter] <----------- [Validation]                     | |
|  +---------------------------------+----------------------------------+ |
+------------------------------------+------------------------------------+
                                     |
                                     | HTTPS (Vision-Language Inference)
                                     v
+-------------------------------------------------------------------------+
|                       OpenRouter AI Gateway                             |
|   - Primary: google/gemini-2.0-flash-lite-001 (Fast Multi-Modal VLM)    |
|   - Fallback 1: meta-llama/llama-3.2-11b-vision-instruct:free           |
|   - Fallback 2: google/gemini-2.0-pro-exp-02-05:free                   |
+-------------------------------------------------------------------------+
```

---

