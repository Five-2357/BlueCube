// Fullscreen canvas
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

// Parameters
const maxArcs = 50;
const maxLength = 50;
const maxForks = 2;
const influenceRadius = 150;

// Arc class
class Arc {
    constructor() {
        this.reset();
    }
    reset() {
        this.segments = [{ x: center.x, y: center.y }];
        this.angle = Math.random() * Math.PI * 2;
        this.length = Math.random() * maxLength * 0.5 + maxLength * 0.5;
        this.color = `hsla(${200 + Math.random() * 60},100%,75%,1)`; // icy-blue
        this.forks = [];
        this.generateSegments();
    }
    generateSegments() {
        let x = center.x, y = center.y;
        for (let i = 0; i < this.length; i += 5) {
            x += Math.cos(this.angle) * 5 + (Math.random() - 0.5) * 5;
            y += Math.sin(this.angle) * 5 + (Math.random() - 0.5) * 5;
            this.segments.push({ x, y });
            if (Math.random() < 0.05 && this.forks.length < maxForks) {
                this.forks.push(new Fork(x, y, this.angle + (Math.random() - 0.5)));
            }
        }
    }
    update() {
        const dx = mouse.x - center.x;
        const dy = mouse.y - center.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        // Only attract arcs if mouse is close
        const targetX = dist < influenceRadius ? mouse.x : center.x;
        const targetY = dist < influenceRadius ? mouse.y : center.y;

        for (let s of this.segments) {
            s.x += (targetX - s.x) * 0.01 + (Math.random() - 0.5) * 1.5;
            s.y += (targetY - s.y) * 0.01 + (Math.random() - 0.5) * 1.5;
        }

        for (let f of this.forks) f.update();
        if (Math.random() < 0.01) this.reset();
    }
    draw(ctx) {
        ctx.lineWidth = 2;
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        for (let s of this.segments) ctx.lineTo(s.x, s.y);
        ctx.stroke();
        for (let f of this.forks) f.draw(ctx);
        ctx.shadowBlur = 0;
    }
}

// Fork class for branch arcs
class Fork {
    constructor(x, y, angle) {
        this.segments = [];
        this.color = `hsla(${200 + Math.random() * 60},100%,85%,1)`;
        let len = Math.random() * 20 + 10;
        for (let i = 0; i < len; i += 5) {
            x += Math.cos(angle) * 5 + (Math.random() - 0.5) * 2;
            y += Math.sin(angle) * 5 + (Math.random() - 0.5) * 2;
            this.segments.push({ x, y });
        }
    }
    update() {
        for (let s of this.segments) {
            s.x += (Math.random() - 0.5) * 1;
            s.y += (Math.random() - 0.5) * 1;
        }
    }
    draw(ctx) {
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        for (let s of this.segments) ctx.lineTo(s.x, s.y);
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}

// Create arcs
const arcs = [];
for (let i = 0; i < maxArcs; i++) arcs.push(new Arc());

// Draw central glowing orb
function drawOrb(ctx, time) {
    const glow = 40 + Math.sin(time * 0.1) * 15;
    const gradient = ctx.createRadialGradient(center.x, center.y, 0, center.x, center.y, glow);
    gradient.addColorStop(0, 'rgba(50,200,255,1)');
    gradient.addColorStop(0.5, 'rgba(0,150,255,0.6)');
    gradient.addColorStop(1, 'rgba(0,0,30,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(center.x, center.y, glow, 0, Math.PI * 2);
    ctx.fill();
}

// Animation loop
let t = 0;
function animate() {
    t++;
    ctx.fillStyle = 'rgba(0,0,0,0.15)';
    ctx.fillRect(0, 0, w, h);

    drawOrb(ctx, t);

    for (let a of arcs) {
        a.update();
        a.draw(ctx);
    }

    requestAnimationFrame(animate);
}

animate();
