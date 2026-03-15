# TDXRay Website

Static website for the TDXRay paper. Host on GitHub Pages by pushing the contents of this folder to a `gh-pages` branch (or the `docs/` folder of your repo).

## Structure

```
tdxray/
├── index.html          ← Main page (everything is one file + linked assets)
├── css/
│   └── style.css       ← All styles
├── js/
│   └── main.js         ← Scroll animations, FAQ, counters, typewriter
├── img/
│   └── logo.png        ← Your TDXRay logo
└── assets/             ← Put your demo video here (see below)
```

## Customization Checklist

### 1. Add Your Paper PDF
Drop `paper.pdf` in the root folder next to `index.html`.

### 2. Add Your Demo Video
Open `index.html` and find the `<!-- REPLACE THIS SECTION WITH YOUR VIDEO -->` comment in the `#demo` section.

**Option A — Local MP4:**
```html
<video controls poster="img/demo-poster.jpg">
  <source src="assets/demo.mp4" type="video/mp4">
</video>
```

**Option B — YouTube:**
```html
<iframe src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
  allowfullscreen allow="autoplay; encrypted-media"></iframe>
```
Then delete the `<div class="demo-placeholder">...</div>` block.

### 3. Update Author Links
Find the `#team` section and replace the `href="#"` links with actual profile URLs.

### 4. Update GitHub Link
Search for `https://github.com/` and replace with your actual repo URL (appears in the hero actions and footer).

### 5. Venue / Status Badge
The hero badge says "IEEE S&P 2026 — Under Submission". Update once accepted.

### 6. BibTeX
Update the `@inproceedings` entry in the `#citation` section with the final venue info once available.

## Deployment to GitHub Pages

```bash
# From your repo root
git subtree push --prefix tdxray origin gh-pages
```

Or copy the contents of `tdxray/` into your repo's `docs/` folder and enable Pages from Settings → Pages → Source: `docs/`.

## Fonts & Dependencies

All fonts are loaded from Google Fonts (online CDN). No npm, no build step, no server required.
Works fully offline if you download and host the fonts locally.
