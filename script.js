/* ============================================================
   Claude Skills Directory — interactions
   ============================================================ */

// ===== Shared helpers =====
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[c]));
}
function categoryLabel(c) {
  return ({
    official: "Official",
    builtin: "Built-in",
    community: "Community",
    mcp: "MCP / Plugin",
    experimental: "Experimental"
  })[c] || c;
}
function skillCardHTML(s) {
  return `
    <a class="skill-card reveal" href="skill.html?slug=${encodeURIComponent(s.slug)}">
      <div class="tag-row">
        <span class="cat-pill ${s.category}">${categoryLabel(s.category)}</span>
        ${(s.surfaces||[]).slice(0,2).map(x=>`<span class="cat-pill">${escapeHtml(x)}</span>`).join("")}
      </div>
      <div class="skill-name"><span class="skill-emoji">${s.emoji||"📦"}</span>${escapeHtml(s.name)}</div>
      <p class="skill-desc">${escapeHtml(s.summary||"")}</p>
      <div class="skill-meta">
        <span>📂 ${escapeHtml(s.source||"")}</span>
        <span>🛠 ${(s.tools||[]).length} tool${(s.tools||[]).length===1?"":"s"}</span>
      </div>
    </a>
  `;
}

// ===== Home page: featured cards + marquee =====
function renderFeatured() {
  const host = document.getElementById("featured-cards");
  if (!host || !window.SKILLS) return;
  const slugs = window.FEATURED_SLUGS || [];
  const featured = slugs.map(slug => window.SKILLS.find(s => s.slug === slug)).filter(Boolean);
  host.innerHTML = featured.map((s, i) => {
    const html = skillCardHTML(s);
    return html.replace('class="skill-card reveal"', `class="skill-card reveal" data-delay="${(i%3)+1}"`);
  }).join("");
}
function renderMarquee() {
  const host = document.getElementById("marquee-track");
  if (!host || !window.SKILLS) return;
  const sample = window.SKILLS.slice(0, 28);
  const item = s => `<span class="marquee-item"><span class="emoji">${s.emoji||"📦"}</span>${escapeHtml(s.name)}</span>`;
  // duplicate so the loop is seamless
  host.innerHTML = sample.map(item).join("") + sample.map(item).join("");
}

// ===== Directory page =====
function renderDirectory() {
  const host = document.getElementById("directory-grid");
  if (!host) return;
  const all = window.SKILLS || [];
  const countEl = document.getElementById("results-count");
  const searchEl = document.getElementById("search-input");
  const filterButtons = document.querySelectorAll(".filter-btn");

  // Annotate filter buttons with counts
  const counts = all.reduce((acc, s) => { acc[s.category] = (acc[s.category]||0) + 1; return acc; }, {});
  counts.all = all.length;
  filterButtons.forEach(btn => {
    const cat = btn.dataset.cat;
    const n = counts[cat] ?? 0;
    if (!btn.querySelector(".count")) {
      const span = document.createElement("span");
      span.className = "count";
      span.textContent = n;
      btn.appendChild(span);
    }
  });

  const state = { q: "", cat: "all" };

  function apply() {
    const q = state.q.trim().toLowerCase();
    const cat = state.cat;
    const filtered = all.filter(s => {
      if (cat !== "all" && s.category !== cat) return false;
      if (!q) return true;
      const hay = [s.name, s.summary, s.description, (s.triggers||[]).join(" "), s.source, (s.surfaces||[]).join(" ")].join(" ").toLowerCase();
      return hay.includes(q);
    });

    host.innerHTML = filtered.map((s, i) => {
      const html = skillCardHTML(s);
      return html.replace('class="skill-card reveal"', `class="skill-card reveal" data-delay="${i%6}"`);
    }).join("");

    if (countEl) {
      countEl.innerHTML = `<strong style="color:var(--text)">${filtered.length}</strong> skill${filtered.length===1?"":"s"}` +
        (cat !== "all" ? ` <span class="cat-pill ${cat}" style="margin-left:6px;">${categoryLabel(cat)}</span>` : "") +
        (q ? ` matching <code>${escapeHtml(q)}</code>` : "");
    }
    if (filtered.length === 0) {
      host.innerHTML = `
        <div class="muted" style="grid-column:1/-1;text-align:center;padding:80px 24px;">
          <div style="font-size:2.5rem;margin-bottom:12px;opacity:.5;">🔍</div>
          <div style="font-size:1.05rem;color:var(--text);margin-bottom:6px;">No skills match those filters</div>
          <div>Try clearing the search or picking a different category.</div>
        </div>`;
    }

    // re-observe the freshly inserted cards
    observeReveals();
    wireSpotlights();
  }

  if (searchEl) {
    searchEl.addEventListener("input", e => { state.q = e.target.value; apply(); });
  }
  const clearBtn = document.getElementById("clear-search");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      state.q = "";
      if (searchEl) { searchEl.value = ""; searchEl.focus(); }
      apply();
    });
  }
  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      state.cat = btn.dataset.cat || "all";
      apply();
    });
  });

  apply();
}

