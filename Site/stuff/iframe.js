// Check if the page is inside an iframe
if (window.top !== window.self && !document.referrer.startsWith("https://bluecube.pages.dev")) {
    // Clear the page and show the NOT-ALLOWED message
    document.body.innerHTML = '';
    document.body.style.margin = '0';
    document.body.style.height = '100vh';
    document.body.style.display = 'flex';
    document.body.style.justifyContent = 'center';
    document.body.style.alignItems = 'center';
    document.body.style.background = '#000';
    document.body.style.color = '#fff';
    document.body.style.fontFamily = 'monospace';
    document.body.style.fontSize = '24px';
    document.body.style.textAlign = 'center';

    const message = document.createElement('div');
    message.innerHTML = 'NOT-ALLOWED<br>Error: a598e4f2afad9df861fdc476f67ef252';
    document.body.appendChild(message);

    // Redirect the top frame to your site
    window.top.location.href = "https://bluecube.pages.dev";
}
