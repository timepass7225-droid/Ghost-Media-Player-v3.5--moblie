/* Ghost Media Player MOBILE edition — phone shell, laid out like a classic mobile media player (loads after every other script).
 *  - Top bar (title, search, open files) + bottom navigation: Video / Audio / Radio / Lyrics / More
 *  - Mini player above the navigation while something plays; tap it to open the full player
 *  - Android back button, lock-screen controls (Media Session), screen-awake while a video plays
 * It only clicks the app's own existing buttons, so the playback engine is untouched. */
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var html = document.documentElement, body = document.body, sidebar = $("sidebar"), stage = $("stage"), list = $("libraryList");
  if (!sidebar || !stage || !list) return;
  body.classList.add("is-mobile");

  function ic(d, s) { s = s || 22; return '<svg width="' + s + '" height="' + s + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + d + "</svg>"; }
  var ICON = {
    video: ic('<rect x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path d="M10.5 9.5v5l4.2-2.5-4.2-2.5Z" fill="currentColor"/>'),
    audio: ic('<path d="M9 17V5.6l10-1.8v11.2"/><circle cx="6.4" cy="17" r="2.6"/><circle cx="16.4" cy="15" r="2.6"/>'),
    radio: ic('<rect x="3.5" y="8.5" width="17" height="11" rx="2.5"/><path d="M7 8.5 17.5 4"/><circle cx="16" cy="14" r="2.3"/>'),
    lyrics: ic('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3M9 21h6"/>'),
    more: ic('<circle cx="5.5" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="18.5" cy="12" r="1.3" fill="currentColor"/>'),
    search: ic('<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/>'),
    add: ic('<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h3.1a1 1 0 0 1 .8.4l1.2 1.6h6A2.5 2.5 0 0 1 20 9.5v7a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-9Z"/><path d="M12 10.5v5M9.5 13h5"/>'),
    back: ic('<path d="M15 5.5 8.5 12l6.5 6.5"/>'),
    play: ic('<path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor"/>'),
    pause: ic('<rect x="6.5" y="5.5" width="4" height="13" rx="1" fill="currentColor"/><rect x="13.5" y="5.5" width="4" height="13" rx="1" fill="currentColor"/>'),
    next: ic('<path d="M6 6l9 6-9 6V6Z" fill="currentColor"/><path d="M17.5 6v12"/>'),
    ghost: '<svg viewBox="0 0 32 32" width="26" height="26"><path d="M16 3c-6.6 0-11 5.1-11 11v13.2c0 .9 1 1.4 1.7.8l2.6-2.3 2.7 2.3c.5.4 1.2.4 1.7 0l2.3-2 2.3 2c.5.4 1.2.4 1.7 0l2.7-2.3 2.6 2.3c.7.6 1.7.1 1.7-.8V14C27 8.1 22.6 3 16 3z" fill="currentColor"/><circle cx="12.2" cy="13.5" r="1.7" fill="#121212"/><circle cx="19.8" cy="13.5" r="1.7" fill="#121212"/></svg>'
  };

  var filter = "video";                       // "video" (video + images) or "audio": what the library list shows
  var want = 0;                               // time of the last user action that should bring the player forward

  /* ---------- run an action the app's own navigation already knows ---------- */
  function orbItem(label) {
    var all = document.querySelectorAll(".orbitem");
    for (var i = 0; i < all.length; i++) if (all[i].textContent.replace(/\s+/g, " ").trim() === label) return all[i];
    return null;
  }
  var SCREEN_TABS = { Radio: 1, Lyrics: 1 };
  function go(label) {
    closeMore();
    var b = orbItem(label);
    if (b) b.click();
    if (!SCREEN_TABS[label]) sidebar.classList.add("is-open"); else sidebar.classList.remove("is-open");
    if (label === "Home") setFilter(filter);
    sync();
  }
  function setFilter(f) { filter = f; list.setAttribute("data-filter", f); }

  /* ---------- top bar ---------- */
  var top = document.createElement("header");
  top.className = "mtop";
  top.innerHTML = '<button type="button" class="mtop__lead" aria-label="Back"></button><div class="mtop__title">Video</div>' +
    '<button type="button" class="mtop__btn" data-act="search" aria-label="Search">' + ICON.search + "</button>" +
    '<button type="button" class="mtop__btn" data-act="open" aria-label="Open files">' + ICON.add + "</button>";
  document.body.appendChild(top);
  var lead = top.querySelector(".mtop__lead"), topTitle = top.querySelector(".mtop__title");
  top.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    if (b === lead) { if (activePanel() !== "library") go("Home"); return; }
    var a = b.getAttribute("data-act");
    if (a === "open") { var fi = $("fileInput"); if (fi) fi.click(); }
    if (a === "search") toggleSearch();
  });
  function toggleSearch(force) {
    var s = $("libSearch"), on = typeof force === "boolean" ? force : !body.classList.contains("m-search");
    body.classList.toggle("m-search", on);
    if (s) { if (on) setTimeout(function () { s.focus(); }, 30); else { s.value = ""; s.dispatchEvent(new Event("input", { bubbles: true })); s.blur(); } }
  }

  /* ---------- bottom navigation ---------- */
  var TABS = [
    { id: "video", label: "Video", icon: ICON.video },
    { id: "audio", label: "Audio", icon: ICON.audio },
    { id: "Radio", label: "Radio", icon: ICON.radio },
    { id: "Lyrics", label: "Lyrics", icon: ICON.lyrics },
    { id: "more", label: "More", icon: ICON.more }
  ];
  var bar = document.createElement("nav");
  bar.className = "mtabs"; bar.setAttribute("aria-label", "Main");
  bar.innerHTML = TABS.map(function (t) {
    return '<button type="button" class="mtab" data-tab="' + t.id + '" aria-label="' + t.label + '"><i>' + t.icon + "</i><span>" + t.label + "</span></button>";
  }).join("");
  document.body.appendChild(bar);

  var sheet = document.createElement("div");
  sheet.className = "msheet"; sheet.hidden = true;
  sheet.innerHTML = '<div class="msheet__scrim"></div><div class="msheet__panel" role="menu">' +
    ["Effects", "Themes", "Settings", "About"].map(function (n) { return '<button type="button" class="msheet__item" role="menuitem" data-go="' + n + '">' + n + "</button>"; }).join("") + "</div>";
  document.body.appendChild(sheet);
  function openMore() { sheet.hidden = false; sync(); }
  function closeMore() { if (!sheet.hidden) { sheet.hidden = true; sync(); } }

  bar.addEventListener("click", function (e) {
    var t = e.target.closest(".mtab"); if (!t) return;
    var id = t.getAttribute("data-tab");
    if (id === "more") { sheet.hidden ? openMore() : closeMore(); return; }
    if (id === "video" || id === "audio") { filter = id; go("Home"); return; }
    go(id);
  });
  sheet.addEventListener("click", function (e) {
    if (e.target.classList.contains("msheet__scrim")) return closeMore();
    var b = e.target.closest(".msheet__item"); if (b) go(b.getAttribute("data-go"));
  });

  /* ---------- mini player ---------- */
  var mini = document.createElement("div");
  mini.className = "mmini"; mini.hidden = true;
  mini.innerHTML = '<i class="mmini__bar"><b></b></i><button type="button" class="mmini__main" aria-label="Open player"><span class="mmini__art"></span><span class="mmini__txt"><b></b><small></small></span></button>' +
    '<button type="button" class="mmini__btn" data-a="play" aria-label="Play / pause"></button><button type="button" class="mmini__btn" data-a="next" aria-label="Next">' + ICON.next + "</button>";
  document.body.appendChild(mini);
  var mArt = mini.querySelector(".mmini__art"), mName = mini.querySelector(".mmini__txt b"), mSub = mini.querySelector(".mmini__txt small"),
      mPlay = mini.querySelector('[data-a="play"]'), mBar = mini.querySelector(".mmini__bar b");
  mini.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    var a = b.getAttribute("data-a");
    if (a === "play") { var p = $("playBtn"); if (p) p.click(); setTimeout(paintMini, 60); }
    else if (a === "next") { var n = $("nextBtn"); if (n) n.click(); }
    else { sidebar.classList.remove("is-open"); sync(); }
  });
  function core() { return window.GhostCore || null; }
  function current() { var c = core(); return c && c.getCurrent ? c.getCurrent() : null; }
  var audio = $("audioEl"), video = $("videoEl"), title = $("nowTitle"), playBtn = $("playBtn");
  function activeEl() { return video && !video.hidden && video.src ? video : audio; }
  function paintMini() {
    var it = current(); if (!it) return;
    mName.textContent = it.name; mSub.textContent = it.kind === "audio" ? "Audio" : it.kind === "video" ? "Video" : "Image";
    mArt.innerHTML = it.kind === "audio" ? ICON.audio : it.kind === "video" ? ICON.video : ICON.ghost;
    var el = activeEl(), paused = !el || el.paused;
    mPlay.innerHTML = paused ? ICON.play : ICON.pause;
  }
  function tickMini() {
    var el = activeEl(); if (!el || !isFinite(el.duration) || !el.duration) { mBar.style.width = "0"; return; }
    mBar.style.width = Math.min(100, el.currentTime / el.duration * 100).toFixed(1) + "%";
  }
  [audio, video].forEach(function (el) {
    if (!el) return;
    ["play", "pause", "ended", "emptied", "loadedmetadata"].forEach(function (n) { el.addEventListener(n, function () { paintMini(); }); });
    el.addEventListener("timeupdate", function () { if (!mini.hidden) tickMini(); });
  });

  /* ---------- "which screen am I on" ---------- */
  function screenOpen() {
    var s = window.GhostScreens && GhostScreens.current();
    if (s) return s;
    if (window.GhostRadio && GhostRadio.isOpen && GhostRadio.isOpen()) return "radio";
    return "";
  }
  function activePanel() {
    var p = sidebar.querySelector(".sidebar__panel.is-active");
    return p ? p.id.replace("panel-", "") : "library";
  }
  function view() {
    if (sidebar.classList.contains("is-open")) return "home";
    return screenOpen() ? "screen" : "player";
  }
  function currentTab() {
    if (!sheet.hidden) return "more";
    var v = view();
    if (v === "screen") return screenOpen() === "lyrics" ? "Lyrics" : "Radio";
    if (v === "home") { var p = activePanel(); return p === "library" ? filter : (p === "radio" ? "Radio" : p === "lyrics" ? "Lyrics" : "more"); }
    return "";
  }
  var TITLES = { library: "", effects: "Effects", themes: "Themes", settings: "Settings", radio: "Radio", lyrics: "Lyrics" };
  var pending = 0;
  function sync() { if (!pending) pending = requestAnimationFrame(doSync); }
  function doSync() {
    pending = 0;
    var v = view(), c = currentTab(), p = activePanel(), it = current();
    html.classList.toggle("m-home", v === "home");
    html.classList.toggle("m-player", v === "player");
    html.classList.toggle("m-screen", v === "screen");
    var showMini = v === "home" && !!it && p === "library";
    html.classList.toggle("m-mini", showMini);
    mini.hidden = !showMini;
    if (showMini) { paintMini(); tickMini(); }
    var all = bar.querySelectorAll(".mtab");
    for (var i = 0; i < all.length; i++) all[i].classList.toggle("is-on", all[i].getAttribute("data-tab") === c);
    var lib = p === "library";
    topTitle.textContent = lib ? (filter === "audio" ? "Audio" : "Video") : (TITLES[p] || "Ghost");
    lead.innerHTML = lib ? ICON.ghost : ICON.back;
    lead.classList.toggle("is-brand", lib);
    top.classList.toggle("is-sub", !lib);
    if (!lib && body.classList.contains("m-search")) toggleSearch(false);
    updateEmpty();
  }
  new MutationObserver(sync).observe(sidebar, { attributes: true, attributeFilter: ["class"], subtree: true });
  new MutationObserver(sync).observe(stage, { attributes: true, attributeFilter: ["class"] });
  var radioScreen = $("radioScreen");
  if (radioScreen) new MutationObserver(sync).observe(radioScreen, { attributes: true, attributeFilter: ["hidden"] });

  /* ---------- empty hint for the current tab ---------- */
  var empty = document.createElement("div");
  empty.className = "mempty"; empty.hidden = true;
  empty.innerHTML = '<div class="mempty__ic"></div><p></p><button type="button" class="btn btn--primary">Open files</button>';
  var panelLib = $("panel-library");
  if (panelLib && list.parentNode) list.parentNode.insertBefore(empty, list.nextSibling);
  empty.querySelector("button").addEventListener("click", function () { var fi = $("fileInput"); if (fi) fi.click(); });
  function updateEmpty() {
    var rows = list.children, n = 0;
    for (var i = 0; i < rows.length; i++) {
      var k = rows[i].getAttribute("data-kind");
      if (filter === "audio" ? k === "audio" : k !== "audio") n++;
    }
    empty.hidden = n > 0;
    if (!n) {
      empty.querySelector("p").textContent = filter === "audio" ? "No songs yet. Tap + (top right) to add music." : "No videos yet. Tap + (top right) to add videos.";
      empty.querySelector(".mempty__ic").innerHTML = filter === "audio" ? ICON.audio : ICON.video;
    }
  }
  new MutationObserver(function () { sync(); }).observe(list, { childList: true });

  /* ---------- bring the player forward when the user starts a video / image ---------- */
  function arm() { want = Date.now(); }
  list.addEventListener("click", function (e) { if (e.target.closest(".media-item") && !e.target.closest("[data-remove]")) arm(); }, true);
  var recent = $("recentList"); if (recent) recent.addEventListener("click", function (e) { if (e.target.closest(".media-item")) arm(); }, true);
  var fi0 = $("fileInput"); if (fi0) fi0.addEventListener("change", arm);
  document.addEventListener("ghost:trackchange", function (e) {
    var it = e.detail && e.detail.item;
    if (it) {
      if (it.kind === "audio") filter = "audio"; else if (it.kind === "video" || it.kind === "image") filter = "video";
      if (list.getAttribute("data-filter")) setFilter(filter);
      if (Date.now() - want < 4000 && it.kind !== "audio") { want = 0; sidebar.classList.remove("is-open"); }
    }
    sync();
  });
  // in the player the top-left button goes back to the list; on Radio / Lyrics it goes back to the list too
  var tgl = $("sidebarToggle");
  if (tgl) {
    tgl.innerHTML = ICON.back; tgl.setAttribute("aria-label", "Back to library");
    stage.addEventListener("click", function (e) {
      if (!e.target.closest("#sidebarToggle")) return;
      e.stopImmediatePropagation(); e.preventDefault();
      go("Home");
    }, true);
  }

  /* ---------- hardware / gesture BACK (Capacitor App plugin; Escape in a browser) ---------- */
  function goBack() {
    if (!sheet.hidden) { closeMore(); return true; }
    if (document.fullscreenElement) { try { document.exitFullscreen(); } catch (e) {} return true; }
    var v = view();
    if (v === "screen") { go("Home"); return true; }
    if (v === "home") {
      if (body.classList.contains("m-search")) { toggleSearch(false); return true; }
      if (activePanel() !== "library") { go("Home"); return true; }
      return false;                                                   // list is the home page: let Android minimise
    }
    go("Home"); return true;                                          // player -> back to the list
  }
  window.GhostMobile = { back: goBack, go: go };
  var cap = window.Capacitor, appPlugin = cap && cap.Plugins && cap.Plugins.App;
  if (appPlugin && appPlugin.addListener) {
    appPlugin.addListener("backButton", function () {
      if (!goBack() && appPlugin.minimizeApp) appPlugin.minimizeApp();   // keep the music going instead of killing the app
    });
  }

  /* ---------- lock-screen / notification controls ---------- */
  var ms = navigator.mediaSession;
  function pushMeta() {
    if (!ms || !window.MediaMetadata) return;
    var t = (title && title.textContent || "").trim();
    if (!t || /^(Ghost Media Player|Lyrics|Radio)$/i.test(t)) return;
    try { ms.metadata = new MediaMetadata({ title: t, artist: "Ghost Media Player", album: "" }); } catch (e) {}
  }
  if (ms) {
    var act = function (name, fn) { try { ms.setActionHandler(name, fn); } catch (e) {} };
    var press = function (id) { return function () { var b = $(id); if (b) b.click(); }; };
    act("play", function () { var el = activeEl(); if (el && el.paused && playBtn) playBtn.click(); });
    act("pause", function () { var el = activeEl(); if (el && !el.paused && playBtn) playBtn.click(); });
    act("previoustrack", press("prevBtn"));
    act("nexttrack", press("nextBtn"));
    act("seekto", function (d) { var el = activeEl(); if (el && d && typeof d.seekTime === "number") el.currentTime = d.seekTime; });
    act("seekbackward", function () { var el = activeEl(); if (el) el.currentTime = Math.max(0, el.currentTime - 10); });
    act("seekforward", function () { var el = activeEl(); if (el) el.currentTime = el.currentTime + 10; });
    if (title) new MutationObserver(pushMeta).observe(title, { childList: true, characterData: true, subtree: true });
    [audio, video].forEach(function (el) {
      if (!el) return;
      el.addEventListener("play", function () { ms.playbackState = "playing"; pushMeta(); });
      el.addEventListener("pause", function () { ms.playbackState = "paused"; });
      el.addEventListener("ended", function () { ms.playbackState = "none"; });
    });
  }

  /* ---------- keep the screen on only while a video is actually playing ---------- */
  var lock = null;
  function wake(on) {
    if (!navigator.wakeLock) return;
    if (on && !lock) navigator.wakeLock.request("screen").then(function (l) { lock = l; l.addEventListener("release", function () { lock = null; }); }).catch(function () {});
    else if (!on && lock) { lock.release().catch(function () {}); lock = null; }
  }
  if (video) {
    video.addEventListener("play", function () { wake(true); });
    ["pause", "ended", "emptied"].forEach(function (n) { video.addEventListener(n, function () { wake(false); }); });
  }
  document.addEventListener("visibilitychange", function () { if (!document.hidden && video && !video.paused) wake(true); });

  /* ---------- touch polish ---------- */
  document.addEventListener("contextmenu", function (e) { if (!/^(INPUT|TEXTAREA)$/.test(e.target.tagName)) e.preventDefault(); });

  /* ---------- start on the library list (like a classic phone player) ---------- */
  setFilter(filter);
  sidebar.classList.add("is-open");
  sync();
})();
