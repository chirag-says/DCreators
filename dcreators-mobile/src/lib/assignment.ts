/**
 * Assignment vocabulary and title resolution.
 *
 * A project carries three overlapping strings and the UI kept picking a
 * different one on each screen, which is how the consultant ended up staring
 * at "Hire Designer / Hire Designer" with no idea what the job actually was:
 *
 *   assignment_type     "Hire Designer"  — the ROLE. The consultant already
 *                                          knows their own role; never a title.
 *   assignment_details  ["Logo Design"]  — the CREATIVE ITEM. This is the title.
 *   assignment_brief    "logo Design"    — free text the client typed.
 *
 * Two of the four project-creation paths (bid accept, book consultant) used to
 * write `assignment_details: null`, so everything fell back to the role. Those
 * now capture a creative item up front; `getAssignmentTitle` still degrades
 * gracefully for rows written before that.
 */

/** Roles a client can hire for. Mirrors `bid_requests.category` semantics. */
export const HIRE_ROLES = [
  'Hire Creative Consultant',
  'Hire Photographer',
  'Hire Videographer',
  'Hire Designer',
  'Hire Sculptor',
  'Hire Artisan',
] as const;

/** The concrete deliverable. This is what becomes the assignment title. */
export const CREATIVE_ITEMS = [
  'Academic Event Photography',
  'Accessories & Jewelleries',
  'App Design',
  'Architectural Photography',
  'Birthday Photography',
  'Brand Identity',
  'Logo Design',
  'Social Media Kit',
  'Packaging Design',
  'Illustration',
  'UI/UX Design',
  'Product Photography',
  'Corporate Photography',
  'Art Direction',
  'Video Production',
] as const;

export type CreativeItem = (typeof CREATIVE_ITEMS)[number];

const TITLE_MAX = 60;

/** Collapse a free-text brief into something that can sit on one line. */
function briefAsTitle(brief: string | null | undefined): string | null {
  if (!brief) return null;
  const firstLine = brief.split('\n')[0].trim();
  if (!firstLine) return null;
  return firstLine.length > TITLE_MAX
    ? `${firstLine.slice(0, TITLE_MAX - 1).trimEnd()}…`
    : firstLine;
}

/**
 * The one place that decides what an assignment is called. Every surface that
 * shows a project name calls this so the consultant sees the same string on the
 * dashboard card, the detail screen, the work order, payment and history.
 */
export function getAssignmentTitle(project: {
  assignment_details?: string[] | null;
  assignment_brief?: string | null;
  assignment_type?: string | null;
} | null | undefined): string {
  if (!project) return 'Creative Project';

  const item = project.assignment_details?.[0]?.trim();
  if (item) return item;

  const fromBrief = briefAsTitle(project.assignment_brief);
  if (fromBrief) return fromBrief;

  return project.assignment_type?.trim() || 'Creative Project';
}
