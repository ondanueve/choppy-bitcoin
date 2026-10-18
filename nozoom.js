(function () {
  const style = document.createElement("style");
  style.textContent = "html,body{touch-action:manipulation;overscroll-behavior:none}";
  document.documentElement.appendChild(style);
  const block = function (e) {
    if (e.touches && e.touches.length > 1) e.preventDefault();
  };
  document.addEventListener("touchstart", block, { passive: false });
  document.addEventListener("touchmove", block, { passive: false });
  ["gesturestart", "gesturechange", "gestureend"].forEach(function (ev) {
    document.addEventListener(ev, function (e) { e.preventDefault(); }, { passive: false });
  });
  document.addEventListener("wheel", function (e) {
    if (e.ctrlKey) e.preventDefault();
  }, { passive: false });
  document.addEventListener("dblclick", function (e) { e.preventDefault(); }, true);
})();
