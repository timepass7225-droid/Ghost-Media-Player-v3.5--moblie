#!/usr/bin/env python3
"""Generates every Android launcher icon + splash logo from build/icon_512.png (the Ghost logo).
Run only when the logo changes:   python3 scripts/make-icons.py
Output goes to resources/android/res/ (committed to the repo); the GitHub build copies it into the APK project
with scripts/apply-android-resources.js. Needs Pillow."""
import os, sys
from PIL import Image, ImageDraw

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
SRC = os.path.join(ROOT, "build", "icon_512.png")
OUT = os.path.join(ROOT, "resources", "android", "res")
BG = (10, 10, 12, 255)
INK = (243, 243, 245)

src = Image.open(SRC).convert("RGBA")

# --- the ghost alone: light shape on transparent, eyes become real holes (alpha follows brightness) ---
lum = src.convert("L")
box = lum.point(lambda v: 255 if v > 128 else 0).getbbox()          # the ghost body (not the rounded square)
ghost_lum = lum.crop(box)
alpha = ghost_lum.point(lambda v: max(0, min(255, int((v - 10) / (243 - 10) * 255))))
ghost = Image.new("RGBA", ghost_lum.size, INK + (0,))
ghost.putalpha(alpha)

def fit_ghost(canvas_px, ghost_h_frac):
    """ghost centred on a transparent square canvas, ghost_h_frac = ghost height / canvas"""
    h = int(canvas_px * ghost_h_frac); w = int(ghost.width * h / ghost.height)
    g = ghost.resize((w, h), Image.LANCZOS)
    c = Image.new("RGBA", (canvas_px, canvas_px), (0, 0, 0, 0))
    c.alpha_composite(g, ((canvas_px - w) // 2, (canvas_px - h) // 2))
    return c

def save(img, rel):
    p = os.path.join(OUT, rel); os.makedirs(os.path.dirname(p), exist_ok=True); img.save(p, optimize=True)

DENS = {"mdpi": 1, "hdpi": 1.5, "xhdpi": 2, "xxhdpi": 3, "xxxhdpi": 4}
# the visible logo box of the original (rounded square) without its transparent margin
sq = src.crop(src.getchannel("A").getbbox())

for d, k in DENS.items():
    legacy = int(48 * k); fg = int(108 * k)
    # 1) adaptive foreground (108dp, ghost kept inside the 66dp safe circle)
    save(fit_ghost(fg, 0.50), "mipmap-%s/ic_launcher_foreground.png" % d)
    # 2) legacy square icon = the logo exactly as supplied
    save(sq.resize((legacy, legacy), Image.LANCZOS), "mipmap-%s/ic_launcher.png" % d)
    # 3) legacy round icon
    S = legacy * 4                                                    # draw big, shrink = clean edges
    r = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    ImageDraw.Draw(r).ellipse((0, 0, S - 1, S - 1), fill=BG)
    r.alpha_composite(fit_ghost(S, 0.60))
    save(r.resize((legacy, legacy), Image.LANCZOS), "mipmap-%s/ic_launcher_round.png" % d)

# splash logo (shown while the app starts): ghost only, the dark background comes from drawable/splash.xml
save(fit_ghost(384, 0.80), "drawable-nodpi/splash_logo.png")

def write(rel, text):
    p = os.path.join(OUT, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
    open(p, "w", encoding="utf-8").write(text)

adaptive = '''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
    <monochrome android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
'''
write("mipmap-anydpi-v26/ic_launcher.xml", adaptive)
write("mipmap-anydpi-v26/ic_launcher_round.xml", adaptive)
write("values/ic_launcher_background.xml", '''<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#0A0A0C</color>
</resources>
''')
write("drawable/splash.xml", '''<?xml version="1.0" encoding="utf-8"?>
<layer-list xmlns:android="http://schemas.android.com/apk/res/android">
    <item>
        <shape android:shape="rectangle">
            <solid android:color="#0A0A0C"/>
        </shape>
    </item>
    <item>
        <bitmap android:src="@drawable/splash_logo" android:gravity="center"/>
    </item>
</layer-list>
''')
print("icons written to", os.path.normpath(OUT))
