// A refresh always starts from the top. Links to a section of a page still land on it.
history.scrollRestoration = "manual";
const navEntry = performance.getEntriesByType("navigation")[0];
if (navEntry && navEntry.type === "reload" && location.hash) history.replaceState(null, "", location.pathname + location.search);
if (!location.hash) {
  scrollTo(0, 0);
  addEventListener("pageshow", () => scrollTo(0, 0));
}

const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (n) => Math.min(1, Math.max(0, n));
const RAD = Math.PI / 180;

// Hero wires and the four skills from the current hero
const NODES = [
  ["Generative AI", 125, 55, "M300 250 H225 V55 H125"],
  ["Prompting", 95, 180, "M300 250 H190 V180 H95"],
  ["Design", 95, 320, "M300 250 H190 V320 H95"],
  ["Digital Literacy", 125, 445, "M300 250 H225 V445 H125"],
  ["Canva Design", 480, 85, "M300 250 H395 V85 H480"],
  ["Careers", 505, 250, "M300 250 H505"],
  ["Google Workspace", 480, 415, "M300 250 H395 V415 H480"],
];
const NS = "http://www.w3.org/2000/svg";
const wires = document.getElementById("wires"), board = document.getElementById("board");
if (board) NODES.forEach(([name, x, y, d], i) => {
  ["wire", "pulse"].forEach((cls) => {
    const p = document.createElementNS(NS, "path");
    p.setAttribute("d", d);
    p.setAttribute("class", cls);
    p.setAttribute("pathLength", "1000");
    if (cls === "pulse") p.style.animationDelay = i * (-3.6 / NODES.length) + "s";
    wires.append(p);
  });
  const el = document.createElement("div");
  el.className = "node";
  el.textContent = name;
  el.style.left = x / 6 + "%";
  el.style.top = y / 5 + "%";
  el.style.animationDelay = i * (-3.6 / NODES.length) + "s";
  board.append(el);
});

// Skills ticker
const SKILLS = ["Artificial Intelligence", "Generative AI", "Prompt Engineering", "Canva Design", "Google Workspace", "Digital Literacy", "Career Readiness"];
const ticker = document.getElementById("ticker");
if (ticker) [...SKILLS, ...SKILLS].forEach((t) => {
  const s = document.createElement("span");
  s.textContent = t;
  const i = document.createElement("i");
  i.textContent = "✦";
  ticker.append(s, i);
});

// Headings: words sharpen into place one at a time
const splitWords = (el) => {
  let i = 0;
  const walk = (parent, gradient) => {
    [...parent.childNodes].forEach((n) => {
      if (n.nodeType === 1) {
        const isG = n.classList.contains("g");
        walk(n, gradient || isG);
        if (isG) n.classList.remove("g");
        return;
      }
      if (n.nodeType !== 3) return;
      const frag = document.createDocumentFragment();
      n.textContent.split(/(\s+)/).forEach((part) => {
        if (!part.trim()) { frag.append(part); return; }
        const w = document.createElement("span");
        w.className = gradient ? "w g" : "w";
        w.style.setProperty("--i", i++);
        w.textContent = part;
        frag.append(w);
      });
      n.replaceWith(frag);
    });
  };
  walk(el, false);
};
const INTRO_MS = reduce || document.documentElement.classList.contains("no-intro") ? 150 : 1900;
const heroTitle = document.querySelector("#hero h1");
const headings = [...document.querySelectorAll("h2")];
[heroTitle, ...headings].forEach(splitWords);
setTimeout(() => heroTitle.classList.add("say"), INTRO_MS);
const sayIO = new IntersectionObserver((list) => list.forEach((e) => {
  if (e.isIntersecting) { e.target.classList.add("say"); sayIO.unobserve(e.target); }
}), { threshold: 0.3 });
headings.forEach((h) => sayIO.observe(h));

// Icons: trace each line so it can draw itself
document.querySelectorAll(".icon svg *").forEach((s) => s.setAttribute("pathLength", "1"));

