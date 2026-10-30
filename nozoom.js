(function () {
  const style = document.createElement("style");
  style.textContent = "html,body{touch-action:manipulation;overscroll-behavior:none}";
  document.documentElement.appendChild(style);
  let allow = false;
  let playLock = false;
  try { allow = localStorage.getItem("choppy-allow-zoom") === "1"; } catch (e) {}
  function blocked() { return !allow || playLock; }
  const blockTouch = function (e) {
    if (!blocked()) return;
    if (e.touches && e.touches.length > 1) e.preventDefault();
  };
  document.addEventListener("touchstart", blockTouch, { passive: false });
  document.addEventListener("touchmove", blockTouch, { passive: false });
  ["gesturestart", "gesturechange", "gestureend"].forEach(function (ev) {
    document.addEventListener(ev, function (e) { if (blocked()) e.preventDefault(); }, { passive: false });
  });
  document.addEventListener("wheel", function (e) {
    if (blocked() && e.ctrlKey) e.preventDefault();
  }, { passive: false });
  document.addEventListener("dblclick", function (e) { if (blocked()) e.preventDefault(); }, true);
  function applyViewport() {
    const meta = document.querySelector('meta[name="viewport"]');
    if (!meta) return;
    meta.setAttribute("content", blocked()
      ? "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
      : "width=device-width, initial-scale=1, viewport-fit=cover");
  }
  applyViewport();
  window.ChoppyZoom = {
    set: function (nextAllow, nextPlayLock) {
      allow = !!nextAllow;
      playLock = !!nextPlayLock;
      try { localStorage.setItem("choppy-allow-zoom", allow ? "1" : "0"); } catch (e) {}
      applyViewport();
    }
  };
})();
