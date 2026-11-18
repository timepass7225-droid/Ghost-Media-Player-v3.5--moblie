/* Ghost Media Player — theme system
 * 18 complete themes (colors + stage backdrop + font + shape) plus optional custom
 * accent / background colors, persisted to localStorage. No external requests.
 */
(function (global) {
  "use strict";

  var STORAGE_KEY = "ghost.theme.v1";
  var SANS = "-apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif";
  var ROUND = "\"Trebuchet MS\", \"Segoe UI\", Roboto, Arial, sans-serif";
  var SERIF = "Georgia, \"Iowan Old Style\", \"Times New Roman\", serif";
  var MONO = "\"SF Mono\", \"Cascadia Mono\", Consolas, \"Courier New\", monospace";

  // stage = backdrop of the main playback area (behind title / ghost icon).
  var PRESETS = {
    orange: {
      name: "Classic Orange", tag: "Charcoal with a warm orange accent",
      bg: "#121212", bgElevated: "#1c1c1e", panel: "#161618",
      text: "#f2f2f2", accent: "#ff8800",
      stage: "radial-gradient(ellipse at 50% 25%, #26211a 0%, #0c0c0d 72%)", radius: 12, font: SANS
    },
    ghost: {
      name: "Ghost", tag: "Classic black & white",
      bg: "#0a0a0c", bgElevated: "#111114", panel: "#0f0f12",
      text: "#f3f3f5", accent: "#ffffff",
      stage: "radial-gradient(ellipse at 50% 30%, #1c1c22 0%, #050506 70%)",
      radius: 14, font: SANS
    },
    obsidian: {
      name: "Obsidian", tag: "Pure black, sharp corners",
      bg: "#000000", bgElevated: "#0a0a0a", panel: "#080808",
      text: "#ececec", accent: "#e6e6e6",
      stage: "#000000", radius: 4, font: SANS
    },
    midnight: {
      name: "Midnight", tag: "Deep navy, soft blue",
      bg: "#070b17", bgElevated: "#0d1426", panel: "#0a1020",
      text: "#e8eeff", accent: "#6ea8ff",
      stage: "radial-gradient(ellipse at 50% 20%, #15234a 0%, #050814 72%)", radius: 14, font: SANS
    },
    neon: {
      name: "Neon City", tag: "Cyberpunk pink & cyan",
      bg: "#0b0714", bgElevated: "#130c22", panel: "#100a1d",
      text: "#f4eeff", accent: "#ff3cac",
      stage: "radial-gradient(ellipse at 20% 15%, rgba(255,60,172,.35), transparent 55%), radial-gradient(ellipse at 85% 85%, rgba(0,229,255,.30), transparent 55%), #07040f",
      radius: 10, font: ROUND
    },
    cyber: {
      name: "Cyber", tag: "Electric green on black",
      bg: "#030806", bgElevated: "#08130f", panel: "#06100c",
      text: "#e6fff4", accent: "#19ff9c",
      stage: "radial-gradient(ellipse at 80% 10%, rgba(25,255,156,.22), transparent 55%), radial-gradient(ellipse at 10% 90%, rgba(0,170,255,.18), transparent 55%), #020605", radius: 6, font: MONO
    },
    aurora: {
      name: "Aurora", tag: "Northern lights",
      bg: "#07121a", bgElevated: "#0d1c27", panel: "#0a1721",
      text: "#eafff8", accent: "#5df2c2",
      stage: "radial-gradient(ellipse at 20% 10%, rgba(93,242,194,.30), transparent 55%), radial-gradient(ellipse at 85% 30%, rgba(150,110,255,.28), transparent 55%), #050e15", radius: 16, font: SANS
    },
    crimson: {
      name: "Crimson", tag: "Black and blood red",
      bg: "#0c0507", bgElevated: "#16090c", panel: "#110709",
      text: "#fff0f1", accent: "#ff3b4e",
      stage: "radial-gradient(ellipse at 50% 20%, rgba(255,59,78,.26), transparent 60%), #080304", radius: 10, font: SANS
    },
    sunset: {
      name: "Sunset", tag: "Purple to orange glow",
      bg: "#140a17", bgElevated: "#1e1022", panel: "#190d1d",
      text: "#fff1ea", accent: "#ff9a5c",
      stage: "linear-gradient(160deg, #3b1249 0%, #a2325f 48%, #ff8f5a 100%)",
      radius: 18, font: ROUND
    },
    ocean: {
      name: "Ocean", tag: "Deep blue & teal",
      bg: "#06111c", bgElevated: "#0a1a2a", panel: "#081522",
      text: "#e8f4ff", accent: "#3ddbd9",
      stage: "linear-gradient(180deg, #06263f 0%, #04121f 100%), #04121f",
      radius: 16, font: SANS
    },
    forest: {
      name: "Forest", tag: "Calm dark green",
      bg: "#0a0f0c", bgElevated: "#101712", panel: "#0d1310",
      text: "#eef4f0", accent: "#6ddc9a",
      stage: "radial-gradient(ellipse at 50% 100%, #123524 0%, #070b09 70%)",
      radius: 14, font: SANS
    },
    amoled: {
      name: "AMOLED Black", tag: "True black, cyan accent, saves battery",
      bg: "#000000", bgElevated: "#0a0a0a", panel: "#050505",
      text: "#f5f5f5", accent: "#22d3ee",
      stage: "#000000", radius: 14, font: SANS
    },
    rose: {
      name: "Rose", tag: "Deep wine with a pink glow",
      bg: "#140a0f", bgElevated: "#1f1016", panel: "#1a0d13",
      text: "#ffeef3", accent: "#ff6b9d",
      stage: "radial-gradient(ellipse at 50% 20%, rgba(255,107,157,.26), transparent 60%), #0d060a", radius: 18, font: ROUND
    },
    lavender: {
      name: "Lavender", tag: "Dark violet, soft purple",
      bg: "#0f0b1a", bgElevated: "#181229", panel: "#130e22",
      text: "#f1ecff", accent: "#b794ff",
      stage: "radial-gradient(ellipse at 50% 15%, rgba(183,148,255,.28), transparent 60%), #0a0713", radius: 16, font: SANS
    },
    gold: {
      name: "Gold", tag: "Black and warm gold",
      bg: "#0f0c05", bgElevated: "#1a1508", panel: "#141006",
      text: "#fff6e0", accent: "#ffc83d",
      stage: "radial-gradient(ellipse at 50% 20%, rgba(255,200,61,.22), transparent 60%), #0a0803", radius: 12, font: SANS
    },
    coffee: {
      name: "Coffee", tag: "Warm brown, cosy",
      bg: "#120d0a", bgElevated: "#1c1511", panel: "#17110d",
      text: "#f4ebe3", accent: "#d9a066",
      stage: "radial-gradient(ellipse at 50% 100%, #2b1d14 0%, #0c0806 72%)", radius: 14, font: SERIF
    },
    cloud: {
      name: "Cloud", tag: "Light blue and white, easy in daylight",
      bg: "#eef3fb", bgElevated: "#ffffff", panel: "#e3eaf5",
      text: "#101828", accent: "#2563eb", light: true,
      stage: "radial-gradient(ellipse at 50% 30%, #ffffff 0%, #dbe5f4 80%)", radius: 16, font: SANS
    },
    paperlight: {
      name: "Paper", tag: "Light & clean",
      bg: "#f4f4f2", bgElevated: "#ffffff", panel: "#ececea",
      text: "#141414", accent: "#141414", light: true,
      stage: "radial-gradient(ellipse at 50% 30%, #ffffff 0%, #e4e4e0 80%)",
      radius: 14, font: SERIF
    }
  };
  // Control styles change the SHAPE and layout of the control bar, buttons, seek and volume sliders (see style.css [data-ctl]).
  var CONTROL_STYLES = {
    classic: { name: "Modern Classic", tag: "Round buttons, thin sliders" },
    glass:   { name: "Glass",   tag: "Frosted floating capsule" },
    cyber:   { name: "Cyberpunk", tag: "Angular, segmented sliders" },
    minimal: { name: "Minimalist", tag: "Line icons, hairline sliders" },
    analog:  { name: "Classic Analog", tag: "Chunky knob buttons, tape sliders" },
    xp:      { name: "Retro Desktop", tag: "Docked one-row bar, title-bar chrome" },
    tactical:{ name: "Tactical", tag: "Chamfered armour keys, hazard stripe, crosshair seek" },
    glyph:   { name: "Glyph", tag: "Bracket buttons, text-mode sliders" },
    grid:    { name: "Neon Grid", tag: "Glowing rounded keys, laser-line sliders" },
    dock:    { name: "Modern Dock", tag: "Docked one-row bar, flat square keys" },
    soft:    { name: "Soft Touch", tag: "Pillowy pressed-out keys, no outlines" },
    ring:    { name: "Neon Ring", tag: "Glowing outline rings, hairline laser sliders" },
    hifi:    { name: "Hi-Fi Receiver", tag: "Brushed faceplate, steel knobs, amber display" },
    bubble:  { name: "Bubble Pop", tag: "Big bright bubbles, fat rounded sliders" }
  };
  // Each theme picks a control style by default; the person can override it in Themes.
  var CTL_BY_PRESET = { orange: "classic", ghost: "classic", obsidian: "minimal", neon: "cyber", midnight: "glass", cyber: "cyber", aurora: "glass", crimson: "classic", sunset: "soft", ocean: "glass", forest: "soft", paperlight: "minimal", amoled: "classic", rose: "soft", lavender: "glass", gold: "classic", coffee: "soft", cloud: "minimal" };
  var DEFAULT_PREFS = { preset: "orange", customAccent: null, customBg: null, ctl: "auto" };

  function hexToRgb(hex) {
    var h = String(hex || "#000000").replace("#", "");
    if (h.length === 3) h = h.split("").map(function (c) { return c + c; }).join("");
    var num = parseInt(h.slice(0, 6), 16) || 0;
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }
  function toHex(c) {
    function p(v) { v = Math.max(0, Math.min(255, Math.round(v))); return (v < 16 ? "0" : "") + v.toString(16); }
    return "#" + p(c.r) + p(c.g) + p(c.b);
  }
  // mix(a, b, t): t=0 -> a, t=1 -> b
  function mix(a, b, t) {
    var x = hexToRgb(a), y = hexToRgb(b);
    return toHex({ r: x.r + (y.r - x.r) * t, g: x.g + (y.g - x.g) * t, b: x.b + (y.b - x.b) * t });
  }
  function relativeLuminance(hex) {
    var rgb = hexToRgb(hex);
    var a = [rgb.r, rgb.g, rgb.b].map(function (v) {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }
  function contrastColor(hex) { return relativeLuminance(hex) > 0.5 ? "#0a0a0c" : "#ffffff"; }
  function rgba(hex, alpha) {
    var c = hexToRgb(hex);
    return "rgba(" + c.r + "," + c.g + "," + c.b + "," + alpha + ")";
  }

  function loadPrefs() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      var p = Object.assign({}, DEFAULT_PREFS, raw ? JSON.parse(raw) : {});
      if (!PRESETS[p.preset]) p.preset = "orange";
      if (p.ctl !== "auto" && !CONTROL_STYLES[p.ctl]) p.ctl = "auto";   // e.g. a preset removed in an update
      return p;
    } catch (e) { return Object.assign({}, DEFAULT_PREFS); }
  }
  function savePrefs(prefs) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs)); } catch (e) { /* storage unavailable */ }
  }

  function GhostThemesCtl(prefs) {
    return prefs.ctl && prefs.ctl !== "auto" && CONTROL_STYLES[prefs.ctl] ? prefs.ctl : (CTL_BY_PRESET[prefs.preset] || "classic");
  }
  function apply(prefs) {
    var preset = PRESETS[prefs.preset] || PRESETS.ghost;
    var root = document.documentElement;
    var set = function (k, v) { root.style.setProperty(k, v); };
    var accent = prefs.customAccent || preset.accent;
    var customBg = prefs.customBg;
    var isLight = !!preset.light;
    if (customBg) isLight = relativeLuminance(customBg) > 0.5;   // custom color decides light/dark text
    var text = customBg ? (isLight ? "#141414" : "#f3f3f5") : preset.text;

    // Custom background color recolors EVERYTHING (sidebar + main stage), not just the body.
    var bg = customBg || preset.bg;
    var lift = isLight ? "#ffffff" : "#ffffff", sink = "#000000";
    var bgElevated = customBg ? (isLight ? mix(bg, lift, 0.55) : mix(bg, lift, 0.05)) : preset.bgElevated;
    var panel = customBg ? (isLight ? mix(bg, sink, 0.04) : mix(bg, sink, 0.25)) : preset.panel;
    var stage = customBg
      ? "radial-gradient(ellipse at 50% 30%, " + (isLight ? mix(bg, "#ffffff", 0.5) : mix(bg, "#ffffff", 0.08)) + " 0%, " + bg + " 75%)"
      : preset.stage;

    set("--bg", bg);
    set("--bg-elevated", bgElevated);
    set("--panel", panel);
    set("--stage-bg", stage);
    set("--text", text);
    set("--accent", accent);
    set("--accent-contrast", contrastColor(accent));
    set("--accent-soft", rgba(accent, 0.16));
    set("--glow", rgba(accent, 0.35));
    set("--radius-sm", Math.max(2, Math.round(preset.radius * 0.6)) + "px");
    set("--radius-md", preset.radius + "px");
    set("--radius-lg", Math.round(preset.radius * 1.4) + "px");
    set("--font", preset.font);

    if (isLight) {
      set("--text-dim", "#4a4a4a");
      set("--text-faint", "#8a8a8a");
      set("--border", "rgba(0,0,0,0.12)");
      set("--border-soft", "rgba(0,0,0,0.08)");
      set("--panel-glass", "rgba(0,0,0,0.045)");
      set("--hover", "rgba(0,0,0,0.08)");
      set("--fade", "linear-gradient(180deg, transparent, rgba(255,255,255,0.78) 45%, rgba(255,255,255,0.92))");
      set("--on-visual", "#ffffff");
      set("color-scheme", "light");
    } else {
      set("--text-dim", "#a0a0a8");
      set("--text-faint", "#64646c");
      set("--border", "rgba(255,255,255,0.09)");
      set("--border-soft", "rgba(255,255,255,0.06)");
      set("--panel-glass", "rgba(255,255,255,0.045)");
      set("--hover", "rgba(255,255,255,0.10)");
      set("--fade", "linear-gradient(180deg, transparent, rgba(0,0,0,0.72) 45%, rgba(0,0,0,0.86))");
      set("--on-visual", "#ffffff");
      set("color-scheme", "dark");
    }
    document.body.setAttribute("data-theme", prefs.preset);
    document.body.setAttribute("data-ctl", GhostThemesCtl(prefs));
    // Every theme has its own play-button SHAPE (css/advanced.css). It applies while the control style is "Match theme";
    // choosing a control style by hand keeps that style's buttons instead.
    if (!prefs.ctl || prefs.ctl === "auto") document.body.setAttribute("data-ps", prefs.preset); else document.body.removeAttribute("data-ps");
    document.body.classList.toggle("is-light", isLight);
    document.body.classList.toggle("has-glyph", !!preset.glyph);
    if (global.GhostGlyph) global.GhostGlyph.sync(!!preset.glyph);
  }

  var GhostThemes = {
    PRESETS: PRESETS,
    CONTROL_STYLES: CONTROL_STYLES,
    controlStyle: function () { return GhostThemesCtl(this.current); },
    setControlStyle: function (key) {
      if (key !== "auto" && !CONTROL_STYLES[key]) return;
      this.current.ctl = key; apply(this.current); savePrefs(this.current);
    },
    current: loadPrefs(),
    init: function () { apply(this.current); },
    // Picking a theme keeps a custom accent / background only if the person set one after.
    setPreset: function (key) {
      if (!PRESETS[key]) return;
      this.current.preset = key;
      this.current.customAccent = null;
      this.current.customBg = null;
      this.current.ctl = "auto";
      apply(this.current); savePrefs(this.current);
    },
    setAccent: function (hex) { this.current.customAccent = hex; apply(this.current); savePrefs(this.current); },
    setBackground: function (hex) { this.current.customBg = hex; apply(this.current); savePrefs(this.current); },
    clearCustom: function () {
      this.current.customAccent = null; this.current.customBg = null;
      apply(this.current); savePrefs(this.current);
    },
    reset: function () {
      this.current = Object.assign({}, DEFAULT_PREFS);
      apply(this.current); savePrefs(this.current);
    }
  };

  global.GhostThemes = GhostThemes;
})(window);
