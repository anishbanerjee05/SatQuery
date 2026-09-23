# SatQuery Design & Full-Stack Integration Invariants

## Typography & Clean Headers
- Do not place repetitive pill badges above section titles (e.g. `[● EXECUTION TOPOLOGY]`, `[● SYSTEM ARCHITECTURE]`). Rely on strong, uncluttered typography (`font-light tracking-[-0.03em] text-white`).
- Use "Start Querying" as the primary hero CTA button copy.

## Navigation Synchronization
- Floating navbar items must reflect the precise vertical order of sections on the page.
- When an item is active, display its icon and label in an expanded pill capsule; inactive items show clean icons.

## Card Hover Glow (Spotlight Cards)
- Hover spotlight cards must calculate pointer coordinates relative to the card's bounding box (`e.clientX - rect.left`, `e.clientY - rect.top`).
- The hover spotlight border and backdrop gradient must smoothly fade in on hover.

## WebGL & Shader Resilience
- WebGL contexts must be requested with fallbacks (primary options -> default options -> webgl2/webgl/experimental-webgl).
- Always include an ambient fallback glow backdrop so the canvas never leaves a barren black void if graphics contexts drop.

## Live Full-Stack Verification
- Backend routes must support live multipart query submission and SQLite/Postgres persistence with timezone-aware datetimes (`datetime.now(timezone.utc)`).
- Agent specialist nodes must generate real OpenCV difference heatmaps, bounding box annotations, and composite evidence.
