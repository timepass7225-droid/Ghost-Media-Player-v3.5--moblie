/* Ghost Media Player MOBILE — smoothness layer.
 *  1. Video start: the <video> stays invisible until its FIRST FRAME is on screen, then fades in. No more black box /
 *     stale frame / flicker while the decoder spins up.
 *  2. Performance mode (Settings): Auto | Smooth (lite) | Full. "lite" removes shadows, transitions and decorative animations.
 *  3. Self-healing: if a video drops a lot of frames, lite mode switches on by itself.
 *  4. Everything decorative is paused while the screen is off / the app is in the background.
 * Loads right after player.js (before app.js) so Settings can ask it for its panel. */
(function (global) {
  "use strict";
  var doc = document.documentElement, KEY = "ghost.perf.v1";
  var $ = function (id) { return document.getElementById(id); };
  var video = $("videoEl"), audio = $("audioEl");

  function getMode() { try { return localStorage.getItem(KEY) || "auto"; } catch (e) { return "auto"; } }
  function weakPhone() { return (navigator.deviceMemory || 4) <= 4 || (navigator.hardwareConcurrency || 4) <= 6; }
  function applyMode(m) {
    var lite = m === "lite" || (m === "auto" && weakPhone());
    doc.classList.toggle("lite", lite);
    return lite;
  }

  /* ---------------------------------------------------------------- 1. first-frame gate for video */
  var gateTimer = 0, gateSeq = 0;
  function reveal(seq) {
    if (seq !== undefined && seq !== gateSeq) return;          // a newer video has started: ignore the old one's callbacks
    clearTimeout(gateTimer);
    if (video) video.classList.remove("is-pending");
  }
  function gate() {
    if (!video) return;
    var seq = ++gateSeq;
    video.classList.add("is-pending");
    clearTimeout(gateTimer);
    gateTimer = setTimeout(function () { reveal(seq); }, 3000);   // never leave the picture hidden (corrupt file, slow storage)
    drops.reset();
  }
  function onFirstFrame() {
    var seq = gateSeq;
    if (!video.classList.contains("is-pending")) return;
    if (video.paused || !video.requestVideoFrameCallback) { reveal(seq); return; }
    try { video.requestVideoFrameCallback(function () { reveal(seq); }); } catch (e) { reveal(seq); }
    setTimeout(function () { reveal(seq); }, 400);                // safety net if the callback never fires
  }
  if (video) {
    video.setAttribute("disablepictureinpicture", "");
    video.setAttribute("x-webkit-airplay", "deny");
    video.setAttribute("playsinline", "");
    try { video.disablePictureInPicture = true; video.disableRemotePlayback = true; } catch (e) { /* ignore */ }
    video.addEventListener("loadeddata", onFirstFrame);
    video.addEventListener("playing", onFirstFrame);
    ["error", "emptied", "abort"].forEach(function (n) { video.addEventListener(n, function () { reveal(); }); });
  }
  if (audio) { audio.setAttribute("x-webkit-airplay", "deny"); try { audio.disableRemotePlayback = true; } catch (e) { /* ignore */ } }

  // Hook the engine: every video load starts hidden (synchronously, before the first paint of the new source).
  if (global.GhostPlayer && global.GhostPlayer.prototype.loadKind) {
    var origLoad = global.GhostPlayer.prototype.loadKind;
    global.GhostPlayer.prototype.loadKind = function (kind) {
      var el = origLoad.apply(this, arguments);
      if (kind === "video") gate(); else reveal();
      return el;
    };
  }

  /* ---------------------------------------------------------------- 3. dropped-frame watchdog */
  var drops = (function () {
    var lastTotal = 0, lastDropped = 0, bad = 0, timer = 0, done = false;
    function tick() {
      if (!video || video.paused || video.hidden || !video.getVideoPlaybackQuality) return;
      var q = video.getVideoPlaybackQuality(), dt = q.totalVideoFrames - lastTotal, dd = q.droppedVideoFrames - lastDropped;
      lastTotal = q.totalVideoFrames; lastDropped = q.droppedVideoFrames;
      if (dt < 40) return;                                         // not enough frames to judge
      bad = dd / dt > 0.12 ? bad + 1 : 0;
      if (bad >= 2 && !doc.classList.contains("lite")) {           // two bad windows in a row: take the load off
        doc.classList.add("lite"); done = true;
        var t = $("toast"); if (t) { t.textContent = "Smooth mode switched on for this video"; t.hidden = false; clearTimeout(t._pt); t._pt = setTimeout(function () { t.hidden = true; }, 2600); }
      }
    }
    return {
      reset: function () { lastTotal = lastDropped = bad = 0; },
      start: function () { if (!timer && !done && getMode() !== "full") timer = setInterval(tick, 4000); },
      stop: function () { clearInterval(timer); timer = 0; }
    };
  })();
  if (video) {
    video.addEventListener("playing", drops.start);
    ["pause", "ended", "emptied"].forEach(function (n) { video.addEventListener(n, drops.stop); });
  }

  /* ---------------------------------------------------------------- 4. background */
  document.addEventListener("visibilitychange", function () { doc.classList.toggle("is-bg", document.hidden); });

  /* ---------------------------------------------------------------- 2. Settings panel */
  var MODES = {
    auto: { name: "Auto", tag: "Smooth mode on weaker phones, full effects on strong ones" },
    lite: { name: "Smooth (Lite)", tag: "No shadows or decorative animation. Best for low-end phones" },
    full: { name: "Full effects", tag: "All glows and transitions. Needs a fast phone" }
  };
  function settingsHtml(esc) {
    var m = getMode();
    return '<div class="settings-group"><h3>Performance</h3>' +
      '<div class="settings-row"><div><div class="settings-row__label">Performance mode</div><div class="settings-row__hint" id="perfHint">' + esc(MODES[m].tag) + '</div></div>' +
      '<select class="select" id="perfMode">' + Object.keys(MODES).map(function (k) {
        return '<option value="' + k + '"' + (k === m ? " selected" : "") + ">" + esc(MODES[k].name) + "</option>";
      }).join("") + "</select></div></div>";
  }
  document.addEventListener("change", function (e) {
    var t = e.target;
    if (!t || t.id !== "perfMode") return;
    try { localStorage.setItem(KEY, t.value); } catch (err) { /* ignore */ }
    applyMode(t.value);
    var h = $("perfHint"); if (h) h.textContent = MODES[t.value].tag;
  });

  global.GhostPerf = { settingsHtml: settingsHtml, mode: getMode, apply: applyMode };
})(window);
