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

const maxTendrils = 50;
const maxBranches = 5;
const maxReach = 200; // max distance cursor can attract tendrils
const tendrils = [];

class Tendril {
    constructor() { this.reset(); }
    reset() {
        this.points = [{x: center.x, y: center.y}];
        this.vx = (Math.random()-0.5)*6;
        this.vy = (Math.random()-0.5)*6;
        this.life = Math.random()*180 + 120;
        this.color = `hsla(${180 + Math.random()*60}, 100%, 75%, 1)`;
        this.branches = [];
        for(let i=0;i<maxBranches;i++){
            this.branches.push({x:center.x, y:center.y, vx:(Math.random()-0.5)*3, vy:(Math.random()-0.5)*3});
        }
    }
    update() {
        let p = this.points[this.points.length-1];

        // distance to cursor
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx*dx + dy*dy);

        // if cursor is too far, attract only to center
        let targetX = center.x;
        let targetY = center.y;
        if(dist < maxReach){
            targetX = mouse.x;
            targetY = mouse.y;
        }

        const tx = targetX - p.x;
        const ty = targetY - p.y;

        this.vx += tx*0.007 + (Math.random()-0.5)*1.2;
        this.vy += ty*0.007 + (Math.random()-0.5)*1.2;

        this.vx *= 0.92;
        this.vy *= 0.92;

        p.x += this.vx;
        p.y += this.vy;

        this.points.push({x:p.x, y:p.y});
        if(this.points.length > this.life) this.points.shift();

        for(let b of this.branches){
            const bx = (dist < maxReach) ? mouse.x : center.x;
            const by = (dist < maxReach) ? mouse.y : center.y;
            const dx2 = bx - b.x;
            const dy2 = by - b.y;
            b.vx += dx2*0.006 + (Math.random()-0.5)*0.6;
            b.vy += dy2*0.006 + (Math.random()-0.5)*0.6;
            b.vx *= 0.94;
            b.vy *= 0.94;
            b.x += b.vx;
            b.y += b.vy;
        }

        if(Math.random()<0.01) this.reset();
    }
    draw(ctx) {
        ctx.shadowBlur = 35;
        ctx.shadowColor = this.color;
        ctx.lineWidth = 3;

        // main tendril
        ctx.beginPath();
        let p0 = this.points[0];
        ctx.moveTo(p0.x, p0.y);
        for(let p of this.points) ctx.lineTo(p.x,p.y);
        ctx.strokeStyle = this.color;
        ctx.stroke();

        // branches
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

// central orb
function drawCenterOrb(ctx, t){
    const gradient = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, 80);
    const glow = 50 + Math.sin(t*0.05)*20;
    gradient.addColorStop(0, `rgba(50,200,255,1)`);
    gradient.addColorStop(0.5, `rgba(0,150,255,0.6)`);
    gradient.addColorStop(1, `rgba(0,0,50,0)`);
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(center.x, center.y, glow, 0, Math.PI*2);
    ctx.fill();
}

// create tendrils
for(let i=0;i<maxTendrils;i++) tendrils.push(new Tendril());

let time = 0;
function animate() {
    time++;
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    ctx.fillRect(0,0,w,h);

    drawCenterOrb(ctx, time);

    for(let t of tendrils){
        t.update();
        t.draw(ctx);
    }
    requestAnimationFrame(animate);
}

animate();