// Cards fade up one after another, and their icons draw in
const riseIO = new IntersectionObserver((list) => list.forEach((e) => {
  if (!e.isIntersecting) return;
  e.target.classList.add("in", "drawn");
  riseIO.unobserve(e.target);
  // Hand the card back to its own hover styles once it has landed
  setTimeout(() => e.target.classList.remove("rise", "in"), 1600);
}), { threshold: 0.1 });
document.querySelectorAll(".pillars, .cards, .partners, .steps, .who-grid, .vgrid, .faq, .clist, .stagger").forEach((group) => {
  [...group.children].forEach((c, i) => {
    c.classList.add("rise");
    c.style.setProperty("--i", i);
    const icon = c.querySelector(".icon");
    if (icon) icon.style.setProperty("--i", i);
    riseIO.observe(c);
  });
});

// Cards glow around the cursor
document.addEventListener("pointermove", (e) => {
  const c = e.target.closest && e.target.closest(".glow");
  if (!c) return;
  const r = c.getBoundingClientRect();
  c.style.setProperty("--x", e.clientX - r.left + "px");
  c.style.setProperty("--y", e.clientY - r.top + "px");
});

// Menu: full-width bar at the top, floating pill after that
const nav = document.getElementById("nav");
const burger = document.getElementById("burger");
const links = document.getElementById("links");
burger.addEventListener("click", () => {
  const open = links.classList.toggle("open");
  burger.setAttribute("aria-expanded", open);
});
links.addEventListener("click", (e) => {
  if (e.target.closest("a")) { links.classList.remove("open"); burger.setAttribute("aria-expanded", false); }
});
let pillW = 0;
const measureNav = () => {
  const was = nav.style.transition;
  nav.style.transition = "none";
  nav.style.width = "max-content";
  pillW = nav.offsetWidth;
  nav.style.width = "";
  void nav.offsetWidth;
  nav.style.transition = was;
};
const setNav = () => {
  const full = scrollY < 60;
  nav.classList.toggle("full", full);
  const max = innerWidth - 24;
  nav.style.width = Math.min(max, full ? Math.min(1240, max) : pillW) + "px";
};
document.fonts.ready.then(() => { measureNav(); setNav(); });
measureNav();
setNav();

// Hero tilts back into depth while the next section rises and straightens over it
const heroWrap = document.getElementById("heroWrap");
const hero = document.getElementById("hero");
const sheet = document.getElementById("sheet");
const heroEdge = document.body.classList.contains("canva-page") ? ["59,130,246", "125,190,255"] : ["242,106,19", "255,154,60"];
const setHero3D = () => {
  if (reduce) return;
  const r = heroWrap.getBoundingClientRect();
  const t = clamp(-r.top / ((r.height - innerHeight) * 0.62));
  const e = t * t * (3 - 2 * t);
  hero.style.transform = e ? `translate3d(0,${-7 * e}%,${-300 * e}px) rotateX(${32 * e}deg)` : "";
  hero.style.borderRadius = 40 * e + "px";
  hero.style.boxShadow = e ? `0 0 ${90 * e}px rgba(${heroEdge[0]},${0.5 * e}), inset 0 0 0 1px rgba(${heroEdge[1]},${0.45 * e})` : "";
  hero.style.setProperty("--dim", (0.45 * e).toFixed(3));

  const q = clamp((innerHeight - (sheet.offsetTop - scrollY)) / innerHeight);
  const s = q * q * (3 - 2 * q);
  sheet.style.transform = s < 1 ? `perspective(1500px) rotateX(${-20 * (1 - s)}deg) scale(${0.9 + 0.1 * s})` : "none";
};

// Who We Serve panel grows as it arrives
const grow = document.getElementById("grow");
const setGrow = () => {
  if (reduce || !grow) return;
  const q = clamp((innerHeight - grow.getBoundingClientRect().top) / (innerHeight * 0.75));
  grow.style.transform = `scale(${0.88 + 0.12 * q})`;
};

// How We Teach: steps light up in order
const stepsEl = document.getElementById("steps");
const stepEls = stepsEl ? [...stepsEl.children] : [];
const setSteps = () => {
  if (!stepsEl) return;
  const q = clamp((innerHeight * 0.9 - stepsEl.getBoundingClientRect().top) / (innerHeight * 0.55));
  stepEls.forEach((s, i) => s.classList.toggle("lit", reduce || q >= (i + 0.4) / stepEls.length));
};

