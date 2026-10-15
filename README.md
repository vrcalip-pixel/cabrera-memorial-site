# cabrera-memorial-site

Edit `data.json` (or `template.html` for page layout), then run:

    node build.js

This regenerates `index.html` and the calendar files in `calendar/`. Commit and push to publish.

## Funeral Mass Program booklet

The booklet at `/program/` (cover, Order of Service, Readings) lives in
`program/index.html`. After editing it, regenerate the downloadable PDF:

    powershell -ExecutionPolicy Bypass -File program\make-pdf.ps1

It also stamps the PDF link with a version, so phones always get the newest PDF.
Then commit and push the program folder.

Mountain View Funeral Home prints this PDF for the Mass and brings the copies
with the casket to St. John of the Woods, so the PDF must be final before
their print deadline. Send them the newest file after any change.
