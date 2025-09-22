const canvas = document.getElementById('fluid');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let width = canvas.width;
let height = canvas.height;

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

// grid
const gridSize = 150;
const cellSize = Math.min(width, height) / gridSize;

const vx = new Float32Array(gridSize * gridSize);
const vy = new Float32Array(gridSize * gridSize);
const dens = new Float32Array(gridSize * gridSize);

function idx(x, y) {
  return x + y * gridSize;
}

// mouse injects "ink"
document.addEventListener('mousemove', e => {
  const gx = Math.floor(e.clientX / cellSize);
  const gy = Math.floor(e.clientY / cellSize);
  if (gx > 1 && gx < gridSize - 1 && gy > 1 && gy < gridSize - 1) {
    const i = idx(gx, gy);
    dens[i] += 50;
    vx[i] += e.movementX * 0.2;
    vy[i] += e.movementY * 0.2;
  }
});

// bilinear interpolation helper
function sample(arr, x, y) {
  const x0 = Math.floor(x);
  const x1 = Math.min(x0 + 1, gridSize - 1);
  const y0 = Math.floor(y);
  const y1 = Math.min(y0 + 1, gridSize - 1);
  const tx = x - x0;
  const ty = y - y0;

  return (
    arr[idx(x0, y0)] * (1 - tx) * (1 - ty) +
    arr[idx(x1, y0)] * tx * (1 - ty) +
    arr[idx(x0, y1)] * (1 - tx) * ty +
    arr[idx(x1, y1)] * tx * ty
  );
}

function step() {
  const newDens = new Float32Array(dens.length);
  const newVX = new Float32Array(vx.length);
  const newVY = new Float32Array(vy.length);

  for (let y = 1; y < gridSize - 1; y++) {
    for (let x = 1; x < gridSize - 1; x++) {
      const i = idx(x, y);

      // backtrace
      let px = x - vx[i] * 0.05;
      let py = y - vy[i] * 0.05;

      px = Math.max(1, Math.min(gridSize - 2, px));
      py = Math.max(1, Math.min(gridSize - 2, py));

      newDens[i] = sample(dens, px, py) * 0.99;
      newVX[i] = vx[i] * 0.98;
      newVY[i] = vy[i] * 0.98;
    }
  }

  dens.set(newDens);
  vx.set(newVX);
  vy.set(newVY);
}

function render() {
  const image = ctx.createImageData(width, height);
  const data = image.data;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const gx = x / cellSize;
      const gy = y / cellSize;

      const d = sample(dens, gx, gy);
      const c = Math.min(255, d * 4);

      const i = (x + y * width) * 4;
      data[i] = 90;
      data[i + 1] = 140;
      data[i + 2] = 255;
      data[i + 3] = c;
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
