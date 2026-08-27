const THEME_KEYS = ["ink", "paper", "paperAlt", "sage", "sageDeep", "roseDeep", "rose", "stone", "muted"];

const FONT_SIZE_MAP = { small: "0.7em", medium: "1em", large: "1.3em", xlarge: "1.6em" };
const FONT_FAMILY_MAP = { display: "var(--font-display)", body: "var(--font-body)", mono: "var(--font-mono)" };

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function escapeHtmlWithBreaks(str) {
  return escapeHtml(str).replace(/\n/g, "<br>");
}

// Normalizes an image field to {src,x,y,zoom}. Supports the legacy plain-string
// format (a bare path) alongside the newer {src,x,y,zoom} object, so existing
// content set before this feature keeps rendering unchanged (x:50,y:50,zoom:100
// is exactly the old default look: centered, filling the frame).
function resolveImageField(value) {
  if (!value) return null;
  if (typeof value === "string") return { src: value, x: 50, y: 50, zoom: 100 };
  if (!value.src) return null;
  return {
    src: value.src,
    x: value.x ?? 50,
    y: value.y ?? 50,
    zoom: value.zoom ?? 100,
  };
}

function backgroundImageStyle(imgField) {
  const img = resolveImageField(imgField);
  if (!img) return null;
  return {
    backgroundImage: `url("${img.src}")`,
    backgroundPosition: `${img.x}% ${img.y}%`,
    backgroundSize: `${img.zoom}%`,
  };
}

function applyTheme(theme) {
  const root = document.documentElement;
  for (const key of THEME_KEYS) {
    if (theme[key]) {
      const cssVar = "--color-" + key.replace(/([A-Z])/g, "-$1").toLowerCase();
      root.style.setProperty(cssVar, theme[key]);
    }
  }
}

function renderTitleSegments(segments) {
  return (segments || []).map((seg) => {
    const styles = [];
    if (seg.color) styles.push(`color:${seg.color}`);
    if (seg.fontSize && FONT_SIZE_MAP[seg.fontSize]) styles.push(`font-size:${FONT_SIZE_MAP[seg.fontSize]}`);
    if (seg.fontFamily && FONT_FAMILY_MAP[seg.fontFamily]) styles.push(`font-family:${FONT_FAMILY_MAP[seg.fontFamily]}`);
    const styleAttr = styles.length ? ` style="${styles.join(";")}"` : "";
    const tag = seg.highlight ? "em" : "span";
    const html = `<${tag}${styleAttr}>${escapeHtml(seg.text)}</${tag}>`;
    return seg.lineBreakAfter ? html + "<br>" : html;
  }).join("");
}

function renderHero(hero) {
  document.getElementById("hero-eyebrow").textContent = hero.eyebrow || "";
  document.getElementById("hero-title").innerHTML = renderTitleSegments(hero.titleSegments);
  document.getElementById("hero-subtitle").innerHTML = escapeHtmlWithBreaks(hero.subtitle || "");

  const statsEl = document.getElementById("hero-stats");
  statsEl.innerHTML = (hero.stats || []).map((s) => `
    <div class="stat-row">
      <div class="stat-num">${escapeHtml(s.number)}</div>
      <div class="stat-label">${escapeHtml(s.label)}</div>
    </div>
  `).join("");
}

function renderAbout(about) {
  const portraitEl = document.getElementById("about-portrait");
  const labelEl = document.getElementById("about-portrait-label");
  const portraitStyle = backgroundImageStyle(about.portrait);
  if (portraitStyle) {
    Object.assign(portraitEl.style, portraitStyle);
    labelEl.style.display = "none";
  }

  const copyEl = document.getElementById("about-copy");
  const paragraphsHtml = (about.paragraphs || [])
    .map((p) => `<p class="reveal">${escapeHtmlWithBreaks(p.text ?? p)}</p>`)
    .join("");
  const tagsHtml = (about.tags || [])
    .map((t) => `<span class="tag">${escapeHtml(t.tag ?? t)}</span>`)
    .join("");

  copyEl.innerHTML = `
    <p class="lead reveal">「${escapeHtmlWithBreaks(about.quote || "")}」</p>
    ${paragraphsHtml}
    <div class="about-tags reveal">${tagsHtml}</div>
  `;
}

