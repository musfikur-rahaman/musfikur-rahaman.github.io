(function () {
  var root = document.documentElement;

  // Theme toggle: remembers an explicit choice, otherwise follows the OS.
  var themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      var current = root.dataset.theme ||
        (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
      var next = current === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch (e) {}
    });
  }

  // Mobile menu
  var menuToggle = document.getElementById("menuToggle");
  var navLinks = document.getElementById("navLinks");
  if (menuToggle && navLinks) {
    var setOpen = function (open) {
      navLinks.classList.toggle("open", open);
      menuToggle.setAttribute("aria-expanded", String(open));
      menuToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    };
    menuToggle.addEventListener("click", function () {
      setOpen(!navLinks.classList.contains("open"));
    });
    navLinks.addEventListener("click", function (e) {
      if (e.target.closest("a")) setOpen(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });
  }

  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  // Dots-and-lines constellation (teal, moderately stronger, all pages).
  // A fixed canvas sits behind the page content. Most particles are
  // dots, with a few stars, outline circles and outline triangles
  // mixed in. They drift slowly, link to nearby particles with
  // lines, and lean in / glow / draw a line to the cursor (or touch
  // point) when it is near. No extra UI, no counter.
  // Respects prefers-reduced-motion (static faint shapes only) and
  // follows the site's light/dark theme via --accent.
  (function () {
    var reduceMotion = false;
    try {
      reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (e) {}
    if (!document.body) return;
    var canvas = document.createElement("canvas");
    canvas.className = "constellation-canvas";
    canvas.setAttribute("aria-hidden", "true");
    document.body.insertBefore(canvas, document.body.firstChild);
    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var dots = [];
    var pointer = { x: -9999, y: -9999, active: false, lastMove: 0 };
    var rafId = null;
    var running = false;
    var accent = { r: 15, g: 118, b: 110 };
    var isDark = false;

    function parseHex(hex) {
      hex = (hex || "").trim().replace("#", "");
      if (hex.length === 3) hex = hex.split("").map(function (c) { return c + c; }).join("");
      if (hex.length !== 6) return null;
      var n = parseInt(hex, 16);
      if (isNaN(n)) return null;
      return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    }
    function readTheme() {
      var cs = null;
      try { cs = window.getComputedStyle(root); } catch (e) {}
      var parsed = cs ? parseHex(cs.getPropertyValue("--accent")) : null;
      accent = parsed || { r: 15, g: 118, b: 110 };
      isDark = root.dataset.theme === "dark" ||
        (!root.dataset.theme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
    function rgba(c, a) {
      return "rgba(" + c.r + "," + c.g + "," + c.b + "," + a + ")";
    }
    function resize() {
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildDots();
      draw(0);
    }
    function buildDots() {
      var w = window.innerWidth, h = window.innerHeight;
      var count = Math.max(40, Math.min(90, Math.round((w * h) / 16000)));
      dots = [];
      for (var i = 0; i < count; i++) {
        // Mixed shapes: mostly dots, with stars, circles, triangles.
        var roll = Math.random();
        var shape = roll < 0.50 ? "dot" : roll < 0.70 ? "star" :
          roll < 0.85 ? "circle" : "triangle";
        dots.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          r: 1.4 + Math.random() * 1.0,
          shape: shape,
          phase: Math.random() * Math.PI * 2,
          speed: 0.4 + Math.random() * 0.8
        });
      }
    }
    function draw(time) {
      var w = window.innerWidth, h = window.innerHeight;
      ctx.clearRect(0, 0, w, h);
      var dotA = isDark ? 0.65 : 0.55;
      var lineA = isDark ? 0.26 : 0.20;
      var cursorA = isDark ? 0.55 : 0.45;
      var linkDist = 130, cursorDist = 160;
      var now = time || 0;
      var pointerFresh = pointer.active && (Date.now() - pointer.lastMove < 3000);
      var i, j, d;
      // Lines between nearby dots.
      for (i = 0; i < dots.length; i++) {
        for (j = i + 1; j < dots.length; j++) {
          var dx = dots[i].x - dots[j].x, dy = dots[i].y - dots[j].y;
          var dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < linkDist) {
            ctx.strokeStyle = rgba(accent, lineA * (1 - dist / linkDist));
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.stroke();
          }
        }
      }
      // Lines + lean-in for dots near the pointer.
      for (i = 0; i < dots.length; i++) {
        d = dots[i];
        var px = d.x, py = d.y, near = 0;
        if (pointerFresh) {
          var pdx = pointer.x - d.x, pdy = pointer.y - d.y;
          var pd = Math.sqrt(pdx * pdx + pdy * pdy);
          if (pd < cursorDist && pd > 0.01) {
            near = 1 - pd / cursorDist;
            px = d.x + (pdx / pd) * near * 6;
            py = d.y + (pdy / pd) * near * 6;
            ctx.strokeStyle = rgba(accent, cursorA * near);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(px, py);
            ctx.lineTo(pointer.x, pointer.y);
            ctx.stroke();
          }
        }
        var twinkle = 0.75 + 0.25 * Math.sin(now / 900 * d.speed + d.phase);
        var alpha = Math.min(1, dotA * twinkle + near * 0.45);
        var rr = d.r * (1 + near * 0.6);
        if (d.shape === "star") {
          // 4-point sparkle star.
          ctx.fillStyle = rgba(accent, alpha);
          ctx.beginPath();
          var outer = rr * 3.2, inner = rr * 0.6;
          for (var k = 0; k < 8; k++) {
            var ang = k * Math.PI / 4 - Math.PI / 2;
            var rad = k % 2 === 0 ? outer : inner;
            var sx = px + Math.cos(ang) * rad, sy = py + Math.sin(ang) * rad;
            if (k === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
          }
          ctx.closePath();
          ctx.fill();
        } else if (d.shape === "circle") {
          ctx.strokeStyle = rgba(accent, alpha);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(px, py, rr + 2.0, 0, Math.PI * 2);
          ctx.stroke();
        } else if (d.shape === "triangle") {
          ctx.strokeStyle = rgba(accent, alpha);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(px, py - rr * 2.4);
          ctx.lineTo(px + rr * 2.4, py + rr * 1.8);
          ctx.lineTo(px - rr * 2.4, py + rr * 1.8);
          ctx.closePath();
          ctx.stroke();
        } else {
          ctx.fillStyle = rgba(accent, alpha);
          ctx.beginPath();
          ctx.arc(px, py, rr, 0, Math.PI * 2);
          ctx.fill();
        }
        d._px = px; d._py = py;
      }
    }
    function step(time) {
      if (!running) return;
      var w = window.innerWidth, h = window.innerHeight;
      for (var i = 0; i < dots.length; i++) {
        var d = dots[i];
        d.x += d.vx; d.y += d.vy;
        if (d.x < -10) d.x = w + 10; else if (d.x > w + 10) d.x = -10;
        if (d.y < -10) d.y = h + 10; else if (d.y > h + 10) d.y = -10;
      }
      draw(time);
      rafId = window.requestAnimationFrame(step);
    }
    function start() {
      if (running || reduceMotion) return;
      running = true;
      rafId = window.requestAnimationFrame(step);
    }
    function stop() {
      running = false;
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      rafId = null;
    }
    function onVisibility() {
      if (document.hidden) stop();
      else { draw(0); start(); }
    }
    function onPointer(e) {
      pointer.x = e.clientX; pointer.y = e.clientY;
      pointer.active = true; pointer.lastMove = Date.now();
    }
    function onPointerLeave() { pointer.active = false; }

    readTheme();
    resize();
    if (reduceMotion) {
      // Static faint dots only: no drift, no cursor lines.
      draw(0);
      window.addEventListener("resize", resize);
      try {
        var obs = new MutationObserver(function () { readTheme(); draw(0); });
        obs.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
      } catch (e) {}
      return;
    }
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("pointerdown", onPointer, { passive: true });
    document.addEventListener("mouseleave", onPointerLeave);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    try {
      var observer = new MutationObserver(function () { readTheme(); });
      observer.observe(root, { attributes: true, attributeFilter: ["data-theme"] });
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", readTheme);
    } catch (e) {}
    start();
  })();
})();
