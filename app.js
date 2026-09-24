/* Theme toggle.
   The stylesheet already handles three states: bare :root is light,
   prefers-color-scheme flips it when nothing is stamped, and a data-theme
   attribute overrides both. This only stamps the attribute and remembers it.
   Storage can throw (private windows, blocked site data), so every read and
   write is wrapped and the page works correctly without it. */
(function () {
  var root = document.documentElement;

  try {
    var saved = localStorage.getItem("sr-theme");
    if (saved === "dark" || saved === "light") root.dataset.theme = saved;
  } catch (e) {}

  function effective() {
    if (root.dataset.theme) return root.dataset.theme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function paint(btn) {
    var dark = effective() === "dark";
    var label = btn.querySelector(".t-label");
    var icon = btn.querySelector("use");
    if (label) label.textContent = dark ? "Light" : "Dark";
    if (icon) icon.setAttribute("href", dark ? "#i-sun" : "#i-moon");
    btn.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  }

  function init() {
    var btn = document.getElementById("theme-toggle");
    if (!btn) return;
    paint(btn);
    btn.addEventListener("click", function () {
      var next = effective() === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try { localStorage.setItem("sr-theme", next); } catch (e) {}
      paint(btn);
    });
    // Follow the OS while the viewer has not made an explicit choice.
    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", function () {
      if (!root.dataset.theme) paint(btn);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();

/* FTC photo rotation. Reduced-motion visitors still receive each photo;
   the stylesheet removes the fade transition for them. */
(function () {
  function initRotators() {
    document.querySelectorAll("[data-rotator]").forEach(function (rotator) {
      var images = Array.prototype.slice.call(rotator.querySelectorAll("img"));
      if (images.length < 2) return;

      var current = 0;
      var delay = Number(rotator.getAttribute("data-interval")) || 4500;
      var caption = rotator.parentElement.querySelector("figcaption");

      window.setInterval(function () {
        images[current].classList.remove("is-active");
        images[current].setAttribute("aria-hidden", "true");
        current = (current + 1) % images.length;
        images[current].classList.add("is-active");
        images[current].removeAttribute("aria-hidden");
        if (caption && images[current].dataset.caption) {
          caption.textContent = images[current].dataset.caption;
        }
      }, delay);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRotators);
  } else {
    initRotators();
  }
})();
