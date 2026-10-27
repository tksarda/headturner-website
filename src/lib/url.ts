// Prefixes a site-root path (e.g. "/assets/logo-ink.svg") with the site's base path.
// On headturner.io the base is "/", so paths stay as they are. On a github.io preview
// the site lives under "/headturner-website/", and this keeps images and links working there too.
const base = import.meta.env.BASE_URL.replace(/\/$/, '');

export const url = (path: string): string => (path.startsWith('/') ? base + path : path);
