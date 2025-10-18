// Inject CSS
const style = document.createElement('style');
style.textContent = `
  body {
    margin: 0;
    height: 100vh;
    background: #f7f9fc;
    font-family: 'Segoe UI', sans-serif;
  }

  #contextMenu {
    position: absolute;
    background-color: #ffffff;
    border: 1px solid #ddd;
    border-radius: 10px;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
    padding: 0;
    margin: 0;
    list-style: none;
    display: none;
    z-index: 1000;
    min-width: 160px;
    animation: fadeIn 0.15s ease-in-out;
  }

  #contextMenu li {
    padding: 12px 18px;
    cursor: pointer;
    transition: background 0.2s ease;
  }

  #contextMenu li:hover {
    background-color: #f0f0f0;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.95); }
    to { opacity: 1; transform: scale(1); }
  }
`;
document.head.appendChild(style);

// Create context menu
const menu = document.createElement('ul');
menu.id = 'contextMenu';
for (let i = 1; i <= 5; i++) {
  const item = document.createElement('li');
  item.textContent = (i % 2 === 0 ? '🔸' : '🔹') + ` Option ${i}`;
  item.onclick = () => {
    alert(`✅ You selected Option ${i}`);
    menu.style.display = 'none';
  };
  menu.appendChild(item);
}
document.body.appendChild(menu);

// Handle right-click
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();

  if (window.innerWidth < 600 && 'ontouchstart' in window) return;

  const menuWidth = menu.offsetWidth;
  const menuHeight = menu.offsetHeight;
  const x = (e.pageX + menuWidth > window.innerWidth) ? window.innerWidth - menuWidth - 10 : e.pageX;
  const y = (e.pageY + menuHeight > window.innerHeight) ? window.innerHeight - menuHeight - 10 : e.pageY;

  menu.style.left = `${x}px`;
  menu.style.top = `${y}px`;
  menu.style.display = 'block';
});

// Hide menu
['click', 'scroll', 'resize'].forEach(evt =>
  window.addEventListener(evt, () => {
    menu.style.display = 'none';
  })
);
