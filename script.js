/* ============================================================
   PARLAMENTI ERŐTÉR 2026 — JavaScript
   ============================================================ */

'use strict';

/* ── SECTION 0 adatok — itt frissítsd a számokat ─────────────
   Utolsó frissítés: 2026. március 30.
   ──────────────────────────────────────────────────────────── */

const POLL_DATE = '2026. március 30.';

const PARTIES = [
  {
    abbr:      'TISZA',
    name:      'Tisztelet és Szabadság Párt',
    leader:    'Magyar Péter',
    color:     '#2A6DB5',
    pct:       47.8,
    threshold: 'in',   // 'in' | 'edge' | 'out'
  },
  {
    abbr:      'Fidesz–KDNP',
    name:      'Fidesz – Magyar Polgári Szövetség',
    leader:    'Orbán Viktor',
    color:     '#C03030',
    pct:       40.5,
    threshold: 'in',
  },
  {
    abbr:      'Mi Hazánk',
    name:      'Mi Hazánk Mozgalom',
    leader:    'Toroczkai László',
    color:     '#C07020',
    pct:       5.7,
    threshold: 'in',
  },
  {
    abbr:      'DK',
    name:      'Demokratikus Koalíció',
    leader:    'Dobrev Klára',
    color:     '#8B1A4A',
    pct:       2.8,
    threshold: 'edge',
  },
  {
    abbr:      'MKKP',
    name:      'Magyar Kétfarkú Kutya Párt',
    leader:    'Nagy Dávid',
    color:     '#2B7A3B',
    pct:       2.8,
    threshold: 'edge',
  },
];

// Közvélemény-kutatások — legfrissebb elérhető mérés intézetenként
const POLLS = [
  {
    inst:    'Republikon',
    date:    '2026. márc. 23–26.',
    type:    'independent',   // 'independent' | 'gov'
    results: { TISZA: 49, Fidesz: 40, MiHazank: 5, DK: 2, MKKP: 4 },
  },
  {
    inst:    'Medián',
    date:    '2026. márc. 17–20.',
    type:    'independent',
    results: { TISZA: 58, Fidesz: 35, MiHazank: 4, DK: 1, MKKP: 2 },
  },
  {
    inst:    'Nézőpont',
    date:    '2026. márc. 17.',
    type:    'gov',
    results: { TISZA: 40, Fidesz: 46, MiHazank: 8, DK: 3, MKKP: 3 },
  },
];

/* ── Scroll progress bar ────────────────────────────────────── */
(function () {
  const bar = document.getElementById('scroll-progress');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = (total > 0 ? (scrolled / total) * 100 : 0) + '%';
  }, { passive: true });
})();

/* ── Sidebar toggle ─────────────────────────────────────────── */
(function () {
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('sidebarOverlay');
  const hamburger = document.getElementById('hamburger');
  if (!sidebar || !overlay || !hamburger) return;

  function openSidebar() {
    sidebar.classList.add('open');
    overlay.classList.add('visible');
    hamburger.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeSidebar() {
    sidebar.classList.remove('open');
    overlay.classList.remove('visible');
    hamburger.classList.remove('open');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', () => {
    sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
  });
  overlay.addEventListener('click', closeSidebar);

  // Close sidebar on nav link click (mobile)
  sidebar.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 900) closeSidebar();
    });
  });

  // Close on escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSidebar();
  });
})();

/* ── Active nav highlight (IntersectionObserver) ───────────── */
(function () {
  const navItems = document.querySelectorAll('.nav-item[data-section]');
  if (!navItems.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          navItems.forEach(item => {
            item.classList.toggle('active', item.dataset.section === id);
          });
        }
      });
    },
    { rootMargin: '-20% 0px -70% 0px', threshold: 0 }
  );

  navItems.forEach(item => {
    const section = document.getElementById(item.dataset.section);
    if (section) observer.observe(section);
  });
})();

/* ── Scroll reveal ──────────────────────────────────────────── */
(function () {
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -60px 0px', threshold: 0.05 }
  );

  revealEls.forEach(el => observer.observe(el));
})();

/* ── Tier card toggle ───────────────────────────────────────── */
window.toggleTier = function (id) {
  const card = document.getElementById(id);
  if (!card) return;
  card.classList.toggle('open');
};

