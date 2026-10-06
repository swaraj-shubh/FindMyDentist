# FMD Dentist Workspace — UI prototype

A static, zero-build page (`dentist.html` + `favicon.svg`). All data is fictional and saved in the visitor's browser (LocalStorage).

## Deploy on Vercel

**Dashboard:** Import the repo → set **Root Directory** to `ui-prototypes` → Framework Preset **Other** → leave Build Command and Output Directory empty → Deploy.

**CLI:**
```bash
cd ui-prototypes
vercel          # preview
vercel --prod   # production
```

`vercel.json` serves the page at `/` (rewrite to `/dentist`), enables clean URLs, and adds basic security headers.

## Run locally
```bash
cd ui-prototypes && python3 -m http.server 8090   # http://127.0.0.1:8090/dentist.html
```
