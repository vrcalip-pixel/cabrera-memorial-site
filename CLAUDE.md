# Patrick Cabrera Memorial Site — Project Brief

## What this is
A small, fast, mobile-first website that is the single source of truth for the
funeral services of Patrick Reyes Cabrera (July 20, 1955 – September 24, 2026).
It replaces a static flyer. Family members will open it from a group text on
their phones; extended family is flying in from Guam and elsewhere.

The site exists to do four things, in this order:
1. Get people to the right place, on time, for three events (viewing, Funeral
   Mass, interment with military honors).
2. Let the family correct a date or address in ONE place and have it change
   everywhere.
3. Tell people who Patrick was — a whole person, not just "Army + Vikings."
4. Collect: memorial gifts, shared memories/condolences.

Owner: Vince Cabrera (site builder, eulogist). Content decisions come from the
family; Vince is the editor of record.

## Hard rules
- **Every fact comes from `data.json` or `content/*.md`.** Never hard-code a
  name, date, time, address, or phone number in a component. If it isn't in
  data.json, it is a `TBD` and should render as a clearly marked placeholder
  ("Details coming soon"), never as invented text.
- **Do not add facts.** Do not guess hymns, readings, reception details,
  parking, or family names. Leave them TBD and list them in the launch checklist.
- **No pallbearers section.** There are none. The casket is delivered to the
  church the morning of the Mass by Mountain View transport.
- **Catholic Mass of Christian Burial terminology.** Use the order of service in
  data.json verbatim. Do not substitute generic "Words of Welcome / Benediction"
  structure.
- **Tone:** warm, plain, dignified. Short sentences. No stock funeral phrases
  ("gone but not forgotten," "gained his wings"). The bio in `content/bio.md`
  sets the voice — match it.
- **Privacy:** no home addresses, no personal phone numbers, no mention of
  health history or cause of death. Priest names and the parish office number
  are fine.
- **Accessibility is non-negotiable:** WCAG 2.1 AA. Semantic HTML, real
  headings in order, alt text on every photo, 4.5:1 contrast, visible focus
  states, no text in images, reduced-motion respected. Older relatives are the
  audience; default body text ≥ 18px on mobile.

## Stack (keep it simple)
- **Astro** + **Tailwind** static site. `data.json` and `content/*.md` are read
  at build time. No CMS, no database, no auth.
- Deploy to **Netlify** (preferred — drag-and-drop or Git deploy, free, custom
  domain in minutes). GitHub Pages is the fallback.
- Forms (Share a Memory) via **Netlify Forms** or an embedded Google Form —
  whichever is faster. Submissions go to Vince's email.
- Donations: a single outbound link from `data.json.giving.url`. Do not build
  payment handling.
- Photos: `/public/photos/`. Optimize to ≤ 300 KB each; use Astro `<Image>`.
- One emoji favicon is fine; a photo-cropped favicon is nicer. No external
  fonts beyond Google Fonts (headline serif — see Design).

## Pages / sections (single page with anchors is acceptable; keep nav sticky)
1. **Home / hero** — portrait, full name, dates, one-line epitaph from
   data.json, three event cards (date · time · venue · "Get directions" ·
   "Add to calendar"). Burial card carries the arrive-early warning verbatim.
2. **Services** — full detail per event, embedded map link (Google/Apple), what
   to expect (rosary before Mass, open casket for family only until 10:00,
   military honors at the cemetery). Pull all copy from data.json.
3. **About Patrick** — `content/bio.md` rendered, then photo gallery
   (lightbox optional, not required).
4. **Program** — digital version of the printed program: order of service,
   readings, celebrants, acknowledgments. Printable with `@media print`.
5. **Share a Memory** — short form: name, relationship, memory (textarea),
   optional photo upload if Netlify Forms allows; otherwise text only.
6. **Give** — one paragraph + one button to `giving.url`. Hide the section
   entirely while `giving.url` is TBD.
7. **Family** (`/family`, unlisted, no password) — arrivals, who's staying
   where, contact for logistics. Only build if `family.show` is true.
8. **Updates** — a short dated changelog at the bottom of Services so people
   who already saved a screenshot know what changed.

## Design
- Match the Canva flyer the family already circulated: deep teal/navy
  background (`#1F3A48` family), warm off-white text (`#E6E6E6`), a
  high-contrast serif for headings (Playfair Display or Bodoni Moda), a clean
  humanist sans for body (Lato or Source Sans 3). Light-gray panel accents.
- Respect `prefers-color-scheme`: the dark palette is the default; provide a
  readable light fallback.
- Portrait in an arch/rounded-top frame echoes the flyer. Reuse the same photo.
- No animation beyond subtle fades. This is a memorial, not a product page.

## Launch checklist (block launch on items marked ⛔)
- ⛔ Viewing date and venue confirmed (`events.viewing`)
- ⛔ Burial venue confirmed as Tahoma National Cemetery (`events.interment`)
- ⛔ Portrait photo in `/public/photos/portrait.jpg`
- ⛔ `giving.url` set, or Give section hidden
- Rosary time (9:00 vs 9:15) and placement of Words of Remembrance confirmed
  with Father Tuan (`program.*`)
- Readers, readings, hymns filled in or section labeled "to be announced"
- "Survived by" names complete in `content/bio.md`
- Parish name in Piti verified with Uncle Joey (Assumption of Our Lady)
- Test on an iPhone over cellular; test "Add to calendar" on iOS and Android
- Run axe / Lighthouse accessibility; fix anything below AA
- Set `<title>` and Open Graph image so the link previews well in iMessage

## How to work with Vince
- He will paste updates from the family and from Father Tuan as plain text.
  Apply them to `data.json` / `content/*.md` only, then rebuild. Confirm what
  changed in one line.
- Prefer the smallest change. He is shipping this in days, not weeks.
