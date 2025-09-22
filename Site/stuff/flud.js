// Full-screen canvas
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
const mouse = { x: center.x, y: center.y };
document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

const tendrils = [];
const maxTendrils = 40;
const maxBranches = 5;

class Tendril {
    constructor() { this.reset(); }
    reset() {
        this.points = [{x: center.x, y: center.y}];
        this.vx = (Math.random()-0.5)*6;
        this.vy = (Math.random()-0.5)*6;
        this.life = Math.random()*200+150;
        // icy blue tones
        const hue = 180 + Math.random()*60; 
        this.color = `hsla(${hue},100%,75%,1)`;
        this.branches = [];
        for(let i=0;i<maxBranches;i++){
            this.branches.push({x:center.x, y:center.y, vx:(Math.random()-0.5)*3, vy:(Math.random()-0.5)*3});
        }
    }
    update() {
        let p = this.points[this.points.length-1];

        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        this.vx += dx*0.006 + (Math.random()-0.5)*1;
        this.vy += dy*0.006 + (Math.random()-0.5)*1;

        this.vx *= 0.93;
        this.vy *= 0.93;

        p.x += this.vx;
        p.y += this.vy;

        this.points.push({x:p.x, y:p.y});
        if(this.points.length > this.life) this.points.shift();

        for(let b of this.branches){
            const dx2 = mouse.x - b.x;
            const dy2 = mouse.y - b.y;
            b.vx += dx2*0.005 + (Math.random()-0.5)*0.6;
            b.vy += dy2*0.005 + (Math.random()-0.5)*0.6;
            b.vx *= 0.94;
            b.vy *= 0.94;
            b.x += b.vx;
            b.y += b.vy;
        }

        if(Math.random()<0.01) this.reset();
    }
    draw(ctx) {
        ctx.shadowBlur = 30;
        ctx.shadowColor = this.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        let p0 = this.points[0];
        ctx.moveTo(p0.x, p0.y);
        for(let p of this.points) ctx.lineTo(p.x,p.y);
        ctx.strokeStyle = this.color;
        ctx.stroke();

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
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fillRect(0,0,w,h);

    for(let t of tendrils){
        t.update();
        t.draw(ctx);
    }
    requestAnimationFrame(animate);
}

animate();
