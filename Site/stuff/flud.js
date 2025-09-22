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
document.addEventListener('mousemove', e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

const NUM_FILAMENTS = 35; // Number of arcs
const MAX_SEGMENTS = 25;  // Segments per filament
const SEGMENT_LENGTH = 6; // Length of each segment
const MOUSE_INFLUENCE_RADIUS = 200;

// Filament class
class Filament {
    constructor() { this.reset(); }
    reset() {
        this.segments = [{ x: center.x, y: center.y }];
        this.angle = Math.random() * Math.PI * 2;
        this.color = `hsla(${230 + Math.random()*60},100%,75%,1)`; // electric blue
        this.length = Math.floor(Math.random() * MAX_SEGMENTS + 10);
        this.forks = [];
        this.generate();
    }
    generate() {
        let x = center.x, y = center.y;
        for (let i=0; i<this.length; i++) {
            let dx = Math.cos(this.angle) * SEGMENT_LENGTH + (Math.random()-0.5) * 3;
            let dy = Math.sin(this.angle) * SEGMENT_LENGTH + (Math.random()-0.5) * 3;
            x += dx; y += dy;
            this.segments.push({ x, y });
            // random fork
            if(Math.random() < 0.08 && this.forks.length < 2) {
                this.forks.push(new Fork(x, y, this.angle + (Math.random()-0.5)));
            }
        }
    }
    update() {
        const dx = mouse.x - center.x;
        const dy = mouse.y - center.y;
        const distToMouse = Math.sqrt(dx*dx + dy*dy);

        // update segments
        for(let s of this.segments) {
            s.x += (Math.random()-0.5)*1.5;
            s.y += (Math.random()-0.5)*1.5;
            // slight attraction if mouse nearby
            if(distToMouse < MOUSE_INFLUENCE_RADIUS && Math.random()<0.3) {
                s.x += dx*0.008;
                s.y += dy*0.008;
            }
        }

        for(let f of this.forks) f.update();
        if(Math.random() < 0.005) this.reset();
    }
    draw(ctx) {
        ctx.lineWidth = 2;
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        for(let s of this.segments) ctx.lineTo(s.x, s.y);
        ctx.stroke();
        for(let f of this.forks) f.draw(ctx);
        ctx.shadowBlur = 0;
    }
}

// Fork class
class Fork {
    constructor(x,y,angle){
        this.segments = [];
        this.color = `hsla(${230 + Math.random()*60},100%,85%,1)`;
        const len = Math.floor(Math.random()*10 + 5);
        for(let i=0;i<len;i++){
            x += Math.cos(angle)*3 + (Math.random()-0.5)*1.5;
            y += Math.sin(angle)*3 + (Math.random()-0.5)*1.5;
            this.segments.push({x,y});
        }
    }
    update(){
        for(let s of this.segments){
            s.x += (Math.random()-0.5)*1;
            s.y += (Math.random()-0.5)*1;
        }
    }
    draw(ctx){
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        for(let s of this.segments) ctx.lineTo(s.x,s.y);
        ctx.stroke();
        ctx.shadowBlur = 0;
    }
}

// Create filaments
const filaments = [];
for(let i=0;i<NUM_FILAMENTS;i++) filaments.push(new Filament());

// Central glowing electrode
function drawElectrode(ctx, t){
    const glow = 25 + Math.sin(t*0.1)*8;
    const gradient = ctx.createRadialGradient(center.x,center.y,0,center.x,center.y,glow);
    gradient.addColorStop(0,'rgba(50,200,255,1)');
    gradient.addColorStop(0.4,'rgba(0,150,255,0.6)');
    gradient.addColorStop(1,'rgba(0,0,20,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(center.x, center.y, glow,0,Math.PI*2);
    ctx.fill();
}

// Animation loop
let t=0;
function animate(){
    t++;
    ctx.fillStyle='rgba(0,0,0,0.12)';
    ctx.fillRect(0,0,w,h);

    drawElectrode(ctx, t);

    for(let f of filaments){
        f.update();
        f.draw(ctx);
    }

    requestAnimationFrame(animate);
}

animate();
