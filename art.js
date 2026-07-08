// Art page: light-up-on-scroll walls + accessible lightbox.
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
