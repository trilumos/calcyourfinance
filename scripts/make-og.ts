/**
 * Generates a branded Open Graph image (1200×630 PNG) per calculator + a
 * default, into public/og/. Clean Geist-style: ink wordmark, big title, a
 * per-platform accent. Run with: npm run og
 *
 * PNGs are committed so they ship regardless of the deploy host's fonts.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import { calculators } from "../src/calculators/index.ts";
import { getPlatform } from "../src/config/platforms.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const outDir = resolve(root, "public", "og");
mkdirSync(outDir, { recursive: true });

const fontPath = resolve(
  root,
  "node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2",
);
const fontBuffer = readFileSync(fontPath);

const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function svg({
  title,
  subtitle,
  accent,
  chip,
}: {
  title: string;
  subtitle: string;
  accent: string;
  chip?: string;
}): string {
  const ink = "#171717";
  const body = "#4d4d4d";
  const mute = "#888888";
  const link = "#0070f3";
  return `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#ffffff"/>
  <rect width="1200" height="12" fill="${accent}"/>
  <text x="80" y="120" font-family="Geist Variable, sans-serif" font-size="30" font-weight="400" fill="${ink}">Calc<tspan fill="${link}">Your</tspan>Finance</text>
  ${
    chip
      ? `<circle cx="92" cy="296" r="11" fill="${accent}"/><text x="116" y="305" font-family="Geist Variable, sans-serif" font-size="26" font-weight="400" fill="${body}">${esc(chip)}</text>`
      : ""
  }
  <text x="80" y="400" font-family="Geist Variable, sans-serif" font-size="76" font-weight="400" fill="${ink}">${esc(title)}</text>
  <text x="80" y="470" font-family="Geist Variable, sans-serif" font-size="32" font-weight="400" fill="${body}">${esc(subtitle)}</text>
  <text x="80" y="566" font-family="Geist Variable, sans-serif" font-size="24" font-weight="400" fill="${mute}">calcyourfinance.com</text>
</svg>`;
}

function render(markup: string, outFile: string) {
  const r = new Resvg(markup, {
    fitTo: { mode: "width", value: 1200 },
    font: {
      fontBuffers: [fontBuffer],
      defaultFontFamily: "Geist Variable",
      // Use ONLY the Geist buffer so every text element is consistent
      // (no condensed system-font fallback on the large title).
      loadSystemFonts: false,
    },
  });
  writeFileSync(outFile, r.render().asPng());
}

// Default
render(
  svg({
    title: "Calculate fees. Keep more.",
    subtitle: "Free e-commerce, payment & finance calculators.",
    accent: "#171717",
  }),
  resolve(outDir, "default.png"),
);

// Per calculator
for (const c of calculators) {
  const p = getPlatform(c.platform);
  render(
    svg({
      title: c.title,
      subtitle: c.metaDescription.split(".")[0] + ".",
      accent: p?.color ?? "#0070f3",
      chip: p?.name,
    }),
    resolve(outDir, `${c.slug}.png`),
  );
}

console.log(`Generated ${calculators.length + 1} OG images → public/og/`);