// ===== Skill detail page =====
function renderSkillDetail() {
  const host = document.getElementById("skill-detail");
  if (!host) return;
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");
  const s = (window.SKILLS||[]).find(x => x.slug === slug);

  if (!s) {
    host.innerHTML = `
      <a class="back" href="directory.html">← Back to directory</a>
      <h1>Skill not found</h1>
      <p>We couldn't find a skill with slug <code>${escapeHtml(slug||"")}</code>. It may have been renamed or removed.</p>
      <p><a class="link" href="directory.html">Browse all skills →</a></p>
    `;
    document.title = "Skill not found — Claude Skills Directory";
    return;
  }

  document.title = `${s.name} — Claude Skills Directory`;
  const triggers = (s.triggers||[]).map(t => `<code>${escapeHtml(t)}</code>`).join(" ") || "<span class='muted'>None declared</span>";
  const tools = (s.tools||[]).map(t => `<code>${escapeHtml(t)}</code>`).join(" ") || "<span class='muted'>None declared</span>";
  const surfaces = (s.surfaces||[]).map(t => `<span class="cat-pill">${escapeHtml(t)}</span>`).join(" ") || "<span class='muted'>—</span>";

  host.innerHTML = `
    <a class="back" href="directory.html">← Back to directory</a>
    <div class="frame frame-skill frame-component" data-frame-name="Skill / ${escapeHtml(s.name)}" id="frame-skill">
      <div class="frame-label">
        <span class="f-chev">▸</span>
        <span class="f-icon"></span>
        <span class="f-name">${escapeHtml(s.name)}</span>
        <span class="f-meta">/ Component · ${categoryLabel(s.category)}</span>
      </div>
      <div class="frame-handles"><span class="tl"></span><span class="tr"></span><span class="bl"></span><span class="br"></span></div>
    <h1><span>${s.emoji||"📦"}</span>${escapeHtml(s.name)}</h1>
    <div class="tag-row">
      <span class="cat-pill ${s.category}">${categoryLabel(s.category)}</span>
      <span class="cat-pill">${escapeHtml(s.source||"")}</span>
    </div>
    <p class="skill-desc-lg">${escapeHtml(s.summary||"")}</p>

    <div class="skill-meta-grid reveal">
      <div class="row"><strong>Slug</strong><span><code>${escapeHtml(s.slug)}</code></span></div>
      <div class="row"><strong>Category</strong><span>${categoryLabel(s.category)}</span></div>
      <div class="row"><strong>Surfaces</strong><span>${surfaces}</span></div>
      <div class="row"><strong>Source</strong><span>${escapeHtml(s.source||"—")}</span></div>
      <div class="row"><strong>Triggers</strong><span>${triggers}</span></div>
      <div class="row"><strong>Allowed tools</strong><span>${tools}</span></div>
    </div>

    <h2>What it does</h2>
    <p>${escapeHtml(s.description||s.summary||"")}</p>

    <h2>Install</h2>
    <p>${escapeHtml(s.install||"")}</p>

    <h3>Generic install (copy to ~/.claude/skills/)</h3>
    <pre class="code"><span class="c-tok-com"># 1. clone the source repo</span>
git clone <span class="c-tok-str">${escapeHtml(s.repo||"https://github.com/anthropics/skills")}</span> /tmp/skills-src

<span class="c-tok-com"># 2. copy the skill folder into your user-level skills directory</span>
mkdir -p ~/.claude/skills
cp -r /tmp/skills-src/${escapeHtml(s.slug)} ~/.claude/skills/${escapeHtml(s.slug)}

<span class="c-tok-com"># 3. verify the skill is detected</span>
claude /skills list</pre>

    <h2>How to trigger it</h2>
    <p>Claude loads the skill automatically when your prompt matches its description. Common phrases that trigger this skill:</p>
    <ul>${(s.triggers||["(none declared)"]).map(t => `<li><code>${escapeHtml(t)}</code></li>`).join("")}</ul>

    <h2>Repository / docs</h2>
    <p>${s.repo ? `<a class="link" href="${escapeHtml(s.repo)}" target="_blank" rel="noopener">${escapeHtml(s.repo)} →</a>` : "<span class='muted'>No public repo listed.</span>"}</p>

    <h2>See also</h2>
    <div class="grid-cards">
      ${(window.SKILLS||[])
          .filter(x => x.slug !== s.slug && x.category === s.category)
          .slice(0, 3)
          .map(skillCardHTML).join("") || "<p class='muted'>No related skills.</p>"}
    </div>
    </div>
  `;

  observeReveals();
  wireSpotlights();
}

