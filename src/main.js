import "./pixel-field.js";
import "./pixel-drift.js";
import "./pixel-trail.js";

(function () {
  "use strict";

  function initClock() {
    var el = document.getElementById("clock");
    if (!el) return;
    function tick() {
      var t = new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Europe/London",
      });
      el.textContent = "UK " + t;
    }
    tick();
    setInterval(tick, 20000);
  }

  function initScrollSpy() {
    var secs = Array.prototype.slice.call(document.querySelectorAll("[data-sec]"));
    var rails = Array.prototype.slice.call(document.querySelectorAll("[data-rail]"));
    var fill = document.getElementById("nav-fill");
    var bar = document.getElementById("progress-bar");
    if (!secs.length) return;

    function sync() {
      var max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      var p = Math.min(1, Math.max(0, window.scrollY / max));
      if (fill) fill.style.height = (p * 100).toFixed(2) + "%";
      if (bar) bar.style.width = (p * 100).toFixed(2) + "%";

      var mid = window.scrollY + window.innerHeight * 0.4;
      var active = 0;
      secs.forEach(function (s, i) {
        if (s.offsetTop <= mid) active = i;
      });
      rails.forEach(function (a) {
        var on = Number(a.getAttribute("data-rail")) === active;
        a.classList.toggle("is-active", on);
      });
    }

    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    sync();
  }

  function initDrag() {
    var wrap = document.getElementById("collage");
    if (!wrap) return;
    var el = null, sx = 0, sy = 0, ox = 0, oy = 0, rot = 0, z = 10;

    wrap.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "touch") return;
      var t = e.target.closest("[data-drag]");
      if (!t) return;
      el = t;
      rot = parseFloat(t.getAttribute("data-rot") || "0");
      ox = parseFloat(t.dataset.dx || "0");
      oy = parseFloat(t.dataset.dy || "0");
      sx = e.clientX;
      sy = e.clientY;
      el.style.animation = "none";
      el.style.zIndex = String(++z);
      el.style.transition = "none";
      el.setPointerCapture(e.pointerId);
      e.preventDefault();
    });

    wrap.addEventListener("pointermove", function (e) {
      if (!el) return;
      var dx = ox + e.clientX - sx;
      var dy = oy + e.clientY - sy;
      el.dataset.dx = dx;
      el.dataset.dy = dy;
      var tilt = Math.max(-14, Math.min(14, rot + (e.clientX - sx) * 0.02));
      el.style.transform = "translate(" + dx + "px," + dy + "px) rotate(" + tilt + "deg)";
    });

    function end() {
      if (!el) return;
      el.style.transition = "transform 420ms cubic-bezier(.2,.8,.2,1)";
      var dx = parseFloat(el.dataset.dx || "0");
      var dy = parseFloat(el.dataset.dy || "0");
      el.style.transform = "translate(" + dx + "px," + dy + "px) rotate(" + rot + "deg)";
      el = null;
    }
    wrap.addEventListener("pointerup", end);
    wrap.addEventListener("pointercancel", end);
  }

  function initYear() {
    var el = document.getElementById("year");
    if (el) el.textContent = String(new Date().getFullYear());
  }

  document.addEventListener("DOMContentLoaded", function () {
    initClock();
    initYear();
    initScrollSpy();
    initDrag();
  });
})();
