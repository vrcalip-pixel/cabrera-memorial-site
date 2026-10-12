// Renders index.html from template.html + data.json, and writes one .ics
// calendar file per event into calendar/. Run: node build.js
const fs = require('fs');
const path = require('path');

const root = __dirname;
const data = JSON.parse(fs.readFileSync(path.join(root, 'data.json'), 'utf8'));
const template = fs.readFileSync(path.join(root, 'template.html'), 'utf8');
const TZ = 'America/Los_Angeles';

const isTBD = v => v == null || v === '' || /^TBD/i.test(String(v).trim());
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const placeholder = '<span class="tbd">Details coming soon</span>';
const show = v => (isTBD(v) ? placeholder : esc(v));
const slug = key => key.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();

// "2026-10-20" + "09:00" -> "20261020T090000" (local time in TZ)
const stamp = (date, time) => date.replace(/-/g, '') + 'T' + time.replace(':', '') + '00';

// "2026-10-14" -> "October 14, 2026"; "16:00" -> "4:00 PM"
const longDate = date => new Date(date + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const clock = time => { const [h, m] = time.split(':').map(Number); return `${(h % 12) || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`; };
// Heading line: date and time first, then the event. `end` is shown only when it is a real end time
// (calendar-only estimates live in `calendarEnd`).
// If it has to wrap on a phone, it breaks between the date and the time, never inside either.
const headingWhen = ev => `<span class="nw">${esc(longDate(ev.date))},</span> <span class="nw">${clock(ev.start)}${ev.end ? ' – ' + clock(ev.end) : ''}</span>`;

function calendarFields(key, ev) {
  const start = ev.arrivalTime || ev.start;
  const end = ev.end || ev.calendarEnd;
  if (!ev.date || !start || !end) throw new Error(`events.${key} needs date, start/arrivalTime and end for the calendar`);
  return {
    title: `${ev.title} · ${data.person.displayName}`,
    start: stamp(ev.date, start),
    end: stamp(ev.date, end),
    location: [ev.venueName, isTBD(ev.address) ? ev.city : ev.address].filter(v => !isTBD(v)).join(', '),
    details: [ev.timeDisplay, ev.notes, ev.warning, ev.reception].filter(v => !isTBD(v)).join('\n\n'),
  };
}

function googleUrl(c) {
  const q = new URLSearchParams({
    action: 'TEMPLATE', text: c.title, dates: `${c.start}/${c.end}`, ctz: TZ,
    location: c.location, details: c.details,
  });
  return 'https://calendar.google.com/calendar/render?' + q.toString();
}

// iCalendar text escaping and 75-octet line folding (RFC 5545)
const icsText = s => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
function fold(line) {
  const out = [];
  let cur = '';
  for (const ch of line) {
    if (Buffer.byteLength(cur + ch) > (out.length ? 74 : 75)) { out.push(cur); cur = ''; }
    cur += ch;
  }
  out.push(cur);
  return out.join('\r\n ');
}

function ics(key, c) {
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+/, '');
  return [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Cabrera Memorial//EN', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VTIMEZONE', `TZID:${TZ}`,
    'BEGIN:DAYLIGHT', 'TZOFFSETFROM:-0800', 'TZOFFSETTO:-0700', 'TZNAME:PDT', 'DTSTART:19700308T020000', 'RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU', 'END:DAYLIGHT',
    'BEGIN:STANDARD', 'TZOFFSETFROM:-0700', 'TZOFFSETTO:-0800', 'TZNAME:PST', 'DTSTART:19701101T020000', 'RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU', 'END:STANDARD',
    'END:VTIMEZONE',
    'BEGIN:VEVENT',
    `UID:${slug(key)}@cabrera-memorial`,
    `DTSTAMP:${now}`,
    `DTSTART;TZID=${TZ}:${c.start}`,
    `DTEND;TZID=${TZ}:${c.end}`,
    `SUMMARY:${icsText(c.title)}`,
    `LOCATION:${icsText(c.location)}`,
    `DESCRIPTION:${icsText(c.details)}`,
    'END:VEVENT', 'END:VCALENDAR',
  ].map(fold).join('\r\n') + '\r\n';
}

