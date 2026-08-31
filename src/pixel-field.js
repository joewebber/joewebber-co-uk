/* <pixel-field> — dissolving grid of pixel cells driven by animated value noise.
   Attributes: cell, accent, density, fps */
(function () {
  const hash = (x, y, z) => {
    let n = x * 374761393 + y * 668265263 + z * 1274126177;
    n = (n ^ (n >>> 13)) >>> 0;
    n = (n * 1274126177) >>> 0;
    return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
  };
  const smooth = (t) => t * t * (3 - 2 * t);
  const lerp = (a, b, t) => a + (b - a) * t;

  function noise(x, y, z) {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    const xf = smooth(x - xi), yf = smooth(y - yi), zf = smooth(z - zi);
    const c = (dx, dy, dz) => hash(xi + dx, yi + dy, zi + dz);
    const x00 = lerp(c(0, 0, 0), c(1, 0, 0), xf);
    const x10 = lerp(c(0, 1, 0), c(1, 1, 0), xf);
    const x01 = lerp(c(0, 0, 1), c(1, 0, 1), xf);
    const x11 = lerp(c(0, 1, 1), c(1, 1, 1), xf);
    return lerp(lerp(x00, x10, yf), lerp(x01, x11, yf), zf);
  }

  class PixelField extends HTMLElement {
    connectedCallback() {
      if (this._booted) return;
      this._booted = true;
      Object.assign(this.style, { display: "block", width: "100%", height: "100%" });
      this.canvas = document.createElement("canvas");
      Object.assign(this.canvas.style, { display: "block", width: "100%", height: "100%" });
      this.appendChild(this.canvas);
      this.ctx = this.canvas.getContext("2d");
      this.read();
      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(this);
      this.resize();
      this.onScroll = () => {
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        this.sn = window.scrollY / max;
      };
      window.addEventListener("scroll", this.onScroll, { passive: true });
      this.sn = 0;
      this.onScroll();
      this.t0 = performance.now();
      this.last = 0;
      this.tick();
    }

    disconnectedCallback() {
      cancelAnimationFrame(this.raf);
      if (this.ro) this.ro.disconnect();
      window.removeEventListener("scroll", this.onScroll);
    }

    static get observedAttributes() { return ["cell", "accent", "density", "base"]; }
    attributeChangedCallback() { if (this._booted) this.read(); }

    read() {
      this.cell = Math.max(4, parseInt(this.getAttribute("cell") || "11", 10));
      this.accent = this.getAttribute("accent") || "#f3a63c";
      this.accentRGB = this.resolve(this.accent);
      this.baseRGB = this.resolve(this.getAttribute("base") || "#151b2e");
      this.density = parseFloat(this.getAttribute("density") || "1");
      this.fps = parseFloat(this.getAttribute("fps") || "9");
    }

    resolve(color) {
      const c = document.createElement("canvas");
      c.width = c.height = 1;
      const x = c.getContext("2d");
      x.fillStyle = "#000";
      x.fillStyle = color;
      x.fillRect(0, 0, 1, 1);
      const d = x.getImageData(0, 0, 1, 1).data;
      return [d[0], d[1], d[2]];
    }

    resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.w = this.clientWidth || window.innerWidth;
      this.h = this.clientHeight || window.innerHeight;
      this.canvas.width = Math.round(this.w * dpr);
      this.canvas.height = Math.round(this.h * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.ctx.imageSmoothingEnabled = false;
    }

    tick() {
      this.raf = requestAnimationFrame(() => this.tick());
      const now = performance.now();
      if (now - this.last < 1000 / this.fps) return;
      this.last = now;
      const ctx = this.ctx;
      if (!ctx || !this.w) return;
      const cell = this.cell;
      const cols = Math.ceil(this.w / cell);
      const rows = Math.ceil(this.h / cell);
      const t = (now - this.t0) / 1000;
      const z = t * 0.14 + this.sn * 3;
      const sx = 0.055, sy = 0.055;
      // the fade axis rotates slowly, so the amber end drifts around the page
      const ang = t * 0.07;
      const ca = Math.cos(ang), sa = Math.sin(ang);
      ctx.clearRect(0, 0, this.w, this.h);
      const px = cell - 1;
      for (let r = 0; r < rows; r++) {
        const yN = r / rows;
        for (let c = 0; c < cols; c++) {
          const xN = c / cols;
          // keep the centre column (where the copy sits) clear, dense toward the edges
          const edge = Math.max(
            Math.pow(Math.max(0, 1 - xN / 0.3), 1.5),
            Math.pow(Math.max(0, (xN - 0.62) / 0.38), 1.4),
            Math.pow(Math.max(0, (yN - 0.72) / 0.28), 1.5)
          );
          if (edge <= 0.02) continue;
          const n = noise(c * sx, r * sy, z) * 0.65 + noise(c * sx * 2.3, r * sy * 2.3, z * 1.6) * 0.35;
          const threshold = 1 - edge * 0.72 * this.density;
          if (n < threshold) continue;
          // diagonal ramp: amber at the top right, grey toward the bottom left,
          // dithered per cell so the transition stays pixelated
          const diag = 0.5 - ((xN - 0.5) * ca + (0.5 - yN) * sa) + (hash(c, r, 7) - 0.5) * 0.16;
          const mix = Math.min(1, Math.max(0, 1 - diag * 1.35));
          const a = this.accentRGB, g = this.baseRGB;
          ctx.fillStyle =
            "rgb(" +
            Math.round(g[0] + (a[0] - g[0]) * mix) + "," +
            Math.round(g[1] + (a[1] - g[1]) * mix) + "," +
            Math.round(g[2] + (a[2] - g[2]) * mix) + ")";
          ctx.globalAlpha = 0.07 + edge * 0.14 + mix * 0.1;
          ctx.fillRect(c * cell, r * cell, px, px);
        }
      }
      ctx.globalAlpha = 1;
    }
  }

  if (!customElements.get("pixel-field")) customElements.define("pixel-field", PixelField);
})();