/* ── Threshold filter tabs ──────────────────────────────────── */
(function () {
  const tabs  = document.querySelectorAll('.thresh-tab');
  const cards = document.querySelectorAll('.tier-card');
  if (!tabs.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.dataset.filter;
      cards.forEach(card => {
        if (filter === 'all' || card.dataset.tier === filter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });

      // Update seats bar highlights
      updateSeatsVizHighlight(filter);
    });
  });

  function updateSeatsVizHighlight(filter) {
    document.querySelectorAll('#section-1 .bar-seg').forEach(seg => {
      if (filter === 'all') {
        seg.classList.remove('dim');
      } else {
        const tier = seg.dataset.tier;
        seg.classList.toggle('dim', tier !== filter);
      }
    });
  }
})();

/* ── Scenario tabs ──────────────────────────────────────────── */
window.showSc = function (n) {
  document.querySelectorAll('.sc-panel').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.sc-tab').forEach(t => t.classList.remove('active'));
  const panel = document.getElementById('sc' + n);
  const tab   = document.querySelector('.sc-tab[data-sc="' + n + '"]');
  if (panel) panel.classList.add('active');
  if (tab)   tab.classList.add('active');
};

/* ── Sarkalatos törvények – search & filter ─────────────────── */
(function () {
  const searchInput = document.getElementById('sarkalatos-search');
  const catBtns     = document.querySelectorAll('.cat-btn');
  const rows        = document.querySelectorAll('.sarkalatos-row');
  const countEl     = document.getElementById('sarkalatos-count');
  if (!searchInput || !rows.length) return;

  let activeCategory = 'all';
  let searchQuery = '';

  function filterRows() {
    let visible = 0;
    rows.forEach(row => {
      const name = (row.dataset.name || '').toLowerCase();
      const cat  = (row.dataset.cat  || '');
      const year = (row.dataset.year || '');
      const law  = (row.dataset.law  || '').toLowerCase();

      const matchSearch = !searchQuery ||
        name.includes(searchQuery) ||
        cat.toLowerCase().includes(searchQuery) ||
        year.includes(searchQuery) ||
        law.includes(searchQuery);

      const matchCat = activeCategory === 'all' || cat === activeCategory;

      if (matchSearch && matchCat) {
        row.classList.remove('hidden');
        visible++;
      } else {
        row.classList.add('hidden');
      }
    });
    if (countEl) countEl.textContent = visible;
  }

  searchInput.addEventListener('input', e => {
    searchQuery = e.target.value.toLowerCase().trim();
    filterRows();
  });

  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      catBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCategory = btn.dataset.cat;
      filterRows();
    });
  });

  // Init count
  if (countEl) countEl.textContent = rows.length;
})();

/* ── Section 0: pártok és közvélemény-kutatások (generált) ─── */
(function () {
  const THRESHOLD_LABELS = {
    in:   { cls: 'threshold-in',   text: '✓ Parlament' },
    edge: { cls: 'threshold-edge', text: '~ Küszöb alatt' },
    out:  { cls: 'threshold-out',  text: '✗ Küszöb alatt' },
  };

  // Party cards
  const grid = document.getElementById('party-grid');
  if (grid) {
    grid.innerHTML = PARTIES.map(p => `
      <div class="party-card" style="--party-color:${p.color}">
        <div class="party-card-abbr">${p.abbr}</div>
        <div class="party-card-name">${p.name}</div>
        <div class="party-card-leader">${p.leader}</div>
        <div class="party-card-pct">${p.pct}%</div>
        <div class="party-card-pct-note">PolitPro átlag · ${POLL_DATE}</div>
        <span class="party-card-threshold ${THRESHOLD_LABELS[p.threshold].cls}">${THRESHOLD_LABELS[p.threshold].text}</span>
      </div>`).join('');
  }

  // Aggregate bar
  const aggBar = document.getElementById('poll-agg-bar');
  if (aggBar) {
    const total = PARTIES.reduce((s, p) => s + p.pct, 0);
    const other = Math.max(0, +(100 - total).toFixed(1));
    aggBar.innerHTML = PARTIES.map(p =>
      `<div class="poll-agg-seg" style="width:${p.pct}%;background:${p.color}" title="${p.abbr} ${p.pct}%">${p.pct >= 8 ? p.abbr + ' ' + p.pct + '%' : ''}</div>`
    ).join('') + (other > 0 ? `<div class="poll-agg-seg" style="width:${other}%;background:#B4B2A9" title="Egyéb ${other}%"></div>` : '');
  }

  // Aggregate legend
  const aggLegend = document.getElementById('poll-agg-legend');
  if (aggLegend) {
    aggLegend.innerHTML = PARTIES.map(p =>
      `<div class="poll-agg-legend-item"><div class="poll-agg-legend-dot" style="background:${p.color}"></div>${p.abbr}</div>`
    ).join('');
  }

  // Poll comparison table body
  const pollBody = document.getElementById('poll-table-body');
  if (pollBody) {
    pollBody.innerHTML = POLLS.map(poll => {
      const r = poll.results;
      const tagCls  = poll.type === 'gov' ? 'poll-tag-gov' : 'poll-tag-independent';
      const tagText = poll.type === 'gov' ? 'Kormányközeli' : 'Független';
      return `<tr>
        <td>
          <span class="poll-inst-name">${poll.inst}</span>
          <span class="poll-inst-date">${poll.date}</span>
          <span class="poll-inst-tag ${tagCls}">${tagText}</span>
        </td>
        <td><span class="poll-pct poll-pct-tisza">${r.TISZA}%</span></td>
        <td><span class="poll-pct poll-pct-fidesz">${r.Fidesz}%</span></td>
        <td><span class="poll-pct poll-pct-mh">${r.MiHazank}%</span></td>
        <td><span class="poll-pct poll-pct-dk">${r.DK}%</span></td>
        <td><span class="poll-pct poll-pct-mkkp">${r.MKKP}%</span></td>
      </tr>`;
    }).join('');
  }
})();

