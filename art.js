// Art page: light-up-on-scroll walls + accessible lightbox (with an optional
// View-Transition morph between the thumbnail and the full image).
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
  var main = document.getElementById("main");
  var current = -1;
  var lastFocus = null;

  // Morph only where it's safe: supported + motion allowed.
  var canMorph = !reduced && typeof document.startViewTransition === "function";
  function nameOf(el, n) { if (el) el.style.viewTransitionName = n; }

  function paint(i) {
    current = (i + frames.length) % frames.length;
    var f = frames[current];
    var img = f.querySelector("img");
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = f.dataset.title + " — " + f.dataset.medium.toLowerCase();
  }

  function doOpen(i) {
    lb.hidden = false;
    document.body.style.overflow = "hidden";
    if (main) main.setAttribute("inert", "");   // lock the page behind the dialog
    paint(i);
  }

  function open(i) {
    lastFocus = document.activeElement;
    if (!canMorph) { doOpen(i); btnClose.focus(); return; }
    nameOf(frames[i].querySelector("img"), "lb-active");
    var vt = document.startViewTransition(function () {
      nameOf(frames[i].querySelector("img"), "");
      nameOf(lbImg, "lb-active");
      doOpen(i);
    });
    vt.updateCallbackDone.then(function () { btnClose.focus(); });
    vt.finished.finally(function () { nameOf(lbImg, ""); });
  }

  function doClose() {
    lb.hidden = true;
    document.body.style.overflow = "";
    if (main) main.removeAttribute("inert");
    lbImg.src = "";
  }

  function close() {
    if (!canMorph) { doClose(); if (lastFocus) lastFocus.focus(); return; }
    var target = frames[current] && frames[current].querySelector("img");
    nameOf(lbImg, "lb-active");
    var vt = document.startViewTransition(function () {
      nameOf(lbImg, "");
      nameOf(target, "lb-active");
      doClose();
    });
    vt.finished.finally(function () { nameOf(target, ""); });
    if (lastFocus) lastFocus.focus();
  }

  function navigate(delta) {
    if (!canMorph) { paint(current + delta); return; }
    nameOf(lbImg, "lb-active");
    var vt = document.startViewTransition(function () { paint(current + delta); });
    vt.finished.finally(function () { nameOf(lbImg, ""); });
  }

  frames.forEach(function (f, i) {
    f.addEventListener("click", function () { open(i); });
  });
  btnClose.addEventListener("click", close);
  btnPrev.addEventListener("click", function () { navigate(-1); });
  btnNext.addEventListener("click", function () { navigate(1); });
  lb.addEventListener("click", function (e) { if (e.target === lb) close(); });

  document.addEventListener("keydown", function (e) {
    if (lb.hidden) return;
    if (e.key === "Escape") close();
    else if (e.key === "ArrowLeft") navigate(-1);
    else if (e.key === "ArrowRight") navigate(1);
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
