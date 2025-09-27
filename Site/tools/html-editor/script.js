const files = {
  "index.html": "<!DOCTYPE html>\n<html>\n<head>\n  <title>My Page</title>\n  <link rel='stylesheet' href='styles.css'>\n</head>\n<body>\n  <h1>Hello World</h1>\n  <script src='script.js'></script>\n</body>\n</html>",
  "styles.css": "body { font-family: sans-serif; background: #fafafa; }",
  "script.js": "// Change This"
};

let currentFile = "index.html";
let editor = null;

function initEditor() {
  editor = CodeMirror.fromTextArea(document.getElementById("editor"), {
    mode: "htmlmixed",
    lineNumbers: true,
    tabSize: 2
  });
  editor.setValue(files[currentFile]);
  editor.on("change", () => {
    files[currentFile] = editor.getValue();
    updatePreview();
  });
}

function loadFileList() {
  const list = document.getElementById("file-list");
  list.innerHTML = "";
  Object.keys(files).forEach(file => {
    const li = document.createElement("li");
    li.textContent = file;
    if (file === currentFile) li.classList.add("active");
    li.onclick = () => switchFile(file);
    list.appendChild(li);
  });
}

function switchFile(file) {
  currentFile = file;
  editor.setValue(files[file]);
  loadFileList();
}

function updatePreview() {
  const iframe = document.getElementById("preview");
  const doc = `
    ${files["index.html"]}
    <style>${files["styles.css"]}</style>
    <script>
      window.onerror = function(msg, src, line, col, err) {
        parent.postMessage({type:'error', msg}, '*');
      };

      const origLog = console.log;
      const origErr = console.error;
      console.log = (...args) => {
        parent.postMessage({type:'console', level:'log', msg: args.join(' ')}, '*');
        origLog(...args);
      };
      console.error = (...args) => {
        parent.postMessage({type:'console', level:'error', msg: args.join(' ')}, '*');
        origErr(...args);
      };

      window.addEventListener("message", (e) => {
        if(e.data.type === "runCommand") {
          try {
            let result = eval(e.data.code);
            parent.postMessage({type:'console', level:'result', msg: String(result)}, '*');
          } catch(err) {
            parent.postMessage({type:'console', level:'error', msg: err.message}, '*');
          }
        }
      });
    </script>
    <script>${files["script.js"]}<\/script>
  `;
  iframe.srcdoc = doc;
}

function setupErrorsAndConsole() {
  window.addEventListener("message", (e) => {
    if (e.data.type === "error") {
      document.getElementById("errors").textContent = e.data.msg;
    }
    if (e.data.type === "console") {
      const out = document.getElementById("console-output");
      const div = document.createElement("div");
      div.textContent = `[${e.data.level}] ${e.data.msg}`;
      if (e.data.level === "error") div.style.color = "red";
      if (e.data.level === "result") div.style.color = "cyan";
      out.appendChild(div);
      out.scrollTop = out.scrollHeight;
    }
  });

  document.getElementById("console-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      const code = e.target.value;
      e.target.value = "";
      document.getElementById("preview").contentWindow.postMessage({type:"runCommand", code}, "*");
    }
  });
}

function setupButtons() {
  document.getElementById("new-file").onclick = () => {
    const name = prompt("Enter new file name:");
    if (name && !files[name]) {
      files[name] = "";
      switchFile(name);
      loadFileList();
    }
  };

  document.getElementById("delete-file").onclick = () => {
    if (currentFile === "index.html") {
      alert("You cannot delete index.html");
      return;
    }
    if (confirm(`Delete ${currentFile}?`)) {
      delete files[currentFile];
      currentFile = "index.html";
      switchFile("index.html");
      loadFileList();
    }
  };

  document.getElementById("export").onclick = () => {
    const zip = new JSZip();
    for (const [name, content] of Object.entries(files)) {
      zip.file(name, content);
    }
    zip.generateAsync({type:"blob"}).then(blob => {
      saveAs(blob, "project.zip");
    });
  };
}

window.onload = () => {
  initEditor();
  loadFileList();
  updatePreview();
  setupErrorsAndConsole();
  setupButtons();
};
