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
const NUM_ARCS = 40;
const MAX_SEGMENTS = 25;
const ARC_LENGTH = 80;
const ARC_FORK_CHANCE = 0.1;
const MOUSE_RADIUS = 200;

// Arc class
class Arc {
    constructor() { this.reset(); }
    reset() {
        this.segments = [];
        this.color = `hsla(${200+Math.random()*50},100%,75%,1)`; // blue
        this.angle = Math.random()*Math.PI*2;
        this.length = Math.floor(Math.random() * MAX_SEGMENTS + 10);
        this.forks = [];
        this.generate();
    }
    generate() {
        let x = center.x;
        let y = center.y;
        for (let i=0;i<this.length;i++){
            const dx = Math.cos(this.angle)*4 + (Math.random()-0.5)*4;
            const dy = Math.sin(this.angle)*4 + (Math.random()-0.5)*4;
            x += dx;
            y += dy;
            this.segments.push({x,y});
            // maybe fork
            if(Math.random() < ARC_FORK_CHANCE){
                this.forks.push(new Fork(x,y,this.angle + (Math.random()-0.5)));
            }
        }
    }
    update() {
        // flicker and random movement
        for(let s of this.segments){
            s.x += (Math.random()-0.5)*1.5;
            s.y += (Math.random()-0.5)*1.5;
            // attract slightly to mouse if in radius
            const dx = mouse.x - s.x;
            const dy = mouse.y - s.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if(dist < MOUSE_RADIUS){
                s.x += dx*0.01;
                s.y += dy*0.01;
            }
        }
        for(let f of this.forks) f.update();
        if(Math.random() < 0.005) this.reset();
    }
    draw(ctx){
        ctx.lineWidth = 2;
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.strokeStyle = this.color;
        ctx.beginPath();
        ctx.moveTo(center.x, center.y);
        for(let s of this.segments) ctx.lineTo(s.x,s.y);
        ctx.stroke();
        for(let f of this.forks) f.draw(ctx);
        ctx.shadowBlur = 0;
    }
}

// Forks for arcs
class Fork {
    constructor(x,y,angle){
        this.segments = [];
        this.color = `hsla(${200+Math.random()*50},100%,85%,1)`;
        const len = Math.floor(Math.random()*10 + 5);
        for(let i=0;i<len;i++){
            x += Math.cos(angle)*3 + (Math.random()-0.5)*2;
            y += Math.sin(angle)*3 + (Math.random()-0.5)*2;
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

// create arcs
const arcs = [];
for(let i=0;i<NUM_ARCS;i++) arcs.push(new Arc());

// Draw central glowing electrode
function drawElectrode(ctx,t){
    const glow = 30 + Math.sin(t*0.1)*10;
    const gradient = ctx.createRadialGradient(center.x,center.y,0,center.x,center.y,glow);
    gradient.addColorStop(0,'rgba(50,200,255,1)');
    gradient.addColorStop(0.5,'rgba(0,150,255,0.6)');
    gradient.addColorStop(1,'rgba(0,0,50,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(center.x,center.y,glow,0,Math.PI*2);
    ctx.fill();
}

// Animation loop
let t = 0;
function animate(){
    t++;
    ctx.fillStyle = 'rgba(0,0,0,0.1)';
    ctx.fillRect(0,0,w,h);

    drawElectrode(ctx,t);

    for(let a of arcs){
        a.update();
        a.draw(ctx);
    }

    requestAnimationFrame(animate);
}

animate();
