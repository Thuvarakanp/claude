# Deploying ClaudeBro to claudebro.xyz

The site is fully SEO-prepared. **The only reason Google doesn't see it is
that it isn't deployed yet.** This file walks you through the fastest path
from localhost to indexed-by-Google.

---

## 1. Deploy the static files (5 min)

This is a vanilla static site — no build step, no framework. Pick one host:

### Option A — Cloudflare Pages (recommended, free)

1. Push the project folder to a public or private GitHub repo.
2. Go to https://dash.cloudflare.com/ → **Pages** → **Connect to Git**.
3. Pick the repo. **Build command:** leave empty. **Output directory:** `/`.
4. Deploy. You'll get a `*.pages.dev` URL immediately.
5. **Custom domain:** Pages → your project → **Custom domains** → add `claudebro.xyz`.
6. Cloudflare gives you the DNS records to add at your domain registrar. Add them. Wait ~5 min for propagation.

### Option B — Vercel (also free)

```bash
npm i -g vercel
cd d:/claude
vercel        # follow prompts, choose "no" for framework detection
vercel --prod
```

Then **Project → Settings → Domains** → add `claudebro.xyz`.

### Option C — Netlify

Drag-and-drop `d:/claude/` onto https://app.netlify.com/drop, then add the custom domain.

---

## 2. Confirm HTTPS is live

Open `https://claudebro.xyz/` in a fresh browser tab. Confirm:

- The padlock icon shows (HTTPS works)
- The home page renders
- Click around — every nav link resolves
- View source — confirm OG / JSON-LD tags are present

---

## 3. Submit to Google (do this on day one)

1. **Google Search Console** — https://search.google.com/search-console
2. Add property → use the **URL prefix** option → `https://claudebro.xyz/`
3. **Verify ownership.** Easiest: HTML tag method. Search Console gives you a `<meta name="google-site-verification" content="...">` tag. Paste it into the `<head>` of every page (or just `index.html` for URL-prefix). Re-deploy. Click verify.
4. **Submit your sitemap:** Search Console → **Sitemaps** → enter `sitemap.xml` → Submit.
5. **Request indexing of the home page:** URL Inspection → enter `https://claudebro.xyz/` → "Request indexing". Repeat for `/quickstart.html`, `/directory.html`, `/mcp.html`, `/api.html`.
6. Wait. Google takes anywhere from a few hours to a few weeks for first-pass indexing. Check **Coverage** in Search Console to track progress.

---

## 4. Submit to other engines (covers Bing, DuckDuckGo, ChatGPT-search)

- **Bing Webmaster Tools** — https://www.bing.com/webmasters → add site → submit sitemap.
- **IndexNow** (Bing + Yandex push notifications) — once verified at Bing, generate an IndexNow key and ping `https://api.indexnow.org/indexnow?url=https://claudebro.xyz/&key=YOUR_KEY` after every meaningful content update.

---

## 5. The keyword reality

**Don't try to rank for "claude".** That's Anthropic's brand term and you'll lose to claude.ai, anthropic.com, Wikipedia, the App Store. Target long-tail searches your audience actually types:

- `claude code skills list`
- `claude agent skills directory`
- `claude mcp servers`
- `claude code plugins`
- `claude code hooks examples`
- `claude pro guide`
- `claude opus 4.7 vs sonnet`
- `how to install claude code skills`
- `claudebro` (your own brand — you should own this immediately)

You're well-positioned for those because your page titles, descriptions, and JSON-LD all mention the exact phrases.

---

## 6. Build authority (the slow part)

Google ranks pages partly by who links to them. Day-one tactics:

- Submit to https://github.com/hesreallyhim/awesome-claude-code (a popular awesome-list)
- Post on Hacker News, r/ClaudeAI, r/LocalLLaMA
- Write a launch post on dev.to / Hashnode linking back
- Post on Twitter / Bluesky / LinkedIn with the OG image
- Submit to Product Hunt
- Add the site to your GitHub profile README
- Reach out to Claude-focused YouTubers / bloggers

Every backlink from a real site moves the needle.

---

## 7. Iterate

- Update `<lastmod>` in `sitemap.xml` whenever you change a page.
- Add new pages → add them to sitemap.xml + llms.txt.
- Watch Search Console's **Performance** tab to learn what queries actually bring traffic, then add more content targeting those.

---

## Quick post-deploy checklist

- [ ] `https://claudebro.xyz/` returns 200 with HTTPS
- [ ] `/robots.txt`, `/sitemap.xml`, `/llms.txt`, `/favicon.svg`, `/og-image.svg` all return 200
- [ ] OG / Twitter tags validated (https://www.opengraph.xyz/ + https://cards-dev.twitter.com/validator)
- [ ] Schema.org JSON-LD validated (https://validator.schema.org/)
- [ ] Rich Results test (https://search.google.com/test/rich-results) — FAQPage + BreadcrumbList + Article should all detect
- [ ] PageSpeed Insights run (https://pagespeed.web.dev/) — should score 90+ on this site
- [ ] Submitted to Search Console + Bing Webmaster
- [ ] Sitemap submitted in both
- [ ] First indexing requests sent for top 5 pages
