/* Ghost Media Player MOBILE — "Music player look".
 * Six whole-screen looks for the song player (art, title, equaliser, keys). Colour themes still decide the colours;
 * a look decides the SHAPE of the music screen. Pure CSS (css/mlooks.css, body[data-mlook]) — nothing runs per frame.
 * Picked in More > Themes. */
(function (global) {
  "use strict";
  var KEY = "ghost.mlook.v1";
  var LOOKS = {
    classic: { name: "Classic", tag: "Rounded art card" },
    vinyl:   { name: "Vinyl", tag: "Spinning record while a song plays" },
    amoled:  { name: "AMOLED", tag: "Pure black, saves battery" },
    poster:  { name: "Poster", tag: "Big square art, huge title" },
    neon:    { name: "Neon Ring", tag: "Glowing ring around the art" },
    minimal: { name: "Minimal", tag: "Only the title and big keys" }
  };
  var ORDER = Object.keys(LOOKS);
  var cur = "classic";
  try { var v = localStorage.getItem(KEY); if (LOOKS[v]) cur = v; } catch (e) { /* ignore */ }

  function apply() { if (document.body) document.body.setAttribute("data-mlook", cur); }

  // tiny schematic of each look (uses the live accent colour)
  function sketch(k) {
    var A = 'fill="var(--accent)"', S = 'fill="currentColor" opacity=".18"', L = 'fill="currentColor" opacity=".45"';
    var body = "";
    if (k === "classic") body = '<rect x="38" y="8" width="44" height="40" rx="9" ' + S + '/><rect x="30" y="54" width="60" height="4" rx="2" ' + L + '/><circle cx="60" cy="66" r="6" ' + A + '/>';
    if (k === "vinyl")   body = '<circle cx="60" cy="28" r="22" fill="#111"/><circle cx="60" cy="28" r="15" fill="none" stroke="#fff" stroke-opacity=".12"/><circle cx="60" cy="28" r="7" ' + A + '/><rect x="30" y="54" width="60" height="4" rx="2" ' + L + '/><circle cx="60" cy="66" r="6" ' + A + '/>';
    if (k === "amoled")  body = '<rect x="0" y="0" width="120" height="76" fill="#000"/><rect x="40" y="10" width="40" height="36" rx="8" fill="#fff" opacity=".12"/><rect x="30" y="54" width="60" height="3" rx="1.5" fill="#fff" opacity=".4"/><circle cx="60" cy="66" r="6" ' + A + '/>';
    if (k === "poster")  body = '<rect x="22" y="4" width="76" height="50" rx="8" ' + A + ' opacity=".35"/><rect x="28" y="40" width="46" height="5" rx="2.5" ' + L + '/><rect x="22" y="58" width="76" height="3" rx="1.5" ' + L + '/><circle cx="60" cy="69" r="5" ' + A + '/>';
    if (k === "neon")    body = '<circle cx="60" cy="28" r="22" fill="none" stroke="var(--accent)" stroke-width="3"/><circle cx="60" cy="28" r="15" ' + S + '/><rect x="30" y="56" width="60" height="4" rx="2" ' + L + '/><circle cx="60" cy="68" r="5" ' + A + '/>';
    if (k === "minimal") body = '<rect x="22" y="18" width="76" height="7" rx="3" ' + L + '/><rect x="34" y="31" width="52" height="4" rx="2" ' + S + '/><rect x="30" y="52" width="60" height="3" rx="1.5" ' + L + '/><circle cx="60" cy="66" r="7" ' + A + '/>';
    return '<svg viewBox="0 0 120 76" aria-hidden="true">' + body + '</svg>';
  }

  function cardsHtml(esc) {
    return '<div class="settings-group"><h3>Music player look</h3>' +
      '<div class="settings-row__hint" style="margin:-4px 0 8px">How the song screen looks. Colours come from the theme above.</div>' +
      '<div class="ml-cards">' + ORDER.map(function (k) {
        return '<button type="button" class="ml-card' + (k === cur ? " is-active" : "") + '" data-mlook-key="' + k + '" aria-pressed="' + (k === cur) + '">' +
          sketch(k) + "<b>" + esc(LOOKS[k].name) + "</b><i>" + esc(LOOKS[k].tag) + "</i></button>";
      }).join("") + "</div></div>";
  }

  function set(k) {
    if (!LOOKS[k]) return;
    cur = k;
    try { localStorage.setItem(KEY, k); } catch (e) { /* ignore */ }
    apply();
    Array.prototype.forEach.call(document.querySelectorAll("[data-mlook-key]"), function (el) {
      var on = el.getAttribute("data-mlook-key") === k;
      el.classList.toggle("is-active", on); el.setAttribute("aria-pressed", on ? "true" : "false");
    });
  }

  // one delegated listener: the Themes panel rebuilds its HTML, so cards cannot hold their own listeners
  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-mlook-key]");
    if (!b) return;
    set(b.getAttribute("data-mlook-key"));
    var t = document.getElementById("toast");
    if (t) { t.textContent = "Music look: " + LOOKS[cur].name; t.hidden = false; clearTimeout(t._mt); t._mt = setTimeout(function () { t.hidden = true; }, 1500); }
  });

  global.GhostMLook = { LOOKS: LOOKS, current: function () { return cur; }, set: set, cardsHtml: cardsHtml };
  if (document.body) apply(); else document.addEventListener("DOMContentLoaded", apply);
})(window);
