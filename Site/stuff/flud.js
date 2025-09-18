const canvas = document.getElementById('fluid');
const ctx = canvas.getContext('2d');

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resize();
window.addEventListener('resize', resize);

// Example: draw trailing circles on mouse move
let mouse = { x: 0, y: 0 };
document.addEventListener('mousemove', e => {
  mouse.x = e.clientX;
  mouse.y = e.clientY;
});

function animate() {
  ctx.fillStyle = 'rgba(13,17,23,0.2)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.beginPath();
  ctx.arc(mouse.x, mouse.y, 20, 0, Math.PI * 2);
  ctx.fillStyle = '#58a6ff';
  ctx.fill();

  requestAnimationFrame(animate);
}
animate();
