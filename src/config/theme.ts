/**
 * Design tokens — "Ledger" system (PLAN §1).
 * Editorial-precision fintech: warm paper, ledger-emerald accent, tabular
 * monospace readouts. Exported as TS so OG-image generation and any JS can
 * read the exact same palette the CSS uses (src/styles/global.css is the
 * runtime source of truth — keep these in sync).
 */

export const theme = {
  color: {
    paper: "#F6F4EE",
    surface: "#FFFFFF",
    surface2: "#FBFAF6",
    ink: "#15211B",
    inkSoft: "#45514A",
    inkFaint: "#6B756E",
    line: "#E3DFD4",
    lineStrong: "#CFC9BA",
    brand: "#0E6B53", // ledger emerald
    brandDeep: "#0A4E3D",
    brandBright: "#15A37A",
    positive: "#0E6B53",
    negative: "#C0492F", // terracotta — deductions / fees
    gold: "#C8A24B", // verified badge / premium accent
  },
  font: {
    display: '"Fraunces Variable", Georgia, "Times New Roman", serif',
    body: '"Hanken Grotesk Variable", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    mono: '"IBM Plex Mono", ui-monospace, "Cascadia Code", Menlo, monospace',
  },
  radius: { sm: "6px", md: "10px", lg: "16px" },
} as const;

export type Theme = typeof theme;
