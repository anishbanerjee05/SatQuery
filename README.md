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

## LangGraph Agent Workflow

SatQuery executes queries through a stateful graph where each node transforms a shared `AgentState` object:

```
                  +-------------------+
                  |   Incoming Query  |
                  +---------+---------+
                            |
                            v
                  +-------------------+
                  |    Router Node    |
                  +---------+---------+
                            |
                            v
                  +-------------------+
                  |  Preprocess Node  |
                  +---------+---------+
                            |
           +----------------+----------------+
           |                |                |                |
           v                v                v                v
     +-----------+    +-----------+    +-----------+    +-----------+
     |   VQA &   |    |  Change   |    | Spatial   |    | Optical-  |
     |Captioning |    | Detection |    | Grounding |    |SAR Fusion |
     +-----+-----+    +-----+-----+    +-----+-----+    +-----+-----+
           |                |                |                |
           +----------------+----------------+----------------+
                            |
                            v
                  +-------------------+
                  |  Validation Node  |
                  +---------+---------+
                            |
                            v
                  +-------------------+
                  | Output Formatter  |
                  +---------+---------+
                            |
                            v
                  +-------------------+
                  |   Final Response  |
                  +-------------------+
```

### Shared State Attributes

The graph state maintains the following fields across execution:

- `question` (str): Natural language inquiry submitted by the user.
- `input_type` (str): Declared modality (`single`, `bitemporal`, or `optical_sar`).
- `detected_task` (str): Routing classification determined by the Router node (`vqa`, `change_detection`, `grounding`, or `fusion`).
- `image_urls` (dict): URLs pointing to uploaded image assets (`single`, `t1`, `t2`, `optical`, `sar`).
- `image_metadata` (dict): Extracted dimensions, color channels, and file format information.
- `specialist_output` (dict): Raw text answers, bounding boxes, or difference metrics produced by the specialist.
- `validation_result` (dict): Quality checks, confidence heuristic scores, and warnings.
- `formatted_response` (dict): Final structured response payload matched to the Pydantic schema.

---

### Node 1: Router

The Router node classifies incoming requests into specialist pipelines using a combination of declared input modality and question semantics:

- Modality Overrides: If `input_type == "bitemporal"`, the task automatically maps to `change_detection`. If `input_type == "optical_sar"`, the task maps to `fusion`.
- Keyword & Intent Analysis: For single-image inputs, the query is analyzed for spatial location keywords (such as "where is", "locate", "find", "detect", "bounding box"). Presence of spatial keywords routes to `grounding`; general descriptive inquiries route to `vqa_captioning`.
- Deterministic Execution: Fallbacks ensure unresolvable queries default safely to the VQA pipeline rather than throwing exceptions.

---

### Node 2: Preprocess

The Preprocess node prepares satellite imagery for downstream multimodal vision-language consumption:

- Aspect-Ratio Resizing: Normalizes ultra-high-resolution aerial frames down to standard processing resolutions (max 1024x1024) while preserving aspect ratios to prevent geospatial distortion.
- Format Validation: Checks uploaded buffers for valid JPEG, PNG, or TIFF headers; converts grayscale single-channel arrays into standard RGB representations.
- Metadata Extraction: Computes width, height, aspect ratio, and channel depth stored in `image_metadata`.
- Synthetic Fallback Generator: If no image payload is provided (e.g. during headless automated test runs), the preprocessor generates an aligned synthetic Earth observation scene with satellite coordinate grids to keep the pipeline executable.

---

### Node 3A: VQA & Scene Captioning Specialist

Handles general analytical questions, land-cover classification queries, and holistic scene descriptions:

- Visual Question Answering: Evaluates questions such as "What type of agricultural patterns are visible?" or "Estimate the percentage of cloud cover over the harbor."
- Chain-of-Thought Inspection: Prompts vision-language models to structure answers into observation, analysis, and conclusion sections.
- Metric Extraction: Identifies quantitative details mentioned in the scene (such as estimated vessel counts, road densities, or vegetation health indices).

---

### Node 3B: Bi-temporal Change Detection Engine

Specialized for comparing two temporal observations of the same geographic footprint across time:

- Difference Calculation: Computes pixel-wise absolute difference maps between normalized image arrays at T1 and T2:
  `diff_map = |Image_T2 - Image_T1|`
