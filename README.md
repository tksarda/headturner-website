# Headturner website

Single-page site for [Headturner](https://www.linkedin.com/in/thilaksarda/), built from the Figma design with [Astro](https://astro.build) and published to GitHub Pages at headturner.io.

**Status: pre-launch.** The site is set to `noindex`, and these sections are hidden until real content exists (switches in `src/data/sections.json`, overview in `SECTIONS.md`):

- Testimonials, results cards, ads carousel and pipeline report (placeholder content)
- The hero's third proof point (a result)
- The Playbook card (the playbook and its sign-up form don't exist yet)

## Run it locally

```sh
npm install
npm run dev      # preview at http://localhost:4321
npm run build    # outputs the site to dist/
npm run check    # type-checks the code; should report 0 errors
npm run sections # prints which sections are shown or hidden, and updates SECTIONS.md
```

Needs Node 22.23 or newer.

## Where things live

| Folder | What's in it |
|---|---|
| `src/data/` | All editable content: text, lists and links. `sections.json` lists the page's sections in order, with on/off switches |
| `src/components/` | One component per section of the page |
| `src/styles/global.css` | All styles and design tokens |
| `src/scripts/main.js` | All interactions |
| `public/assets/` | Images and icons |
| `design-source/` | HTML sources for generated images (ads, pipeline report, book cover). Not published |

See `CLAUDE.md` for the design rules to follow when editing, with Claude or by hand.

## Publishing

Every push to `main` builds the site and publishes it through GitHub Actions (`.github/workflows/deploy.yml`).

Until a custom domain is set, the site is published at `https://<github-username>.github.io/headturner-website/`. The workflow reads the address from the Pages settings, so the same code works there and on headturner.io.

One-time setup in the GitHub repository:

1. **Settings, Pages, Source:** choose **GitHub Actions**.
2. **Settings, Pages, Custom domain:** `headturner.io`, then tick **Enforce HTTPS** once it's available.
3. At the domain provider (Porkbun), the root and `www` DNS records point to `<github-username>.github.io`.

## Before launch

- [ ] Replace the placeholder content and switch the matching sections on in `src/data/sections.json`
- [ ] Set `noindex` to `false` in `src/data/site.json`
- [ ] Booking link (`bookingUrl` in `src/data/site.json`) and the meetup sign-up link (`src/data/event.json`)
- [ ] FAQ: replace "[X weeks]" in the first answer (`src/data/faq.json`)
- [ ] Final logo lists, with logo files (`src/data/logos.json`)
- [ ] Privacy page: company details, address, VAT number and contact email (`src/pages/privacy.astro`)
- [ ] The playbook PDF and a working sign-up form, then switch on the Playbook card