function renderResume(resume) {
  const educationHtml = (resume.education || []).map((e) => `
    <div class="edu-item">
      <div class="edu-item-head">
        <span class="edu-school">${escapeHtml(e.school || "")}</span>
        <span class="edu-period">${escapeHtml(e.period || "")}</span>
      </div>
      <div class="edu-degree">${escapeHtml(e.degree || "")}</div>
      ${e.description ? `<p class="edu-desc">${escapeHtmlWithBreaks(e.description)}</p>` : ""}
    </div>
  `).join("");

  const experienceHtml = (resume.experience || []).map((e) => `
    <div class="exp-item">
      <div class="exp-item-head">
        <span class="exp-company">${escapeHtml(e.company || "")}</span>
        <span class="exp-period">${escapeHtml(e.period || "")}</span>
      </div>
      <div class="exp-role">${escapeHtml(e.role || "")}</div>
      ${(e.highlights || []).length ? `<ul class="exp-highlights">${
        e.highlights.map((h) => `<li>${escapeHtml(h.text ?? h)}</li>`).join("")
      }</ul>` : ""}
    </div>
  `).join("");

  document.getElementById("resume-education").innerHTML = educationHtml;
  document.getElementById("resume-experience").innerHTML = experienceHtml;
}

function renderFooter(footer) {
  document.getElementById("footer-eyebrow").textContent = footer.eyebrow || "";
  document.getElementById("footer-title").innerHTML = escapeHtmlWithBreaks(footer.title || "");

  const linksEl = document.getElementById("footer-links");
  const emailLink = footer.email
    ? `<a class="footer-link" href="mailto:${escapeHtml(footer.email)}">Email：${escapeHtml(footer.email)}</a>`
    : "";
  const phoneLink = footer.phone
    ? `<a class="footer-link" href="tel:${escapeHtml(footer.phone.replace(/[^\d+]/g, ""))}">電話：${escapeHtml(footer.phone)}</a>`
    : "";
  const socialLinks = (footer.socialLinks || [])
    .map((l) => `<a class="footer-link" href="${escapeHtml(l.url)}">${escapeHtml(l.label)}</a>`)
    .join("");
  linksEl.innerHTML = emailLink + phoneLink + socialLinks;

  const year = new Date().getFullYear();
  document.getElementById("footer-copyright").textContent =
    `© ${year} All works shown are for portfolio purposes.`;
}

function videoEmbedUrl(url) {
  if (!url) return null;
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=|youtube\.com\/embed\/)([\w-]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  return null;
}

let igEmbedRequested = false;
function ensureInstagramEmbed() {
  if (igEmbedRequested) {
    window.instgrm?.Embeds.process();
    return;
  }
  igEmbedRequested = true;
  const script = document.createElement("script");
  script.async = true;
  script.src = "https://www.instagram.com/embed.js";
  document.body.appendChild(script);
}

let fbEmbedRequested = false;
function ensureFacebookEmbed() {
  if (window.FB) {
    window.FB.XFBML.parse();
    return;
  }
  if (fbEmbedRequested) return;
  fbEmbedRequested = true;
  const script = document.createElement("script");
  script.async = true;
  script.crossOrigin = "anonymous";
  script.src = "https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v20.0";
  document.body.appendChild(script);
}

// object-fit:cover already fills+crops the frame; object-position picks the focal point,
// and scale (transform, anchored at that same point) zooms in further within that crop.
function imgTagHtml(imgField, altText) {
  const img = resolveImageField(imgField);
  if (!img) return null;
  const style = `object-position:${img.x}% ${img.y}%; transform:scale(${img.zoom / 100}); transform-origin:${img.x}% ${img.y}%;`;
  return `<img src="${escapeHtml(img.src)}" alt="${escapeHtml(altText)}" loading="lazy" style="${style}">`;
}