- Change Mask Generation: Thresholds significant difference clusters and calculates the percentage of surface alteration across the scene footprint.
- Comparative Narrative: The vision-language model evaluates both images side-by-side alongside the calculated difference map to describe specific changes (e.g. newly paved road corridors, deforested clearings, building construction, or seasonal water body shrinkage).

---

### Node 3C: Spatial Visual Grounding

Identifies specific physical features and objects within the scene and returns normalized bounding box coordinates:

- Normalized Coordinate Format: Returns bounding boxes in standardized `[ymin, xmin, ymax, xmax]` float values scaled between `0.0` and `1.0`:
  - `ymin`: Top edge coordinate normalized to image height.
  - `xmin`: Left edge coordinate normalized to image width.
  - `ymax`: Bottom edge coordinate normalized to image height.
  - `xmax`: Right edge coordinate normalized to image width.
- Resolution-Independent Scaling: Coordinates render dynamically on the frontend canvas regardless of display screen DPI or container resizing.
- Multi-Class Tagging: Accompanies every bounding box with a specific object classification label (e.g. `storage_tank`, `runway`, `vessel`, `bridge`, `crane`) and detected confidence.

---

### Node 3D: Optical-SAR Multimodal Fusion

Bridges complementary remote sensing physics across visible and microwave spectra:

- Optical Strengths: Provides rich spectral color, surface texture, and optical reflectance under daylight and clear-sky conditions.
- SAR Strengths: Synthetic Aperture Radar microwave pulses penetrate cloud layers, haze, and darkness, reflecting strongly off metallic corner reflectors, urban geometry, and smooth water bodies (specular reflectance).
- Channel Fusion: Blends optical RGB channels with SAR backscatter intensity arrays into composite multi-band false-color imagery.
- All-Weather Intelligence: Explains scene features visible only in SAR (e.g. ships obscured beneath heavy fog banks or saturated soil boundaries invisible to optical sensors).

---

### Node 4: Validation

Performs structural and semantic verification before releasing data to the API caller:

- Coordinate Clamping: Ensures all returned bounding box values strictly conform to `0.0 <= coord <= 1.0` and that `ymin < ymax` and `xmin < xmax`.
- Non-Empty Safeguards: Verifies the specialist produced a coherent textual explanation; triggers automatic retry prompts with simplified constraints if null or corrupt responses occur.
- Confidence Assessment: Calculates an overall confidence metric (range `0.0` to `1.0`) combining model self-reported certainty, bounding box geometric plausibility, and input image resolution.
- Flagging & Warnings: Attaches advisory warnings if resolution limits reduce identification certainty (e.g. attempting to count small vehicles in low-resolution 10-meter Sentinel imagery).

---

### Node 5: Output Formatter

Assembles validated state data into a strict JSON contract returned to the client:

```json
{
  "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "question": "Locate the primary aircraft runway and airport taxiways.",
  "input_type": "single",
  "task": "grounding",
  "answer": "The primary asphalt runway spans diagonally across the central quadrant with two parallel taxiways running adjacent.",
  "confidence": 0.88,
  "bounding_boxes": [
    {
      "box_2d": [0.24, 0.12, 0.42, 0.88],
      "label": "primary_runway",
      "confidence": 0.92
    },
    {
      "box_2d": [0.44, 0.18, 0.52, 0.82],
      "label": "taxiway_alpha",
      "confidence": 0.85
    }
  ],
  "visual_evidence": {
    "overlay_url": "https://storage.satquery.ai/overlays/3fa85f64-overlay.png",
    "diff_map_url": null,
    "composite_url": null,
    "change_percentage": null
  },
  "created_at": "2026-09-24T20:30:00Z"
}
```

---

## Getting Started

### Prerequisites

- Python 3.10, 3.11, or 3.12
- Node.js 18.x or 20.x and npm
- OpenRouter API key (obtain from openrouter.ai)
- PostgreSQL database (optional; defaults to local SQLite `satquery.db` if unset)

---

### Backend Installation (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd satquery-backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   # On macOS / Linux:
   python3 -m venv .venv
   source .venv/bin/activate

   # On Windows (PowerShell):
   python -m venv .venv
   .venv\Scripts\Activate.ps1
   ```

3. Install project dependencies in editable development mode:
   ```bash
   pip install -e ".[dev]"
   ```

4. Configure environment credentials:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` to supply your `OPENROUTER_API_KEY`.

