(() => {
  "use strict";

  const els = {
    fileName: document.getElementById("fileName"),
    downloadBtn: document.getElementById("downloadBtn"),
    toggleSidebar: document.getElementById("toggleSidebar"),
    sidebar: document.getElementById("sidebar"),
    thumbList: document.getElementById("thumbList"),
    canvas: document.getElementById("canvas"),
    slideImage: document.getElementById("slideImage"),
    emptyState: document.getElementById("emptyState"),
    prevBtn: document.getElementById("prevBtn"),
    nextBtn: document.getElementById("nextBtn"),
    zoomOut: document.getElementById("zoomOut"),
    zoomIn: document.getElementById("zoomIn"),
    zoomLevel: document.getElementById("zoomLevel"),
    pageInput: document.getElementById("pageInput"),
    pageTotal: document.getElementById("pageTotal"),
  };

  const state = {
    config: null,
    slides: [], // array of image src strings, in order
    index: 0, // 0-based current slide
    zoom: 1, // multiplier relative to fit-to-window baseline
  };

  const ZOOM_MIN = 0.25;
  const ZOOM_MAX = 3;
  const ZOOM_STEP = 0.1;

  function pad(n, width) {
    return String(n).padStart(width, "0");
  }

  async function urlExists(url) {
    try {
      const res = await fetch(url, { method: "HEAD", cache: "no-store" });
      if (res.ok) return true;
      // Some static hosts mishandle HEAD; fall back to GET.
      if (res.status === 405) {
        const res2 = await fetch(url, { method: "GET", cache: "no-store" });
        return res2.ok;
      }
      return false;
    } catch {
      return false;
    }
  }

  async function loadManifest(folder) {
    try {
      const res = await fetch(`${folder}/manifest.json`, { cache: "no-store" });
      if (!res.ok) return null;
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((name) => `${folder}/${name}`);
      }
      return null;
    } catch {
      return null;
    }
  }

  async function detectSequentialImages(folder, ext, paddingWidths) {
    let width = null;
    for (const w of paddingWidths) {
      const candidate = `${folder}/${pad(1, w)}.${ext}`;
      if (await urlExists(candidate)) {
        width = w;
        break;
      }
    }
    if (width === null) return [];

    const found = [];
    let n = 1;
    while (true) {
      const candidate = `${folder}/${pad(n, width)}.${ext}`;
      if (!(await urlExists(candidate))) break;
      found.push(candidate);
      n += 1;
    }
    return found;
  }

  async function loadConfig() {
    try {
      const res = await fetch("config.json", { cache: "no-store" });
      if (res.ok) return await res.json();
    } catch {
      /* fall through to defaults */
    }
    return {};
  }

  function applyHeaderInfo(config) {
    const fileName = config.fileName || "portfolio.pdf";
    const downloadFile = config.downloadFile || "";
    els.fileName.textContent = fileName;
    els.fileName.title = fileName;
    if (downloadFile) {
      els.downloadBtn.href = downloadFile;
      els.downloadBtn.setAttribute("download", fileName);
    }
  }

  function renderThumbnails() {
    els.thumbList.innerHTML = "";
    const frag = document.createDocumentFragment();
    state.slides.forEach((src, i) => {
      const item = document.createElement("div");
      item.className = "thumb-item";
      item.dataset.index = String(i);

      const frame = document.createElement("div");
      frame.className = "thumb-frame";
      const img = document.createElement("img");
      img.src = src;
      img.loading = "lazy";
      img.alt = `Slide ${i + 1}`;
      frame.appendChild(img);

      const num = document.createElement("div");
      num.className = "thumb-num";
      num.textContent = String(i + 1);

      item.appendChild(frame);
      item.appendChild(num);
      item.addEventListener("click", () => goTo(i));

      frag.appendChild(item);
    });
    els.thumbList.appendChild(frag);
  }

  function updateThumbHighlight() {
    const items = els.thumbList.querySelectorAll(".thumb-item");
    items.forEach((item, i) => {
      const active = i === state.index;
      item.classList.toggle("active", active);
      if (active) {
        item.scrollIntoView({ block: "nearest" });
      }
    });
  }

  function renderSlide() {
    const total = state.slides.length;
    if (total === 0) {
      els.slideImage.hidden = true;
      els.emptyState.hidden = false;
      els.pageInput.value = "0";
      els.pageTotal.textContent = "0";
      els.prevBtn.disabled = true;
      els.nextBtn.disabled = true;
      return;
    }

    els.emptyState.hidden = true;
    els.slideImage.hidden = false;
    els.slideImage.src = state.slides[state.index];
    els.slideImage.alt = `Slide ${state.index + 1}`;
    els.pageInput.value = String(state.index + 1);
    els.pageTotal.textContent = String(total);
    els.prevBtn.disabled = state.index === 0;
    els.nextBtn.disabled = state.index === total - 1;
    applyZoom();
    updateThumbHighlight();
  }

  function goTo(index) {
    const total = state.slides.length;
    if (total === 0) return;
    const clamped = Math.max(0, Math.min(total - 1, index));
    if (clamped === state.index) return;
    state.index = clamped;
    renderSlide();
  }

  function next() {
    goTo(state.index + 1);
  }

  function prev() {
    goTo(state.index - 1);
  }

  function applyZoom() {
    els.slideImage.style.transform = `scale(${state.zoom})`;
    els.zoomLevel.textContent = `${Math.round(state.zoom * 100)}%`;
  }

  function setZoom(z) {
    state.zoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, z));
    applyZoom();
  }

  function toggleSidebar() {
    const open = els.sidebar.classList.toggle("open");
    els.toggleSidebar.classList.toggle("is-open", open);
  }

  // ---------- Event wiring ----------

  els.toggleSidebar.addEventListener("click", toggleSidebar);
  els.prevBtn.addEventListener("click", prev);
  els.nextBtn.addEventListener("click", next);
  els.zoomIn.addEventListener("click", () => setZoom(state.zoom + ZOOM_STEP));
  els.zoomOut.addEventListener("click", () => setZoom(state.zoom - ZOOM_STEP));

  els.pageInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const n = parseInt(els.pageInput.value, 10);
      if (!Number.isNaN(n)) goTo(n - 1);
      els.pageInput.blur();
    }
  });
  els.pageInput.addEventListener("blur", () => {
    els.pageInput.value = String(state.index + 1);
  });

  document.addEventListener("keydown", (e) => {
    if (document.activeElement === els.pageInput) return;
    switch (e.key) {
      case "ArrowDown":
      case "ArrowRight":
        e.preventDefault();
        next();
        break;
      case "ArrowUp":
      case "ArrowLeft":
        e.preventDefault();
        prev();
        break;
      default:
        break;
    }
  });

  // Touch swipe navigation
  let touchStartX = null;
  let touchStartY = null;
  els.canvas.addEventListener(
    "touchstart",
    (e) => {
      if (state.zoom > 1.05) return;
      const t = e.changedTouches[0];
      touchStartX = t.clientX;
      touchStartY = t.clientY;
    },
    { passive: true }
  );
  els.canvas.addEventListener(
    "touchend",
    (e) => {
      if (touchStartX === null) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStartX;
      const dy = t.clientY - touchStartY;
      touchStartX = null;
      touchStartY = null;
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0) next();
      else prev();
    },
    { passive: true }
  );

  // ---------- Init ----------

  async function init() {
    const config = await loadConfig();
    state.config = config;
    applyHeaderInfo(config);

    const folder = config.imageFolder || "images";
    const ext = config.imageExtension || "png";
    const paddingWidths = config.paddingWidths || [2, 3, 1];

    let slides = await loadManifest(folder);
    if (!slides) {
      slides = await detectSequentialImages(folder, ext, paddingWidths);
    }

    state.slides = slides;
    renderThumbnails();
    renderSlide();
  }

  init();
})();
