/* Ghost Media Player MOBILE edition — runs first, before any other script.
 * Sets the phone defaults once per release (v2 = the redesigned phone layout). The user can still change theme,
 * 3D look etc. afterwards; their choice is not overwritten again until the next "init" version. */
(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("is-mobile");
  if (window.Capacitor && (window.Capacitor.isNativePlatform ? window.Capacitor.isNativePlatform() : true)) doc.classList.add("is-native");
  try {
    if (!localStorage.getItem("ghost.mobile.init.v2")) {
      localStorage.setItem("ghost.look3d.v1", "0");      // 3D look off (costs GPU on weak phones)
      localStorage.setItem("ghost.nav.mode", "simple");  // the bottom navigation replaces the desktop orb menu
      localStorage.setItem("ghost.ui.v1", "normal");     // classic layout, tuned for phones
      localStorage.setItem("ghost.theme.v1", JSON.stringify({ preset: "orange", customAccent: null, customBg: null, ctl: "auto" }));
      localStorage.setItem("ghost.mobile.init.v2", "1");
    }
  } catch (e) { /* storage unavailable: defaults still apply */ }

  /* Performance class, decided BEFORE the first paint so weak phones never render the heavy effects at all.
   * ghost.perf.v1 = "auto" (default) | "lite" | "full".  Auto = lite on phones with little RAM / few CPU cores. */
  try {
    var mode = localStorage.getItem("ghost.perf.v1") || "auto";
    var mem = navigator.deviceMemory || 4, cores = navigator.hardwareConcurrency || 4;
    var weak = mem <= 4 || cores <= 6;
    if (mode === "lite" || (mode === "auto" && weak)) doc.classList.add("lite");
  } catch (e) { doc.classList.add("lite"); }
})();
