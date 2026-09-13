// Generates favicon.svg and the PNG icon set for the PWA manifest into ./public.
import { mkdir, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const svg = (pad = 0) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${-pad} ${-pad} ${64 + pad * 2} ${64 + pad * 2}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0f172a"/>
      <stop offset="1" stop-color="#020617"/>
    </linearGradient>
  </defs>
  <rect x="${-pad}" y="${-pad}" width="${64 + pad * 2}" height="${64 + pad * 2}" fill="#020617"/>
  <rect x="2" y="2" width="60" height="60" rx="14" fill="url(#bg)" stroke="#1e293b" stroke-width="2"/>
  <rect x="13" y="17" width="20" height="4.5" rx="2.25" fill="#475569"/>
  <rect x="13" y="26" width="28" height="4.5" rx="2.25" fill="#475569"/>
  <rect x="13" y="35" width="16" height="4.5" rx="2.25" fill="#475569"/>
  <rect x="13" y="44" width="24" height="4.5" rx="2.25" fill="#475569"/>
  <circle cx="40" cy="37" r="11.5" fill="rgba(34,211,238,0.18)" stroke="#22d3ee" stroke-width="3.2"/>
  <rect x="30" y="34.8" width="15" height="4.5" rx="2.25" fill="#22d3ee"/>
  <line x1="48.5" y1="45.5" x2="56" y2="53" stroke="#22d3ee" stroke-width="4.2" stroke-linecap="round"/>
</svg>`;

await mkdir('public', { recursive: true });
await writeFile('public/favicon.svg', svg());

const targets = [
  ['public/pwa-192x192.png', 192, 0],
  ['public/pwa-512x512.png', 512, 0],
  ['public/pwa-maskable-512x512.png', 512, 8],
  ['public/apple-touch-icon.png', 180, 4],
];
for (const [file, size, pad] of targets) {
  await sharp(Buffer.from(svg(pad))).resize(size, size).png().toFile(file);
  console.log('wrote', file);
}