5. Run database schema migrations:
   ```bash
   alembic upgrade head
   ```

6. Start the development server with live reload:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```
   The backend interactive documentation will be accessible at `http://localhost:8000/docs`.

---

### Frontend Installation (Next.js 14)

1. Open a new terminal session and navigate to the frontend directory:
   ```bash
   cd satquery-frontend
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Configure frontend environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Ensure `NEXT_PUBLIC_API_URL` points to your backend instance (default: `http://localhost:8000`).

4. Launch the Next.js development server:
   ```bash
   npm run dev
   ```
   Open your browser to `http://localhost:3000` to access the SatQuery interface.

---

## Environment Configuration

### Backend Environment Variables (`satquery-backend/.env`)

| Variable | Requirement | Default | Description |
| :--- | :--- | :--- | :--- |
| `OPENROUTER_API_KEY` | Required | None | API authentication key for OpenRouter foundation model access |
| `DATABASE_URL` | Optional | `sqlite+aiosqlite:///./satquery.db` | PostgreSQL or SQLite database connection URI |
| `STORAGE_PROVIDER` | Optional | `local` | Asset storage backend: `local`, `s3`, or `cloudflare_r2` |
| `STORAGE_BUCKET_NAME`| Optional | `satquery-assets` | Target bucket name when using S3 or Cloudflare R2 |
| `S3_ENDPOINT_URL` | Optional | None | Custom endpoint URL for Cloudflare R2 or MinIO |
| `AWS_ACCESS_KEY_ID` | Optional | None | Storage authentication access key |
| `AWS_SECRET_ACCESS_KEY`| Optional | None | Storage authentication secret key |
| `PRIMARY_VLM_MODEL` | Optional | `google/gemini-2.0-flash-lite-001` | Primary vision-language model identifier |
| `FALLBACK_VLM_MODEL` | Optional | `meta-llama/llama-3.2-11b-vision-instruct:free` | First fallback vision-language model |
| `PORT` | Optional | `8000` | Port on which the FastAPI application listens |

### Frontend Environment Variables (`satquery-frontend/.env.local`)

| Variable | Requirement | Default | Description |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | Required | `http://localhost:8000` | Public base URL for the backend FastAPI endpoints |

---

## REST API Reference

The backend exposes RESTful endpoints supporting both JSON queries and multipart binary image uploads:

### 1. Health Verification

`GET /health`

Verifies backend runtime health, database connectivity, and agent availability.

**Response (200 OK):**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "database": "connected",
  "agent_graph": "ready"
}
```

---

### 2. Submit Satellite Query

`POST /query`

Dispatches an Earth observation task to the LangGraph agent pipeline.

**Content-Type:** `multipart/form-data`

**Request Parameters:**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `question` | string | Yes | Plain-language question or analytical task prompt |
| `input_type` | string | No | Modality selector: `single` (default), `bitemporal`, or `optical_sar` |
| `image_single` | file | Optional | Primary optical scene for single-image VQA or spatial grounding |
| `image_t1` | file | Optional | Earlier timestamp image (T1) for change detection |
| `image_t2` | file | Optional | Later timestamp image (T2) for change detection |
| `image_optical` | file | Optional | Visible spectrum RGB image for sensor fusion |
| `image_sar` | file | Optional | Synthetic Aperture Radar amplitude image for sensor fusion |

---

### 3. Query History & Retrieval

`GET /history`

Retrieves historical satellite analysis sessions ordered by most recent submission.

**Query Parameters:**
- `limit` (integer, optional, default: 20): Maximum records returned.
- `offset` (integer, optional, default: 0): Pagination offset.

---

## Command-Line Usage (cURL Examples)

You can query the SatQuery engine directly from your terminal or automated pipelines:

### Example A: Single-Scene Grounding Query

Locate specific ground assets with spatial bounding boxes:

```bash
curl -X POST "http://localhost:8000/query" \
  -F "question=Identify and locate all cargo vessels moored at the harbor." \
  -F "input_type=single" \
  -F "image_single=@/path/to/harbor_satellite.jpg"
