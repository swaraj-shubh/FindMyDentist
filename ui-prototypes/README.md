# FMD Dentist — UI prototypes

Two static, zero-build pages: the public website (`dentist-web.html`, served at `/`) and the clinic workspace (`dentist.html`, served at `/dentist`), plus `favicon.svg` and `assets/smile.jpg`. All data is fictional and saved in the visitor's browser (LocalStorage).

## Deploy on Vercel

**Dashboard:** Import the repo → set **Root Directory** to `ui-prototypes` → Framework Preset **Other** → leave Build Command and Output Directory empty → Deploy.

**CLI:**
```bash
cd ui-prototypes
vercel          # preview
vercel --prod   # production
```

`vercel.json` serves the website at `/` (rewrite to `/dentist-web`), the workspace at `/dentist`, enables clean URLs, and adds basic security headers.

## Run locally
```bash
cd ui-prototypes && python3 -m http.server 8090   # http://127.0.0.1:8090/dentist-web.html  (website)  or  /dentist.html  (workspace)
```
