# GitHub se APK banane ka tarika (Hinglish)

1. github.com par naya repository banao (naam: ghost-media-player-mobile). Public ya Private - dono chalte hain.
2. Is zip ko extract karo. **Andar wale folder ke contents** upload karne hain (jahan package.json dikhe) - bahar wala folder nahi.
   Upload karo: www-src, scripts, build, tests, package.json, capacitor.config.json, .gitignore, README files.
   Mat upload karo: node_modules, android (ye apne aap ban jaate hain).
3. Workflow file: repo me **Add file -> Create new file** dabao, naam me likho `.github/workflows/build-apk.yml` (slash likhte hi folders ban jaate hain), aur is project ki `.github/workflows/build-apk.yml` ka poora text paste karke Commit karo.
   (Agar tumhara purana wala paste karoge to bhi chalega, par isme ek fix hai: `npm run build` pehle chalta hai, uske baad `cap add android`.)
4. Repo ke **Actions** tab me jao -> "Build Android APK" -> **Run workflow**. 5-10 minute lagte hain. (main branch par push karne se bhi apne aap chalta hai.)
5. Green tick aane par us run ko kholo -> neeche **Artifacts** me `Ghost-Media-Player-APK` download karo -> zip kholo -> `app-debug.apk` mila.
6. APK phone me bhejo, install karte waqt "Install unknown apps" allow karo.

Dhyan rakho:
- Ye **debug APK** hai (Play Store ke liye nahi). Play Store ke liye signed release build alag se banana padega.
- Agar build fail ho to Actions me failed step kholo aur uska error mujhe bhej do.
- App ka icon aur splash screen ab Ghost logo ka hai: build ke dauran `scripts/apply-android-resources.js` apne-aap laga deta hai (workflow me step "Apply the Ghost logo").
