# Suryakant Mayekar — Freelance Profile Website

A modern, responsive, client-facing freelance profile site built with **HTML, SCSS and vanilla JavaScript** — no frameworks, no runtime dependencies.

Two complete designs are included:

| Version | Location | Theme |
|---|---|---|
| **Main (default)** | `/` | Dark editorial — black, gray, `#455CE9` blue, Space Grotesk + Inter |
| **Archive** | `/v3/` | Warm & premium — paper + amber, Sora + Inter |

Both share the same content, contact details and Netlify form (`name="contact"`).

## Features

- 🎨 Dark editorial design with numbered sections, oversized type and a blue accent
- 🔤 Google Fonts: **Space Grotesk** (headings) + **Inter** (body)
- 👤 Profile photo in the hero with a blue offset frame
- 📱 Fully responsive (mobile menu, fluid `clamp()` type, adaptive grids)
- ✨ On-scroll reveal animations via `IntersectionObserver` (blur-rise), animated counters, blue ticker, scroll progress
- 🖱️ Pointer-following glow in the hero (desktop only) and sticky "Why me" column
- 🧭 Sticky header with scroll state + active-section highlighting
- 🔽 Custom accessible dropdown (keyboard + mouse) that progressively enhances a native `<select>`
- 📬 Netlify Forms contact form with inline validation, honeypot and success/error states (falls back to `mailto:` in local development)
- ♿ Accessible: skip link, focus states, ARIA, `prefers-reduced-motion`
- 🔍 SEO basics: meta description, Open Graph, JSON-LD Person schema

## Getting started

```bash
npm install      # sass compiler + playwright-core (dev only)
npm run build    # compiles both: scss/ → css/ and v3/scss/ → v3/css/
npm run dev      # watch + recompile the main site
npm run dev:v3   # watch + recompile the archive version
npm run serve    # preview server
```

You can also open `index.html` directly — the compiled CSS is committed.

### Preview locally

```bash
npm run serve
```

- Main site → **http://localhost:3000/**
- Archive → **http://localhost:3000/v3/**

The preview server (`scripts/preview.mjs`) redirects directory URLs without a trailing slash (`/v3` → `/v3/`) so relative asset paths always resolve.

### UI checks

```bash
npm run check:ui   # headless Chrome checks + screenshots in /review
```

Covers load/CSS errors, horizontal overflow, stat numbers, pricing badge overlap, service spacing, custom dropdown, mobile menu and back-to-top.

## Project structure

```
index.html            # main site markup
scss/
  main.scss           # entry point
  _tokens.scss        # colors, fonts, breakpoints
  _base.scss          # reset, typography, layout, section headings
  _components.scss    # buttons, links, tags
  _header.scss        # fixed bar, nav, mobile menu
  _hero.scss          # hero, headline, portrait, pointer glow
  _sections.scss      # ticker, stats, services, work, process, why, pricing, footer
  _contact.scss       # contact section, form, custom select
  _motion.scss        # scroll-reveal system
css/main.css          # compiled (do not edit directly)
js/main.js            # all interactivity
assets/profile.jpg    # hero portrait
v3/                   # archived warm version (same structure)
scripts/
  preview.mjs         # dependency-free preview server
  check-ui.mjs        # headless UI checks
netlify.toml          # build + headers
```

## Contact form (Netlify Forms)

The contact form posts to **Netlify Forms** — no backend or third-party service needed.

1. Deploy the site (the form is detected at deploy time because of `data-netlify="true"`).
2. In Netlify: **Forms → contact → Form notifications → Add notification → Email notification**
3. Set the recipient to `suryakantmayekar@gmail.com` and save.
4. Submit the form once on the live site to test; submissions appear under **Forms** in Netlify.

Notes:
- The custom dropdown keeps a hidden native `<select name="topic">` in sync, so Netlify still receives the value; without JavaScript the native select is shown instead.
- Netlify Forms works **only on the deployed site** — locally the form opens your email app instead.
- A hidden `bot-field` honeypot + Netlify's built-in spam filtering protect against bots.
- The free plan includes a monthly submission allowance (100 submissions/month at time of writing).

## Editing content

- **Text, projects, pricing** → `index.html` (main) or `v3/index.html` (archive)
- **Colors & fonts (main)** → `scss/_tokens.scss` (then `npm run build`)
- **Colors & fonts (archive)** → `v3/scss/_variables.scss`
- **Contact details** are live in `index.html`:
  - Email: `suryakantmayekar@gmail.com`
  - Phone / WhatsApp: `+91 98709 17491` (`tel:+919870917491`)
  - LinkedIn: `https://www.linkedin.com/in/suryakant-mayekar-45994b12/`

## Animations

Add `data-reveal` to any element; the optional delay is a CSS custom property:

```html
<div data-reveal style="--d:120ms">…</div>
```

The main site uses a blur-rise reveal. The archive version (`/v3/`) additionally supports `fade`, `left`, `right`, `scale` and `zoom` variants via `data-reveal="..."` plus `--reveal-delay`.
