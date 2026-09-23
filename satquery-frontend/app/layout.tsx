import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SatQuery AI — Planetary Vision & Agentic Satellite Intelligence",
  description: "Agentic assistant for satellite imagery analysis with visual evidence, execution trace audit, and confidence scores across Optical, Bi-temporal, and SAR radar modalities.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className="font-sans antialiased bg-black text-neutral-100 min-h-screen selection:bg-white/20 selection:text-white">
        {children}
      </body>
    </html>
  );
}