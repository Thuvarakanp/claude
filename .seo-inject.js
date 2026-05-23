const fs = require("fs");
const path = "d:/claude/";

const BASE = "https://claudebro.xyz";
const AUTHOR = "Thuvarakan Perinpanayagam";

const PAGES = {
  "index.html": {
    title: "Claude Pro Guide — A-to-Z reference for Claude (Skills, MCP, Plugins, API)",
    desc: "The pro reference for working with Claude. 101 skills, MCP servers, Claude Code plugins, slash commands, hooks, API guide, and the 4.x model family — all in one place.",
    path: "/",
    type: "website",
    schema: "home",
    keywords: "Claude AI, Claude Code, Anthropic, Claude skills, MCP, Model Context Protocol, Claude API, Claude plugins, Claude hooks, Claude Opus, Claude Sonnet, Claude Haiku, AI coding assistant",
  },
  "quickstart.html": {
    title: "Quickstart — Set up Claude Code, claude.ai, API in 10 min | Claude Pro Guide",
    desc: "A-to-Z Claude setup: claude.ai, desktop apps, Claude Code CLI, IDE extensions, the API, and mobile. Install commands, first-day config, and a CLAUDE.md template.",
    path: "/quickstart.html",
    type: "article",
    schema: "article",
    keywords: "Claude Code install, Claude setup, claude.ai signup, Anthropic API key, Claude Code CLI, CLAUDE.md, Claude quickstart",
  },
  "directory.html": {
    title: "Skills Directory — 101 Claude Agent Skills, searchable | Claude Pro Guide",
    desc: "Searchable, filterable directory of 101 Claude Agent Skills — official, built-in, MCP, community, and experimental. PDF, Excel, Figma, Playwright, GitHub, and more.",
    path: "/directory.html",
    type: "website",
    schema: "directory",
    keywords: "Claude skills directory, Claude Agent Skills, PDF skill, Excel skill, Figma skill, Playwright MCP, GitHub MCP, ui-ux-pro-max",
  },
  "install.html": {
    title: "Install Claude Skills — Claude Code, API, claude.ai | Claude Pro Guide",
    desc: "How to install Claude Agent Skills across every surface — Claude Code (CLI + IDE), the Anthropic API, claude.ai, and via plugins / MCP. Troubleshooting and security included.",
    path: "/install.html",
    type: "article",
    schema: "article",
    keywords: "install Claude skills, ~/.claude/skills, SKILL.md, skills container API, claude.ai capabilities",
  },
  "guide.html": {
    title: "How Claude Skills Work — Progressive disclosure, triggers, frontmatter",
    desc: "The conceptual guide to Claude Agent Skills: progressive disclosure, frontmatter spec, allowed-tools, how triggers work, and the difference between skills, slash commands, and MCP.",
    path: "/guide.html",
    type: "article",
    schema: "article",
    keywords: "Claude skills explained, progressive disclosure, SKILL.md frontmatter, Claude triggers, allowed-tools, agent skills",
  },
  "create.html": {
    title: "Build Your First Claude Skill — Step-by-step tutorial | Claude Pro Guide",
    desc: "Build a working Claude Agent Skill end-to-end in under 10 minutes. Naming, frontmatter, helper scripts, trigger testing, publishing, and a pre-publish checklist.",
    path: "/create.html",
    type: "article",
    schema: "howto",
    keywords: "create Claude skill, build SKILL.md, Claude skill tutorial, agent skill template, publish skill",
  },
  "skill.html": {
    title: "Skill detail — Claude Pro Guide",
    desc: "Detail page for a single Claude Agent Skill — what it does, triggers, install instructions, allowed tools, and related skills.",
    path: "/skill.html",
    type: "article",
    schema: "article",
    keywords: "Claude skill, SKILL.md, agent skill detail",
  },
  "mcp.html": {
    title: "MCP Guide — Model Context Protocol servers for Claude | Claude Pro Guide",
    desc: "Everything about MCP: how it works, installing servers in Claude Code and claude.ai, 30+ recommended servers (GitHub, Postgres, Linear, Figma, Slack), and how to build your own.",
    path: "/mcp.html",
    type: "article",
    schema: "article",
    keywords: "MCP, Model Context Protocol, MCP servers, Claude MCP, GitHub MCP, Postgres MCP, Linear MCP, Figma MCP, build MCP server, context7, shadcn MCP",
  },
  "plugins.html": {
    title: "Claude Code Plugins — Marketplace, popular plugins, authoring | Claude Pro Guide",
    desc: "Claude Code plugins explained: what they bundle, the marketplace, 20+ recommended plugins for dev, workflow, and code review, and how to publish your own.",
    path: "/plugins.html",
    type: "article",
    schema: "article",
    keywords: "Claude Code plugin, Claude plugin marketplace, plugin.json, claude plugin install, build Claude plugin",
  },
  "api.html": {
    title: "Anthropic API Guide — Caching, thinking, tools, vision, batch, computer use",
    desc: "Production Anthropic API guide: auth, model IDs, prompt caching (90% cheaper), extended thinking, tool use, vision, PDFs, files, batch (50% off), citations, computer use, pricing.",
    path: "/api.html",
    type: "article",
    schema: "article",
    keywords: "Anthropic API, Claude API, prompt caching, extended thinking, tool use, Claude vision, batch API, computer use, claude-opus-4-7, claude-sonnet-4-6, claude-haiku-4-5",
  },
  "commands.html": {
    title: "Slash Commands — Every Claude Code built-in + custom command guide",
    desc: "Reference for every Claude Code slash command: /init, /review, /security-review, /verify, /ultrareview, plus how to write custom commands. Copy-paste starter library included.",
    path: "/commands.html",
    type: "article",
    schema: "article",
    keywords: "Claude Code slash commands, /init, /review, /security-review, custom slash command, ~/.claude/commands",
  },
  "hooks.html": {
    title: "Claude Code Hooks — Events, matchers, automation examples | Pro Guide",
    desc: "Complete hooks reference: PreToolUse, PostToolUse, Stop, SessionStart, UserPromptSubmit, and more. Six real-world hook recipes — format on save, notify on stop, block force-push, audit log.",
    path: "/hooks.html",
    type: "article",
    schema: "article",
    keywords: "Claude Code hooks, PreToolUse, PostToolUse, Stop hook, settings.json hooks, format on save, automation",
  },
  "models.html": {
    title: "Claude Models Compared — Opus 4.7 vs Sonnet 4.6 vs Haiku 4.5 | Pro Guide",
    desc: "The Claude 4.x family compared. When to use Opus 4.7, Sonnet 4.6, and Haiku 4.5. Pricing, capabilities, context windows, decision flow, and migration notes from 3.x.",
    path: "/models.html",
    type: "article",
    schema: "article",
    keywords: "Claude models, Claude Opus 4.7, Claude Sonnet 4.6, Claude Haiku 4.5, claude-opus-4-7, claude-sonnet-4-6, claude-haiku-4-5, Claude pricing, Claude 4.x",
  },
};

