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

// Force-refresh button: wipes the cached copy and reloads straight from the
// network, for when you're back on wifi and want the latest version of the
// guide instead of whatever got saved for offline use.
const refreshBtn = document.getElementById("refreshBtn");
if (refreshBtn) {
  refreshBtn.addEventListener("click", async () => {
    if (refreshBtn.classList.contains("is-spinning")) return;
    refreshBtn.classList.add("is-spinning");
    const pill = document.getElementById("offlinePill");
    if (pill) { pill.textContent = "Refreshing…"; pill.classList.remove("is-ready"); }
    try {
      if ("caches" in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      if ("serviceWorker" in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }
    } catch (e) {
      // Even if clearing fails, still attempt a hard reload below.
    }
    const url = new URL(window.location.href);
    url.searchParams.set("_refresh", Date.now().toString());
    window.location.replace(url.toString());
  });
}
