// Art page: living fireflies, light-up-on-scroll walls, accessible lightbox.

// --- fireflies over the opening ---
(function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canvas = document.getElementById("fireflies");
  if (!canvas) return;
  var ctx = canvas.getContext("2d");
  var section = canvas.parentElement;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0, flies = [], raf = null;
  var pointer = { x: -9999, y: -9999 };

  function resize() {
    W = section.clientWidth; H = section.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawn() {
    var n = Math.max(24, Math.min(60, Math.round(W * H / 24000)));
    flies = [];
    for (var i = 0; i < n; i++) {
      flies.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: 0, vy: 0,
        a: Math.random() * Math.PI * 2,        // wander angle
        r: 1 + Math.random() * 1.6,            // core radius
        tw: Math.random() * Math.PI * 2,       // twinkle phase
        ts: 0.008 + Math.random() * 0.02       // twinkle speed
      });
    }
  }

  function drawStatic() {
    resize(); spawn();
    flies.forEach(function (f) { paint(f, 0.55 + Math.random() * 0.4); });
  }

  function paint(f, glow) {
    var g = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, f.r * 7);
    g.addColorStop(0, "rgba(240,200,100," + 0.85 * glow + ")");
    g.addColorStop(0.35, "rgba(232,182,76," + 0.28 * glow + ")");
    g.addColorStop(1, "rgba(232,182,76,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r * 7, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,235,170," + glow + ")";
    ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2); ctx.fill();
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    flies.forEach(function (f) {
      // gentle wander
      f.a += (Math.random() - 0.5) * 0.3;
      f.vx += Math.cos(f.a) * 0.02;
      f.vy += Math.sin(f.a) * 0.02;
      // scatter away from the pointer, softly
      var dx = f.x - pointer.x, dy = f.y - pointer.y;
      var d2 = dx * dx + dy * dy;
      if (d2 < 120 * 120) {
        var d = Math.sqrt(d2) || 1, push = (120 - d) / 120 * 0.6;
        f.vx += (dx / d) * push;
        f.vy += (dy / d) * push;
      }
      f.vx *= 0.96; f.vy *= 0.96;
      f.x += f.vx; f.y += f.vy;
      if (f.x < -20) f.x = W + 20; if (f.x > W + 20) f.x = -20;
      if (f.y < -20) f.y = H + 20; if (f.y > H + 20) f.y = -20;
      f.tw += f.ts;
      paint(f, 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(f.tw)));
    });
    raf = requestAnimationFrame(tick);
  }

  function start() { if (raf === null) raf = requestAnimationFrame(tick); }
  function stop() { if (raf !== null) { cancelAnimationFrame(raf); raf = null; } }

  if (reduced) { drawStatic(); window.addEventListener("resize", drawStatic); return; }

  resize(); spawn();
  window.addEventListener("resize", function () { resize(); spawn(); });
  section.addEventListener("pointermove", function (e) {
    var b = canvas.getBoundingClientRect();
    pointer.x = e.clientX - b.left; pointer.y = e.clientY - b.top;
  });
  section.addEventListener("pointerleave", function () { pointer.x = pointer.y = -9999; });

  // only animate while the opening is on screen and the tab is visible
  var vis = new IntersectionObserver(function (entries) {
    entries[0].isIntersecting && !document.hidden ? start() : stop();
  }, { threshold: 0.05 });
  vis.observe(section);
  document.addEventListener("visibilitychange", function () {
    document.hidden ? stop() : start();
  });
})();

// --- walls + lightbox ---
(function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var walls = Array.prototype.slice.call(document.querySelectorAll(".wall"));

  // --- pools of light ---
  if (!("IntersectionObserver" in window) || reduced) {
    walls.forEach(function (w) { w.classList.add("lit"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add("lit");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.25 });
    walls.forEach(function (w) { io.observe(w); });
  }

  // --- lightbox ---
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lbImg");
  var lbCap = document.getElementById("lbCap");
  var btnClose = document.getElementById("lbClose");
  var btnPrev = document.getElementById("lbPrev");
  var btnNext = document.getElementById("lbNext");
  var frames = Array.prototype.slice.call(document.querySelectorAll(".frame"));
  var current = -1;
  var lastFocus = null;

  function show(i) {
    current = (i + frames.length) % frames.length;
    var f = frames[current];
    var img = f.querySelector("img");
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = f.dataset.title + " — " + f.dataset.medium.toLowerCase();
  }

  function open(i) {
    lastFocus = document.activeElement;
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    show(i);
    btnClose.focus();
  }

  function close() {
    lb.hidden = true;
    document.body.style.overflow = "";
    lbImg.src = "";
    if (lastFocus) lastFocus.focus();
  }

  frames.forEach(function (f, i) {
    f.addEventListener("click", function () { open(i); });
  });
  btnClose.addEventListener("click", close);
  btnPrev.addEventListener("click", function () { show(current - 1); });
  btnNext.addEventListener("click", function () { show(current + 1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) close(); });

  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") show(current - 1);
    else if (e.key === "ArrowRight") show(current + 1);
    else if (e.key === "Tab") {
      // keep focus inside the dialog
      var focusables = [btnClose, btnPrev, btnNext];
      var idx = focusables.indexOf(document.activeElement);
      if (e.shiftKey && (idx === 0 || idx === -1)) {
        e.preventDefault();
        focusables[focusables.length - 1].focus();
      } else if (!e.shiftKey && idx === focusables.length - 1) {
        e.preventDefault();
        focusables[0].focus();
      }
    }
  });
})();
