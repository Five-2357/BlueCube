// full-screen canvas
const canvas = document.createElement('canvas');
document.body.style.margin = '0';
document.body.style.overflow = 'hidden';
document.body.style.background = 'black';
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
const maxTendrils = 35;
const maxBranches = 4;

class Tendril {
    constructor() { this.reset(); }
    reset() {
        this.points = [{x: center.x, y: center.y}];
        this.vx = (Math.random()-0.5)*4;
        this.vy = (Math.random()-0.5)*4;
        this.life = Math.random()*150+100;
        this.color = `hsla(${Math.random()*360},100%,70%,1)`;
        this.branches = [];
        for(let i=0;i<maxBranches;i++){
            this.branches.push({x:center.x, y:center.y, vx:(Math.random()-0.5)*2, vy:(Math.random()-0.5)*2});
        }
    }
    update() {
        // update main tendril
        let p = this.points[this.points.length-1];
        p.x += this.vx;
        p.y += this.vy;
        this.vx += (center.x - p.x)*0.004 + (Math.random()-0.5)*0.5;
        this.vy += (center.y - p.y)*0.004 + (Math.random()-0.5)*0.5;
        this.vx *= 0.96;
        this.vy *= 0.96;
        this.points.push({x:p.x, y:p.y});
        if(this.points.length > this.life) this.points.shift();

        // update branches
        for(let b of this.branches){
            b.x += b.vx;
            b.y += b.vy;
            b.vx += (center.x - b.x)*0.004 + (Math.random()-0.5)*0.3;
            b.vy += (center.y - b.y)*0.004 + (Math.random()-0.5)*0.3;
            b.vx *= 0.96;
            b.vy *= 0.96;
        }

        if(Math.random()<0.01) this.reset();
    }
    draw(ctx) {
        // glow effect
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        let p0 = this.points[0];
        ctx.moveTo(p0.x, p0.y);
        for(let p of this.points) ctx.lineTo(p.x, p.y);
        ctx.strokeStyle = this.color;
        ctx.stroke();

        // draw branches
        for(let b of this.branches){
            ctx.beginPath();
            ctx.moveTo(center.x, center.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = this.color;
            ctx.stroke();
        }
        ctx.shadowBlur = 0;
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
