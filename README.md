# PearlOxy Uganda Limited — Website

Static marketing site for **PearlOxy Uganda Limited** (Kampala, Uganda) and its flagship
**MPOS device** — Mobile Portable Oxygen Storage, a portable oxygen buffer designed to keep
oxygen therapy running during power interruptions in low-resource hospitals.

Nine pages, no build dependencies, no framework. Every section is written so it maps cleanly
onto a native Elementor widget for the planned WordPress rebuild.

---

## Run it locally

```bash
python serve.py
```

Then open <http://localhost:5199>. The server adds `no-store` headers and resolves clean URLs
(`/about/` → `about/index.html`), so a rebuild always shows up on reload.

## Rebuild the pages

```bash
python build.py
```

`build.py` wraps each body partial in `src/` with the shared `<head>`, header and footer, then
writes `index.html`, `<slug>/index.html`, `sitemap.xml` and `robots.txt`.

**Edit `src/*.html`, not the generated `index.html` files** — a rebuild overwrites them.
Shared markup (nav, footer, meta tags, JSON-LD) lives in `build.py`.

The build asserts on every page that there is exactly one `<h1>` and that every `<img>` carries
an `alt` attribute; it fails loudly rather than shipping a regression.

---

## Layout

```
├── build.py              page shell, SEO metadata, nav/footer, sitemap
├── serve.py              local preview server
├── src/*.html            page bodies (the files you edit)
├── assets/css/main.css   design system — flexbox only, no CSS Grid
├── assets/js/main.js     mobile menu, accordion, reveal, video facade, forms
├── assets/img/           optimised imagery (≤1800px, JPEG for photos)
├── content/              original unoptimised source assets
└── <slug>/index.html     generated output
```

## Design system

The palette is sampled directly from the PearlOxy logo — a single cobalt hue across many
values, with no second accent colour. Depth and light do the work instead of hue variety.

| Token | Value | Sampled from | Use |
| --- | --- | --- | --- |
| `--ink` | `#0C1330` | Sphere shadow | Dark bands, headings |
| `--cobalt` | `#0A3591` | Wordmark | Primary actions, accents |
| `--cobalt-lit` | `#0D36AA` | Sphere core | Gradient mesh |
| `--blue` | `#2E5FD4` | — | Interactive / hover |
| `--sky` | `#9FC6F1` | Sphere highlight | Glow, accents on dark |
| `--ivory` | `#FBFAF7` | — | Page background |
| `--ivory-2` | `#F4F1EA` | — | Alternating sections |

The site is light-dominant: ivory throughout, with deep cobalt bands used sparingly as
punctuation (the Problem section, impact quote, funding, footer and sub-page heroes).

Display type is **Fraunces** (variable, with the `WONK` axis on for distinctive letterforms);
body and UI are **Inter**. Breakpoints: 480 / 768 / 992 / 1152 / 1320. Navigation switches to
a hamburger below 1152px, above the layout breakpoint, because nine items plus the brand and
CTA need the extra room.

Visual devices, all pure CSS so they survive the Elementor rebuild: a fixed SVG film-grain
overlay, radial-gradient meshes on dark bands, the logo's sphere enlarged as the hero light
source, gradient-border feature cards, a scrolling marquee, staggered scroll reveals,
count-up statistics and parallax-lite on the hero device.

### Brand assets

| File | Use |
| --- | --- |
| `pearloxy-logo.png` | Full logo with tagline, on light |
| `pearloxy-logo-light.png` | Full logo with tagline, on dark — used in the footer |
| `pearloxy-logo-mark.png` | Sphere + wordmark, no tagline — used in the header |
| `pearloxy-logo-mark-light.png` | Same, knocked out white for dark backgrounds |

The tagline is illegible below about 60px tall, which is why the header uses the mark.

## Elementor mapping

| This site | Elementor widget |
| --- | --- |
| `.container`, `.row`, `.col-*` | Flex Container / Columns |
| `.iconbox`, `.flow__step` | Icon Box |
| `.card`, `.compare`, `.person` | Image Box / Icon Box |
| `.accordion` | Accordion |
| `.video` | Video (with image overlay) |
| `.gallery` | Gallery |
| `form[data-mailto-form]` | Form |
| `.spec` | Text Editor table |

No CSS Grid, canvas, WebGL or JS-driven layout is used anywhere.

## Forms

Static hosting has no form backend, so each form opens the visitor's mail client with every
answer pre-filled, addressed to `cathybertainembabazi@gmail.com`. In the WordPress rebuild,
replace each `<form data-mailto-form>` with an Elementor Form widget.

Anchor links such as `/contact/#subject=Hospital%20Pilot` pre-select the form's Subject field.

## Videos

Two YouTube videos are embedded as click-to-play facades — a local poster image plus a play
button — so nothing loads from YouTube until the visitor asks for it:

- `U_c3C8_FDGk` — *The Problem: Up to 40% Child Pneumonia Deaths are preventable*
- `SqK5JbHIvgY` — *The Solution: MPOS keeps the oxygen flowing during power blackouts*

---

## Imagery

Photographs of the team, the workshop and the device are PearlOxy's own and are used
throughout in preference to stock.

**Two stock files from `content/` are deliberately not used on the site:**

- `african-american-boy-patient-...-2MMY4NF.jpg` carries visible **Alamy watermarks** — it is
  an unlicensed comp. A de-watermarked copy of the same scene exists in `content/` as
  `DeWatermark.ai_1758032642689.jpeg`; licensing it properly is still worth doing.
- `istockphoto-2187445730-1024x1024.jpg` shows a man presenting a data chart, not a clinician,
  so it was replaced with PearlOxy's own workshop photography.

Before launch, confirm the licence for every remaining stock image: the `istockphoto-*` and
`freepik`-derived files in `content/` came in at preview sizes.

## A note on the figures

Numbers drawn from the PearlOxy pitch deck — the annual oxygen volume per unit and the figure
of 224 children — are presented throughout as **company projections**, each labelled as such and
accompanied by a disclosure that they are not independently verified medical evidence and have
not been validated in clinical trials. Market sizes are likewise presented as PearlOxy's own
stated estimates. Please keep that framing if you edit the copy.

## Deploying

Any static host works. For GitHub Pages, serve from the repository root on the default branch;
relative links resolve correctly under the `/PearlOxy/` sub-path. If you deploy to a custom
domain, update `SITE_URL` in `build.py` and re-run the build so canonicals, Open Graph URLs
and the sitemap point at the live host.
