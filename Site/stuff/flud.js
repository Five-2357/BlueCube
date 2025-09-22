<canvas id="fluid"></canvas>
<script>
const canvas = document.getElementById('fluid');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let width = canvas.width;
let height = canvas.height;

// Resize handling
window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

// Fluid grid resolution
const gridSize = 100;
const cellSize = Math.min(width, height) / gridSize;

const velocityX = Array(gridSize * gridSize).fill(0);
const velocityY = Array(gridSize * gridSize).fill(0);
const density   = Array(gridSize * gridSize).fill(0);

function idx(x, y) {
  return x + y * gridSize;
}

// Add "ink" when moving mouse
let mouse = { x: 0, y: 0, down: false };
document.addEventListener('mousemove', e => {
  const gx = Math.floor(e.clientX / cellSize);
  const gy = Math.floor(e.clientY / cellSize);
  if (gx > 1 && gx < gridSize-1 && gy > 1 && gy < gridSize-1) {
    const i = idx(gx, gy);
    density[i] += 50;
    velocityX[i] += (e.movementX || 0) * 0.2;
    velocityY[i] += (e.movementY || 0) * 0.2;
  }
});

// Fluid update (super simplified stable fluids)
function step() {
  const newDensity = density.slice();
  const newVX = velocityX.slice();
  const newVY = velocityY.slice();

  for (let y = 1; y < gridSize-1; y++) {
    for (let x = 1; x < gridSize-1; x++) {
      const i = idx(x,y);

      // diffuse density
      newDensity[i] *= 0.99;

      // advect density
      let px = x - velocityX[i] * 0.1;
      let py = y - velocityY[i] * 0.1;
      px = Math.max(1, Math.min(gridSize-2, px));
      py = Math.max(1, Math.min(gridSize-2, py));
      newDensity[i] = density[idx(Math.floor(px), Math.floor(py))];

      // decay velocity
      newVX[i] *= 0.99;
      newVY[i] *= 0.99;
    }
  }

  for (let i = 0; i < density.length; i++) {
    density[i] = newDensity[i];
    velocityX[i] = newVX[i];
    velocityY[i] = newVY[i];
  }
}

function render() {
  const image = ctx.createImageData(width, height);
  const data = image.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const gx = Math.floor(x / cellSize);
      const gy = Math.floor(y / cellSize);
      const d = density[idx(gx, gy)] || 0;
      const c = Math.min(255, d * 5);
      const index = (x + y * width) * 4;
      data[index] = 90;    // blue-ish tint
      data[index+1] = 140; // purple-ish
      data[index+2] = 255;
      data[index+3] = c;   // alpha
    }
  }

  ctx.putImageData(image, 0, 0);
}

function loop() {
  step();
  render();
  requestAnimationFrame(loop);
}
loop();
