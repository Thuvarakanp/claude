const fs = require("fs");
const BASE = "https://claudebro.xyz";

// Per-page breadcrumbs (after Home).
const CRUMBS = {
  "quickstart.html": [{ name: "Quickstart", path: "/quickstart.html" }],
  "directory.html":  [{ name: "Skills",      path: "/directory.html" }],
  "install.html":    [{ name: "Skills",      path: "/directory.html" }, { name: "Install", path: "/install.html" }],
  "guide.html":      [{ name: "Skills",      path: "/directory.html" }, { name: "Guide",   path: "/guide.html" }],
  "create.html":     [{ name: "Skills",      path: "/directory.html" }, { name: "Build",   path: "/create.html" }],
  "skill.html":      [{ name: "Skills",      path: "/directory.html" }, { name: "Skill",   path: "/skill.html" }],
  "mcp.html":        [{ name: "MCP",         path: "/mcp.html" }],
  "plugins.html":    [{ name: "Plugins",     path: "/plugins.html" }],
  "api.html":        [{ name: "API",         path: "/api.html" }],
  "commands.html":   [{ name: "Commands",    path: "/commands.html" }],
  "hooks.html":      [{ name: "Hooks",       path: "/hooks.html" }],
  "models.html":     [{ name: "Models",      path: "/models.html" }],
};

function breadcrumb(file) {
  const items = [{ "@type": "ListItem", position: 1, name: "Home", item: BASE + "/" }];
  (CRUMBS[file] || []).forEach((c, i) => {
    items.push({ "@type": "ListItem", position: 2 + i, name: c.name, item: BASE + c.path });
  });
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

// FAQPage schema for the home (matches the FAQ section we just added).
const faqPage = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a Claude Agent Skill?",
      acceptedAnswer: { "@type": "Answer", text: "A skill is a folder containing a SKILL.md file (YAML frontmatter + markdown body) plus optional scripts and reference files. Claude loads the skill on demand when a user's prompt matches its description — extending what Claude can do without bloating every prompt." }
    },
    {
      "@type": "Question",
      name: "Where do I put my Claude skills?",
      acceptedAnswer: { "@type": "Answer", text: "User-scope skills go in ~/.claude/skills/<skill-name>/. Project-scope skills go in .claude/skills/ inside the repo. Claude Code auto-discovers both at session start. For claude.ai, upload skills via Settings → Capabilities → Skills." }
    },
    {
      "@type": "Question",
      name: "What is MCP (Model Context Protocol)?",
      acceptedAnswer: { "@type": "Answer", text: "MCP is the open JSON-RPC protocol Claude uses to talk to external systems — databases, APIs, your own tools. You install MCP servers (Postgres, GitHub, Slack, Figma, etc.) and Claude can call their tools mid-conversation." }
    },
    {
      "@type": "Question",
      name: "Which Claude model should I use?",
      acceptedAnswer: { "@type": "Answer", text: "Default to Claude Sonnet 4.6 — strong, fast, ~5× cheaper than Opus. Use Claude Opus 4.7 for hard reasoning, large refactors, and multi-step plans. Use Claude Haiku 4.5 for high-volume routing and classification." }
    },
    {
      "@type": "Question",
      name: "How do I install Claude Code?",
      acceptedAnswer: { "@type": "Answer", text: "Run npm install -g @anthropic-ai/claude-code, then claude in your project. Sign in with claude.ai (subscription) or an API key. Full setup walkthrough in the Quickstart guide." }
    },
    {
      "@type": "Question",
      name: "What's the difference between a skill, a slash command, and an MCP server?",
      acceptedAnswer: { "@type": "Answer", text: "Skills trigger automatically from natural-language matching. Slash commands are user-typed shortcuts (/review). MCP servers are long-running processes that expose tools Claude can call. They layer together." }
    },
    {
      "@type": "Question",
      name: "How does prompt caching reduce API costs?",
      acceptedAnswer: { "@type": "Answer", text: "Mark a stable prompt prefix with cache_control type ephemeral and cache hits within 5 minutes are ~90% cheaper. Heavy users see the cache extend for hours." }
    },
    {
      "@type": "Question",
      name: "Is ClaudeBro affiliated with Anthropic?",
      acceptedAnswer: { "@type": "Answer", text: "No. ClaudeBro is an unofficial community resource. All Claude trademarks and skill names belong to their respective owners. Official documentation lives at docs.claude.com." }
    }
  ]
};

function inject(file, schemas) {
  const p = "d:/claude/" + file;
  let html = fs.readFileSync(p, "utf8");
  const orig = html;

  // Remove any previously-injected extras (idempotent).
  html = html.replace(/<script type="application\/ld\+json"\s+data-extra[\s\S]*?<\/script>\s*/g, "");

  // Build new extras block right before </head>.
  const blocks = schemas.map((s, i) =>
    `<script type="application/ld+json" data-extra="${i}">\n${JSON.stringify(s, null, 2)}\n</script>`
  ).join("\n");

  html = html.replace(/(<\/head>)/, blocks + "\n$1");

  if (html !== orig) {
    fs.writeFileSync(p, html);
    console.log(file + ": +" + schemas.length + " JSON-LD blocks");
  } else {
    console.log(file + ": no change");
  }
}

// Home: FAQPage + BreadcrumbList (just Home).
inject("index.html", [faqPage, breadcrumb("index.html")]);

// All other pages: BreadcrumbList.
Object.keys(CRUMBS).forEach(f => inject(f, [breadcrumb(f)]));