// Media that provides its own official embed widget (live, interactive — swipeable/playable)
// instead of a static cover: no cover image to fetch or upload, just the post/video URL.
function workMediaHtml(work) {
  const coverHtml = imgTagHtml(work.coverImage, work.title);
  if (coverHtml) {
    return { html: coverHtml, hasEmbed: false };
  }
  if (work.type === "instagram" && work.instagramUrl) {
    // Instagram's embed.js is meant to resize the iframe to fit via a postMessage handshake,
    // but that resize reliably fails to fire for Reels (works fine for photo/carousel posts) —
    // so Reels get pinned to a 9:16 height instead of trusting the (broken) auto-resize.
    const isReel = /\/(reel|tv)\//.test(work.instagramUrl);
    return {
      html: `<blockquote class="instagram-media" data-instgrm-permalink="${escapeHtml(work.instagramUrl)}" data-instgrm-version="14"></blockquote>`,
      hasEmbed: true,
      embedKind: "instagram",
      isReel,
    };
  }
  if (work.type === "facebook" && work.facebookUrl) {
    const isVideo = /\/(videos|reel)\//.test(work.facebookUrl);
    return {
      html: `<div class="${isVideo ? "fb-video" : "fb-post"}" data-href="${escapeHtml(work.facebookUrl)}" data-width="380"></div>`,
      hasEmbed: true,
      embedKind: "facebook",
      isReel: isVideo,
    };
  }
  if (work.type === "image" && work.image) {
    const imageHtml = imgTagHtml(work.image, work.title);
    if (imageHtml) return { html: imageHtml, hasEmbed: false };
  }
  if (work.type === "video" && work.linkUrl) {
    const embed = videoEmbedUrl(work.linkUrl);
    if (embed) return { html: `<iframe src="${escapeHtml(embed)}" loading="lazy" allowfullscreen></iframe>`, hasEmbed: false };
  }
  const markLabel = {
    instagram: "IG 貼文嵌入區",
    facebook: "Facebook 嵌入區",
    video: "影片連結",
    pdf: "PDF 檔案",
    link: "外部連結",
  }[work.type] || "作品";
  return { html: `<div class="ph"><div class="ph-icon"></div><span class="ph-mark">${escapeHtml(markLabel)}</span></div>`, hasEmbed: false };
}

function workCardHtml(work, index) {
  const media = workMediaHtml(work);
  const label = work.brand || work.category || "";
  const html = `
    <div class="work-card" data-work-index="${index}">
      <div class="work-media${media.hasEmbed ? " has-embed" : ""}${media.isReel ? " is-reel" : ""}">
        ${media.html}
        ${media.hasEmbed ? "" : `<div class="work-overlay"><span>查看完整案例 →</span></div>`}
      </div>
      <div class="work-label">
        <div class="work-code">CASE / ${String(index + 1).padStart(2, "0")} — ${escapeHtml(label)}</div>
        <div class="work-title">${escapeHtml(work.title || "")}</div>
        <div class="work-result">${escapeHtml(work.result || "")}</div>
      </div>
    </div>
  `;
  return { media, html };
}

// Renders one set of work cards into the grid (featured, or a single brand's works —
// whichever is currently showing). Index/numbering is local to what's shown.
function renderWorkGrid(worksToShow) {
  const gridEl = document.getElementById("works-grid");
  const cards = worksToShow.map((w, i) => workCardHtml(w, i));
  gridEl.innerHTML = cards.map((c) => c.html).join("");

  gridEl.querySelectorAll(".work-card").forEach((card) => {
    const i = Number(card.dataset.workIndex);
    const work = worksToShow[i];
    if (cards[i].media.hasEmbed) {
      // Let the live embed (swipe, play, etc.) own the media area; only the label opens the modal.
      card.querySelector(".work-label").addEventListener("click", () => openWorkDetail(work));
    } else {
      card.addEventListener("click", () => openWorkDetail(work));
    }
  });

  if (cards.some((c) => c.media.embedKind === "instagram")) ensureInstagramEmbed();
  if (cards.some((c) => c.media.embedKind === "facebook")) ensureFacebookEmbed();
}

