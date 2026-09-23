# SatQuery AI Frontend

Next.js 14 frontend for SatQuery AI with Tailwind CSS and shadcn/ui components.

## Quick Start

### Prerequisites
- Node.js 18+
- Backend API running (see backend README)

### Setup

1. Copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_API_BASE_URL`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```

### Features

- Three analysis modes: Single Image, Bi-temporal (T1/T2), Optical+SAR Fusion
- Drag-and-drop image upload with previews
- Real-time results with visual evidence overlay
- Confidence scoring and execution trail
- Query history sidebar

### Deployment

Vercel:
```bash
vercel deploy
```

Configure `NEXT_PUBLIC_API_BASE_URL` in Vercel environment variables.