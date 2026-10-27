import { defineConfig } from 'astro/config';

// Where the site lives. On headturner.io it's the root of the domain. The deploy workflow
// sets SITE_URL and SITE_BASE from the repository's Pages settings, so a preview on
// <user>.github.io/<repo>/ works too (before the custom domain is connected).
export default defineConfig({
  site: process.env.SITE_URL || 'https://headturner.io',
  base: process.env.SITE_BASE || '/',
});
