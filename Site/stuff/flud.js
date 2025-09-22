// create full-screen canvas
const canvas = document.createElement('canvas');
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.appendChild(canvas);
const ctx = canvas.getContext('2d');

let w = canvas.width = window.innerWidth;
let h = canvas.height = window.innerHeight;

window.addEventListener('resize', () => {
  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
});

const center = { x: w/2, y: h/2 };
const tendrils = [];
const maxTendrils = 40;
const maxLength = 250;

class Tendril {
  constructor() { this.reset(); }
  reset() {
    this.x = center.x;
    this.y = center.y;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
    this.life = Math.random() * maxLength;
    this.color = `hsl(${Math.random()*360},100%,60%)`;
    this.path = [{x: this.x, y: this.y}];
  }
  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.path.push({x: this.x, y: this.y});
    if(this.path.length > this.life) this.path.shift();

    const dx = center.x - this.x;
    const dy = center.y - this.y;
    this.vx += dx * 0.003;
    this.vy += dy * 0.003;
    this.vx *= 0.96;
    this.vy *= 0.96;

    if(Math.random() < 0.02) this.reset();
  }
  draw(ctx) {
    ctx.beginPath();
    ctx.moveTo(this.path[0].x, this.path[0].y);
    for(let i=1;i<this.path.length;i++) ctx.lineTo(this.path[i].x,this.path[i].y);
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

for(let i=0;i<maxTendrils;i++) tendrils.push(new Tendril());

function animate() {
  ctx.fillStyle = 'rgba(0,0,0,0.1)';
  ctx.fillRect(0,0,w,h);
  for(let t of tendrils){
    t.update();
    t.draw(ctx);
  }
  requestAnimationFrame(animate);
}

animate();
