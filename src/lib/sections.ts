// Reads src/data/sections.json: the page's sections, in order, with their on/off switches.
import data from '../data/sections.json';

export type SectionItem = (typeof data.items)[number];

// Preview mode: PUBLIC_SHOW_ALL=true shows every section, placeholders included. The deploy workflow turns it on
// for the github.io preview address only, so headturner.io always follows the switches in sections.json.
const showAll = import.meta.env.PUBLIC_SHOW_ALL === 'true';

/** Is this section (or part of a section) switched on? Unknown keys count as off. */
export const isShown = (key: string): boolean => showAll || data.items.find((i) => i.key === key)?.show === true;

/** The page's top-level sections, in page order. */
export const pageSections: SectionItem[] = data.items.filter((i) => i.type === 'section');
