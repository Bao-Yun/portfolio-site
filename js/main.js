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
  if (about.portrait) {
    portraitEl.style.backgroundImage = `url("${about.portrait}")`;
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

function renderResume(about) {
  const educationHtml = (about.education || []).map((e) => `
    <div class="edu-item">
      <div class="edu-item-head">
        <span class="edu-school">${escapeHtml(e.school || "")}</span>
        <span class="edu-period">${escapeHtml(e.period || "")}</span>
      </div>
      <div class="edu-degree">${escapeHtml(e.degree || "")}</div>
      ${e.description ? `<p class="edu-desc">${escapeHtmlWithBreaks(e.description)}</p>` : ""}
    </div>
  `).join("");

  const experienceHtml = (about.experience || []).map((e) => `
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

function workMediaHtml(work) {
  if (work.coverImage) {
    return `<img src="${escapeHtml(work.coverImage)}" alt="${escapeHtml(work.title)}" loading="lazy">`;
  }
  if (work.type === "image" && work.image) {
    return `<img src="${escapeHtml(work.image)}" alt="${escapeHtml(work.title)}" loading="lazy">`;
  }
  if (work.type === "video" && work.linkUrl) {
    const embed = videoEmbedUrl(work.linkUrl);
    if (embed) return `<iframe src="${escapeHtml(embed)}" loading="lazy" allowfullscreen></iframe>`;
  }
  const markLabel = {
    instagram: "IG 貼文嵌入區",
    video: "影片連結",
    pdf: "PDF 檔案",
    link: "外部連結",
  }[work.type] || "作品";
  return `<div class="ph"><div class="ph-icon"></div><span class="ph-mark">${escapeHtml(markLabel)}</span></div>`;
}

function renderWorks(works) {
  const gridEl = document.getElementById("works-grid");
  gridEl.innerHTML = works.map((work, i) => `
    <div class="work-card" data-work-index="${i}">
      <div class="work-media">
        ${workMediaHtml(work)}
        <div class="work-overlay"><span>查看完整案例 →</span></div>
      </div>
      <div class="work-label">
        <div class="work-code">CASE / ${String(i + 1).padStart(2, "0")} — ${escapeHtml(work.category || "")}</div>
        <div class="work-title">${escapeHtml(work.title || "")}</div>
        <div class="work-result">${escapeHtml(work.result || "")}</div>
      </div>
    </div>
  `).join("");

  gridEl.querySelectorAll(".work-card").forEach((card) => {
    card.addEventListener("click", () => openWorkDetail(works[Number(card.dataset.workIndex)]));
  });
}

function openWorkDetail(work) {
  const backdrop = document.getElementById("work-detail-backdrop");
  const content = document.getElementById("work-detail-content");

  let bodyHtml = "";
  if (work.type === "instagram" && work.instagramUrl) {
    bodyHtml = `
      <blockquote class="instagram-media" data-instgrm-permalink="${escapeHtml(work.instagramUrl)}"></blockquote>
    `;
    if (!window.instgrm) {
      const script = document.createElement("script");
      script.async = true;
      script.src = "https://www.instagram.com/embed.js";
      document.body.appendChild(script);
    } else {
      setTimeout(() => window.instgrm.Embeds.process(), 0);
    }
  } else if (work.type === "pdf" && work.pdfFile) {
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
  const [theme, hero, about, footer, works] = await Promise.all([
    fetchJson("data/theme.json"),
    fetchJson("data/hero.json"),
    fetchJson("data/about.json"),
    fetchJson("data/footer.json"),
    fetchJson("data/works-index.json").catch(() => []),
  ]);

  applyTheme(theme);
  renderHero(hero);
  renderAbout(about);
  renderResume(about);
  renderFooter(footer);
  renderWorks(works);

  document.getElementById("work-detail-backdrop").addEventListener("click", (e) => {
    if (e.target.id === "work-detail-backdrop") closeWorkDetail();
  });

  setupRevealObserver();
}

init().catch((err) => console.error(err));