function eventCard(key, ev, icsPath) {
  const c = calendarFields(key, ev);
  const where = isTBD(ev.address)
    ? `${show(ev.venueName)}${isTBD(ev.city) ? '' : ', ' + esc(ev.city)}`
    : `${show(ev.venueName)}<br><a href="${esc(ev.mapUrl)}">${esc(ev.address)}</a>`;
  const expect = (ev.whatToExpect || []).length
    ? `\n        <p>What to expect:</p>\n        <ul>\n${ev.whatToExpect.map(i => `          <li>${show(i)}</li>`).join('\n')}\n        </ul>`
    : '';
  const lines = [
    `      <article class="event">`,
    `        <h3><span class="when">${headingWhen(ev)}</span> ${show(ev.title)}</h3>`,
    `        <p class="where">${where}</p>`,
    ev.warning ? `        <div class="notice"><p>${ev.arrivalTime ? `Please arrive by ${clock(ev.arrivalTime)}. ` : ''}${show(ev.warning)}</p></div>` : '',
    isTBD(ev.notes) ? '' : `        <p>${esc(ev.notes)}</p>`,
    expect ? expect.slice(1) : '',
    isTBD(ev.reception) ? '' : `        <p>${esc(ev.reception)}</p>`,
    `        <div class="links">`,
    isTBD(ev.mapUrl) ? '' : `          <a class="btn" href="${esc(ev.mapUrl)}">Get directions</a>`,
    `          <a class="btn" href="${esc(icsPath)}">Add to iPhone calendar</a>`,
    `          <a class="btn" href="${esc(googleUrl(c))}">Add to Google Calendar</a>`,
    `        </div>`,
    `      </article>`,
  ];
  return lines.filter(Boolean).join('\n');
}

fs.mkdirSync(path.join(root, 'calendar'), { recursive: true });
const cards = Object.entries(data.events).map(([key, ev]) => {
  const icsPath = `calendar/${slug(key)}.ics`;
  fs.writeFileSync(path.join(root, icsPath), ics(key, calendarFields(key, ev)));
  return eventCard(key, ev, icsPath);
});

// Ways to help: hidden when giving.show is false. While giving.url is TBD the
// button renders as a clearly marked, non-clickable placeholder.
const g = data.giving || {};
const givingNav = g.show ? '      <li><a href="#give">Ways to help</a></li>\n' : '';
// Optional giving.photo sits beside the text on desktop and below it on phones.
const gp = g.photo && !isTBD(g.photo.src) ? g.photo : null;
const giving = !g.show ? '' : [
  '<section id="give">',
  `  <div class="wrap${gp ? ' give-grid' : ''}">`,
  '    <div class="give-text">',
  `      <h2>${show(g.headline)}</h2>`,
  isTBD(g.text) ? '' : `      <p>${esc(g.text)}</p>`,
  isTBD(g.url)
    ? `      <p><span class="btn btn-placeholder" aria-disabled="true">${esc(g.buttonLabel)}</span> <span class="tbd">Link coming soon</span></p>`
    : `      <p><a class="btn gold" href="${esc(g.url)}">${esc(g.buttonLabel)}</a></p>`,
  isTBD(g.url) || isTBD(g.tipNote) ? '' : `      <p class="small muted tip-note">${esc(g.tipNote)}</p>`,
  isTBD(g.inPerson) ? '' : `      <p>${esc(g.inPerson)}</p>`,
  isTBD(g.closing) ? '' : `      <p class="lede-small" lang="ch">${esc(g.closing)}</p>`,
  '    </div>',
  gp ? `    <figure class="give-photo"><img src="${esc(gp.src)}" alt="${esc(gp.alt)}" width="${gp.width}" height="${gp.height}" loading="lazy" decoding="async"></figure>` : '',
  '  </div>',
  '</section>',
].filter(Boolean).join('\n') + '\n';

// Cache-busting: browsers may hold styles.css for 10 minutes on GitHub Pages.
// Stamping the link with a hash of the file means a new page always loads matching styles.
const cssHash = require('crypto').createHash('sha1').update(fs.readFileSync(path.join(root, 'styles.css'))).digest('hex').slice(0, 8);

// Share a memory: copy and the Formspree endpoint come from data.json
const m = data.memories || {};
if (isTBD(m.endpoint)) throw new Error('memories.endpoint (Formspree URL) is missing in data.json');

const html = template
  .replace('href="styles.css"', `href="styles.css?v=${cssHash}"`)
  .replace('{{memories.headline}}', show(m.headline))
  .replace('{{memories.intro}}', show(m.intro))
  .replace('{{memories.endpoint}}', esc(m.endpoint))
  // Hero shortcut straight to the fundraiser, shown only once giving.url is set
  .replace('{{heroDonate}}', g.show && !isTBD(g.url) ? `      <a class="btn gold-outline" href="${esc(g.url)}">${esc(g.buttonLabel)}</a>\n` : '')
  .replace('{{givingNav}}', givingNav)
  .replace('{{giving}}', giving)
  .replace(/^<!-- template\.html:.*-->\r?\n/m, '<!-- Generated by build.js from template.html + data.json. Do not edit this file directly. -->\n')
  .replace('{{events}}', '\n' + cards.join('\n\n') + '\n');
fs.writeFileSync(path.join(root, 'index.html'), html);
console.log(`Built index.html and ${cards.length} calendar files.`);
