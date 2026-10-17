# Suryakant Mayekar — Freelance Profile Website

A modern, responsive, client-facing freelance profile site built with **HTML, SCSS and vanilla JavaScript** — no frameworks, no runtime dependencies.

## Features

- 🎨 Warm & premium design (paper background, coffee/amber accent)
- 🔤 Google Fonts: **Sora** (headings) + **Inter** (body)
- 📱 Fully responsive (mobile nav, fluid type with `clamp()`, adaptive grids)
- ✨ On-scroll reveal animations via `IntersectionObserver` (fade / slide / scale variants + stagger delays)
- 📊 Animated hero counters, scroll progress bar, infinite tech marquee
- 🧭 Sticky header with scroll state + active-section nav highlighting
- 📬 Contact form that opens a pre-filled `mailto:` (nothing stored, no backend needed)
- ♿ Accessible: skip link, focus rings, ARIA states, `prefers-reduced-motion` support
- 🔍 SEO basics: meta description, Open Graph, JSON-LD Person schema

## Getting started

```bash
npm install      # installs the sass compiler (dev-only)
npm run build    # compiles scss/main.scss → css/main.css
npm run dev      # recompile on change
npm run serve    # preview at http://localhost:3000
```

You can also simply open `index.html` in a browser — `css/main.css` is committed.

## Project structure

```
index.html          # all content & markup
scss/
  main.scss         # entry point
  _variables.scss   # colors, fonts, breakpoints, tokens
  _mixins.scss      # respond(), focus-ring()
  _base.scss        # reset, typography, layout, shared components
  _buttons.scss     # button variants
  _nav.scss         # header, nav, mobile menu
  _hero.scss        # hero, profile card, floating chips
  _marquee.scss     # tech marquee
  _services.scss    # service cards + lifecycle mini-flow
  _process.scss     # 9-step lifecycle
  _work.scss        # featured projects + other work
  _why.scss         # why-me cards + skill cloud
  _pricing.scss     # pricing packages
  _contact.scss     # contact section + form
  _footer.scss
  _animations.scss  # scroll reveal system
css/main.css        # compiled output (do not edit directly)
js/main.js          # all interactivity
```

## Editing content

- **Text, projects, pricing** → `index.html`
- **Colors & fonts** → `scss/_variables.scss` (then `npm run build`)
- **Placeholder contact details** → search `index.html` & `js/main.js` for `PLACEHOLDER`:
  - Email: `hello@suryakantmayekar.com`
  - Phone/WhatsApp: `+91 XXXXX XXXXX`
  - LinkedIn: profile URL in the contact section

## Adding a new scroll animation

Add `data-reveal` to any element (optionally with a variant and delay):

```html
<div data-reveal="left" style="--reveal-delay:150ms">…</div>
```

Variants: `fade`, `left`, `right`, `scale`, `zoom` (default = fade-up).