// ===== Scroll progress bar + topbar scrolled state =====
function wireScrollProgress() {
  const bar = document.querySelector(".scroll-progress");
  const topbar = document.querySelector(".topbar");
  const onScroll = () => {
    const h = document.documentElement;
    if (bar) {
      const max = (h.scrollHeight - h.clientHeight) || 1;
      bar.style.width = ((h.scrollTop / max) * 100) + "%";
    }
    if (topbar) topbar.classList.toggle("is-scrolled", h.scrollTop > 20);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

// ===== Mouse spotlight on cards =====
function wireSpotlights() {
  document.querySelectorAll(".skill-card, .bento-card, .install-card").forEach(el => {
    if (el.dataset.spotlightWired) return;
    el.dataset.spotlightWired = "1";
    el.addEventListener("mousemove", e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", (e.clientX - r.left) + "px");
      el.style.setProperty("--my", (e.clientY - r.top) + "px");
    });
  });
}

// ===== IntersectionObserver scroll-reveal =====
let revealObserver = null;
function observeReveals() {
  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach(el => el.classList.add("in"));
    return;
  }
  if (!revealObserver) {
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          revealObserver.unobserve(en.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -40px 0px" });
  }
  document.querySelectorAll(".reveal:not(.in)").forEach(el => revealObserver.observe(el));
}

// ===== Animated counters =====
function animateCounters() {
  document.querySelectorAll("[data-counter]").forEach(el => {
    const target = parseInt(el.dataset.counter, 10);
    if (isNaN(target)) return;
    const suffix = el.dataset.suffix || "";
    const dur = 1200;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.floor(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = target + suffix;
    };
    requestAnimationFrame(tick);
  });
}

// ===== Back to top FAB =====
function wireFab() {
  const fab = document.getElementById("fab");
  if (!fab) return;
  const onScroll = () => {
    if (window.scrollY > 600) fab.classList.add("visible");
    else fab.classList.remove("visible");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  fab.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  onScroll();
}

// ===== Mobile drawer =====
function wireMobileDrawer() {
  const btn = document.getElementById("menu-toggle");
  const drawer = document.getElementById("mobile-drawer");
  if (!btn || !drawer) return;
  btn.addEventListener("click", () => {
    const open = drawer.classList.toggle("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });
  drawer.querySelectorAll("a").forEach(a => a.addEventListener("click", () => drawer.classList.remove("open")));
}

// ===== Cmd+K command palette =====
function wirePalette() {
  const backdrop = document.getElementById("palette-backdrop");
  if (!backdrop) return;
  const input = document.getElementById("palette-input");
  const results = document.getElementById("palette-results");
  const triggers = document.querySelectorAll("[data-palette-trigger]");

  let focusIdx = 0;
  let current = [];

  function open() {
    backdrop.classList.add("open");
    setTimeout(() => input.focus(), 50);
    render("");
  }
  function close() {
    backdrop.classList.remove("open");
    input.value = "";
  }
  function render(q) {
    const all = window.SKILLS || [];
    q = q.trim().toLowerCase();
    current = !q ? all.slice(0, 30) : all.filter(s => {
      const hay = [s.name, s.summary, (s.triggers||[]).join(" ")].join(" ").toLowerCase();
      return hay.includes(q);
    }).slice(0, 30);
    focusIdx = 0;
    if (current.length === 0) {
      results.innerHTML = `<div class="palette-empty">No skills match <strong>${escapeHtml(q)}</strong></div>`;
      return;
    }
    results.innerHTML = current.map((s, i) => `
      <div class="palette-item${i===focusIdx?' focused':''}" data-slug="${escapeHtml(s.slug)}">
        <span class="emoji">${s.emoji||"📦"}</span>
        <div class="info">
          <div class="name">${escapeHtml(s.name)}</div>
          <div class="desc">${escapeHtml(s.summary||"")}</div>
        </div>
        <span class="cat-pill pill ${s.category}">${categoryLabel(s.category)}</span>
      </div>
    `).join("");
    results.querySelectorAll(".palette-item").forEach((el, i) => {
      el.addEventListener("click", () => navigate(current[i]));
      el.addEventListener("mouseenter", () => { focusIdx = i; updateFocus(); });
    });
  }
  function updateFocus() {
    results.querySelectorAll(".palette-item").forEach((el, i) => el.classList.toggle("focused", i === focusIdx));
    const el = results.querySelector(".palette-item.focused");
    if (el) el.scrollIntoView({ block: "nearest" });
  }
  function navigate(s) {
    if (!s) return;
    window.location.href = `skill.html?slug=${encodeURIComponent(s.slug)}`;
  }

  triggers.forEach(t => t.addEventListener("click", open));

  document.addEventListener("keydown", e => {
    const isOpen = backdrop.classList.contains("open");
    const meta = e.metaKey || e.ctrlKey;
    if (meta && e.key.toLowerCase() === "k") { e.preventDefault(); isOpen ? close() : open(); return; }
    if (!isOpen) return;
    if (e.key === "Escape") { e.preventDefault(); close(); }
    if (e.key === "ArrowDown") { e.preventDefault(); focusIdx = Math.min(current.length-1, focusIdx+1); updateFocus(); }
    if (e.key === "ArrowUp")   { e.preventDefault(); focusIdx = Math.max(0, focusIdx-1); updateFocus(); }
    if (e.key === "Enter")     { e.preventDefault(); navigate(current[focusIdx]); }
  });

  backdrop.addEventListener("click", e => { if (e.target === backdrop) close(); });
  if (input) input.addEventListener("input", e => render(e.target.value));
}

// ===== Layers panel (Figma-style frame nav) =====
function wireLayersPanel() {
  const panel = document.getElementById("layers-panel");
  if (!panel) return;
  const head = panel.querySelector(".layers-head");
  const toggle = panel.querySelector(".lh-toggle");
  head.addEventListener("click", () => {
    const collapsed = panel.classList.toggle("collapsed");
    toggle.textContent = collapsed ? "+" : "−";
  });
  // Auto-build from .frame[data-frame-name] elements on the page
  const list = panel.querySelector(".layers-list");
  if (list && list.children.length === 0) {
    const frames = Array.from(document.querySelectorAll(".frame[data-frame-name]"));
    frames.forEach((f, i) => {
      const li = document.createElement("li");
      const isComp = f.classList.contains("frame-component");
      if (isComp) li.classList.add("component");
      if (f.classList.contains("frame-nested")) li.classList.add("nested");
      li.innerHTML = `<span class="l-icon" style="${isComp?'color:var(--figma-purple)':'color:var(--figma-blue)'}"></span><span>${f.dataset.frameName}</span>`;
      if (!f.id) f.id = "frame-" + i;
      li.addEventListener("click", () => {
        document.getElementById(f.id).scrollIntoView({ behavior: "smooth", block: "start" });
      });
      list.appendChild(li);
    });
  }
  // highlight the current frame as you scroll
  const items = list ? Array.from(list.querySelectorAll("li")) : [];
  if (items.length && "IntersectionObserver" in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          const id = en.target.id;
          items.forEach(it => it.classList.remove("active"));
          const idx = Array.from(document.querySelectorAll(".frame[data-frame-name]")).findIndex(f => f.id === id);
          if (idx >= 0 && items[idx]) items[idx].classList.add("active");
        }
      });
    }, { threshold: 0.25, rootMargin: "-15% 0px -50% 0px" });
    document.querySelectorAll(".frame[data-frame-name]").forEach(f => obs.observe(f));
  }
}

// ===== Boot =====
document.addEventListener("DOMContentLoaded", () => {
  renderFeatured();
  renderMarquee();
  renderDirectory();
  renderSkillDetail();
  wireScrollProgress();
  wireSpotlights();
  observeReveals();
  animateCounters();
  wireFab();
  wireMobileDrawer();
  wirePalette();
  wireLayersPanel();
});
