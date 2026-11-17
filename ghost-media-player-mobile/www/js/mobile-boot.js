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
})();
