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

Owner: Vince Calip (site builder, eulogist). Content decisions come from the
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
- **Catholic Mass of Christian Burial terminology.** The event is called "Funeral Mass" (what the family calls it); "Mass of Christian Burial" appears once, as the formal name heading the program. Never "Mass of Catholic Burial" (Vince, 2026-10-11). Use the order of service in
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

## Current state (read this first)
A working first draft already exists: `index.html` at the repo root, built as a
single self-contained file (inline CSS, inline JS, two base64-embedded photos).
It is live for the family to review. Do NOT rebuild it from scratch or migrate
it to a framework unless Vince asks. Your job is to make it easy to edit and
deploy, then apply updates as they come in.

First task when you open this repo:
1. Move the two embedded base64 images out of `index.html` into
   `/photos/family.jpg` and `/photos/portrait.jpg` and reference them by path.
2. Move the inline `<style>` into `/styles.css`. Keep the HTML otherwise intact.
3. Make `data.json` the source of truth: either a tiny build script
   (`node build.js` renders `index.html` from `template.html` + `data.json`), or
   clearly commented HTML blocks that map 1:1 to data.json keys. Vince's
   preference is the build script — he wants to change a date in one place.
4. Add a `netlify.toml` and deploy. Confirm the live URL works on a phone.
   (Done on GitHub Pages instead: https://cabrera-memorial.com — custom domain
   via Namecheap DNS, 2026-10-11. The old github.io link redirects there.)

## Stack (keep it simple)
- **Plain static HTML/CSS/JS.** No framework. `data.json` and `content/*.md`
  feed a small Node build script. No CMS, no database, no auth.
- Deploy to **Netlify** (preferred — drag-and-drop or Git deploy, free, custom
  domain in minutes). GitHub Pages is the fallback.
- Share a Memory posts to **Formspree** (`data.json.memories.endpoint`), which
  emails the family. Replaced the old `mailto:` on 2026-10-11; no email address
  is stored on the site. (Netlify Forms not used: the site is on GitHub Pages.)
- Donations: a single outbound link from `data.json.giving.url`. Do not build
  payment handling.
- Photos: `/public/photos/`. Optimize to ≤ 300 KB each; use Astro `<Image>`.
- One emoji favicon is fine; a photo-cropped favicon is nicer. No external
  fonts beyond Google Fonts (headline serif — see Design).

## Pages / sections (single page with anchors is acceptable; keep nav sticky)
Order on the page: Services and Funeral Mass Program side by side on desktop (stacked on
phones), then About Patrick (Vince, 2026-10-11).
1. **Home / hero** — portrait, full name, dates, one-line epitaph from
   data.json, three event cards (date · time · venue · "Get directions" ·
   "Add to calendar"). Burial card carries the arrive-early warning verbatim.
2. **Services** — full detail per event, embedded map link (Google/Apple), what
   to expect (rosary before Mass, open casket for family only until 10:00,
   military honors at the cemetery). Pull all copy from data.json.
3. **About Patrick** — `content/bio.md` rendered, then photo gallery
   (lightbox optional, not required).
4. **Funeral Mass Program** — digital version of the printed program: order of service,
   readings, celebrants, acknowledgments. Printable with `@media print`.
   Program booklet subpage: `/program/` (program/index.html + book.css), three
   pages only — cover with the hero family photo, Order of Service, Readings
   (trimmed at Vince's request, 2026-10-12). The PDF download is generated from
   it with `program/make-pdf.ps1` (headless Edge, half-letter); rerun after any edit.
5. **Share a Memory** — short form: name, relationship, memory (textarea),
   optional photo upload if Netlify Forms allows; otherwise text only.
6. **Give** — one paragraph + one button to `giving.url`. Hide the section
   entirely while `giving.url` is TBD.
7. **Family** (`/family`, unlisted, no password) — arrivals, who's staying
   where, contact for logistics. Only build if `family.show` is true.
8. ~~Updates~~ — removed at Vince's request. Don't add it back.

## Design (already decided — do not change without asking)
- Palette is in `data.json.site.design`. Base plum `#4E2951` was sampled from
  Patrick's shirt in the hero photo; it is NOT the Canva flyer teal and NOT the
  Vikings' official purple. Gold `#FFC62F` is reserved for primary action buttons (When and where, Send to
  the family, Give through GoFundMe — Vince, 2026-10-11) and the burial "arrive
  early" warning.