// Trainer cards fan out as they arrive (phones swipe instead)
const deck = document.getElementById("deck");
const cards = deck ? [...deck.children] : [];
const END = [
  { x: -2, y: 0.08, r: -8 },
  { x: -1, y: -0.05, r: -4 },
  { x: 0, y: 0.03, r: 1 },
  { x: 1, y: -0.05, r: 4 },
  { x: 2, y: 0.08, r: 8 },
];
const setFan = () => {
  if (!deck || innerWidth <= 720) return;
  const p = reduce ? 1 : clamp((innerHeight - deck.getBoundingClientRect().top) / (innerHeight * 0.8));
  const e = p * p * (3 - 2 * p);
  const w = cards[0].offsetWidth;
  const spread = Math.min(0.96, (deck.clientWidth / 2 - w / 2 - 10) / (2 * w));
  cards.forEach((c, i) => {
    const a = END[i];
    c.style.setProperty("--tx", a.x * w * spread * e + "px");
    c.style.setProperty("--ty", a.y * w * e + "px");
    c.style.setProperty("--r", a.r * e + (1 - e) * (i - 2) * 2 + "deg");
  });
};

// The menu's button style follows the section in the middle of the screen
const themed = [...document.querySelectorAll("[data-theme]")].reverse();
const onScroll = () => {
  setHero3D();
  setNav();
  setGrow();
  setSteps();
  setFan();
  const mid = innerHeight * 0.5;
  const cur = themed.find((s) => { const r = s.getBoundingClientRect(); return r.top <= mid && r.bottom >= mid; });
  document.body.classList.toggle("light", !!cur && cur.dataset.theme === "light");
};
addEventListener("scroll", onScroll, { passive: true });
addEventListener("resize", () => { measureNav(); onScroll(); });
onScroll();

// Glide scrolling: mouse wheels ease to a target. Touch and keyboards stay native.
let target = scrollY, current = scrollY, gliding = false;
const maxScroll = () => document.documentElement.scrollHeight - innerHeight;
const glide = () => {
  current += (target - current) * 0.1;
  if (Math.abs(target - current) < 0.6) {
    current = target;
    gliding = false;
  }
  scrollTo(0, current);
  if (gliding) requestAnimationFrame(glide);
};
const startGlide = () => {
  if (gliding) return;
  gliding = true;
  current = scrollY;
  requestAnimationFrame(glide);
};
if (!reduce) {
  addEventListener("wheel", (e) => {
    if (e.ctrlKey || e.target.closest("textarea, select, .deck")) return;
    e.preventDefault();
    const unit = e.deltaMode === 1 ? 32 : e.deltaMode === 2 ? innerHeight : 1;
    if (!gliding) target = scrollY;
    target = Math.min(maxScroll(), Math.max(0, target + e.deltaY * unit));
    startGlide();
  }, { passive: false });
}
document.addEventListener("click", (e) => {
  const a = e.target.closest && e.target.closest('a[href^="#"]');
  if (!a) return;
  const el = document.querySelector(a.getAttribute("href"));
  if (!el) return;
  e.preventDefault();
  // Pinned sections report where they are pinned, so measure the section they sit in
  const host = el.closest("#gWrap, #heroWrap") || el;
  const y = host.id === "heroWrap" ? 0 : host.getBoundingClientRect().top + scrollY - (host.id === "gWrap" ? 0 : 70);
  if (reduce) { scrollTo(0, y); return; }
  target = Math.min(maxScroll(), Math.max(0, y));
  startGlide();
});

// Contact form: opens WhatsApp with the enquiry ready to send to Urban Chanakya
const WHATSAPP_NUMBER = "917002308545";
const form = document.getElementById("contact-form");
if (form) form.addEventListener("submit", (e) => {
  e.preventDefault();
  const d = new FormData(form);
  const value = (key) => String(d.get(key) || "").trim() || "Not provided";
  const message = [
    "*New Website Enquiry*",
    "",
    `*Name:* ${value("name")}`,
    `*Email:* ${value("email")}`,
    `*Phone:* ${value("phone")}`,
    `*I am a:* ${value("type")}`,
    "",
    "*Message:*",
    value("message"),
  ].join("\n");
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  const opened = window.open(url, "_blank");
  if (opened) opened.opener = null;
  else window.location.href = url;
  form.querySelector(".form-note").textContent = "Opening WhatsApp… Press Send there to deliver your enquiry. If nothing happens, message +91 70023 08545 on WhatsApp.";
});

