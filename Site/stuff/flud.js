const canvas = document.getElementById('fluid');
const gl = canvas.getContext('webgl2', { alpha: false });

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
gl.viewport(0, 0, canvas.width, canvas.height);

// === keep all PavelDoGreat setup code here ===
// (framebuffers, shaders, step(), render(), splat(), generateColor() …)

// Mouse → inject dye + velocity
let lastX = 0, lastY = 0, isDown = false;

canvas.addEventListener('mousedown', e => {
  isDown = true;
  lastX = e.clientX / canvas.width;
  lastY = 1.0 - e.clientY / canvas.height; // flip Y for WebGL
});

canvas.addEventListener('mouseup', () => {
  isDown = false;
});

canvas.addEventListener('mousemove', e => {
  if (!isDown) return;

  const x = e.clientX / canvas.width;
  const y = 1.0 - e.clientY / canvas.height;

  const dx = (x - lastX) * 1000;
  const dy = (y - lastY) * 1000;

  splat(x, y, dx, dy, generateColor());

  lastX = x;
  lastY = y;
});

// Main loop
function loop() {
  step();
  render();
  requestAnimationFrame(loop);
}
loop();
