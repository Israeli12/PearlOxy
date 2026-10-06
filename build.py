#!/usr/bin/env python3
"""
PearlOxy Uganda Limited static site builder.

Wraps each body partial in src/ with the shared <head>, header and footer so
metadata, navigation and the footer can never drift between pages.

    python build.py

Output: index.html plus <slug>/index.html for every other page, and sitemap.xml.
Every generated file is plain, dependency-free HTML.
"""

import os
import re
import datetime

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, "src")
SITE_URL = "https://israeli12.github.io/PearlOxy"
EMAIL = "cathybertainembabazi@gmail.com"
LINKEDIN = "https://www.linkedin.com/company/pearloxy-uganda-limited/"

# ---------------------------------------------------------------- page registry
# slug "" = homepage. nav = key used to mark the active nav item.
PAGES = [
    {
        "slug": "", "file": "home", "nav": "home",
        "title": "PearlOxy Uganda | Portable Oxygen Backup for Hospitals",
        "desc": "PearlOxy builds the MPOS device, a portable oxygen buffer that keeps "
                "oxygen therapy flowing when power fails in low-resource hospitals across Uganda.",
        "og": "mpos-device-hero.png",
        "h1": "Uninterrupted Oxygen. When It Matters Most.",
    },
    {
        "slug": "about", "file": "about", "nav": "about",
        "title": "About PearlOxy | Medical Oxygen Technology Built in Uganda",
        "desc": "PearlOxy Uganda Limited is closing the medical oxygen gap in low-resource "
                "healthcare with locally built technology, starting in Uganda and scaling across Africa.",
        "og": "mpos-cylinder-fabrication-kampala.jpg",
        "h1": "Solving a critical healthcare gap with a scalable technology model",
    },
    {
        "slug": "mpos", "file": "mpos", "nav": "mpos",
        "title": "MPOS Device | Uninterruptible Oxygen Supply System | PearlOxy",
        "desc": "The MPOS device stores oxygen while power is available and automatically "
                "supplies up to 3 patients for up to 2 hours during power interruptions.",
        "og": "mpos-device-hero.png",
        "h1": "MPOS: the portable oxygen safety net for any hospital",
    },
    {
        "slug": "impact", "file": "impact", "nav": "impact",
        "title": "Impact | Keeping Oxygen Flowing During Power Cuts | PearlOxy",
        "desc": "How PearlOxy's MPOS device is designed to reduce interruptions to oxygen "
                "therapy caused by power outages, with the company's stated impact projections.",
        "og": "child-patient-oxygen-therapy.jpg",
        "h1": "When the power goes out, we keep the oxygen flowing",
    },
    {
        "slug": "market", "file": "market", "nav": "market",
        "title": "Market Opportunity | Medical Oxygen in Africa | PearlOxy",
        "desc": "PearlOxy's stated market estimates: a $200M addressable market across "
                "Sub-Saharan Africa, $15M serviceable market in Uganda, and a $1M Central Region target.",
        "og": "hospital-ward-low-resource.jpg",
        "h1": "Market Opportunity",
    },
    {
        "slug": "team", "file": "team", "nav": "team",
        "title": "Our Team | Biomedical Engineers Behind PearlOxy Uganda",
        "desc": "Meet the founders, engineers and independent advisory board building "
                "PearlOxy's MPOS oxygen backup technology in Kampala, Uganda.",
        "og": "pearloxy-founder-pitching.jpg",
        "h1": "The team behind MPOS",
    },
    {
        "slug": "partners", "file": "partners", "nav": "partners",
        "title": "Partnerships | MPOS Distribution in East Africa | PearlOxy",
        "desc": "PearlOxy works with government, NGOs, aid organisations, private healthcare "
                "providers and distributors to expand access to reliable hospital oxygen backup.",
        "og": "mpos-ministry-of-health-showcase.jpg",
        "h1": "Partner With PearlOxy",
    },
    {
        "slug": "investors", "file": "investors", "nav": "investors",
        "title": "Investors | $200,000 Pre-Seed | PearlOxy Uganda Limited",
        "desc": "PearlOxy is raising a $200,000 pre-seed round for roughly 18 months of "
                "runway to fund hospital pilots, clinical trials and certification.",
        "og": "mpos-device-hero.png",
        "h1": "Invest in uninterrupted oxygen",
    },
    {
        "slug": "contact", "file": "contact", "nav": "contact",
        "title": "Contact PearlOxy Uganda Limited | Kampala, Uganda",
        "desc": "Contact PearlOxy Uganda Limited in Kampala about product enquiries, "
                "hospital pilots, partnerships, distribution or investment.",
        "og": "mpos-cylinder-fabrication-kampala.jpg",
        "h1": "Talk to PearlOxy",
    },
]

