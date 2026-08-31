/* <pixel-drift> — pixel-art icons drifting behind the page, tinted on a rotating
   amber → navy ramp. Attributes: count, scale, speed, accent, base */
(function () {
  const SLUGS = ["browser", "cassette", "tea", "module", "cd-disk", "record-player", "love-sign", "cloud-error", "spray", "target"];
  // when bundled standalone, the inliner hands us blob urls on window.__resources
  const ICONS = SLUGS.map((s) => {
    const r = window.__resources || {};
    return r["icon-" + s] || "icons/" + s + ".svg";
  });

  const resolve = (color) => {
    const c = document.createElement("canvas");
    c.width = c.height = 1;
    const x = c.getContext("2d");
    x.fillStyle = "#000";
    x.fillStyle = color;
    x.fillRect(0, 0, 1, 1);
    const d = x.getImageData(0, 0, 1, 1).data;
    return [d[0], d[1], d[2]];
  };

  class PixelDrift extends HTMLElement {
    connectedCallback() {
      if (this._booted) return;
      this._booted = true;
      Object.assign(this.style, { display: "block", position: "relative", width: "100%", height: "100%", overflow: "hidden" });
      this.build();
      this.onMove = (e) => {
        this.px = (e.clientX / window.innerWidth - 0.5) * 2;
        this.py = (e.clientY / window.innerHeight - 0.5) * 2;
      };
      this.onScroll = () => {
        const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
        this.sn = window.scrollY / max;
      };
      window.addEventListener("pointermove", this.onMove, { passive: true });
      window.addEventListener("scroll", this.onScroll, { passive: true });
      this.px = 0; this.py = 0; this.cx = 0; this.cy = 0; this.sn = 0;
      this.onScroll();
      this.t0 = performance.now();
      this.tick();
    }

    disconnectedCallback() {
      cancelAnimationFrame(this.raf);
      window.removeEventListener("pointermove", this.onMove);
      window.removeEventListener("scroll", this.onScroll);
    }

    static get observedAttributes() { return ["count", "scale", "accent", "base"]; }
    attributeChangedCallback() { if (this._booted) this.build(); }

    build() {
      const count = Math.max(3, Math.min(22, parseInt(this.getAttribute("count") || "10", 10)));
      const scale = parseFloat(this.getAttribute("scale") || "1");
      this.accentRGB = resolve(this.getAttribute("accent") || "#f3a63c");
      this.baseRGB = resolve(this.getAttribute("base") || "#151b2e");
      this.innerHTML = "";
      this.items = [];
      for (let i = 0; i < count; i++) {
        const size = Math.round((64 + ((i * 29) % 5) * 26) * scale);
        const el = document.createElement("div");
        const url = "url('" + ICONS[i % ICONS.length] + "')";
        Object.assign(el.style, {
          position: "absolute",
          left: "0px",
          top: "0px",
          width: size + "px",
          height: size + "px",
          backgroundColor: "#eceef3",
          maskImage: url,
          webkitMaskImage: url,
          maskSize: "100% 100%",
          webkitMaskSize: "100% 100%",
          maskRepeat: "no-repeat",
          webkitMaskRepeat: "no-repeat",
          imageRendering: "pixelated",
          opacity: String(0.16 + (i % 4) * 0.05),
          willChange: "transform",
        });
        this.appendChild(el);
        this.items.push({
          el,
          size,
          x: ((i * 61) % 100) / 100,
          y: ((i * 43) % 100) / 100,
          amp: 16 + (i % 5) * 14,
          phase: i * 1.7,
          par: 0.3 + (i % 4) * 0.4,
          rot: ((((i * 97) % 100) / 100) - 0.5) * 20,
        });
      }
    }

    tick() {
      this.raf = requestAnimationFrame(() => this.tick());
      const w = this.clientWidth, h = this.clientHeight;
      if (!w) return;
      const t = (performance.now() - this.t0) / 1000;
      this.cx += (this.px - this.cx) * 0.05;
      this.cy += (this.py - this.cy) * 0.05;
      // same rotating fade axis as <pixel-field>
      const ang = t * 0.07;
      const ca = Math.cos(ang), sa = Math.sin(ang);
      const a = this.accentRGB, g = this.baseRGB;
      for (const it of this.items) {
        const bx = it.x * (w - it.size) + Math.sin(t * 0.16 + it.phase) * it.amp + this.cx * it.par * 26;
        let by =
          it.y * (h - it.size) +
          Math.cos(t * 0.13 + it.phase) * it.amp * 0.8 -
          this.cy * it.par * 18 -
          this.sn * 150 * it.par;
        const span = h + it.size;
        by = ((by % span) + span) % span - it.size;
        it.el.style.transform =
          "translate3d(" + Math.round(bx) + "px," + Math.round(by) + "px,0) rotate(" + it.rot.toFixed(2) + "deg)";

        const xN = (bx + it.size / 2) / w;
        const yN = (by + it.size / 2) / h;
        const diag = 0.5 - ((xN - 0.5) * ca + (0.5 - yN) * sa);
        const mix = Math.min(1, Math.max(0, 1 - diag * 1.35));
        it.el.style.backgroundColor =
          "rgb(" +
          Math.round(g[0] + (a[0] - g[0]) * mix) + "," +
          Math.round(g[1] + (a[1] - g[1]) * mix) + "," +
          Math.round(g[2] + (a[2] - g[2]) * mix) + ")";
      }
    }
  }

  if (!customElements.get("pixel-drift")) customElements.define("pixel-drift", PixelDrift);
})();
