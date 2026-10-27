# Headturner website

Single-page marketing site for Headturner (Thilak Sarda, LinkedIn ads for B2B SaaS and tech), built with Astro and published to GitHub Pages at headturner.io. The design was made in Figma by Otto. When you edit this site, keep it looking exactly like the same site.

## How the site is built

- `src/pages/index.astro`: the page. Sections in reading order, one component each.
- `src/components/`: one component per section (Hero, Plans, Faq, ...). Shared button: `TalkButton.astro`.
- `src/data/*.json`: all editable content (text, lists, links). `sections.json` lists every section in page order with its on/off switch. **Most requests are a change to one of these files.**
- `src/styles/global.css`: all styles and design tokens (`:root` at the top).
- `src/scripts/main.js`: all interactions (smooth scroll, nav, carousel, event, card stack, tilt effects). Uses GSAP, Lenis and vanilla-tilt from CDN scripts in `index.astro`.
- `public/assets/`: images and icons. In data files write them as `/assets/...`. In components wrap every image and internal link in `url()` from `src/lib/url.ts`, e.g. `src={url('/assets/logo-ink.svg')}`, so the site also works on a `github.io/<repo>/` preview address, not only on headturner.io.
- `design-source/`: HTML sources for generated images (ads, pipeline report, book cover). Not published.

After changing which sections are shown, run `npm run sections` and commit the updated `SECTIONS.md`.

The github.io preview shows every section (placeholders included); headturner.io follows the switches in `sections.json`. `npm run dev:all` does the same locally.

Commands: `npm install`, `npm run dev` (preview at localhost:4321), `npm run build`, `npm run check` (type check: run it after code changes and fix any errors). Every push to `main` builds and publishes the site through GitHub Actions in about two minutes.

## How to make changes

Always make changes through a pull request with a clear, descriptive title. Never push directly to the main branch. Explain each change in plain, non-technical language.

## Common changes

| To change | Edit |
|---|---|
| Upcoming event (date, place, text, link) | `src/data/event.json`. The date tile fills itself in, and the block hides the day after the event |
| FAQ, plans, "is this a fit" lists, problem cards, steps | the matching file in `src/data/` |
| Booking link for every "Let's talk" button | `bookingUrl` in `src/data/site.json` |
| Testimonials, results, ads | `testimonials.json`, `results.json`, `ads.json`, then switch the matching section on in `sections.json` |
| See what's on the page, show or hide a section | `src/data/sections.json` (the page's sections in order, each with `show: true` or `false`). Run `npm run sections` for an overview, which also updates `SECTIONS.md` |
| Hero, About, "What I believe" copy | the component in `src/components/` |

## Design rules: do not break the style

These come from the Figma design. Follow them on every change.

1. **Reuse, don't invent.** Use the existing classes in `global.css` and the existing components. Before adding CSS, check whether a class already does the job. Add a new component only when a new kind of section is really needed.
2. **Tokens only.** Use the CSS variables in `:root`: colours (`--ink`, `--coral`, `--blue`, `--pink-dark`, `--surface`, `--border`, `--text-muted`, ...), radii (`--radius-sm/md/lg/xl/full`), spacing (`--gutter`, `--section-y`, `--content`) and fonts (`--font-display`, `--font-sans`). Never write a raw hex colour, pixel radius or font in a component.
3. **Type.** Headings use `.display-m`, `.heading-s`; body text uses `.body-l` or the default size; labels use `.pill`. Fonts are Funnel Display (headings) and Funnel Sans (text). Do not add other fonts or sizes.
4. **Layout.** Every section sits in the same 1200px content column, inset by `--gutter`. Full-width panels use `.inset` and `.inset__panel`. Keep the spacing rhythm: do not add one-off margins or paddings between sections.
5. **Colour rules.** Never combine blue and orange/coral in the same component. Keep one primary call to action: "Let's talk". Quieter elements (event, playbook) must never compete with it.
6. **Copy voice.** First person ("I"), senior, direct, human, no hype and no filler. Plain language. Never use a middle dot (·) as a separator in any visible text.
7. **Accessibility is not optional.** Keep alt text on every image, visible focus states, keyboard access, sufficient contrast, and the `prefers-reduced-motion` behaviour. Buttons that open another site get `target="_blank"` with `rel="noopener noreferrer"` and a hidden "(opens in a new tab)" note. No dark patterns.
8. **Responsive.** Always check desktop (1440px) and mobile (390px) after a change. No horizontal scrolling.
9. **Don't invent content.** Never make up testimonials, results, client names, numbers or ads and show them as real. Placeholder sections stay hidden (`show: false` in `sections.json`) until the real content exists.

## Before launch

- Set `noindex` to `false` in `src/data/site.json` (and ask before doing it), so search engines can find the site.
- Replace the placeholders, then switch their flags on: testimonials, results, the pipeline report and the Playbook card (which also needs a real sign-up form and the playbook PDF).
- Fill in the FAQ's "[X weeks]", the booking link, the meetup sign-up link, the final logo lists, and the privacy page's company details.
