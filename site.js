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
