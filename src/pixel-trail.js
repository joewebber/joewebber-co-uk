/* <pixel-trail> — grid-snapped pixels that fall out of the cursor.
   Attributes: accent, cell, rate */
(function () {
  class PixelTrail extends HTMLElement {
    connectedCallback() {
      if (this._booted) return;
      this._booted = true;
      Object.assign(this.style, { display: "block", width: "100%", height: "100%" });
      this.canvas = document.createElement("canvas");
      Object.assign(this.canvas.style, { display: "block", width: "100%", height: "100%" });
      this.appendChild(this.canvas);
      this.ctx = this.canvas.getContext("2d");
      this.read();
      this.bits = [];
      this.ro = new ResizeObserver(() => this.resize());
      this.ro.observe(this);
      this.resize();
      this.lx = null; this.ly = null;
      this.onMove = (e) => this.emit(e.clientX, e.clientY);
      window.addEventListener("pointermove", this.onMove, { passive: true });
      this.tick();
    }

    disconnectedCallback() {
      cancelAnimationFrame(this.raf);
      if (this.ro) this.ro.disconnect();
      window.removeEventListener("pointermove", this.onMove);
    }

    static get observedAttributes() { return ["accent", "cell", "rate"]; }
    attributeChangedCallback() { if (this._booted) this.read(); }

    read() {
      this.cell = Math.max(3, parseInt(this.getAttribute("cell") || "7", 10));
      this.accent = this.getAttribute("accent") || "#f3a63c";
      this.rate = parseFloat(this.getAttribute("rate") || "1");
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

    emit(x, y) {
      const cell = this.cell;
      const dx = this.lx === null ? 0 : x - this.lx;
      const dy = this.ly === null ? 0 : y - this.ly;
      this.lx = x; this.ly = y;
      const speed = Math.min(60, Math.hypot(dx, dy));
      const n = Math.max(1, Math.round((speed / 12) * this.rate));
      for (let i = 0; i < n; i++) {
        const jitter = (Math.random() - 0.5) * cell * 3.2;
        const jitterY = (Math.random() - 0.5) * cell * 3.2;
        const size = cell * (Math.random() < 0.25 ? 2 : 1);
        this.bits.push({
          x: Math.round((x + jitter) / cell) * cell,
          y: Math.round((y + jitterY) / cell) * cell,
          s: size,
          vx: dx * -0.03 + (Math.random() - 0.5) * 0.5,
          vy: dy * -0.03 + (Math.random() - 0.5) * 0.5 + 0.16,
          life: 1,
          decay: 0.014 + Math.random() * 0.022,
          warm: Math.random() < 0.55,
        });
      }
      if (this.bits.length > 420) this.bits.splice(0, this.bits.length - 420);
    }

    tick() {
      this.raf = requestAnimationFrame(() => this.tick());
      const ctx = this.ctx;
      if (!ctx || !this.w) return;
      ctx.clearRect(0, 0, this.w, this.h);
      const cell = this.cell;
      for (let i = this.bits.length - 1; i >= 0; i--) {
        const b = this.bits[i];
        b.life -= b.decay;
        if (b.life <= 0) { this.bits.splice(i, 1); continue; }
        b.x += b.vx; b.y += b.vy; b.vy += 0.06;
        ctx.globalAlpha = Math.max(0, Math.min(0.9, b.life * 0.85));
        ctx.fillStyle = b.warm ? this.accent : "#eceef3";
        ctx.fillRect(Math.round(b.x / cell) * cell, Math.round(b.y / cell) * cell, b.s, b.s);
      }
      ctx.globalAlpha = 1;
    }
  }

  if (!customElements.get("pixel-trail")) customElements.define("pixel-trail", PixelTrail);
})();
