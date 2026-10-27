const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Header becomes glass after scrolling
const header = document.querySelector('.site-header');
const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 20);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Mobile menu
const toggle = document.querySelector('.nav-toggle');
const links = document.getElementById('nav-links');
toggle.addEventListener('click', () => {
  const open = links.classList.toggle('open');
  toggle.setAttribute('aria-expanded', open);
});
links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  links.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}));

// Reveal on scroll, staggered within each group
document.querySelectorAll('.cards, .steps, .who-grid, .partner-cards, .pillars').forEach(group => {
  group.querySelectorAll('.reveal').forEach((el, i) => el.style.setProperty('--d', `${i * 0.08}s`));
});
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

// Rotating hero word
const words = ['AI', 'Design', 'Innovation', 'Careers'];
const wordEl = document.querySelector('.rotator .word');
if (wordEl && !reduceMotion) {
  let i = 0;
  setInterval(() => {
    wordEl.classList.add('out');
    setTimeout(() => {
      i = (i + 1) % words.length;
      wordEl.textContent = words[i];
      wordEl.classList.remove('out');
      // restart the entry animation
      wordEl.style.animation = 'none'; void wordEl.offsetWidth; wordEl.style.animation = '';
    }, 400);
  }, 2800);
}

// Cursor glow + card spotlight
const glow = document.querySelector('.cursor-glow');
window.addEventListener('pointermove', e => {
  glow.style.left = e.clientX + 'px';
  glow.style.top = e.clientY + 'px';
}, { passive: true });
document.querySelectorAll('.card').forEach(card => {
  card.addEventListener('pointermove', e => {
    const r = card.getBoundingClientRect();
    const x = e.clientX - r.left, y = e.clientY - r.top;
    card.style.setProperty('--x', `${x}px`);
    card.style.setProperty('--y', `${y}px`);
    if (!reduceMotion) {
      const rx = ((y / r.height) - .5) * -6, ry = ((x / r.width) - .5) * 6;
      card.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateY(-4px)`;
    }
  });
  card.addEventListener('pointerleave', () => { card.style.transform = ''; });
});

// Animated neural-network background in the hero
const canvas = document.getElementById('network');
if (canvas && !reduceMotion) {
  const ctx = canvas.getContext('2d');
  let w, h, nodes = [], mouse = { x: -999, y: -999 };
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const resize = () => {
    w = canvas.clientWidth; h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(90, Math.floor((w * h) / 14000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
      r: Math.random() * 1.6 + .6, hot: Math.random() < .18
    }));
  };
  resize();
  window.addEventListener('resize', resize);
  canvas.parentElement.addEventListener('pointermove', e => {
    const r = canvas.getBoundingClientRect();
    mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
  });
  canvas.parentElement.addEventListener('pointerleave', () => { mouse.x = mouse.y = -999; });

  let visible = true;
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(canvas);

  const LINK = 130;
  const tick = () => {
    requestAnimationFrame(tick);
    if (!visible) return;
    ctx.clearRect(0, 0, w, h);
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > w) n.vx *= -1;
      if (n.y < 0 || n.y > h) n.vy *= -1;
      const dx = n.x - mouse.x, dy = n.y - mouse.y, d = Math.hypot(dx, dy);
      if (d < 120) { n.x += dx / d * .8; n.y += dy / d * .8; }
    }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < LINK) {
          const o = (1 - d / LINK) * .35;
          ctx.strokeStyle = (a.hot || b.hot) ? `rgba(242,106,19,${o})` : `rgba(150,180,210,${o * .6})`;
          ctx.lineWidth = .8;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
    }
    for (const n of nodes) {
      ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = n.hot ? '#FF9A3C' : 'rgba(210,225,240,.7)';
      if (n.hot) { ctx.shadowColor = '#F26A13'; ctx.shadowBlur = 10; }
      ctx.fill(); ctx.shadowBlur = 0;
    }
  };
  tick();
}

// Contact form: opens the visitor's email app with the enquiry pre-filled.
// Replace with a form service (e.g. Formspree) or your own backend when ready.
const form = document.getElementById('contact-form');
if (form) form.addEventListener('submit', e => {
  e.preventDefault();
  const d = new FormData(form);
  const body = `Name: ${d.get('name')}\nEmail: ${d.get('email')}\nPhone: ${d.get('phone')}\nI am a: ${d.get('type')}\n\n${d.get('message')}`;
  window.location.href = `mailto:info@urbanchanakya.in?subject=${encodeURIComponent('Website enquiry from ' + d.get('name'))}&body=${encodeURIComponent(body)}`;
  form.querySelector('.form-note').textContent = 'Opening your email app… If nothing happens, write to info@urbanchanakya.in.';
});

// PARTS prompting framework tabs (trainers page)
const PARTS = [
  { t: 'Persona', d: 'Identify who you are in relation to the task, so the AI can tailor its output to your role.', e: '"You are a Senior Faculty Developer and expert in Academic Assessment."' },
  { t: 'Aim', d: 'State your objective clearly in direct language. Break large tasks into smaller chunks.', e: '"Analyze the effectiveness of the following learning outcome: Understand the ethical implications of algorithmic bias in machine learning."' },
  { t: 'Recipients', d: 'Specify the audience: students, fellow educators or the general public. This sets the tone and complexity.', e: '"The audience is faculty teaching Engineering and Philosophy."' },
  { t: 'Theme', d: 'Describe the desired style, tone and any relevant parameters.', e: '"Use scholarly, precise, and pedagogically rigorous language."' },
  { t: 'Structure', d: 'Note the format you expect: a short paragraph, a detailed list, a table or a complete script.', e: '"Format as a structured critique. Use a table to compare the original outcome with your alternatives, and include a brief Rationale for each change."' }
];
const partsTabs = document.querySelectorAll('.parts-tabs button');
const partsPanel = document.querySelector('.parts-panel');
if (partsPanel) {
  partsTabs.forEach(btn => btn.addEventListener('click', () => {
    const p = PARTS[btn.dataset.i];
    partsTabs.forEach(b => b.setAttribute('aria-selected', b === btn));
    partsPanel.querySelector('.parts-letter').textContent = p.t[0];
    partsPanel.querySelector('.parts-title').textContent = p.t;
    partsPanel.querySelector('.parts-desc').textContent = p.d;
    partsPanel.querySelector('.parts-example p').textContent = p.e;
    partsPanel.classList.remove('swap'); void partsPanel.offsetWidth; partsPanel.classList.add('swap');
  }));
}

// Audience tabs (Canva page)
const audTabs = document.querySelectorAll('.aud-tabs button');
audTabs.forEach(btn => btn.addEventListener('click', () => {
  audTabs.forEach(b => b.setAttribute('aria-selected', b === btn));
  document.querySelectorAll('.aud-panel').forEach(p => { p.hidden = p.dataset.aud !== btn.dataset.aud; });
}));

// YouTube: show a thumbnail and load the real player only on click
document.querySelectorAll('.yt-player').forEach(el => {
  el.addEventListener('click', () => {
    if (el.classList.contains('playing')) return;
    const f = document.createElement('iframe');
    f.src = `https://www.youtube-nocookie.com/embed/${el.dataset.id}?autoplay=1&rel=0`;
    f.title = el.dataset.title;
    f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    f.allowFullscreen = true;
    el.classList.add('playing');
    el.replaceChildren(f);
  });
});

document.getElementById('year').textContent = new Date().getFullYear();