- Type: Fraunces (display, weight 300) + Lora (body, 19px). Google Fonts.
- Hero: the family photo, uncropped at its native 3:2 ratio. Phones: full width
  with the plum fading up from the bottom into the name. Desktop (≥960px): two
  equal columns — name, dates, epitaph and buttons on the left, photo on the
  right, no fades or blended edges (Vince, 2026-10-11). Built as a `.slides`
  container with one `.slide` so a carousel can be added later.
- No pallbearers section. No Updates section. No portrait in About until Vince
  supplies a better one.
- Do not use the Seal of Guam or the Guam flag (it contains the seal): use
  requires a permit under 1 GCA § 414. Vince decided against it (2026-10-11).
  The latte stone icon is the Guam/CHamoru symbol in the header.
- No animation beyond subtle fades. This is a memorial, not a product page.
  One approved exception (Vince, 2026-10-11): the dove home icon flaps twice on
  page load (under 2 s) and twice on hover/focus. Never a continuous loop (WCAG
  2.2.2); off under prefers-reduced-motion.

## Launch checklist (block launch on items marked ⛔)
- ✅ Viewing confirmed: Wed Oct 14, Mountain View Funeral Home, Lakewood
- ✅ Burial venue confirmed as Tahoma National Cemetery (`events.interment`)
- Higher-resolution copy of the hero family photo (current one is 960×640)
- A better portrait for the About section
- Photo carousel in About (after the bio): tabled 2026-10-11. Vince reviewed the
  shared Google Photos album and chose none; waiting for other photos. Plan: no
  autoplay, prev/next + swipe, alt text on each, ≤300 KB, check with parents
  before using photos of young children.
- ✅ `giving.url` set to the sister's GoFundMe (2026-10-11). Still confirm the
  purposes line and the "card at the viewing" line with the family
- ✅ Order of service confirmed with Darlene (Lazarus Ministry), 2026-10-12: Vince's
  words of remembrance open the service before Mass; family may speak after
  Communion when Fr. Tuan invites; Song of Farewell; reception in the church hall.
  Rosary time (9:00) not discussed: still to confirm.
- Readings: ✅ Wisdom 3:1–9, Psalm 23 (The Lord Is My Shepherd), Romans 6:3–4, 8–9.
  Second reader: Isaac Cabrera. Still TBD: Gospel passage, first reader, prayer texts (Vince asking Mary), hymn titles and the singers' full names (Vince is asking).
- "Survived by" names in `content/bio.md`: children added 2026-10-12 (Gina, Bella,
  Vincent, Isaac, Roxy, Monique, oldest to youngest); grandchildren and siblings
  still unnamed by choice
- Parish name in Piti verified with Uncle Joey (Assumption of Our Lady)
- Test on an iPhone over cellular; test "Add to calendar" on iOS and Android
- Run axe / Lighthouse accessibility; fix anything below AA
- Set `<title>` and Open Graph image so the link previews well in iMessage

## How to work with Vince
- He will paste updates from the family and from Father Tuan as plain text.
  Apply them to `data.json` / `content/*.md` only, then rebuild. Confirm what
  changed in one line.
- Program/service updates must land everywhere they appear: `data.json`
  (event cards + calendar files), the landing page program section
  (`template.html`), the booklet at `program/index.html`, and the PDF download.
  Grep for the old value before calling it done.
- Prefer the smallest change. He is shipping this in days, not weeks.
