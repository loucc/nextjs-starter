// No-flash theme bootstrap: applies the stored/system theme class before
// hydration. Referenced via next/script (beforeInteractive) in the layout.
(function () {
  try {
    var t = localStorage.getItem("theme") || "system";
    var d =
      t === "system"
        ? window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light"
        : t;
    document.documentElement.classList.add(d);
    document.documentElement.style.colorScheme = d;
  } catch (e) {}
})();