NAV = [
    ("home", "index.html", "Home"),
    ("about", "about/", "About"),
    ("mpos", "mpos/", "MPOS"),
    ("impact", "impact/", "Impact"),
    ("market", "market/", "Market"),
    ("team", "team/", "Team"),
    ("partners", "partners/", "Partners"),
    ("investors", "investors/", "Investors"),
    ("contact", "contact/", "Contact"),
]

# ---------------------------------------------------------------- shared markup

HEAD = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="canonical" href="{canonical}">
<meta name="robots" content="index, follow">
<meta name="author" content="PearlOxy Uganda Limited">
<meta name="theme-color" content="#0A2540">

<meta property="og:type" content="website">
<meta property="og:site_name" content="PearlOxy Uganda Limited">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="{ogurl}">
<meta property="og:locale" content="en_UG">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{desc}">
<meta name="twitter:image" content="{ogurl}">

<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Cdefs%3E%3CradialGradient id='g' cx='32%25' cy='30%25'%3E%3Cstop offset='0' stop-color='%237FE3F5'/%3E%3Cstop offset='.32' stop-color='%2322C7E0'/%3E%3Cstop offset='.64' stop-color='%230B7FD4'/%3E%3Cstop offset='1' stop-color='%23064F86'/%3E%3C/radialGradient%3E%3C/defs%3E%3Ccircle cx='16' cy='16' r='15' fill='url(%23g)'/%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="{root}assets/css/main.css">
<script type="application/ld+json">{jsonld}</script>
</head>
<body>
<a class="skip-link" href="#main">Skip to main content</a>
"""

HEADER = """<header class="site-header">
  <div class="container">
    <div class="header-inner">
      <a class="brand" href="{root}index.html" aria-label="PearlOxy Uganda Limited, home">
        <img src="{root}assets/img/pearloxy-logo-mark.png" alt="PearlOxy, The Future of Oxygen Storage" width="750" height="175">
      </a>
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="primary-nav" aria-label="Open navigation menu">
        <span></span><span></span><span></span>
      </button>
      <nav class="nav" id="primary-nav" aria-label="Primary">
        {navlinks}
        <a class="btn btn--primary btn--sm" href="{root}partners/">Partner With Us</a>
      </nav>
      <div class="header-cta">
        <a class="btn btn--primary btn--sm" href="{root}partners/">Partner With Us</a>
      </div>
    </div>
  </div>
</header>
<main id="main">
"""

FOOTER = """</main>
<footer class="site-footer">
  <div class="container">
    <div class="row row--gap">
      <div class="col-4 footer-about">
        <a class="brand" href="{root}index.html">
          <img src="{root}assets/img/pearloxy-logo-light.png" alt="PearlOxy, The Future of Oxygen Storage" width="750" height="175">
        </a>
        <p>Portable oxygen backup technology, locally built in Kampala, designed to keep
          oxygen therapy flowing when power fails.</p>
        <div class="footer-social">
          <a href="{linkedin}" target="_blank" rel="noopener noreferrer" aria-label="PearlOxy on LinkedIn">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13M7.12 20.45H3.55V9h3.57zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0"/></svg>
          </a>
          <a href="mailto:{email}" aria-label="Email PearlOxy">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-10 6L2 7"/></svg>
          </a>
        </div>
      </div>
      <div class="col-3">
        <h2>Explore</h2>
        <ul class="footer-links">
          <li><a href="{root}about/">About PearlOxy</a></li>
          <li><a href="{root}mpos/">The MPOS Device</a></li>
          <li><a href="{root}impact/">Impact</a></li>
          <li><a href="{root}market/">Market Opportunity</a></li>
        </ul>
      </div>
      <div class="col-3">
        <h2>Work With Us</h2>
        <ul class="footer-links">
          <li><a href="{root}team/">Our Team</a></li>
          <li><a href="{root}partners/">Partnerships</a></li>
          <li><a href="{root}investors/">Investors</a></li>
          <li><a href="{root}contact/">Contact</a></li>
        </ul>
      </div>
      <div class="col-3">
        <h2>Contact</h2>
        <ul class="footer-links">
          <li>PearlOxy Uganda Limited</li>
          <li>Kampala, Uganda</li>
          <li><a href="mailto:{email}">{email}</a></li>
          <li><a href="{linkedin}" target="_blank" rel="noopener noreferrer">@pearloxy-uganda-limited</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; {year} PearlOxy Uganda Limited. All rights reserved.</p>
      <p>Figures attributed to the PearlOxy pitch deck are company projections, not independently verified data.</p>
    </div>
  </div>
