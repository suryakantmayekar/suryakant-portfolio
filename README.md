# Suryakant Mayekar — Freelance Profile Website

A modern, responsive, client-facing freelance profile site built with **HTML, SCSS and vanilla JavaScript** — no frameworks, no runtime dependencies.

## Features

- 🎨 Warm & premium design (paper background, coffee/amber accent)
- 🔤 Google Fonts: **Sora** (headings) + **Inter** (body)
- 📱 Fully responsive (mobile nav, fluid type with `clamp()`, adaptive grids)
- ✨ On-scroll reveal animations via `IntersectionObserver` (fade / slide / scale variants + stagger delays)
- 📊 Animated hero counters, scroll progress bar, infinite tech marquee
- 🧭 Sticky header with scroll state + active-section nav highlighting
- 📬 Netlify Forms contact form with inline validation, spam honeypot and success/error states (falls back to `mailto:` in local development)
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

## Contact form (Netlify Forms)

The contact form posts to **Netlify Forms** — no backend or third-party service needed.

1. Deploy the site (the form is detected at deploy time because of `data-netlify="true"`).
2. In Netlify: **Forms → contact → Form notifications → Add notification → Email notification**
3. Set the recipient to `suryakantmayekar@gmail.com` and save.
4. Submit the form once on the live site to test; submissions appear under **Forms** in Netlify.

Notes:
- Netlify Forms works **only on the deployed site** — locally the form opens your email app instead.
- A hidden `bot-field` honeypot + Netlify's built-in spam filtering protect against bots.
- The free plan includes a monthly submission allowance (100 submissions/month at time of writing).

## Editing content

- **Text, projects, pricing** → `index.html`
- **Colors & fonts** → `scss/_variables.scss` (then `npm run build`)
- **Remaining placeholders** → search `index.html` for `PLACEHOLDER`:
  - Phone/WhatsApp: `+91 XXXXX XXXXX`
  - LinkedIn: profile URL in the contact section
- **Email** is already set to `suryakantmayekar@gmail.com` in `index.html`, `js/main.js`, and Netlify form notifications.

## Adding a new scroll animation

Add `data-reveal` to any element (optionally with a variant and delay):

```html
<div data-reveal="left" style="--reveal-delay:150ms">…</div>
```

Variants: `fade`, `left`, `right`, `scale`, `zoom` (default = fade-up).
