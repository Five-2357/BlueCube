if (window.top !== window.self && !document.referrer.startsWith("https://bluecube.pages.dev")) {
  window.top.location = window.location;
}