function esc(s) { return String(s).replace(/"/g, "&quot;"); }

function jsonLd(cfg, url, ogImage) {
  if (cfg.schema === "home") {
    return {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "WebSite",
          "@id": BASE + "/#website",
          url: BASE + "/",
          name: "Claude Pro Guide",
          description: cfg.desc,
          publisher: { "@id": BASE + "/#person" },
          inLanguage: "en-US",
          potentialAction: {
            "@type": "SearchAction",
            target: BASE + "/directory.html?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        },
        {
          "@type": "Person",
          "@id": BASE + "/#person",
          name: AUTHOR,
          url: BASE + "/"
        }
      ]
    };
  }
  if (cfg.schema === "directory") {
    return {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      name: "Claude Skills Directory",
      description: cfg.desc,
      url: url,
      isPartOf: { "@type": "WebSite", name: "Claude Pro Guide", url: BASE + "/" },
      about: { "@type": "Thing", name: "Claude Agent Skills" }
    };
  }
  if (cfg.schema === "howto") {
    return {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: "Build a Claude Agent Skill",
      description: cfg.desc,
      url: url,
      step: [
        { "@type": "HowToStep", name: "Decide what the skill does" },
        { "@type": "HowToStep", name: "Create the folder" },
        { "@type": "HowToStep", name: "Write SKILL.md" },
        { "@type": "HowToStep", name: "Add a helper script" },
        { "@type": "HowToStep", name: "Test the trigger" },
        { "@type": "HowToStep", name: "Iterate on the description" },
        { "@type": "HowToStep", name: "Package and publish" }
      ]
    };
  }
  // default: article
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: cfg.title.split(" — ")[0],
    description: cfg.desc,
    url: url,
    image: ogImage,
    author: { "@type": "Person", name: AUTHOR },
    publisher: { "@type": "Person", name: AUTHOR },
    datePublished: "2026-05-22",
    dateModified: "2026-05-22",
    inLanguage: "en-US"
  };
}

function metaBlock(cfg) {
  const url = BASE + cfg.path;
  const ogImage = BASE + "/og-image.svg";
  const ld = JSON.stringify(jsonLd(cfg, url, ogImage), null, 2);

  return `<title>${esc(cfg.title)}</title>
<meta name="description" content="${esc(cfg.desc)}" />
<meta name="keywords" content="${esc(cfg.keywords)}" />
<meta name="author" content="${esc(AUTHOR)}" />
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
<meta name="theme-color" content="#0a0807" media="(prefers-color-scheme: dark)" />
<meta name="theme-color" content="#d97757" media="(prefers-color-scheme: light)" />
<link rel="canonical" href="${url}" />

<!-- Favicons -->
<link rel="icon" type="image/svg+xml" href="/favicon.svg" />
<link rel="alternate icon" type="image/png" href="/favicon.svg" />
<link rel="apple-touch-icon" href="/favicon.svg" />

<!-- Open Graph -->
<meta property="og:type" content="${cfg.type}" />
<meta property="og:site_name" content="Claude Pro Guide" />
<meta property="og:title" content="${esc(cfg.title)}" />
<meta property="og:description" content="${esc(cfg.desc)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${ogImage}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="Claude Pro Guide — A-to-Z reference for Claude" />
<meta property="og:locale" content="en_US" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(cfg.title)}" />
<meta name="twitter:description" content="${esc(cfg.desc)}" />
<meta name="twitter:image" content="${ogImage}" />
<meta name="twitter:image:alt" content="Claude Pro Guide" />

<script type="application/ld+json">
${ld}
</script>`;
}

for (const [file, cfg] of Object.entries(PAGES)) {
  const p = path + file;
  let html = fs.readFileSync(p, "utf8");
  const orig = html;

  html = html.replace(/<title>[^<]*<\/title>\s*/g, "");
  html = html.replace(/<meta name="description"[^>]*\/?>\s*/g, "");
  html = html.replace(/<meta name="keywords"[^>]*\/?>\s*/g, "");
  html = html.replace(/<meta name="author"[^>]*\/?>\s*/g, "");
  html = html.replace(/<meta name="robots"[^>]*\/?>\s*/g, "");
  html = html.replace(/<meta name="theme-color"[^>]*\/?>\s*/g, "");
  html = html.replace(/<link rel="canonical"[^>]*\/?>\s*/g, "");
  html = html.replace(/<link rel="icon"[^>]*\/?>\s*/g, "");
  html = html.replace(/<link rel="alternate icon"[^>]*\/?>\s*/g, "");
  html = html.replace(/<link rel="apple-touch-icon"[^>]*\/?>\s*/g, "");
  html = html.replace(/<meta property="og:[^"]+"[^>]*\/?>\s*/g, "");
  html = html.replace(/<meta name="twitter:[^"]+"[^>]*\/?>\s*/g, "");
  html = html.replace(/<!-- Favicons -->\s*/g, "");
  html = html.replace(/<!-- Open Graph -->\s*/g, "");
  html = html.replace(/<!-- Twitter Card -->\s*/g, "");
  html = html.replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\s*/g, "");

  const block = metaBlock(cfg);
  html = html.replace(
    /(<meta name="viewport"[^>]*\/?>)/,
    "$1\n" + block
  );

  if (html !== orig) {
    fs.writeFileSync(p, html);
    console.log(file + ": SEO applied");
  } else {
    console.log(file + ": no change");
  }
}