// Arriving from a link to a section: land on that section
const landOnHash = () => {
  if (!location.hash) return;
  let el = null;
  try { el = document.querySelector(location.hash); } catch (e) { return; }
  if (!el) return;
  const host = el.closest("#gWrap, #heroWrap") || el;
  scrollTo(0, host.id === "heroWrap" ? 0 : host.getBoundingClientRect().top + scrollY - (host.id === "gWrap" ? 0 : 70));
  onScroll();
};
addEventListener("load", landOnHash);
landOnHash();

// Sections that hold still while the next one slides over them
const stays = [...document.querySelectorAll(".stay")];
const setStays = () => stays.forEach((s) => { s.style.top = Math.min(0, innerHeight - s.offsetHeight) + "px"; });
setStays();
addEventListener("resize", setStays);
addEventListener("load", setStays);

// Cards that tilt in 3D under the cursor
if (!reduce) document.querySelectorAll(".tilt").forEach((c) => {
  c.addEventListener("pointermove", (e) => {
    if (e.pointerType === "touch") return;
    const r = c.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
    c.style.transform = `perspective(900px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-4px)`;
  });
  c.addEventListener("pointerleave", () => { c.style.transform = ""; });
});

// Numbers count up as they appear
const countIO = new IntersectionObserver((list) => list.forEach((e) => {
  if (!e.isIntersecting) return;
  countIO.unobserve(e.target);
  const m = e.target.textContent.match(/^(\d+)(.*)$/);
  if (!m || reduce) return;
  const end = +m[1], t0 = performance.now();
  const step = (now) => {
    const t = clamp((now - t0) / 1200);
    e.target.textContent = Math.round(end * (1 - Math.pow(1 - t, 3))) + m[2];
    if (t < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}), { threshold: 0.5 });
document.querySelectorAll(".count").forEach((n) => countIO.observe(n));

// PARTS: letters move on every 3 seconds, pausing while off screen or in use
const PARTS = [
  { t: "Persona", d: "Identify who you are in relation to the task, so the AI can tailor its output to your role.", e: '"You are a Senior Faculty Developer and expert in Academic Assessment."' },
  { t: "Aim", d: "State your objective clearly in direct language. Break large tasks into smaller chunks.", e: '"Analyze the effectiveness of the following learning outcome: Understand the ethical implications of algorithmic bias in machine learning."' },
  { t: "Recipients", d: "Specify the audience: students, fellow educators or the general public. This sets the tone and complexity.", e: '"The audience is faculty teaching Engineering and Philosophy."' },
  { t: "Theme", d: "Describe the desired style, tone and any relevant parameters.", e: '"Use scholarly, precise, and pedagogically rigorous language."' },
  { t: "Structure", d: "Note the format you expect: a short paragraph, a detailed list, a table or a complete script.", e: '"Format as a structured critique. Use a table to compare the original outcome with your alternatives, and include a brief Rationale for each change."' },
];
const partsPanel = document.querySelector(".parts-panel");
if (partsPanel) {
  const parts = document.querySelector(".parts");
  const partsTabs = [...document.querySelectorAll(".parts-tabs button")];
  let partIndex = 0, partsVisible = false, partsTimer;
  const fillPart = (p) => {
    partsPanel.querySelector(".parts-letter").textContent = p.t[0];
    partsPanel.querySelector(".parts-title").textContent = p.t;
    partsPanel.querySelector(".parts-desc").textContent = p.d;
    partsPanel.querySelector(".parts-example p").textContent = p.e;
  };
  const showPart = (i) => {
    partIndex = i;
    partsTabs.forEach((b, n) => b.setAttribute("aria-selected", n === i));
    fillPart(PARTS[i]);
    partsPanel.classList.remove("swap");
    void partsPanel.offsetWidth;
    partsPanel.classList.add("swap");
  };
  // Keep the panel at its tallest so the page doesn't jump as letters change
  const fitParts = () => {
    partsPanel.style.minHeight = "";
    let tallest = 0;
    PARTS.forEach((p) => { fillPart(p); tallest = Math.max(tallest, partsPanel.offsetHeight); });
    fillPart(PARTS[partIndex]);
    partsPanel.style.minHeight = tallest + "px";
  };
  fitParts();
  addEventListener("resize", fitParts);
  document.fonts.ready.then(fitParts);
  if (!reduce) {
    new IntersectionObserver(([e]) => { partsVisible = e.isIntersecting; }).observe(parts);
    partsTimer = setInterval(() => {
      if (partsVisible && !parts.matches(":hover, :focus-within")) showPart((partIndex + 1) % PARTS.length);
    }, 3000);
  }
  // Picking a letter stops the cycle so it stays open to read
  partsTabs.forEach((btn, i) => btn.addEventListener("click", () => {
    clearInterval(partsTimer);
    showPart(i);
  }));
}

// Audience tabs
const audTabs = [...document.querySelectorAll(".aud-tabs button")];
audTabs.forEach((btn) => btn.addEventListener("click", () => {
  audTabs.forEach((b) => b.setAttribute("aria-selected", b === btn));
  document.querySelectorAll(".aud-panel").forEach((p) => {
    p.hidden = p.dataset.aud !== btn.dataset.aud;
    if (!p.hidden) {
      p.classList.remove("swap");
      void p.offsetWidth;
      p.classList.add("swap");
    }
  });
  setStays();
}));

// The globe, on pages that have one
if (document.getElementById("globe")) {
// India's boundary, from the data file beside this page
const INDIA_RINGS = window.INDIA_OUTLINE.rings;
const INDIA_ISLES = window.INDIA_OUTLINE.isles;
const inIndia = (lon, lat) => {
  if (lon < 68 || lon > 97.5 || lat < 6.5 || lat > 37.2) return false;
  let hit = false;
  for (const ring of INDIA_RINGS) {
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i], [xj, yj] = ring[j];
      if ((yi > lat) !== (yj > lat) && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) hit = !hit;
    }
  }
  return hit;
};

// Build dots from real land shapes, drawn to a hidden flat map and read back
let world = [], india = [];
const small = innerWidth < 700;
const buildDots = (isLand) => {
  const step = small ? 2.6 : 1.9;
  const next = [];
  for (let lat = -58; lat <= 80; lat += step) {
    const ring = Math.max(1, Math.round((360 * Math.cos(lat * RAD)) / step));
    for (let k = 0; k < ring; k++) {
      const lon = -180 + (k * 360) / ring;
      if (isLand(lon, lat) && !inIndia(lon, lat)) next.push([lon, lat]);
    }
  }
  world = next;
  const fine = small ? 1 : 0.72;
  const local = [...INDIA_ISLES];
  for (let lat = 6.5; lat <= 37.2; lat += fine) for (let lon = 68; lon <= 97.5; lon += fine) if (inIndia(lon, lat)) local.push([lon, lat]);
  india = local;
};
const loadLand = async () => {
  const data = await (await fetch("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-110m.json")).json();
  const geo = topojson.feature(data, data.objects.land);
  const W = 1440, H = 720;
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const x = c.getContext("2d", { willReadFrequently: true });
  x.fillStyle = "#fff";
  const polys = geo.features ? geo.features.flatMap((f) => f.geometry.coordinates) : geo.geometry.coordinates;
  polys.forEach((poly) => {
    x.beginPath();
    poly.forEach((ring) => ring.forEach(([lon, lat], i) => {
      const px = ((lon + 180) / 360) * W, py = ((90 - lat) / 180) * H;
      // Shapes crossing the date line would otherwise smear across the map
      const jump = i && Math.abs(lon - ring[i - 1][0]) > 180;
      i && !jump ? x.lineTo(px, py) : x.moveTo(px, py);
    }));
    x.fill("evenodd");
  });
  const img = x.getImageData(0, 0, W, H).data;
  buildDots((lon, lat) => {
    const px = Math.min(W - 1, Math.floor(((lon + 180) / 360) * W)), py = Math.min(H - 1, Math.floor(((90 - lat) / 180) * H));
    return img[(py * W + px) * 4 + 3] > 128;
  });
};

const canvas = document.getElementById("globe");
const ctx = canvas.getContext("2d");
const gstick = document.getElementById("gstick");
const gWrap = document.getElementById("gWrap");
let W = 0, H = 0, dpr = 1, R = 0;
const size = () => {
  dpr = Math.min(devicePixelRatio || 1, 2);
  W = gstick.clientWidth; H = gstick.clientHeight;
  canvas.width = W * dpr; canvas.height = H * dpr;
  R = Math.min(W * 0.44, H * 0.38);
};
const TILT = -8 * RAD, ca = Math.cos(TILT), sa = Math.sin(TILT);
const project = (lon, lat, lon0) => {
  const la = lat * RAD, d = (lon - lon0) * RAD;
  const x = Math.cos(la) * Math.sin(d), y = Math.sin(la), z = Math.cos(la) * Math.cos(d);
  return [x, y * ca + z * sa, z * ca - y * sa];
};
const draw = (now) => {
  const box = gWrap.getBoundingClientRect();
  const p = clamp(-box.top / (box.height - innerHeight));
  const rise = 1 - Math.pow(1 - clamp(p / 0.5), 2);
  const t = reduce ? 0 : now / 1000;
  const cx = W / 2;
  const cy = H + R * 0.55 - rise * (R * 0.55 + H * 0.3);
  const lon0 = 80 + Math.sin(t * 0.22) * 26;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  const halo = ctx.createRadialGradient(cx, cy, R * 0.8, cx, cy, R * 1.75);
  halo.addColorStop(0, "rgba(242,106,19,.1)");
  halo.addColorStop(0.2, "rgba(255,150,70,.95)");
  halo.addColorStop(0.28, "rgba(242,106,19,.5)");
  halo.addColorStop(0.55, "rgba(242,106,19,.13)");
  halo.addColorStop(1, "rgba(242,106,19,0)");
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(cx, cy, R * 1.75, 0, 7);
  ctx.fill();

  const ball = ctx.createRadialGradient(cx, cy, R * 0.55, cx, cy, R);
  ball.addColorStop(0, "#07070c");
  ball.addColorStop(0.82, "#0d0a0e");
  ball.addColorStop(1, "#3a1707");
  ctx.fillStyle = ball;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, 7);
  ctx.fill();

  const dot = Math.max(1.1, R * 0.0062);
  ctx.fillStyle = "rgba(226,232,240,.78)";
  ctx.beginPath();
  for (const [lon, lat] of world) {
    const [x, y, z] = project(lon, lat, lon0);
    if (z < 0.04) continue;
    const sx = cx + x * R, sy = cy - y * R;
    ctx.moveTo(sx + dot, sy);
    ctx.arc(sx, sy, dot, 0, 7);
  }
  ctx.fill();

  // India's real boundary, so narrow areas stay visible between the dots
  ctx.beginPath();
  for (const ring of INDIA_RINGS) {
    ring.forEach(([lon, lat], i) => {
      const [x, y] = project(lon, lat, lon0);
      const sx = cx + x * R, sy = cy - y * R;
      i ? ctx.lineTo(sx, sy) : ctx.moveTo(sx, sy);
    });
    ctx.closePath();
  }
  ctx.fillStyle = "rgba(242,106,19,.3)";
  ctx.fill("evenodd");
  ctx.strokeStyle = "rgba(255,196,130,.95)";
  ctx.lineWidth = Math.max(0.8, R * 0.0028);
  ctx.lineJoin = "round";
  ctx.stroke();

  ctx.fillStyle = "rgba(255,154,60,.98)";
  ctx.beginPath();
  for (const [lon, lat] of india) {
    const [x, y, z] = project(lon, lat, lon0);
    if (z < 0.04) continue;
    const sx = cx + x * R, sy = cy - y * R;
    ctx.moveTo(sx + dot * 0.8, sy);
    ctx.arc(sx, sy, dot * 0.8, 0, 7);
  }
  ctx.fill();
};

size();
buildDots(() => false);
draw(performance.now());
loadLand().then(() => draw(performance.now())).catch((e) => console.warn("Land data unavailable", e));
let onScreen = false;
new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; }).observe(gWrap);
addEventListener("scroll", () => { if (onScreen) draw(performance.now()); }, { passive: true });
if (!reduce) {
  const loop = (now) => { if (onScreen) draw(now); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}
addEventListener("resize", () => { size(); draw(performance.now()); });
}
