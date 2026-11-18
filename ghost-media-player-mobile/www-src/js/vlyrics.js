/* Ghost Media Player MOBILE — lyrics on top of the video (like subtitles).
 * Uses the lyrics the Lyrics screen already finds/loads (song.lrc next to the video, or loaded by hand).
 * Adds one "Lyrics" key to the video controls: on/off when lyrics exist, otherwise it lets you pick a .lrc/.txt file. */
(function () {
  "use strict";
  var KEY = "ghost.vlyr.on", on = true, last = -2, raf = 0, ov, l1, l2, btn, pick, item = null;
  try { on = localStorage.getItem(KEY) !== "0"; } catch (e) {}
  var $ = function (id) { return document.getElementById(id); };
  var core = function () { return window.GhostCore || null; };
  function toast(m) { var c = core(); if (c && c.toast) c.toast(m); }
  function st() { return window.GhostLyrics ? window.GhostLyrics.getState() : null; }
  function synced() { var s = st(); return !!(s && s.status === "ready" && s.lyrics && s.lyrics.timed && s.lyrics.lines.length); }
  function vid() { return $("videoEl"); }
  function isVideo() { return !!(item && item.kind === "video"); }

  function paint() {
    var v = vid(), show = on && isVideo() && synced();
    if (btn) { btn.hidden = !isVideo(); btn.classList.toggle("is-on", on && synced()); btn.classList.toggle("is-empty", !synced()); }
    if (!ov) return;
    if (!show) { ov.hidden = true; last = -2; return; }
    var s = st(), lines = s.lyrics.lines, i = window.GhostLyrics.findLine(lines, (v.currentTime || 0) - (s.userOffset || 0));
    if (i === last && !ov.hidden) return;
    last = i;
    var cur = i >= 0 ? lines[i].text : "", nxt = i + 1 < lines.length ? lines[i + 1].text : "";
    l1.textContent = cur; l2.textContent = cur ? nxt : "";
    ov.hidden = !(cur || nxt);
  }
  function loop() {
    raf = 0; paint();
    var v = vid();
    if (on && isVideo() && v && !v.paused) raf = requestAnimationFrame(loop);
  }
  function kick() { if (!raf) raf = requestAnimationFrame(loop); }

  function init() {
    var vp = $("viewport"), grp = document.querySelector(".controls__group--right"), ctl = $("controls");
    if (!vp || !grp) return;
    ov = document.createElement("div"); ov.className = "vlyr"; ov.hidden = true; ov.setAttribute("aria-live", "off");
    l1 = document.createElement("div"); l1.className = "vlyr__now"; l2 = document.createElement("div"); l2.className = "vlyr__next";
    ov.appendChild(l1); ov.appendChild(l2); vp.appendChild(ov);

    btn = document.createElement("button"); btn.type = "button"; btn.id = "vLyrBtn"; btn.className = "pillbtn"; btn.hidden = true;
    btn.setAttribute("aria-label", "Lyrics on video"); btn.textContent = "Lyrics";
    grp.insertBefore(btn, grp.firstChild);
    pick = document.createElement("input"); pick.type = "file"; pick.accept = ".lrc,.txt,text/plain"; pick.hidden = true; document.body.appendChild(pick);
    pick.addEventListener("change", function () {
      var f = pick.files && pick.files[0]; pick.value = "";
      if (f && window.GhostLyrics && window.GhostLyrics.loadManual) { on = true; try { localStorage.setItem(KEY, "1"); } catch (e) {} window.GhostLyrics.loadManual(f); }
    });
    btn.addEventListener("click", function () {
      var s = st();
      if (synced()) { on = !on; try { localStorage.setItem(KEY, on ? "1" : "0"); } catch (e) {} last = -2; paint(); kick(); toast(on ? "Lyrics on" : "Lyrics off"); }
      else if (s && s.status === "ready") toast("These lyrics aren't time-synced (plain text). Use a .lrc file.");
      else pick.click();
    });
    if (ctl && window.ResizeObserver) new ResizeObserver(function () { document.documentElement.style.setProperty("--ctlh", ctl.offsetHeight + "px"); }).observe(ctl);

    var v = vid();
    ["play", "playing"].forEach(function (n) { v.addEventListener(n, kick); });
    ["pause", "seeked", "timeupdate", "loadedmetadata"].forEach(function (n) { v.addEventListener(n, function () { if (!raf) paint(); }); });
    document.addEventListener("ghost:lyricschange", function () { last = -2; paint(); kick(); });
    document.addEventListener("ghost:trackchange", function (e) { item = e.detail ? e.detail.item : null; last = -2; paint(); });
    var c = core(); if (c && c.getCurrent) { item = c.getCurrent(); paint(); }
  }
  document.addEventListener("DOMContentLoaded", init);
})();
