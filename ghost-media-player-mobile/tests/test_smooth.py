"""v3.7 checks: no layout jump / flicker when a video starts, music-player looks, new themes, performance mode.
Run:  node tests/make-fixtures.js /tmp/fx && ffmpeg ... /tmp/fx/test.webm && python3 tests/test_smooth.py
(WWWDIR=/path/to/www picks another build to compare against.)"""
import sys, os
sys.path.insert(0, os.path.dirname(__file__))
from common import *
from playwright.sync_api import sync_playwright

SHOTS = os.environ.get("SHOTS", "")
R = Report(); srv, url = serve()
VIDEO = os.path.join(FX, "test.webm"); SONG = os.path.join(FX, "song.wav")

with sync_playwright() as p:
    b, c, page, errors, reqs = launch(p, viewport={"width": 412, "height": 915}, device_scale_factor=2, is_mobile=True, has_touch=True)
    page.goto(url); page.wait_for_selector(".mtabs")
    page.evaluate("() => { window.__rects = []; window.__cls = []; }")

    R.section("video start: no layout jump, no flicker")
    # record the <video> box + pending class every animation frame, starting at the moment the file is opened
    page.evaluate("""() => { const v = document.getElementById('videoEl'); window.__t0 = performance.now();
      (function f(){ const r = v.getBoundingClientRect(); window.__rects.push([Math.round(performance.now()-window.__t0), Math.round(r.top), Math.round(r.height), v.hidden ? 1 : 0, v.classList.contains('is-pending') ? 1 : 0, +getComputedStyle(v).opacity]);
        if (performance.now() - window.__t0 < 1400) requestAnimationFrame(f); })(); }""")
    page.set_input_files("#fileInput", [VIDEO, SONG])
    page.wait_for_timeout(1700)
    rects = page.evaluate("() => window.__rects")
    shown = [r for r in rects if r[3] == 0]
    heights = sorted(set(r[2] for r in shown)); tops = sorted(set(r[1] for r in shown))
    R.check("video box never resizes after it is shown", len(heights) <= 1 and len(tops) <= 1, "heights=%s tops=%s" % (heights, tops))
    pend = [r for r in shown if r[4] == 1]
    R.check("video is hidden (opacity 0) until its first frame", (not shown) or all(r[5] == 0 for r in pend), "pending frames=%d" % len(pend))
    R.check("video becomes visible and plays", page.evaluate("() => { const v=document.getElementById('videoEl'); return !v.paused && v.currentTime>0.2 && getComputedStyle(v).opacity==='1' && !v.classList.contains('is-pending'); }"))
    if SHOTS: page.screenshot(path=SHOTS + "/video.png")

    R.section("track change does not rebuild the list")
    page.evaluate("() => { window.__row = document.querySelector('#libraryList .media-item'); }")
    page.click("#nextBtn"); page.wait_for_timeout(500)
    R.check("list rows are the same DOM nodes", page.evaluate("() => window.__row === document.querySelector('#libraryList .media-item')"))
    R.check("playing marker moved", page.evaluate("() => document.querySelectorAll('#libraryList .media-item.is-playing').length === 1 && document.querySelector('#libraryList .media-item.is-playing').dataset.kind === 'audio'"))

    R.section("music player looks")
    page.evaluate("() => document.getElementById('audioEl').play()")
    page.wait_for_timeout(300)
    for k in ["classic", "vinyl", "amoled", "poster", "neon", "minimal"]:
        page.evaluate("k => GhostMLook.set(k)", k); page.wait_for_timeout(120)
        ok = page.evaluate("k => document.body.dataset.mlook === k && !document.getElementById('audioStage').hidden", k)
        R.check("look '%s' applies" % k, ok)
        if SHOTS: page.screenshot(path=SHOTS + "/look_%s.png" % k)
    page.evaluate("() => GhostMLook.set('vinyl')"); page.wait_for_timeout(500)
    R.check("vinyl record turns while playing", page.evaluate("() => getComputedStyle(document.querySelector('.audio-stage__art')).animationPlayState") == "running")
    page.evaluate("() => document.getElementById('audioEl').pause()"); page.wait_for_timeout(200)
    R.check("vinyl stops when paused", page.evaluate("() => getComputedStyle(document.querySelector('.audio-stage__art')).animationPlayState") == "paused")
    page.evaluate("() => GhostMLook.set('classic')")

    R.section("themes + picker")
    page.evaluate("() => GhostMobile.go('Themes')"); page.wait_for_timeout(300)
    R.check("18 colour themes listed", page.evaluate("() => document.querySelectorAll('#panel-themes .theme-card').length") == 18)
    R.check("music look cards listed", page.evaluate("() => document.querySelectorAll('#panel-themes .ml-card').length") == 6)
    page.click('#panel-themes [data-mlook-key="poster"]'); page.wait_for_timeout(150)
    R.check("tapping a look card applies it", page.evaluate("() => document.body.dataset.mlook") == "poster" and page.evaluate("() => document.querySelector('.ml-card.is-active').dataset.mlookKey") == "poster")
    R.check("look is remembered", page.evaluate("() => localStorage.getItem('ghost.mlook.v1')") == "poster")
    for t in ["amoled", "rose", "lavender", "gold", "coffee", "cloud"]:
        page.click('#panel-themes [data-theme-key="%s"]' % t); page.wait_for_timeout(80)
        R.check("theme '%s' applies" % t, page.evaluate("t => document.body.dataset.theme === t", t))
    if SHOTS: page.screenshot(path=SHOTS + "/themes.png")
    page.evaluate("() => GhostThemes.setPreset('orange')")

    R.section("performance mode")
    page.evaluate("() => GhostMobile.go('Settings')"); page.wait_for_timeout(300)
    R.check("Performance setting shown", page.query_selector("#perfMode") is not None)
    page.select_option("#perfMode", "full"); page.wait_for_timeout(100)
    R.check("Full = no lite class", not page.evaluate("() => document.documentElement.classList.contains('lite')"))
    page.select_option("#perfMode", "lite"); page.wait_for_timeout(100)
    R.check("Lite = lite class", page.evaluate("() => document.documentElement.classList.contains('lite')"))
    R.check("Lite: no box-shadow on the control bar", page.evaluate("() => getComputedStyle(document.getElementById('controls')).boxShadow") == "none")
    R.check("choice saved", page.evaluate("() => localStorage.getItem('ghost.perf.v1')") == "lite")

    R.check("no console / page errors", not errors, errors)
    b.close()
sys.exit(R.done())
