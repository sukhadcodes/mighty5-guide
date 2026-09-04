// Registers the service worker so the whole guide keeps working offline.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").then(reg => {
      const pill = document.getElementById("offlinePill");
      const setReady = () => {
        if (pill) { pill.textContent = "Saved for offline"; pill.classList.add("is-ready"); }
      };
      if (navigator.serviceWorker.controller) setReady();
      reg.addEventListener("updatefound", () => {
        const nw = reg.installing;
        if (nw) nw.addEventListener("statechange", () => {
          if (nw.state === "activated") setReady();
        });
      });
      navigator.serviceWorker.addEventListener("controllerchange", setReady);
    }).catch(() => {
      const pill = document.getElementById("offlinePill");
      if (pill) pill.textContent = "Offline mode unavailable";
    });
  });
} else {
  const pill = document.getElementById("offlinePill");
  if (pill) pill.textContent = "";
}
