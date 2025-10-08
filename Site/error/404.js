const TILE_COUNT = 20;
const BASE_SPEED = 120;
const MIN_SPEED = 40;
const SPEED_STEP_PER_5 = 6;
const COOKIE_NAME = "snake_highscore_pages";

const canvas = document.getElementById('gameCanvas');
const scoreEl = document.getElementById('score');
const highscoreEl = document.getElementById('highscore');
const homeBtn = document.getElementById('homeBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const overlay = document.getElementById('overlay');
const overlayPanel = document.getElementById('overlayPanel');
const btnUp = document.getElementById('btnUp');
const btnLeft = document.getElementById('btnLeft');
const btnDown = document.getElementById('btnDown');
const btnRight = document.getElementById('btnRight');

const ctx = canvas.getContext('2d');
const CELL = 20;
canvas.width = TILE_COUNT * CELL;
canvas.height = TILE_COUNT * CELL;

let snake = [];
let direction = "RIGHT";
let nextDirection = direction;
let food = {x:0,y:0};
let score = 0;
let highScore = 0;
let gameInterval = null;
let isPaused = false;
let gameOver = false;

let audioCtx = null;
function beep(freq, time=0.06, vol=0.06){
  try{
    if(!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.value = freq;
    g.gain.value = vol;
    o.connect(g); g.connect(audioCtx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + time);
    o.stop(audioCtx.currentTime + time + 0.02);
  }catch(e){}
}

function setCookie(name,value,days){
  const d = new Date();
  d.setTime(d.getTime() + (days*24*60*60*1000));
  document.cookie = name + "=" + encodeURIComponent(String(value)) + ";expires=" + d.toUTCString() + ";path=/";
}
function getCookie(name){
  const match = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([.*+?^=!:${}()|[\]\/\\])/g,'\\$1') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}
function loadHighScore(){
  const c = getCookie(COOKIE_NAME);
  if(c !== null){
    const v = parseInt(c,10);
    if(!isNaN(v)) return v;
  }
  const l = localStorage.getItem(COOKIE_NAME);
  if(l !== null){
    const v = parseInt(l,10);
    if(!isNaN(v)) return v;
  }
  return 0;
}
function saveHighScore(v){
  try{
    setCookie(COOKIE_NAME, v, 365);
    localStorage.setItem(COOKIE_NAME, String(v));
  }catch(e){}
}

function randSpot(){
  return {
    x: Math.floor(Math.random() * TILE_COUNT) * CELL,
    y: Math.floor(Math.random() * TILE_COUNT) * CELL
  };
}
function samePos(a,b){ return a.x===b.x && a.y===b.y; }
function collisionWithBody(head, body){
  for(let i=0;i<body.length;i++){
    if(samePos(head, body[i])) return true;
  }
  return false;
}

function resetGame(){
  snake = [
    { x: 9*CELL, y: 10*CELL },  // head
    { x: 8*CELL, y: 10*CELL }   // body
  ];
  direction = "RIGHT";
  nextDirection = direction;
  score = 1; // start with 1 point
  isPaused = false;
  gameOver = false;
  food = randSpot();
  while(collisionWithBody(food, snake)) food = randSpot();
  updateScoreUI();
  hideOverlay();
  resetInterval();
}

function updateScoreUI(){
  scoreEl.textContent = score;
  highscoreEl.textContent = highScore;
}

function currentSpeed(){
  const sp = Math.max(MIN_SPEED, BASE_SPEED - Math.floor(score / 5) * SPEED_STEP_PER_5);
  return sp;
}
function resetInterval(){
  if(gameInterval) clearInterval(gameInterval);
  if(isPaused || gameOver) return;
  gameInterval = setInterval(gameStep, currentSpeed());
}
function togglePause(){
  if(gameOver) return;
  isPaused = !isPaused;
  if(isPaused){
    if(gameInterval) { clearInterval(gameInterval); gameInterval = null; }
    pauseBtn.textContent = "Resume (P)";
    showOverlay("Paused", "Tap Resume or press P to continue.");
  } else {
    pauseBtn.textContent = "Pause (P)";
    hideOverlay();
    resetInterval();
  }
}
function endGame(){
  gameOver = true;
  if(gameInterval) clearInterval(gameInterval);
  gameInterval = null;
  beep(120,0.12,0.08);
  if(score > highScore){
    highScore = score;
    saveHighScore(highScore);
  }
  updateScoreUI();
  showOverlay("Game Over", `Score: ${score} — High: ${highScore}`, true);
}

function gameStep(){
  if(canChangeDirection(direction, nextDirection)) direction = nextDirection;
  let head = { x: snake[0].x, y: snake[0].y };
  if(direction === "LEFT") head.x -= CELL;
  if(direction === "RIGHT") head.x += CELL;
  if(direction === "UP") head.y -= CELL;
  if(direction === "DOWN") head.y += CELL;

  if(head.x < 0 || head.y < 0 || head.x >= canvas.width || head.y >= canvas.height){
    endGame();
    return;
  }
  if(collisionWithBody(head, snake)){
    endGame();
    return;
  }
  if(head.x === food.x && head.y === food.y){
    score++;
    beep(800,0.06,0.06);
    do { food = randSpot(); } while(collisionWithBody(food, snake) || (food.x === head.x && food.y === head.y));
    snake.unshift(head);
    updateScoreUI();
    resetInterval();
  } else {
    snake.pop();
    snake.unshift(head);
  }
  render();
}

function canChangeDirection(cur, next){
  if(!next) return false;
  if(cur === "LEFT" && next === "RIGHT") return false;
  if(cur === "RIGHT" && next === "LEFT") return false;
  if(cur === "UP" && next === "DOWN") return false;
  if(cur === "DOWN" && next === "UP") return false;
  return true;
}

function render(){
  ctx.fillStyle = "#001f3f";
  ctx.fillRect(0,0,canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(255,255,255,0.03)";
  ctx.lineWidth = 1;
  for(let i=0;i<=TILE_COUNT;i++){
    ctx.beginPath();
    ctx.moveTo(i * CELL + 0.5, 0);
    ctx.lineTo(i * CELL + 0.5, canvas.height);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, i * CELL + 0.5);
    ctx.lineTo(canvas.width, i * CELL + 0.5);
    ctx.stroke();
  }

  ctx.fillStyle = "#FF4136";
  roundRect(ctx, food.x+2, food.y+2, CELL-4, CELL-4, 4, true, false);

  for(let i=0;i<snake.length;i++){
    if(i===0){
      ctx.fillStyle = "#9ef6ff";
      ctx.shadowColor = "rgba(0,195,255,0.35)";
      ctx.shadowBlur = 12;
      roundRect(ctx, snake[i].x+2, snake[i].y+2, CELL-4, CELL-4, 5, true, false);
      ctx.shadowBlur = 0;
    } else {
      ctx.fillStyle = i%2===0 ? "#0074D9" : "#005fa3";
      roundRect(ctx, snake[i].x+2, snake[i].y+2, CELL-4, CELL-4, 4, true, false);
    }
    ctx.strokeStyle = "rgba(0,0,0,0.45)";
    ctx.lineWidth = 1;
  }
}

function roundRect(ctx,x,y,w,h,r,fill,stroke){
  if (typeof r === 'undefined') r = 2;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  if(fill) ctx.fill();
  if(stroke) ctx.stroke();
}

function showOverlay(title, text, showRestart=false){
  overlayPanel.innerHTML = `<div style="font-size:18px;font-weight:700;margin-bottom:6px">${title}</div>
                            <div style="color:#dff5ff;margin-bottom:12px">${text || ''}</div>
                            ${ showRestart ? '<div style="display:flex;gap:8px;justify-content:center"><button id="overlayRestart" class="btn">Restart</button></div>' : '' }`;
  overlay.classList.remove('hidden');
  overlay.style.pointerEvents = 'auto';
  if(showRestart){
    document.getElementById('overlayRestart').addEventListener('click',()=>{
      resetGame();
    });
  }
}
function hideOverlay(){
  overlay.classList.add('hidden');
  overlay.style.pointerEvents = 'none';
}

window.addEventListener('keydown', (ev)=>{
  const key = (ev.key || '').toLowerCase();
  if(key === 'p'){ ev.preventDefault(); togglePause(); return; }
  if(key === 'arrowleft' || key === 'a') nextDirection = "LEFT";
  else if(key === 'arrowup' || key === 'w') nextDirection = "UP";
  else if(key === 'arrowright' || key === 'd') nextDirection = "RIGHT";
  else if(key === 'arrowdown' || key === 's') nextDirection = "DOWN";
});

homeBtn.addEventListener('click', ()=> window.location.href = '/');
pauseBtn.addEventListener('click', togglePause);
restartBtn.addEventListener('click', ()=>{ resetGame(); });

btnUp.addEventListener('touchstart', ()=> setDirFromBtn('UP'), {passive:true});
btnLeft.addEventListener('touchstart', ()=> setDirFromBtn('LEFT'), {passive:true});
btnDown.addEventListener('touchstart', ()=> setDirFromBtn('DOWN'), {passive:true});
btnRight.addEventListener('touchstart', ()=> setDirFromBtn('RIGHT'), {passive:true});

[btnUp,btnLeft,btnDown,btnRight].forEach(b=>{
  b.addEventListener('mousedown', (e)=>{ e.preventDefault(); setDirFromBtn(b.id.replace('btn','').toUpperCase()); });
});
function setDirFromBtn(d){ nextDirection = d; }

let touchStartX=0, touchStartY=0;
const TOUCH_THRESHOLD = 20;
canvas.addEventListener('touchstart', (e)=> {
  const t = e.touches[0];
  touchStartX = t.clientX;
  touchStartY = t.clientY;
},{passive:true});
canvas.addEventListener('touchend', (e)=> {
  const t = e.changedTouches[0];
  const dx = t.clientX - touchStartX;
  const dy = t.clientY - touchStartY;
  if(Math.abs(dx) < TOUCH_THRESHOLD && Math.abs(dy) < TOUCH_THRESHOLD) return;
  if(Math.abs(dx) > Math.abs(dy)){
    if(dx > 0) nextDirection = "RIGHT"; else nextDirection = "LEFT";
  } else {
    if(dy > 0) nextDirection = "DOWN"; else nextDirection = "UP";
  }
},{passive:true});

function init(){
  highScore = loadHighScore();
  highscoreEl.textContent = highScore;
  resetGame();
  render();
}
init();
