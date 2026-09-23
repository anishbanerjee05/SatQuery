# Rule: 21st.dev & shadcn Component Integration Guidelines

When integrating components from 21st.dev, v0, or shadcn into this codebase:

1. **Component Placement**:
   - Save base UI primitives into `components/ui/<component-name>.tsx`.
   - Save demos/wrappers into `components/ui/<component-name>-demo.tsx` or `components/<Section>.tsx`.

2. **Domain Adaptation**:
   - Keep core hooks, state management, and physics/rendering engines intact.
   - Tailor titles, placeholders, and action buttons to satellite imagery intelligence (Optical VQA, Bi-temporal Change, SAR Fusion). Remove irrelevant boilerplate (e.g., Figma import, generic web-dev templates).

3. **Design System & Theme Normalization**:
   - Ensure components follow the deep space aesthetic (`bg-[#020617]`, translucent dark cards `bg-slate-900/60`, borders `border-slate-800`, and sky/cyan accents `text-sky-400`, `bg-sky-500`).
   - Use `cn()` from `@/lib/utils` for conditional class joining.

4. **Interactivity**:
   - Wire input actions (e.g. Enter key, send button, action pills) to trigger the analysis workspace or dispatch queries to the LangGraph backend.
