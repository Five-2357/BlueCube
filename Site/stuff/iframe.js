  if (window.top !== window.self && !document.referrer.startsWith("https://bluecube.pages.dev")) {
    document.body.textContent = "NOT ALLOWED";

    setTimeout(() => {
      window.top.location = window.location; // Redirect after 3 sec
    }, 3000);
  }
