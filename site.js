// Main page: scroll reveal + hero detection-box animation trigger.
(function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Tag sections for reveal
  var targets = document.querySelectorAll("section .rule-head, .plate, .worklist li, .analytics, .kit > div");
  targets.forEach(function (el) { el.classList.add("reveal"); });

  if (!("IntersectionObserver" in window) || reduced) {
    targets.forEach(function (el) { el.classList.add("visible"); });
    document.querySelector(".hero-vision").classList.add("vision-on");
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add("visible");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  targets.forEach(function (el) { io.observe(el); });

  // Fire the detection boxes once the hero image is on screen
  var vision = document.querySelector(".hero-vision");
  var vio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        vision.classList.add("vision-on");
        vio.disconnect();
      }
    });
  }, { threshold: 0.4 });
  vio.observe(vision);
})();

// Metric count-up — the big numbers tick up when they scroll into view.
(function () {
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var metrics = document.querySelectorAll(".metric-big[data-count]");
  if (!metrics.length) return;

  // Leave the final (correct) value in place if we can't/shouldn't animate.
  if (reduced || !("IntersectionObserver" in window)) return;

  function run(el) {
    var to = parseFloat(el.dataset.count);
    var dec = parseInt(el.dataset.decimals || "0", 10);
    var pre = el.dataset.prefix || "";
    var suf = el.dataset.suffix || "";
    var dur = 1000, t0 = null;
    function frame(t) {
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = pre + (to * eased).toFixed(dec) + suf;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
    });
  }, { threshold: 0.6 });
  metrics.forEach(function (el) { io.observe(el); });
})();