/* ── Gantt chart ────────────────────────────────────────────── */
(function () {
  const GANTT_START = 2014;
  const GANTT_END   = 2036;
  const RANGE       = GANTT_END - GANTT_START;
  const HIGHLIGHT_START = 2026;
  const HIGHLIGHT_END   = 2030;

  const data = [
    {
      institution: 'Köztársasági elnök',
      person:      'Sulyok Tamás',
      start: 2024, end: 2029,
      type: 'expires-during',
      note: 'Lejár 2029 márciusban — a ciklus alatt természetes csere',
      vote: '2/3 összes képviselő'
    },
    {
      institution: 'Legfőbb ügyész',
      person:      'Nagy Gábor Bálint',
      start: 2025, end: 2034,
      type: 'expires-after',
      note: '2025-ben választva (Polt Péter lemondása után) — 2034-ig aktív, a ciklus alatt nem jár le',
      vote: '2/3 összes képviselő'
    },
    {
      institution: 'OBH elnöke',
      person:      'Senyei György',
      start: 2019, end: 2028,
      type: 'expires-during',
      note: '2019. dec. 10-én választva — mandátum 2028. dec. 10-én jár le, a ciklus alatt természetes csere',
      vote: '2/3 összes képviselő'
    },
    {
      institution: 'Kúria elnöke',
      person:      'Varga Zs. András',
      start: 2021, end: 2030,
      type: 'expires-during',
      note: '2030-ban jár le — a ciklus végén természetes cserealkalom',
      vote: '2/3 összes képviselő'
    },
    {
      institution: 'ÁSZ elnöke',
      person:      'Windisch László',
      start: 2022, end: 2034,
      type: 'expires-after',
      note: '2022-ben választva (Domokos László után) — 2034-ig aktív, blokkolja a cserét',
      vote: '2/3 összes képviselő'
    },
    {
      institution: 'AB-tag (Czine Á.)',
      person:      'Czine Ágnes',
      start: 2014, end: 2026,
      type: 'expires-soon',
      note: '2026-ban természetesen lejár — az első lehetséges csere',
      vote: '2/3 összes képviselő'
    },
    {
      institution: 'AB-tag (Handó T.)',
      person:      'Handó Tünde',
      start: 2020, end: 2032,
      type: 'expires-after',
      note: '2019. nov. 4-én választva, 2020. jan. 1-jén lépett hivatalba — mandátum ~2032 elejéig tart',
      vote: '2/3 összes képviselő'
    },
    {
      institution: 'AB-tag (Horváth A.)',
      person:      'Horváth Attila',
      start: 2016, end: 2028,
      type: 'expires-during',
      note: '2016. nov. 22-én választva, 2016. dec. 1-jén lépett hivatalba — mandátum 2028. dec. 1-jén jár le',
      vote: '2/3 összes képviselő'
    },
    {
      institution: 'AB-tag (Schanda B.)',
      person:      'Schanda Balázs',
      start: 2016, end: 2028,
      type: 'expires-during',
      note: '2016. nov. 22-én választva, 2016. dec. 1-jén lépett hivatalba — mandátum 2028. dec. 1-jén jár le',
      vote: '2/3 összes képviselő'
    },
    {
      institution: 'Médiatanács tagok',
      person:      '5 tag (2015–16)',
      start: 2015, end: 2025,
      type: 'expired',
      note: '2024–2025-ben lejárt — csere lehetséges 2/3-dal (jelenlévők)',
      vote: '2/3 jelenlévő képviselő'
    },
  ];

  const container = document.getElementById('gantt-rows');
  if (!container) return;

  // Highlight band (% based)
  const hlLeft  = ((HIGHLIGHT_START - GANTT_START) / RANGE * 100).toFixed(2) + '%';
  const hlWidth = ((HIGHLIGHT_END - HIGHLIGHT_START) / RANGE * 100).toFixed(2) + '%';

  // Year axis
  const axisContainer = document.getElementById('gantt-axis');
  if (axisContainer) {
    for (let y = GANTT_START; y <= GANTT_END; y += 1) {
      const tick = document.createElement('div');
      tick.className = 'gantt-year-tick';
      if ((y - GANTT_START) % 2 === 0 || y === HIGHLIGHT_START || y === HIGHLIGHT_END) {
        tick.textContent = y;
      }
      axisContainer.appendChild(tick);
    }
  }

  // Rows
  data.forEach((d, i) => {
    const row = document.createElement('div');
    row.className = 'gantt-row';
    row.setAttribute('data-reveal', '');
    row.setAttribute('data-reveal-delay', Math.min(i + 1, 5));

    const left  = ((d.start - GANTT_START) / RANGE * 100).toFixed(2);
    const width = ((d.end   - d.start)     / RANGE * 100).toFixed(2);

    const colorClass = {
      'expires-during': 'gantt-bar-expires-during',
      'expires-after':  'gantt-bar-expires-after',
      'expires-soon':   'gantt-bar-expires-soon',
      'expired':        'gantt-bar-expired',
    }[d.type] || 'gantt-bar-expires-after';

    row.innerHTML = `
      <div class="gantt-row-label">
        <div class="gantt-row-institution">${d.institution}</div>
        <div class="gantt-row-person">${d.person}</div>
      </div>
      <div class="gantt-bar-area">
        <div class="gantt-highlight" style="left:${hlLeft};width:${hlWidth}"></div>
        <div class="gantt-bar ${colorClass}"
             style="left:${left}%;width:0%;transition:width 1.1s cubic-bezier(0.4,0,0.2,1) ${i * 0.07}s"
             data-width="${width}"
             title="${d.institution}: ${d.start}–${d.end}">
          <div class="gantt-bar-label">${d.start}–${d.end}</div>
          <div class="gantt-bar-tooltip">${d.note}<br><em style="opacity:.7">${d.vote}</em></div>
        </div>
      </div>`;

    container.appendChild(row);
  });

  // Animate bars on scroll into view
  const ganttSection = document.getElementById('section-4');
  if (ganttSection) {
    const ganttObserver = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          document.querySelectorAll('.gantt-bar').forEach(bar => {
            const w = bar.dataset.width;
            if (w) bar.style.width = w + '%';
          });
          // Also trigger reveal on rows
          document.querySelectorAll('.gantt-row[data-reveal]').forEach(r => r.classList.add('revealed'));
          ganttObserver.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    ganttObserver.observe(ganttSection);
  }
})();

/* ── Flowchart step reveal ──────────────────────────────────── */
(function () {
  const steps = document.querySelectorAll('.flow-step');
  if (!steps.length) return;

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -40px 0px', threshold: 0.1 }
  );

  steps.forEach((step, i) => {
    step.style.transitionDelay = (i * 0.12) + 's';
    observer.observe(step);
  });
})();

/* ── Matrix row hover highlight ─────────────────────────────── */
(function () {
  const matrixRows = document.querySelectorAll('.matrix-table tbody tr:not(.matrix-group-header)');
  matrixRows.forEach(row => {
    row.querySelectorAll('td:not(:first-child)').forEach(cell => {
      cell.style.cursor = 'default';
    });
  });
})();

/* ── Smooth scroll for nav links ────────────────────────────── */
(function () {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const topbarH = window.innerWidth <= 900 ? 52 : 0;
      const y = target.getBoundingClientRect().top + window.scrollY - topbarH - 20;
      window.scrollTo({ top: y, behavior: 'smooth' });
    });
  });
})();
