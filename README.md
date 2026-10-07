# DataWave — product website

Static site for https://datawavebd.com (no build step; hosted on GitHub Pages).

- `index.html`, `styles.css`, `script.js` — the whole site
- `CNAME` — custom domain
- `robots.txt`, `sitemap.xml`, `llms.txt`, `site.webmanifest` — SEO / AI-crawler files (update `lastmod` in the sitemap and `dateModified` in the JSON-LD when content changes)

## Lead form
Edit `CONFIG` at the top of `script.js`:
- `FORM_ENDPOINT` (Formspree etc.) **or** `WEB3FORMS_KEY` — submissions are emailed to you
- `CONTACT_EMAIL` — shown on the page; also the mailto fallback if no endpoint is set

## Deploy
1. Push to `main`; repo Settings → Pages → Deploy from branch `main` / root.
2. Domain: at your DNS provider add `A` records for `@` → 185.199.108.153, .109.153, .110.153, .111.153 and a `CNAME` for `www` → `hasnat-abdullah.github.io`.
3. In Pages settings enable "Enforce HTTPS" once the certificate is issued.

Preview locally: `python3 -m http.server 8000`
