const canvas = document.getElementById('fluid');
const ctx = canvas.getContext('2d');

let width = canvas.width = window.innerWidth;
let height = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

let mouse = { x: width / 2, y: height / 2 };
document.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

const particles = [];
const maxParticles = 400;
const gradientColors = ['#58a6ff', '#8a2be2']; // blue → purple

class Particle {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 3;
    this.vy = (Math.random() - 0.5) * 3;
    this.life = Math.random() * 200 + 100;
    this.size = Math.random() * 12 + 4;
    this.color = gradientColors[Math.floor(Math.random() * gradientColors.length)];
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;

    // gentle velocity drift → fluid look
    this.vx += (Math.random() - 0.5) * 0.1;
    this.vy += (Math.random() - 0.5) * 0.1;

    this.vx *= 0.98;
    this.vy *= 0.98;
    this.life--;
  }
  draw(ctx) {
    const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size);
    gradient.addColorStop(0, this.color);
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

function addParticles() {
  for (let i = 0; i < 8; i++) {
    if (particles.length < maxParticles) {
      particles.push(new Particle(mouse.x, mouse.y));
    }
  }
}

function animate() {
  // semi-transparent overlay → motion blur / liquid smear
  ctx.fillStyle = 'rgba(13,17,23,0.08)';
  ctx.fillRect(0, 0, width, height);

  addParticles();

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.update();
    p.draw(ctx);
    if (p.life <= 0) particles.splice(i, 1);
  }

  requestAnimationFrame(animate);
}

animate();
