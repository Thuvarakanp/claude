const fs = require("fs");
const path = "d:/claude/";
const files = ["index","quickstart","directory","install","guide","create","skill","mcp","plugins","api","commands","hooks","models"];

// Inline brand logo SVG (one per file occurrence — we'll suffix gradient ids to avoid clashes).
const logoSvg = (idSuffix) => `<svg class="brand-logo" viewBox="0 0 32 32" aria-hidden="true">
        <defs>
          <radialGradient id="bf-${idSuffix}" cx="38%" cy="32%" r="70%">
            <stop offset="0%" stop-color="#f5b692"/>
            <stop offset="55%" stop-color="#d97757"/>
            <stop offset="100%" stop-color="#a64f33"/>
          </radialGradient>
        </defs>
        <circle cx="16" cy="16" r="14" fill="url(#bf-${idSuffix})"/>
        <ellipse cx="11" cy="10" rx="5" ry="3" fill="#fff" opacity=".22"/>
        <circle cx="11" cy="15" r="1.7" fill="#1a0e08"/>
        <circle cx="11.4" cy="14.5" r="0.5" fill="#fff"/>
        <circle cx="21" cy="15" r="1.7" fill="#1a0e08"/>
        <circle cx="21.4" cy="14.5" r="0.5" fill="#fff"/>
        <path d="M11 20 Q16 24 21 20" stroke="#1a0e08" stroke-width="1.7" fill="none" stroke-linecap="round"/>
      </svg>`;

const footerLogoSvg = (idSuffix) => `<svg class="footer-logo-mark" viewBox="0 0 32 32" aria-hidden="true">
          <defs>
            <radialGradient id="bf-${idSuffix}" cx="38%" cy="32%" r="70%">
              <stop offset="0%" stop-color="#f5b692"/>
              <stop offset="55%" stop-color="#d97757"/>
              <stop offset="100%" stop-color="#a64f33"/>
            </radialGradient>
          </defs>
          <circle cx="16" cy="16" r="14" fill="url(#bf-${idSuffix})"/>
          <ellipse cx="11" cy="10" rx="5" ry="3" fill="#fff" opacity=".22"/>
          <circle cx="11" cy="15" r="1.7" fill="#1a0e08"/>
          <circle cx="21" cy="15" r="1.7" fill="#1a0e08"/>
          <path d="M11 20 Q16 24 21 20" stroke="#1a0e08" stroke-width="1.7" fill="none" stroke-linecap="round"/>
        </svg>`;

for (const f of files) {
  const p = path + f + ".html";
  let html = fs.readFileSync(p, "utf8");
  const orig = html;

  // 1) Rename brand text — but only in brand contexts (not in long-form copy that says "Claude" alone).
  //    "Claude Pro Guide" is unique enough to global-replace.
  html = html.split("Claude Pro Guide").join("ClaudeBro");

  // 2) Inject the brand logo SVG into header brand link.
  //    Replace `<span class="brand-text">ClaudeBro</span>` with logo + text.
  const headerLogo = logoSvg(f + "-nav");
  html = html.replace(
    /<a href="index\.html" class="brand">\s*(?:<!--[^>]*-->\s*)?<span class="brand-text">ClaudeBro<\/span>\s*<\/a>/,
    `<a href="index.html" class="brand">
      ${headerLogo}
      <span class="brand-text">ClaudeBro</span>
    </a>`
  );

  // 3) Inject the footer logo SVG into footer-logo.
  //    Replace `<div class="footer-logo"><strong>ClaudeBro</strong></div>` with logo + text.
  const footerLogo = footerLogoSvg(f + "-foot");
  html = html.replace(
    /<div class="footer-logo">\s*<strong>ClaudeBro<\/strong>\s*<\/div>/,
    `<div class="footer-logo">
        ${footerLogo}
        <strong>ClaudeBro</strong>
      </div>`
  );

  // 4) Update og:image:alt to use the new brand line.
  html = html.replace(
    /og:image:alt" content="[^"]*"/,
    'og:image:alt" content="ClaudeBro — A-to-Z reference for Claude"'
  );

  if (html !== orig) {
    fs.writeFileSync(p, html);
    console.log(f + ".html: rebranded");
  } else {
    console.log(f + ".html: no change");
  }
}
