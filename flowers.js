// A soft trail of small white flowers that follows the mouse, fading in and out.
// Approved by Vince (2026-10-18) as the second animation exception. Rules:
// only for a real mouse/trackpad, only while the pointer is moving (nothing when still),
// never for prefers-reduced-motion, never blocks clicks, hidden from screen readers.
(function () {
  if (!window.matchMedia || !matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) return;

  // White blossoms of different kinds (24x24 viewBox): plumeria, jasmine star, daisy, small blossom.
  var petal5 = function (rx, ry, cy) { var s = ''; for (var i = 0; i < 5; i++) s += '<ellipse cx="12" cy="' + cy + '" rx="' + rx + '" ry="' + ry + '" transform="rotate(' + (i * 72) + ' 12 12)"/>'; return s; };
  var FLOWERS = [
    // plumeria: five broad, overlapping petals with a warm yellow heart
    '<g fill="#FFFFFF">' + petal5(4.2, 6.2, 6.4) + '</g><circle cx="12" cy="12" r="2.6" fill="#F4D77A"/>',
    // jasmine (sampaguita-like): six pointed petals
    '<g fill="#FFFFFF">' + [0, 60, 120, 180, 240, 300].map(function (a) { return '<path d="M12 12 C8.8 9.4 9.2 4.8 12 2.4 C14.8 4.8 15.2 9.4 12 12Z" transform="rotate(' + a + ' 12 12)"/>'; }).join('') + '</g><circle cx="12" cy="12" r="1.4" fill="#F7EFD8"/>',
    // daisy: many thin petals and a gold centre
    '<g fill="#FFFFFF">' + Array.apply(null, Array(12)).map(function (_, i) { return '<ellipse cx="12" cy="5.6" rx="1.3" ry="4.4" transform="rotate(' + (i * 30) + ' 12 12)"/>'; }).join('') + '</g><circle cx="12" cy="12" r="2.4" fill="#E8C25A"/>',
    // small round blossom
    '<g fill="#FFFFFF">' + petal5(3.2, 3.6, 7.6) + '</g><circle cx="12" cy="12" r="1.8" fill="#F1E3B0"/>',
  ];

  var layer = document.createElement('div');
  layer.setAttribute('aria-hidden', 'true');
  layer.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:60;overflow:hidden';
  document.body.appendChild(layer);

  var lastX = null, lastY = null, lastT = 0, alive = 0, MAX = 28, GAP = 34, EVERY = 45;
  function bloom(x, y) {
    if (alive >= MAX) return;
    var size = 12 + Math.random() * 12;
    var el = document.createElement('div');
    el.innerHTML = '<svg viewBox="0 0 24 24" width="' + size + '" height="' + size + '" focusable="false">' + FLOWERS[(Math.random() * FLOWERS.length) | 0] + '</svg>';
    el.style.cssText = 'position:absolute;left:' + (x - size / 2) + 'px;top:' + (y - size / 2) + 'px;filter:drop-shadow(0 1px 2px rgba(42,20,41,.35));will-change:transform,opacity';
    layer.appendChild(el); alive++;
    var turn = (Math.random() * 120 - 60), drift = 10 + Math.random() * 14, start = Math.random() * 360;
    var anim = el.animate([
      { opacity: 0, transform: 'translateY(0) rotate(' + start + 'deg) scale(.6)' },
      { opacity: .85, transform: 'translateY(' + (drift * .25) + 'px) rotate(' + (start + turn * .3) + 'deg) scale(1)', offset: .2 },
      { opacity: 0, transform: 'translateY(' + drift + 'px) rotate(' + (start + turn) + 'deg) scale(.9)' }
    ], { duration: 1300 + Math.random() * 500, easing: 'ease-out' });
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
    bloom(e.clientX, e.clientY);
  }, { passive: true });
  document.addEventListener('mouseleave', function () { lastX = null; });
})();
