(function() {
    const allowedHost = "bluecube.pages.dev";

    // Check if the page is inside an iframe
    if (window.top !== window.self && window.location.hostname !== allowedHost) {
        // Clear everything and show NOT-ALLOWED message
        document.documentElement.innerHTML = '';
        document.documentElement.style.height = '100%';
        document.documentElement.style.margin = '0';
        document.documentElement.style.display = 'flex';
        document.documentElement.style.justifyContent = 'center';
        document.documentElement.style.alignItems = 'center';
        document.documentElement.style.background = '#000';
        document.documentElement.style.color = '#fff';
        document.documentElement.style.fontFamily = 'monospace';
        document.documentElement.style.fontSize = '24px';
        document.documentElement.style.textAlign = 'center';

        const message = document.createElement('div');
        message.innerHTML = 'NOT-ALLOWED<br>Error: a598e4f2afad9df861fdc476f67ef252';
        document.body.appendChild(message);

        // Attempt redirect safely
        try {
            window.top.location.href = "https://" + allowedHost;
        } catch (e) {
            console.warn('Cannot redirect top frame due to cross-origin restrictions.');
        }
    }
})();