```

### Example B: Bi-temporal Environmental Change Detection

Compare two multi-temporal scenes to track land-cover modification:

```bash
curl -X POST "http://localhost:8000/query" \
  -F "question=What deforestation or land clearing occurred between these dates?" \
  -F "input_type=bitemporal" \
  -F "image_t1=@/path/to/amazon_2023.png" \
  -F "image_t2=@/path/to/amazon_2025.png"
```

### Example C: Optical and SAR Sensor Fusion

Analyze cloud-obscured terrain by fusing visible spectrum and radar observations:

```bash
curl -X POST "http://localhost:8000/query" \
  -F "question=Delineate active flood inundation zones through the cloud deck." \
  -F "input_type=optical_sar" \
  -F "image_optical=@/path/to/flood_optical.jpg" \
  -F "image_sar=@/path/to/flood_sentinel1_sar.tif"
```

---

## Storage Architecture & Cloud Backends

SatQuery supports a unified storage service abstraction (`app/services/storage.py`) that operates transparently across local disks and S3-compatible cloud object stores:

### 1. Local Filesystem (Default)

During local evaluation or disconnected offline development, SatQuery saves uploaded images and visual evidence overlays directly to `satquery-backend/static/uploads/`.
- No cloud credentials or external network access required.
- Files are served by FastAPI via StaticFiles mount at `/static/uploads/`.

### 2. Cloudflare R2 / AWS S3 Setup

For production deployments, set `STORAGE_PROVIDER=cloudflare_r2` or `STORAGE_PROVIDER=s3` in your `.env`:

```ini
STORAGE_PROVIDER=cloudflare_r2
STORAGE_BUCKET_NAME=satquery-production
S3_ENDPOINT_URL=https://<your-account-id>.r2.cloudflarestorage.com
AWS_ACCESS_KEY_ID=<your-r2-access-key-id>
AWS_SECRET_ACCESS_KEY=<your-r2-secret-access-key>
```

Cloudflare R2 provides zero-cost data egress, making it ideal for serving multi-megabyte high-resolution satellite imagery to web clients.

---

## Production Deployment

### Backend Deployment (Railway or Fly.io)

The backend ships with a multi-stage Dockerfile (`satquery-backend/Dockerfile`) optimized for production container runtimes:

1. Deploy via Railway:
   - Create a new project pointing to your GitHub repository.
   - Set the root directory to `/satquery-backend`.
   - Add your environment variables (`OPENROUTER_API_KEY`, `DATABASE_URL`, `STORAGE_PROVIDER`).
   - Railway will build the container and provide an HTTPS endpoint.

2. Deploy via Fly.io:
   ```bash
   cd satquery-backend
   fly launch --name satquery-api
   fly secrets set OPENROUTER_API_KEY="your-key-here"
   fly deploy
   ```

### Frontend Deployment (Vercel)

Deploy the Next.js frontend with optimal edge caching:

1. Import your repository into the Vercel dashboard.
2. Select the `/satquery-frontend` folder as the root directory.
3. Configure Environment Variables:
   - `NEXT_PUBLIC_API_URL`: Your deployed backend URL (e.g. `https://satquery-api.up.railway.app`).
4. Click Deploy. Vercel automatically builds and hosts the interface on global edge networks.

---

## Troubleshooting & Frequently Encountered Scenarios

| Issue Observed | Root Cause | Recommended Solution |
| :--- | :--- | :--- |
| **CORS blocked by browser** | Frontend origin does not match backend CORS allowlist | Verify `CORS_ORIGINS` in backend config includes `http://localhost:3000` or your Vercel domain. |
| **OpenRouter 401 Unauthorized** | Missing or expired API key | Check that `OPENROUTER_API_KEY` is present in `.env` without surrounding quotation marks. |
| **Model Rate Limit Exceeded (429)** | Free tier quota exhausted on primary model | SatQuery automatically fails over to `meta-llama/llama-3.2-11b-vision-instruct:free`. You can also configure paid model IDs in `.env`. |
| **Alembic migration out of sync** | Database schema mismatch after pull | Run `alembic upgrade head` in `satquery-backend` to apply missing database revisions. |
| **Missing image uploads on reload** | Local container restarted with ephemeral disk | Mount a persistent storage volume to `/app/static/uploads` or configure Cloudflare R2 object storage. |
| **Bounding boxes offset on frontend** | Custom canvas dimension scaling issue | Grounding boxes use normalized coordinates `[0.0, 1.0]`; ensure parent container retains CSS `position: relative`. |

---

