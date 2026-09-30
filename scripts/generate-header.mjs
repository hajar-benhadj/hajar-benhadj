// Generates assets/google-search.svg — an animated "Google search" scene:
// the query types itself, a spinner spins, then the #1 result fades in:
// Hajar Benhadj. Pure SMIL, loops every 8s, works inside GitHub READMEs.
// Run: node scripts/generate-header.mjs

import { writeFileSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const out = join(root, "assets", "google-search.svg");

const W = 1100;
const H = 330;
const DUR = 8; // seconds, full loop

const QUERY = "who is the best female programmer?";
const CHAR_START = 0.04; // fraction of loop when typing begins
const CHAR_END = 0.44;   // fraction when typing finishes
const step = (CHAR_END - CHAR_START) / QUERY.length;
const CHAR_W = 12.2;     // monospace advance per char
const QX = 285;          // query start x
const QY = 152;          // query baseline y

const parts = [];
parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="Google search for the best female programmer, result: Hajar Benhadj">`);
parts.push(`<defs>
  <linearGradient id="nameGrad" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#f9a8d4"/><stop offset="0.5" stop-color="#f472b6"/><stop offset="1" stop-color="#a78bfa"/>
  </linearGradient>
  <linearGradient id="barGrad" x1="0" y1="0" x2="1" y2="0">
    <stop offset="0" stop-color="#f472b6" stop-opacity="0.14"/><stop offset="1" stop-color="#a78bfa" stop-opacity="0.14"/>
  </linearGradient>
</defs>`);

// card background
parts.push(`<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18" fill="#161b22" stroke="#30363d" stroke-width="1.5"/>`);
parts.push(`<rect x="1" y="1" width="${W - 2}" height="4" rx="2" fill="url(#nameGrad)"/>`);

// Google wordmark
const google = [
  ["G", "#4285F4"], ["o", "#EA4335"], ["o", "#FBBC05"],
  ["g", "#4285F4"], ["l", "#34A853"], ["e", "#EA4335"],
];
let gx = W / 2 - 105;
let wordmark = "";
for (const [ch, color] of google) {
  wordmark += `<text x="${gx}" y="72" font-family="Arial, sans-serif" font-size="40" font-weight="700" fill="${color}">${ch}</text>`;
  gx += ch === "l" ? 14 : 30;
}
parts.push(wordmark);
parts.push(`<text x="${W / 2 + 118}" y="72" font-family="Arial, sans-serif" font-size="15" fill="#8b949e">| search the world…</text>`);

// search bar
parts.push(`<rect x="120" y="108" width="${W - 240}" height="58" rx="29" fill="url(#barGrad)" stroke="#30363d" stroke-width="1.5"/>`);
// magnifier icon
parts.push(`<g stroke="#9aa0a6" stroke-width="2.4" fill="none">
  <circle cx="156" cy="137" r="10"/>
  <line x1="163.5" y1="144.5" x2="172" y2="153"/>
</g>`);

// typed query, char by char
const chars = [...QUERY];
chars.forEach((ch, i) => {
  const kt = CHAR_START + i * step;
  const show = kt + 0.004;
  const escaped = ch === "&" ? "&amp;" : ch === "?" ? "?" : ch;
  parts.push(
    `<text x="${QX + i * CHAR_W}" y="${QY}" font-family="Consolas, Menlo, monospace" font-size="23" fill="#e6edf3" opacity="0">` +
    `${escaped}<animate attributeName="opacity" values="0;0;1;1" keyTimes="0;${kt.toFixed(4)};${show.toFixed(4)};1" dur="${DUR}s" repeatCount="indefinite"/></text>`
  );
});

// caret: blinks, steps along with the typing, blinks at the end, hides during results
const caretValues = ["285"];
const caretKeyTimes = ["0"];
chars.forEach((_, i) => {
  caretValues.push(String(QX + (i + 1) * CHAR_W));
  caretKeyTimes.push((CHAR_START + (i + 1) * step).toFixed(4));
});
caretValues.push(String(QX + chars.length * CHAR_W));
caretKeyTimes.push("0.55");
parts.push(
  `<rect x="285" y="${QY - 19}" width="2.5" height="25" fill="#f472b6" opacity="0">` +
  `<animate attributeName="x" calcMode="discrete" values="${caretValues.join(";")}" keyTimes="${caretKeyTimes.join(";")}" dur="${DUR}s" repeatCount="indefinite"/>` +
  `<animate attributeName="opacity" values="0;1;1;1;0;0" keyTimes="0;0.02;0.44;0.55;0.56;1" dur="${DUR}s" repeatCount="indefinite"/>` +
  `</rect>`
);

// searching spinner (appears between typing and results)
parts.push(
  `<g opacity="0">
    <animate attributeName="opacity" values="0;0;1;1;0;0" keyTimes="0;0.44;0.46;0.53;0.55;1" dur="${DUR}s" repeatCount="indefinite"/>
    <circle cx="${W - 160}" cy="137" r="11" fill="none" stroke="#30363d" stroke-width="3"/>
    <circle cx="${W - 160}" cy="137" r="11" fill="none" stroke="#f472b6" stroke-width="3" stroke-linecap="round" stroke-dasharray="18 52">
      <animateTransform attributeName="transform" type="rotate" from="0 ${W - 160} 137" to="360 ${W - 160} 137" dur="0.9s" repeatCount="indefinite"/>
    </circle>
  </g>`
);

// result card
const fade = 'values="0;0;1;1;0;0" keyTimes="0;0.54;0.60;0.92;0.97;1"';
parts.push(
  `<g opacity="0">
    <animate attributeName="opacity" ${fade} dur="${DUR}s" repeatCount="indefinite"/>
    <rect x="250" y="196" width="600" height="104" rx="12" fill="#1c2128" stroke="#f472b6" stroke-opacity="0.45" stroke-width="1.5"/>
    <text x="285" y="240" font-family="Arial, sans-serif" font-size="27" font-weight="800" fill="url(#nameGrad)">Hajar Benhadj
      <animate attributeName="font-size" values="27;27;28;28" keyTimes="0;0.60;0.66;1" dur="${DUR}s" repeatCount="indefinite"/>
    </text>
    <text x="795" y="238" text-anchor="end" font-family="Arial, sans-serif" font-size="19" fill="#fbbf24">★★★★★ <tspan fill="#e6edf3" font-size="16">5.0</tspan></text>
    <text x="285" y="268" font-family="Arial, sans-serif" font-size="15" fill="#8b949e">Software Developer · Automation · AI · Computer Vision — Morocco</text>
    <text x="285" y="290" font-family="Arial, sans-serif" font-size="13" font-style="italic" fill="#f9a8d4">✿ verified: ships products, not just code</text>
  </g>`
);

parts.push(`</svg>`);

mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, parts.join("\n"));
console.log(`Wrote ${out} (${parts.join("\n").length} bytes, ${chars.length}-char query)`);