</footer>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js" defer></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js" defer></script>
<script src="{root}assets/js/main.js" defer></script>
<script src="{root}assets/js/animations.js" defer></script>
</body>
</html>
"""

JSONLD = """{{
"@context":"https://schema.org",
"@type":"Organization",
"name":"PearlOxy Uganda Limited",
"alternateName":"PearlOxy",
"url":"{site}/",
"logo":"{site}/assets/img/mpos-device-product.png",
"email":"{email}",
"description":"PearlOxy develops the MPOS device, a portable oxygen buffer that keeps oxygen therapy flowing during power outages in low-resource hospitals.",
"address":{{"@type":"PostalAddress","addressLocality":"Kampala","addressCountry":"UG"}},
"sameAs":["{linkedin}"],
"makesOffer":{{"@type":"Offer","itemOffered":{{"@type":"Product","name":"MPOS, Mobile Portable Oxygen Storage","description":"Uninterruptible oxygen supply system that stores oxygen while power is available and delivers it to up to 3 patients for up to 2 hours during power interruptions."}},"price":"2000","priceCurrency":"USD"}}
}}"""


def nav_links(active, root):
    out = []
    for key, href, label in NAV:
        cls = ' class="is-active"' if key == active else ""
        aria = ' aria-current="page"' if key == active else ""
        out.append('<a href="{r}{h}"{c}{a}>{l}</a>'.format(r=root, h=href, c=cls, a=aria, l=label))
    return "\n        ".join(out)


def build():
    year = datetime.date.today().year
    written = []

    for page in PAGES:
        slug = page["slug"]
        root = "" if slug == "" else "../"
        canonical = SITE_URL + "/" + (slug + "/" if slug else "")
        ogurl = SITE_URL + "/assets/img/" + page["og"]

        partial_path = os.path.join(SRC, page["file"] + ".html")
        with open(partial_path, encoding="utf-8") as fh:
            body = fh.read()
        body = body.replace("{{ROOT}}", root).replace("{{EMAIL}}", EMAIL).replace("{{LINKEDIN}}", LINKEDIN)

        html = (
            HEAD.format(
                title=page["title"], desc=page["desc"], canonical=canonical,
                ogurl=ogurl, root=root,
                jsonld=JSONLD.format(site=SITE_URL, email=EMAIL, linkedin=LINKEDIN),
            )
            + HEADER.format(root=root, navlinks=nav_links(page["nav"], root))
            + body
            + FOOTER.format(root=root, email=EMAIL, linkedin=LINKEDIN, year=year)
        )

        out_dir = ROOT if slug == "" else os.path.join(ROOT, slug)
        os.makedirs(out_dir, exist_ok=True)
        out_path = os.path.join(out_dir, "index.html")
        with open(out_path, "w", encoding="utf-8", newline="\n") as fh:
            fh.write(html)

        # Sanity checks the quality pass relies on.
        h1s = re.findall(r"<h1[ >]", html)
        assert len(h1s) == 1, "%s has %d <h1> tags (expected 1)" % (out_path, len(h1s))
        imgs = re.findall(r"<img\b[^>]*>", html)
        for img in imgs:
            assert 'alt="' in img, "%s has an <img> without alt text: %s" % (out_path, img[:90])

        written.append((os.path.relpath(out_path, ROOT), canonical, len(html)))

    # sitemap.xml
    today = datetime.date.today().isoformat()
    urls = "\n".join(
        '  <url><loc>{u}</loc><lastmod>{d}</lastmod><priority>{p}</priority></url>'.format(
            u=SITE_URL + "/" + (p["slug"] + "/" if p["slug"] else ""),
            d=today, p="1.0" if p["slug"] == "" else "0.8")
        for p in PAGES
    )
    with open(os.path.join(ROOT, "sitemap.xml"), "w", encoding="utf-8", newline="\n") as fh:
        fh.write('<?xml version="1.0" encoding="UTF-8"?>\n'
                 '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
                 + urls + "\n</urlset>\n")

    with open(os.path.join(ROOT, "robots.txt"), "w", encoding="utf-8", newline="\n") as fh:
        fh.write("User-agent: *\nAllow: /\n\nSitemap: %s/sitemap.xml\n" % SITE_URL)

    for rel, url, size in written:
        print("  %-26s %6.1f KB   %s" % (rel, size / 1024, url))
    print("\n%d pages + sitemap.xml + robots.txt" % len(written))


if __name__ == "__main__":
    build()
