// Reads src/data/sections.json: the page's sections, in order, with their on/off switches.
import data from '../data/sections.json';

export type SectionItem = (typeof data.items)[number];

/** Is this section (or part of a section) switched on? Unknown keys count as off. */
export const isShown = (key: string): boolean => data.items.find((i) => i.key === key)?.show === true;

/** The page's top-level sections, in page order. */
export const pageSections: SectionItem[] = data.items.filter((i) => i.type === 'section');
