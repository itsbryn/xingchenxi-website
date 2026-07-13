# xingchenxi Website v0.1 Launch Checklist

Use this checklist before publishing the static site.

## Required Before Public Launch

- Confirm production domain and replace placeholder `https://www.xingchenxi.com` in `robots.txt` and `sitemap.xml`.
- Add the final production URL as canonical / Open Graph URL in `index.html` and `privacy.html`.
- Create a public contact email, preferably domain-based, and replace the contact placeholder in `index.html` and `privacy.html`.
- Decide hosting location. If using a mainland China server, complete ICP filing before public access.
- Confirm whether analytics will be used. If yes, update `privacy.html` before adding the script.
- Test desktop and mobile pages after deployment, not only locally.

## Recommended

- Register and configure a domain-based email such as `hello@<domain>`.
- Add a simple contact form only after spam protection and privacy text are ready.
- Keep `assets/og-image.png` under 1 MB for social sharing performance.
- Add first public case studies or product notes after the brand page is stable.

## Current Site Package

- `index.html`: one-page brand website
- `daily/`: Daily Brief company log subsite
- `data/daily-brief.json`: public Daily Brief entries
- `cognitive-os/`: Bryn OS cognitive asset subsite
- `data/interviews.json`: public interview library data
- `privacy.html`: privacy notice
- `404.html`: static fallback page
- `site.webmanifest`: mobile install metadata
- `robots.txt`: crawler rules
- `sitemap.xml`: production sitemap template
- `assets/og-image.png`: social sharing image
- `assets/apple-touch-icon.png`, `assets/icon-192.png`, `assets/icon-512.png`: browser and mobile icons
