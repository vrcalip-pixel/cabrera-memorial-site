// Small bouquets of white flowers grow behind the moving mouse: each blossom slowly opens, then fades away.
// Approved by Vince (2026-10-18) as the second animation exception. Rules:
// only for a real mouse/trackpad, only while the pointer is moving (nothing when still),
// never for prefers-reduced-motion, never blocks clicks, hidden from screen readers.
(function () {
  if (!window.matchMedia || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) return;

  // White blossoms of different kinds (24x24 viewBox): plumeria, jasmine star, daisy, small blossom.
  // Each petal is its own element (class "p") so it can unfold from the centre; "c" is the heart.
  var petals = function (n, shape) { var s = ''; for (var i = 0; i < n; i++) s += '<g transform="rotate(' + (i * 360 / n) + ' 12 12)">' + shape + '</g>'; return s; };
  var FLOWERS = [
    // plumeria: five broad, overlapping petals with a warm yellow heart
    '<g fill="#FFFFFF">' + petals(5, '<ellipse class="p" cx="12" cy="6.4" rx="4.2" ry="6.2"/>') + '</g><circle class="c" cx="12" cy="12" r="2.6" fill="#F4D77A"/>',
    // jasmine (sampaguita-like): six pointed petals
    '<g fill="#FFFFFF">' + petals(6, '<path class="p" d="M12 12 C8.8 9.4 9.2 4.8 12 2.4 C14.8 4.8 15.2 9.4 12 12Z"/>') + '</g><circle class="c" cx="12" cy="12" r="1.4" fill="#F7EFD8"/>',
    // daisy: many thin petals and a gold centre
    '<g fill="#FFFFFF">' + petals(12, '<ellipse class="p" cx="12" cy="5.6" rx="1.3" ry="4.4"/>') + '</g><circle class="c" cx="12" cy="12" r="2.4" fill="#E8C25A"/>',
    // small round blossom
    '<g fill="#FFFFFF">' + petals(5, '<ellipse class="p" cx="12" cy="7.6" rx="3.2" ry="3.6"/>') + '</g><circle class="c" cx="12" cy="12" r="1.8" fill="#F1E3B0"/>',
  ];

  var layer = document.createElement('div');
  layer.setAttribute('aria-hidden', 'true');
  layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:60;overflow:hidden';
  document.body.appendChild(layer);

  // Each flower lives about 3.5 s: it blooms (petals unfold one after another), rests, then slowly fades.
  var BLOOM = 1100, LIFE = 3400;
  // Flowers grow in small bouquets: each burst of movement adds a clump of 4–6 blossoms and two leaves.
  var lastX = null, lastY = null, lastT = 0, alive = 0, MAX = 80, GAP = 70, EVERY = 140;
  var opening = 'cubic-bezier(.22,.7,.25,1)';
  var LEAF = '<path d="M12 22 C5 16 5 8 12 2 C19 8 19 16 12 22Z" fill="#A9C3A0"/><path d="M12 21 L12 4" stroke="#8FAE88" stroke-width=".8" fill="none"/>';

  // one bouquet: a larger flower in the middle, smaller ones tucked around it, opening one after another
  function bouquet(x, y) {
    var count = 4 + ((Math.random() * 3) | 0), base = Math.random() * Math.PI * 2;
    for (var k = 0; k < 2; k++) {
      var a = base + k * Math.PI + (Math.random() - .5);
      later(leaf, x + Math.cos(a) * 11, y + Math.sin(a) * 11, a * 180 / Math.PI + 90, k * 120);
    }
    later(bloom, x, y, 20 + Math.random() * 6, 80);
    for (var i = 1; i < count; i++) {
      var ang = base + i * (Math.PI * 2 / (count - 1)) + (Math.random() - .5) * .6, r = 10 + Math.random() * 8;
      later(bloom, x + Math.cos(ang) * r, y + Math.sin(ang) * r, 11 + Math.random() * 8, 160 + i * 110);
    }
  }
  function later(fn, x, y, v, ms) { setTimeout(function () { fn(x, y, v); }, ms); }

  // a soft sage leaf that grows from its base and fades with the flowers
  function leaf(x, y, angle) {
    if (alive >= MAX) return;
    var size = 16 + Math.random() * 6, el = document.createElement('div');
    el.innerHTML = '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" focusable="false">' + LEAF + '</svg>';
    el.style.cssText = 'position:absolute;left:' + (x - size / 2) + 'px;top:' + (y - size / 2) + 'px;will-change:transform,opacity';
    layer.appendChild(el); alive++;
    var anim = el.animate([
      { opacity: 0, transform: 'rotate(' + angle + 'deg) scale(.2)' },
      { opacity: .75, transform: 'rotate(' + angle + 'deg) scale(1)', offset: .25 },
      { opacity: .75, transform: 'rotate(' + (angle + 6) + 'deg) scale(1)', offset: .5 },
      { opacity: 0, transform: 'rotate(' + (angle + 12) + 'deg) scale(.95)' }
    ], { duration: LIFE + 400, easing: 'ease-in-out' });
    anim.onfinish = anim.oncancel = function () { el.remove(); alive--; };
  }

  function bloom(x, y, size) {
    if (alive >= MAX) return;
    var el = document.createElement('div');
    el.innerHTML = '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" focusable="false" style="overflow:visible">' + FLOWERS[(Math.random() * FLOWERS.length) | 0] + '</svg>';
    el.style.cssText = 'position:absolute;left:' + (x - size / 2) + 'px;top:' + (y - size / 2) + 'px;filter:drop-shadow(0 1px 2px rgba(42,20,41,.35));will-change:transform,opacity';
    layer.appendChild(el); alive++;

    // petals unfold from the centre, one after another, around the flower
    var ps = el.querySelectorAll('.p'), step = (BLOOM * .45) / ps.length;
    for (var i = 0; i < ps.length; i++) {
      ps[i].style.transformBox = 'view-box'; ps[i].style.transformOrigin = '12px 12px';
      ps[i].animate([
        { transform: 'scale(.15, .05)', opacity: 0 },
        { transform: 'scale(.7, .6)', opacity: 1, offset: .45 },
        { transform: 'scale(1, 1)', opacity: 1 }
      ], { duration: BLOOM * .7, delay: i * step, easing: opening, fill: 'backwards' });
    }
    var c = el.querySelector('.c');
    c.style.transformBox = 'view-box'; c.style.transformOrigin = '12px 12px';
    c.animate([{ transform: 'scale(0)' }, { transform: 'scale(1.15)', offset: .7 }, { transform: 'scale(1)' }],
      { duration: BLOOM * .5, delay: BLOOM * .45, easing: opening, fill: 'backwards' });

    // the whole flower: soft fade in while it opens, a short rest, then a slow fade away with a gentle drift
    var turn = Math.random() * 50 - 25, drift = 6 + Math.random() * 10, start = Math.random() * 360;
    var life = LIFE + Math.random() * 700;
    var anim = el.animate([
      { opacity: 0, transform: 'translateY(0) rotate(' + start + 'deg)' },
      { opacity: .9, transform: 'translateY(' + (drift * .2) + 'px) rotate(' + (start + turn * .3) + 'deg)', offset: .2 },
      { opacity: .9, transform: 'translateY(' + (drift * .45) + 'px) rotate(' + (start + turn * .55) + 'deg)', offset: .45 },
      { opacity: 0, transform: 'translateY(' + drift + 'px) rotate(' + (start + turn) + 'deg)' }
    ], { duration: life, easing: 'ease-in-out' });
    anim.onfinish = anim.oncancel = function () { el.remove(); alive--; };
  }

  window.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse' || reduce.matches) return;
    var now = e.timeStamp;
    if (lastX === null) { lastX = e.clientX; lastY = e.clientY; lastT = now; return; }
    var dx = e.clientX - lastX, dy = e.clientY - lastY;
    // only when the mouse has actually travelled: no flowers while still or hovering in place
    if (dx * dx + dy * dy < GAP * GAP || now - lastT < EVERY) return;
    lastX = e.clientX; lastY = e.clientY; lastT = now;
    bouquet(e.clientX, e.clientY);
  }, { passive: true });
  document.addEventListener('mouseleave', function () { lastX = null; });
})();
