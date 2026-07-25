/* ══════════════════════════════════════════════
   Deni W. — Portfolio
   Draggable infinite canvas · blur-to-discover tiles
   ══════════════════════════════════════════════ */

(function () {
  "use strict";

  /* ── Config ─────────────────────────────── */
  const NUM_COLS = 7;          // unique columns
  const TILES_PER_COL = 6;     // unique tiles per column
  const TOTAL = NUM_COLS * TILES_PER_COL;
  const GAP = 16;

  // vertical parallax speed per unique column
  const COL_SPEEDS = [0.65, 0.9, 1.1, 0.75, 1.0, 0.7, 0.85];
  // vertical start offset per unique column (stagger like a masonry)
  const COL_OFFSETS = [0, 210, 90, 300, 150, 260, 40];

  /* ══════════════════════════════════════════════════════════════
     KATALOG KONTEN — cukup ubah angka di bawah untuk menambah karya
     ══════════════════════════════════════════════════════════════
     Penamaan file (semua di folder images/):

       Menu GRAPHIC   gambar : graphic-01.jpg    graphic-02.jpg   ...
                      video  : graphicvid-01.mp4 graphicvid-02.mp4 ...

       Menu PROJECT   gambar : project-01.jpg    project-02.jpg   ...
                      video  : projectvid-01.mp4 projectvid-02.mp4 ...

     Menu "All" menampilkan gabungan keduanya.
     Nomor file HARUS berurutan mulai dari 01 tanpa lompat.
     Kalau file belum ada, tile-nya tampil sebagai placeholder gradien.
  */
  const CATALOG = {
    graphic: { images: 50, videos: 14 },
    project: { images: 10, videos: 2 },
  };

  const CAT_META = {
    graphic: { label: "Graphic", img: "graphic-", vid: "graphicvid-" },
    project: { label: "Project", img: "project-", vid: "projectvid-" },
  };

  // aspect ratios (w/h) — mosaic mix of squares & portraits for images.
  // videos get their own varied set of LARGE shapes (wide and tall)
  const RATIOS_IMG = [1, 0.6, 1, 0.75, 1.1, 0.8, 1.45, 0.7, 0.9, 1.25, 0.65, 1.2];
  const RATIOS_VID = [1.6, 0.62, 1.8, 0.72, 1.45, 0.56, 1.7, 0.66];

  /* Teks bawaan untuk karya yang belum diberi judul/deskripsi sendiri. */
  const DEFAULT_INFO =
    "I made this project for the Mothers Day season event in Kuwait. 2025";

  /* ══════════════════════════════════════════════════════════════
     JUDUL & DESKRIPSI TIAP KARYA
     ══════════════════════════════════════════════════════════════
     Kuncinya = NAMA FILE tanpa ekstensi. Tambahkan sebanyak yang
     kamu mau — karya yang tidak ada di daftar ini otomatis memakai
     judul bawaan ("Graphic 01" dst.) dan teks DEFAULT_INFO di atas.

     Format tiap baris:
       "nama-file": { title: "Judulnya", info: "Deskripsinya." },
  */
  const PROJECT_DETAILS = {
    "graphic-01": {
      title: "Mothers Day Poster",
      info: "I made this project for the Mothers Day season event in Kuwait. 2025",
    },
    "graphicvid-01": {
      title: "Eid Collection Promo",
      info: "Short promo video for the Eid collection. 2025",
    },
    // "graphic-02": { title: "...", info: "..." },
    // "project-01": { title: "...", info: "..." },
    // "projectvid-01": { title: "...", info: "..." },
  };

  /* Angka acak yang selalu sama tiap dibuka (biar tata letak stabil,
     tapi tidak berpola/segaris). */
  function seededRand(seed) {
    let s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  const projects = [];
  Object.keys(CATALOG).forEach((cat, catIdx) => {
    const cfg = CATALOG[cat];
    const meta = CAT_META[cat];
    const total = cfg.images + cfg.videos;

    /* Sebar posisi video secara acak. Penting: posisi TIDAK boleh
       berjarak kelipatan jumlah kolom, karena tile dibagi ke kolom
       secara berurutan (i % NUM_COLS) — kalau berpola, semua video
       jatuh di kolom yang sama dan tampak sejajar ke bawah. */
    const rand = seededRand(9781 + catIdx * 3571);
    const vidSlots = new Set();
    const usedCols = new Set();
    const bucket = cfg.videos > 0 ? total / cfg.videos : total;
    for (let v = 0; v < cfg.videos; v++) {
      let pos = -1;
      for (let attempt = 0; attempt < 24; attempt++) {
        let p = Math.floor(v * bucket + rand() * bucket);
        p = Math.max(0, Math.min(p, total - 1));
        while (vidSlots.has(p)) p = (p + 1) % total;
        // kolom tempat tile ini akan jatuh (juga berlaku di menu "All",
        // karena menu itu hanya menggeser semua indeks dengan angka tetap)
        const col = p % NUM_COLS;
        // pilih kolom yang belum dipakai selama masih ada yang kosong
        if (!usedCols.has(col) || usedCols.size >= NUM_COLS) {
          usedCols.add(col);
          pos = p;
          break;
        }
        pos = p; // cadangan kalau semua percobaan bentrok
      }
      vidSlots.add(pos);
    }

    let imgN = 0, vidN = 0;
    for (let i = 0; i < total; i++) {
      const hue = (projects.length * 47) % 360;
      if (vidSlots.has(i) && vidN < cfg.videos) {
        vidN++;
        const nn = String(vidN).padStart(2, "0");
        const d = PROJECT_DETAILS[meta.vid + nn] || {};
        projects.push({
          id: cat + "-v" + nn,
          title: d.title || meta.label + " Video " + nn,
          cat: cat,
          video: true,
          vid: "images/" + meta.vid + nn + ".mp4",
          img: null,
          // bentuk tile video diacak (ada yang lebar, ada yang tinggi)
          ratio: RATIOS_VID[Math.floor(rand() * RATIOS_VID.length)],
          hue: hue,
          info: d.info || DEFAULT_INFO,
        });
      } else {
        imgN++;
        const nn = String(imgN).padStart(2, "0");
        const d = PROJECT_DETAILS[meta.img + nn] || {};
        projects.push({
          id: cat + "-i" + nn,
          title: d.title || meta.label + " " + nn,
          cat: cat,
          video: false,
          vid: null,
          img: "images/" + meta.img + nn + ".jpg",
          ratio: RATIOS_IMG[(imgN - 1) % RATIOS_IMG.length],
          hue: hue,
          info: d.info || DEFAULT_INFO,
        });
      }
    }
  });

  /* ── Skills shown in the About modal.
     Drop icons into images/skills/ named e.g. figma.jpg (or .png) —
     until then a letter placeholder is shown. */
  const SKILLS = [
    "HTML", "CSS", "C++", "JavaScript",
    "Bootstrap", "Node JS", "MySQL", "Figma",
    "VS Code", "Visual Studio", "Git", "Framer",
    "Photoshop", "Illustrator", "Procreate", "Capcut",
    "Davinci Resolve", "RDWorks Laser", "Waterjet Cut",
  ];

  /* ── Clients shown in the Clients modal.
     Drop logos into images/clients/ named client-01.jpg ... */
  const NUM_CLIENTS = 10;

  /* ── DOM refs ───────────────────────────── */
  const canvas = document.getElementById("canvas");
  const world = document.getElementById("world");
  const counterEl = document.getElementById("counter");
  const preloader = document.getElementById("preloader");
  const percentEl = preloader.querySelector(".preloader-percent");
  const barFillEl = preloader.querySelector(".loader-bar-fill");
  const lightbox = document.getElementById("lightbox");

  /* ── State ──────────────────────────────── */
  let tileW = 300;
  let colW = 316;               // tileW + GAP
  let stripW = 0;               // width of one full set of columns
  let colHeights = [];          // wrap period of each unique column
  let currentCat = "all";       // "all" | "graphic" | "project"
  let targetX = 0, targetY = 0;
  let curX = 1e9, curY = 1e9;   // forces first paint
  let velX = 0, velY = 0;
  let dragging = false;
  let movedDist = 0;
  let lastPX = 0, lastPY = 0;
  const colEls = [];            // { el, unique }

  /* ── Helpers ────────────────────────────── */
  const mod = (v, m) => ((v % m) + m) % m;

  function computeTileW() {
    const w = window.innerWidth;
    if (w < 768) return 200;
    if (w < 1440) return 300;
    if (w < 1920) return 340;
    return 430;
  }

  function tileHeight(p) {
    return Math.round(tileW / p.ratio);
  }

  function gradientCSS(p) {
    return (
      "linear-gradient(135deg, hsl(" + p.hue + ", 62%, 74%), hsl(" +
      ((p.hue + 45) % 360) + ", 68%, 52%))"
    );
  }

  /* ── Build the world ────────────────────── */
  function makeTileEl(p) {
    const tile = document.createElement("div");
    tile.className = "tile intro";
    tile.dataset.id = p.id;
    tile.style.height = tileHeight(p) + "px";

    const media = document.createElement("div");
    media.className = "tile-media";

    const ph = document.createElement("div");
    ph.className = "tile-ph";
    ph.style.background = gradientCSS(p);
    ph.textContent = p.title;
    media.appendChild(ph);

    if (p.img) {
      const img = document.createElement("img");
      img.alt = "";
      img.draggable = false;
      img.decoding = "async";
      // catatan: JANGAN pakai loading="lazy" di sini — deteksi lazy
      // Chrome tidak bekerja untuk tile di dalam canvas ber-transform,
      // akibatnya gambar tidak pernah dimuat sama sekali
      img.src = p.img;
      // try .jpg first, then .png, then give up (gradient placeholder stays)
      img.onerror = function () {
        if (this.src.endsWith(".jpg")) {
          this.src = this.src.replace(/\.jpg$/, ".png");
        } else {
          this.remove();
        }
      };
      media.appendChild(img);
    }

    // MP4 autoplay-loop di atas gambar/placeholder; kalau file-nya belum
    // ada, elemen dihapus dan fallback di bawahnya yang tampil
    if (p.video && p.vid) {
      const vid = document.createElement("video");
      vid.muted = true;
      vid.loop = true;
      vid.playsInline = true;
      vid.setAttribute("muted", "");
      vid.setAttribute("playsinline", "");
      // JANGAN autoplay/preload semua — dengan banyak video itu membuat
      // browser berat. syncVideos() yang memuat & memutar HANYA video
      // yang sedang terlihat di layar.
      vid.preload = "none";
      vid.src = p.vid;
      vid.addEventListener("error", () => vid.remove());
      media.appendChild(vid);
    }
    tile.appendChild(media);

    if (p.video) {
      const badge = document.createElement("div");
      badge.className = "video-badge";
      badge.textContent = "video";
      tile.appendChild(badge);
    }
    return tile;
  }

  function filteredProjects() {
    return currentCat === "all"
      ? projects
      : projects.filter((p) => p.cat === currentCat);
  }

  /* Videos only play while their tile is on screen. The canvas is moved
     with transforms, so we check positions directly instead of using an
     IntersectionObserver (which misreads transformed/clipped tiles). */
  let videoEls = [];
  function syncVideos() {
    const H = window.innerHeight, W = window.innerWidth, M = 150;
    // batas video yang berputar bersamaan, supaya tetap ringan
    const MAX_PLAYING = 10;
    let playing = 0;
    for (let i = 0; i < videoEls.length; i++) {
      const v = videoEls[i];
      const r = v.getBoundingClientRect();
      const onScreen =
        r.bottom > -M && r.top < H + M && r.right > -M && r.left < W + M;
      if (onScreen && playing < MAX_PLAYING) {
        playing++;
        if (v.paused) v.play().catch(() => {});
      } else if (!v.paused) {
        v.pause();
      }
    }
  }

  function build() {
    tileW = computeTileW();
    colW = tileW + GAP;
    document.documentElement.style.setProperty("--tileW", tileW + "px");
    document.documentElement.style.setProperty("--gap", GAP + "px");

    world.innerHTML = "";
    colEls.length = 0;
    colHeights = [];

    // distribute the (filtered) projects round-robin into columns
    const list = filteredProjects();
    const nCols = Math.min(NUM_COLS, Math.max(1, list.length));
    const cols = Array.from({ length: nCols }, () => []);
    list.forEach((p, i) => cols[i % nCols].push(p));
    stripW = nCols * colW;

    // wrap period of each column
    colHeights = cols.map((colList) =>
      colList.reduce((h, p) => h + tileHeight(p) + GAP, 0)
    );

    const copiesH = Math.ceil(window.innerWidth / stripW) + 1;
    for (let s = 0; s < copiesH; s++) {
      for (let c = 0; c < nCols; c++) {
        const col = document.createElement("div");
        col.className = "col";
        const copiesV = Math.ceil(window.innerHeight / colHeights[c]) + 1;
        for (let v = 0; v < copiesV; v++) {
          cols[c].forEach((p) => col.appendChild(makeTileEl(p)));
        }
        world.appendChild(col);
        colEls.push({ el: col, unique: c });
      }
    }
    videoEls = Array.from(world.querySelectorAll(".tile video"));
    curX = curY = 1e9; // force repaint
  }

  /* ── Render loop ────────────────────────── */
  function render() {
    if (!dragging) {
      targetX += velX;
      targetY += velY;
      velX *= 0.94;
      velY *= 0.94;
    }
    const nx = curX === 1e9 ? targetX : curX + (targetX - curX) * 0.085;
    const ny = curY === 1e9 ? targetY : curY + (targetY - curY) * 0.085;

    if (Math.abs(nx - curX) > 0.01 || Math.abs(ny - curY) > 0.01 || curX === 1e9) {
      curX = nx;
      curY = ny;
      world.style.transform =
        "translate3d(" + (mod(curX, stripW) - stripW) + "px, 0, 0)";
      for (let i = 0; i < colEls.length; i++) {
        const u = colEls[i].unique;
        const y = mod(curY * COL_SPEEDS[u] + COL_OFFSETS[u], colHeights[u]) - colHeights[u];
        colEls[i].el.style.transform = "translate3d(0, " + y + "px, 0)";
      }
    }
    requestAnimationFrame(render);
  }

  /* ── Dragging ───────────────────────────── */
  canvas.addEventListener("pointerdown", (e) => {
    dragging = true;
    movedDist = 0;
    lastPX = e.clientX;
    lastPY = e.clientY;
    velX = velY = 0;
    canvas.classList.add("grabbing");
    canvas.setPointerCapture(e.pointerId);
  });

  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const dx = e.clientX - lastPX;
    const dy = e.clientY - lastPY;
    lastPX = e.clientX;
    lastPY = e.clientY;
    targetX += dx;
    targetY += dy;
    velX = dx * 0.9;
    velY = dy * 0.9;
    movedDist += Math.abs(dx) + Math.abs(dy);
  });

  function endDrag() {
    dragging = false;
    canvas.classList.remove("grabbing");
  }
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);

  // wheel / trackpad panning
  canvas.addEventListener(
    "wheel",
    (e) => {
      e.preventDefault();
      targetX -= e.deltaX;
      targetY -= e.deltaY;
    },
    { passive: false }
  );

  /* ── Counter (jumlah karya kategori aktif) ── */
  function updateCounter() {
    counterEl.textContent = filteredProjects().length + " works";
  }

  /* ── Lightbox ───────────────────────────── */
  canvas.addEventListener("click", (e) => {
    if (movedDist > 6) return; // it was a drag, not a click
    // pointer capture retargets the click to #canvas, so hit-test manually
    const hit = document.elementFromPoint(e.clientX, e.clientY);
    const tile = hit && hit.closest(".tile");
    if (!tile) return;
    const p = projects.find((x) => x.id === tile.dataset.id);
    if (!p) return;

    const media = lightbox.querySelector(".lightbox-media");
    media.innerHTML = "";
    /* Ukuran frame mengikuti jenis karyanya:
         menu PROJECT  -> rasio layar 16:9  (1920 × 1080)
         GRAPHIC foto  -> 1900 × 1200
         GRAPHIC video -> 1080 × 1920 (tegak)
       Ubah aturan .is-screen / .is-image / .is-video di css/style.css
       kalau ingin ukuran lain. */
    const isScreen = p.cat === "project";
    const isVideo = !isScreen && !!(p.video && p.vid);
    media.classList.toggle("is-screen", isScreen);
    media.classList.toggle("is-video", isVideo);
    media.classList.toggle("is-image", !isScreen && !isVideo);
    const ph = document.createElement("div");
    ph.className = "tile-ph";
    ph.style.background = gradientCSS(p);
    media.appendChild(ph);
    if (p.video && p.vid) {
      // putar MP4 project yang sama dengan tile yang diklik —
      // klik = user gesture, jadi autoplay dengan suara diizinkan
      const vid = document.createElement("video");
      vid.src = p.vid;
      vid.autoplay = true;
      vid.loop = true;
      vid.controls = true;
      vid.playsInline = true;
      vid.addEventListener("error", () => vid.remove());
      // klik pada player (play/pause/seek) jangan menutup lightbox
      vid.addEventListener("click", (e) => e.stopPropagation());
      media.appendChild(vid);
    } else {
      const img = tile.querySelector("img");
      if (img) {
        const big = document.createElement("img");
        big.src = img.src;
        big.alt = p.title;
        media.appendChild(big);
      }
    }
    lightbox.querySelector(".lightbox-title").textContent = p.title;
    lightbox.querySelector(".lightbox-info").textContent = p.info || "";
    lightbox.classList.add("open");
  });

  function closeLightbox() {
    if (!lightbox.classList.contains("open")) return;
    lightbox.classList.remove("open");
    // drop the embed after the fade so the video stops playing
    setTimeout(() => {
      if (!lightbox.classList.contains("open")) {
        lightbox.querySelector(".lightbox-media").innerHTML = "";
      }
    }, 420);
  }

  lightbox.addEventListener("click", closeLightbox);

  /* ── Overlays ───────────────────────────── */
  function bindOverlay(btnSel, overlayId) {
    const overlay = document.getElementById(overlayId);
    document.querySelector(btnSel).addEventListener("click", () => {
      // switching between menus: close whatever is open, then open this
      // one — both animate, giving a cross transition between boxes
      document.querySelectorAll(".overlay.open").forEach((o) => {
        if (o !== overlay) o.classList.remove("open");
      });
      closeLightbox();
      overlay.classList.add("open");
    });
    overlay.querySelectorAll("[data-close]").forEach((el) =>
      el.addEventListener("click", () => overlay.classList.remove("open"))
    );
  }
  bindOverlay(".nav-about", "about");
  bindOverlay(".nav-clients", "clients");
  bindOverlay(".nav-contact", "contact");

  const homeTip = document.getElementById("home-tip");
  let homeTipTimer;
  document.querySelector(".nav-home").addEventListener("click", () => {
    document.querySelectorAll(".overlay.open").forEach((o) =>
      o.classList.remove("open")
    );
    closeLightbox();
    // glide back home
    targetX = 0;
    targetY = 0;
    velX = velY = 0;
    // flash the hint bubble
    homeTip.classList.add("show");
    clearTimeout(homeTipTimer);
    homeTipTimer = setTimeout(() => homeTip.classList.remove("show"), 2200);
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.querySelectorAll(".overlay.open").forEach((o) =>
        o.classList.remove("open")
      );
      closeLightbox();
    }
  });

  /* ── About: skills grid ─────────────────── */
  function buildSkills() {
    const grid = document.getElementById("skills-grid");
    SKILLS.forEach((name) => {
      const slug = name.toLowerCase().replace(/\s+/g, "-");
      const item = document.createElement("div");
      item.className = "skill";

      const icon = document.createElement("div");
      icon.className = "skill-icon";
      const letter = document.createElement("span");
      letter.textContent = name.charAt(0);
      icon.appendChild(letter);

      const img = document.createElement("img");
      img.alt = name;
      img.src = "images/skills/" + slug + ".jpg";
      img.onerror = function () {
        if (this.src.endsWith(".jpg")) {
          this.src = this.src.replace(/\.jpg$/, ".png");
        } else {
          this.remove();
        }
      };
      icon.appendChild(img);

      const label = document.createElement("div");
      label.className = "skill-label";
      label.textContent = name;

      item.appendChild(icon);
      item.appendChild(label);
      grid.appendChild(item);
    });
  }

  /* ── Clients grid (mini home-style tiles) ── */
  function buildClients() {
    const grid = document.getElementById("clients-grid");
    for (let i = 0; i < NUM_CLIENTS; i++) {
      const n = String(i + 1).padStart(2, "0");
      const tile = document.createElement("div");
      tile.className = "client-tile";

      const media = document.createElement("div");
      media.className = "tile-media";

      const ph = document.createElement("div");
      ph.className = "tile-ph";
      ph.style.background =
        "linear-gradient(135deg, hsl(" + ((i * 61) % 360) + ", 55%, 74%), hsl(" +
        ((i * 61 + 50) % 360) + ", 60%, 54%))";
      ph.textContent = "Client " + n;
      media.appendChild(ph);

      const img = document.createElement("img");
      img.alt = "Client " + n;
      img.src = "images/clients/client-" + n + ".jpg";
      img.onerror = function () {
        if (this.src.endsWith(".jpg")) {
          this.src = this.src.replace(/\.jpg$/, ".png");
        } else {
          this.remove();
        }
      };
      media.appendChild(img);

      tile.appendChild(media);
      grid.appendChild(tile);
    }
  }

  /* ── Category segmented control (iOS style) ── */
  const seg = document.getElementById("category-seg");
  const segBtns = Array.from(seg.querySelectorAll(".seg-btn"));
  const segThumb = seg.querySelector(".seg-thumb");

  function placeThumb() {
    const btn = seg.querySelector(".seg-btn.active");
    segThumb.style.width = btn.offsetWidth + "px";
    segThumb.style.transform = "translateX(" + btn.offsetLeft + "px)";
  }

  function setCategory(cat) {
    segBtns.forEach((b) => b.classList.toggle("active", b.dataset.cat === cat));
    placeThumb();
    if (cat === currentCat) return;
    currentCat = cat;

    // fade the canvas out, rebuild with the filtered set, pop back in
    world.style.opacity = "0";
    setTimeout(() => {
      build();
      world.querySelectorAll(".tile.intro").forEach((t) => {
        t.style.transitionDelay = (Math.random() * 0.35).toFixed(2) + "s";
        t.classList.remove("intro");
      });
      setTimeout(() => {
        world.querySelectorAll(".tile").forEach((t) => (t.style.transitionDelay = ""));
      }, 1200);
      world.style.opacity = "1";
      updateCounter();
    }, 260);
  }

  // tap OR drag/slide the thumb — released nearest segment wins
  let segDrag = null;
  seg.addEventListener("pointerdown", (e) => {
    segDrag = { startX: e.clientX, moved: false };
    seg.setPointerCapture(e.pointerId);
  });
  seg.addEventListener("pointermove", (e) => {
    if (!segDrag) return;
    if (Math.abs(e.clientX - segDrag.startX) > 6) segDrag.moved = true;
    if (segDrag.moved) {
      seg.classList.add("dragging");
      const rect = seg.getBoundingClientRect();
      let px = e.clientX - rect.left - segThumb.offsetWidth / 2;
      px = Math.max(4, Math.min(px, seg.clientWidth - segThumb.offsetWidth - 4));
      segThumb.style.transform = "translateX(" + px + "px)";
    }
  });
  function segEnd(e) {
    if (!segDrag) return;
    seg.classList.remove("dragging");
    const rect = seg.getBoundingClientRect();
    const x = e.clientX - rect.left;
    let best = segBtns[0], bd = Infinity;
    segBtns.forEach((b) => {
      const d = Math.abs(b.offsetLeft + b.offsetWidth / 2 - x);
      if (d < bd) { bd = d; best = b; }
    });
    setCategory(best.dataset.cat);
    segDrag = null;
  }
  seg.addEventListener("pointerup", segEnd);
  seg.addEventListener("pointercancel", () => {
    seg.classList.remove("dragging");
    placeThumb();
    segDrag = null;
  });

  /* ── Theme toggle ───────────────────────── */
  const themeBtn = document.getElementById("theme-toggle");
  if (localStorage.getItem("theme") === "dark") {
    document.documentElement.classList.add("dark");
  }
  themeBtn.addEventListener("click", () => {
    const dark = document.documentElement.classList.toggle("dark");
    localStorage.setItem("theme", dark ? "dark" : "light");
  });

  /* ── Preloader + intro ──────────────────── */
  function runPreloader() {
    const D = 1900; // ms
    const start = performance.now();
    // interval instead of rAF so it still completes in throttled/background tabs
    const iv = setInterval(() => {
      const t = Math.min((performance.now() - start) / D, 1);
      const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
      const pct = Math.round(eased * 100);
      percentEl.textContent = pct + "%";
      if (barFillEl) barFillEl.style.width = pct + "%";
      if (t >= 1) {
        clearInterval(iv);
        preloader.classList.add("done");
        introTiles();
      }
    }, 1000 / 60);
  }

  function introTiles() {
    const tiles = world.querySelectorAll(".tile.intro");
    tiles.forEach((t) => {
      t.style.transitionDelay = (Math.random() * 0.55).toFixed(2) + "s";
      t.classList.remove("intro");
    });
    setTimeout(() => {
      tiles.forEach((t) => (t.style.transitionDelay = ""));
    }, 1600);
  }

  /* ── Resize ─────────────────────────────── */
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      build();
      // tiles rebuilt with .intro — reveal instantly (no re-intro on resize)
      world.querySelectorAll(".tile.intro").forEach((t) =>
        t.classList.remove("intro")
      );
      placeThumb();
    }, 250);
  });

  /* ── Go ─────────────────────────────────── */
  build();
  buildSkills();
  buildClients();
  updateCounter();
  placeThumb();
  // re-measure once fonts have settled
  setTimeout(placeThumb, 400);
  render();
  runPreloader();
  // interval (not rAF) so playback keeps in sync even when the browser
  // throttles animation frames
  syncVideos();
  setInterval(syncVideos, 300);
})();
