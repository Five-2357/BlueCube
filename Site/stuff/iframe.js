if (!window.location.href.startsWith("https://bluecube.pages.dev")) {
    // Clear page and show message
    document.body.innerHTML = '';
    document.body.style.cssText = `
        margin:0;height:100vh;display:flex;
        justify-content:center;align-items:center;
        background:#000;color:#fff;font-family:monospace;
        font-size:24px;text-align:center;
    `;
    
    const message = document.createElement('div');
    message.innerHTML = 'NOT-ALLOWED<br>Error: a598e4f2afad9df861fdc476f67ef252';
    document.body.appendChild(message);

    // Redirect after 3 seconds
    setTimeout(() => {
        window.location.href = "https://bluecube.pages.dev/error";
    }, 3000);
}
