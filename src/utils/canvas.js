export function createParticles(canvas, opts = {}) {
  const ctx = canvas.getContext("2d");
  let animId;
  let particles = [];
  const {
    count = 60,
    color = "99, 102, 241",
    minSize = 2,
    maxSize = 5,
    speed = 0.3,
    connect = true,
    connectDist = 120,
  } = opts;

  const resize = () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  };
  window.addEventListener("resize", resize);

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = minSize + Math.random() * (maxSize - minSize);
      this.vx = (Math.random() - 0.5) * speed;
      this.vy = (Math.random() - 0.5) * speed;
      this.alpha = 0.3 + Math.random() * 0.5;
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
      if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${color}, ${this.alpha})`;
      ctx.fill();
    }
  }

  const init = () => {
    resize();
    particles = Array.from({ length: count }, () => new Particle());
  };

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach((p) => { p.update(); p.draw(); });
    if (connect) {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectDist) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(${color}, ${0.08 * (1 - dist / connectDist)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }
    animId = requestAnimationFrame(animate);
  };

  init();
  animate();

  return () => {
    cancelAnimationFrame(animId);
    window.removeEventListener("resize", resize);
  };
}
