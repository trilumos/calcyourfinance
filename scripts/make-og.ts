/**
 * Generates a branded Open Graph image (1200×630 PNG) per calculator + a
 * default, into public/og/. Clean Geist-style: ink wordmark, big title, a
 * per-platform accent. Run with: npm run og
 *
 * Uses Satori to shape text into vector paths (correct typography at any size),
 * then resvg to rasterize to PNG. PNGs are committed so they ship regardless
 * of the deploy host's fonts.
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import { calculators } from "../src/calculators/index.ts";
import { getPlatform } from "../src/config/platforms.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const outDir = resolve(root, "public", "og");
mkdirSync(outDir, { recursive: true });

const fontDir = resolve(root, "node_modules/@fontsource/geist-sans/files");
const font = (w: string) =>
  readFileSync(resolve(fontDir, `geist-sans-latin-${w}-normal.woff`));
const fonts = [
  { name: "Geist", data: font("400"), weight: 400 as const, style: "normal" as const },
  { name: "Geist", data: font("500"), weight: 500 as const, style: "normal" as const },
  { name: "Geist", data: font("600"), weight: 600 as const, style: "normal" as const },
];

const INK = "#171717";
const BODY = "#4d4d4d";
const MUTE = "#888888";
const LINK = "#0070f3";

// Minimal hyperscript for Satori's React-element shape.
const h = (type: string, style: Record<string, unknown>, children?: unknown) => ({
  type,
  props: { style, children },
});

function layout({
  title,
  subtitle,
  accent,
  chip,
}: {
  title: string;
  subtitle: string;
  accent: string;
  chip?: string;
}) {
  return h(
    "div",
    {
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      backgroundColor: "#ffffff",
      padding: "72px 80px",
      fontFamily: "Geist",
      position: "relative",
    },
    [
      h("div", { position: "absolute", top: 0, left: 0, width: 1200, height: 12, backgroundColor: accent }),
      // Wordmark
      h("div", { display: "flex", fontSize: 30, fontWeight: 600, color: INK }, [
        h("div", { display: "flex" }, "Calc"),
        h("div", { display: "flex", color: LINK }, "Your"),
        h("div", { display: "flex" }, "Finance"),
      ]),
      // Middle block
      h("div", { display: "flex", flexDirection: "column" }, [
        chip
          ? h("div", { display: "flex", alignItems: "center", marginBottom: 18 }, [
              h("div", { width: 22, height: 22, borderRadius: 999, backgroundColor: accent, marginRight: 12 }),
              h("div", { display: "flex", fontSize: 26, fontWeight: 500, color: BODY }, chip),
            ])
          : h("div", {}),
        h("div", { display: "flex", fontSize: 72, fontWeight: 600, color: INK, letterSpacing: "-2px", lineHeight: 1.05 }, title),
        h("div", { display: "flex", fontSize: 30, fontWeight: 400, color: BODY, marginTop: 18 }, subtitle),
      ]),
      // Footer
      h("div", { display: "flex", fontSize: 24, fontWeight: 400, color: MUTE }, "calcyourfinance.com"),
    ],
  );
}

async function render(opts: Parameters<typeof layout>[0], outFile: string) {
  const svg = await satori(layout(opts) as never, { width: 1200, height: 630, fonts });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } }).render().asPng();
  writeFileSync(outFile, png);
}

const main = async () => {
  await render(
    {
      title: "Calculate fees. Keep more.",
      subtitle: "Free e-commerce, payment & finance calculators.",
      accent: INK,
    },
    resolve(outDir, "default.png"),
  );

  for (const c of calculators) {
    const p = getPlatform(c.platform);
    await render(
      {
        title: c.title,
        subtitle: c.metaDescription.split(".")[0] + ".",
        accent: p?.color ?? LINK,
        chip: p?.name,
      },
      resolve(outDir, `${c.slug}.png`),
    );
  }

  console.log(`Generated ${calculators.length + 1} OG images → public/og/`);
};

main();
