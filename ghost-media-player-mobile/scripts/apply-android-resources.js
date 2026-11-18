/* Puts the Ghost logo into the generated Android project. Run AFTER `npx cap add android` and BEFORE `npx cap sync`
 * (the GitHub workflow does this for you). Without it Android shows the default Capacitor icon and splash screen.
 *   - launcher icons (square, round, adaptive + themed) and the splash screen come from resources/android/res
 *   - the default Capacitor icon / splash files are removed first (otherwise Android reports duplicate resources)
 *   - android:largeHeap is switched on (big local videos need more memory in the WebView)
 * No dependencies; safe to run twice. */
"use strict";
const fs = require("fs"), path = require("path");
const ROOT = path.join(__dirname, "..");
const RES = path.join(ROOT, "android", "app", "src", "main", "res");
const MAIN = path.join(ROOT, "android", "app", "src", "main");
const SRC = path.join(ROOT, "resources", "android", "res");

if (!fs.existsSync(RES)) { console.error("android/ project not found. Run `npx cap add android` first."); process.exit(1); }
if (!fs.existsSync(SRC)) { console.error("resources/android/res is missing."); process.exit(1); }

function walk(dir, fn) {
  for (const n of fs.readdirSync(dir)) {
    const p = path.join(dir, n), st = fs.statSync(p);
    if (st.isDirectory()) walk(p, fn); else fn(p, n);
  }
}

// 1. remove the stock Capacitor icon / splash so ours do not clash with them
let removed = 0;
walk(RES, (p, n) => {
  const inMipmap = /mipmap/.test(path.relative(RES, p)), inDrawable = /^drawable/.test(path.relative(RES, p));
  const stockIcon = inMipmap && /^ic_launcher(_round|_foreground)?\.(png|webp)$/.test(n);
  const stockSplash = inDrawable && /^splash\.(png|webp|jpg|xml)$/.test(n);
  const stockXml = /mipmap-anydpi/.test(p) && /^ic_launcher(_round)?\.xml$/.test(n);
  if (stockIcon || stockSplash || stockXml) { fs.unlinkSync(p); removed++; }
});

// 2. copy ours
let copied = 0;
walk(SRC, (p) => {
  const to = path.join(RES, path.relative(SRC, p));
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(p, to); copied++;
});

// 3. dark splash background on Android 12+ (only when the launch theme is the androidx SplashScreen one)
const styles = path.join(RES, "values", "styles.xml");
if (fs.existsSync(styles)) {
  let x = fs.readFileSync(styles, "utf8");
  const re = /(<style\s+name="AppTheme\.NoActionBarLaunch"\s+parent="[^"]*SplashScreen[^"]*"\s*>)/;
  if (re.test(x) && !/windowSplashScreenBackground/.test(x)) {
    x = x.replace(re, '$1\n        <item name="windowSplashScreenBackground">#0A0A0C</item>');
    fs.writeFileSync(styles, x);
  }
}

// 4. memory for big local videos
const manifest = path.join(MAIN, "AndroidManifest.xml");
if (fs.existsSync(manifest)) {
  let m = fs.readFileSync(manifest, "utf8");
  if (!/android:largeHeap/.test(m)) { m = m.replace(/<application/, '<application\n        android:largeHeap="true"'); fs.writeFileSync(manifest, m); }
}

console.log("Android resources applied: removed " + removed + " stock file(s), copied " + copied + " Ghost file(s).");