// Homepage shows a curated "featured" set (up to 3, picked in the CMS) instead of just the
// first 3 by list order. "查看更多作品" leads to browsing by employer/brand — not a flat
// reveal-all — since works are organized per company the user worked at. Falls back to
// the old flat behavior if no work has a brand set yet (nothing to browse by).
function renderWorks(allWorks, featuredSlugs) {
  const moreWrap = document.getElementById("works-more-wrap");

  const featuredWorks = (featuredSlugs || [])
    .map((slug) => allWorks.find((w) => w.slug === slug))
    .filter(Boolean);
  const initialWorks = featuredWorks.length ? featuredWorks : allWorks.slice(0, 3);

  // Order brands by the earliest `order` among each brand's own works.
  const brandOrder = new Map();
  allWorks.forEach((w) => {
    if (!w.brand) return;
    const order = w.order ?? 0;
    if (!brandOrder.has(w.brand) || order < brandOrder.get(w.brand)) brandOrder.set(w.brand, order);
  });
  const brands = [...brandOrder.keys()].sort((a, b) => brandOrder.get(a) - brandOrder.get(b));

  function showFeatured() {
    renderWorkGrid(initialWorks);
    if (brands.length) {
      moreWrap.innerHTML = `<button class="works-more-btn" id="works-more-btn">查看更多作品 ↓</button>`;
      moreWrap.hidden = false;
      document.getElementById("works-more-btn").addEventListener("click", showBrandPicker);
    } else if (allWorks.length > initialWorks.length) {
      // No brand data anywhere yet: fall back to a flat reveal-all.
      moreWrap.innerHTML = `<button class="works-more-btn" id="works-more-btn">查看更多作品 ↓</button>`;
      moreWrap.hidden = false;
      document.getElementById("works-more-btn").addEventListener("click", () => {
        renderWorkGrid(allWorks);
        moreWrap.hidden = true;
      });
    } else {
      moreWrap.hidden = true;
    }
  }

  function showBrandPicker() {
    moreWrap.innerHTML = `
      <div class="brand-picker">
        ${brands.map((b) => `<button class="brand-pill" data-brand="${escapeHtml(b)}">${escapeHtml(b)}</button>`).join("")}
      </div>
      <button class="works-more-btn works-back-btn" id="works-back-btn">← 返回精選作品</button>
    `;
    moreWrap.querySelectorAll(".brand-pill").forEach((btn) => {
      btn.addEventListener("click", () => showBrandWorks(btn.dataset.brand));
    });
    document.getElementById("works-back-btn").addEventListener("click", showFeatured);
  }

  function showBrandWorks(brand) {
    const filtered = allWorks
      .filter((w) => w.brand === brand)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    renderWorkGrid(filtered);
    moreWrap.innerHTML = `<button class="works-more-btn works-back-btn" id="works-back-btn">← 返回精選作品</button>`;
    document.getElementById("works-back-btn").addEventListener("click", showFeatured);
  }

  showFeatured();
}

function openWorkDetail(work) {
  const backdrop = document.getElementById("work-detail-backdrop");
  const content = document.getElementById("work-detail-content");

  let bodyHtml = "";
  if (work.type === "pdf" && work.pdfFile) {
    bodyHtml = `<p><a class="footer-link" style="color:var(--color-ink);border-color:var(--color-ink);" href="${escapeHtml(work.pdfFile)}" target="_blank" rel="noopener">開啟 PDF ↗</a></p>`;
  } else if (work.type === "link" && work.linkUrl) {
    bodyHtml = `<p><a class="footer-link" style="color:var(--color-ink);border-color:var(--color-ink);" href="${escapeHtml(work.linkUrl)}" target="_blank" rel="noopener">前往連結 ↗</a></p>`;
  }

  content.innerHTML = `
    <button class="work-detail-close" id="work-detail-close">關閉 ✕</button>
    <div class="work-code">CASE — ${escapeHtml(work.category || "")}</div>
    <h3>${escapeHtml(work.title || "")}</h3>
    ${work.goal ? `<div class="meta"><b>目標：</b>${escapeHtml(work.goal)}</div>` : ""}
    ${work.role ? `<div class="meta"><b>角色：</b>${escapeHtml(work.role)}</div>` : ""}
    ${work.result ? `<div class="meta"><b>成效：</b>${escapeHtml(work.result)}</div>` : ""}
    ${bodyHtml}
    ${work.description ? `<div class="desc">${escapeHtml(work.description)}</div>` : ""}
  `;

  document.getElementById("work-detail-close").addEventListener("click", closeWorkDetail);
  backdrop.classList.add("open");
}

function closeWorkDetail() {
  document.getElementById("work-detail-backdrop").classList.remove("open");
}

function setupRevealObserver() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
}

async function fetchJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  return res.json();
}

async function init() {
  const [theme, hero, about, resume, footer, works, featured] = await Promise.all([
    fetchJson("data/theme.json"),
    fetchJson("data/hero.json"),
    fetchJson("data/about.json"),
    fetchJson("data/resume.json"),
    fetchJson("data/footer.json"),
    fetchJson("data/works-index.json").catch(() => []),
    fetchJson("data/featured.json").catch(() => ({ works: [] })),
  ]);

  applyTheme(theme);
  renderHero(hero);
  renderAbout(about);
  renderResume(resume);
  renderFooter(footer);
  renderWorks(works, featured.works);

  document.getElementById("work-detail-backdrop").addEventListener("click", (e) => {
    if (e.target.id === "work-detail-backdrop") closeWorkDetail();
  });

  setupRevealObserver();
}

init().catch((err) => console.error(err));
