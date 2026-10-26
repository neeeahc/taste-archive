/* 4장 물건 3D 보기(2026-10-27 학생 요청) — 카드를 누르면 화면 가득 큰 입체 물건이 뜨고, 끌어서 360° 돌려 볼 수 있다.
   ※ 진짜 3D 스캔이 아니라 사진 기반 입체: 누끼 사진을 앞뒤로 여러 장 겹쳐 두께(옆면)를 만들고, 앞면 · 뒷면에 사진을 붙인다.
     뒷면 사진이 있으면(data-3d-back — 부채) 그 사진, 없으면 앞면 실루엣을 맨 뒤에 그대로 둬 뒤에서 보면 좌우가 뒤집힌 모습으로 보인다. 두께 = data-3d-depth(물건 너비 대비)
   조작: 끌기 = 돌리기(놓으면 관성) · 휠/두 손가락 = 확대·축소 · 두 번 누르기 = 처음 각도 · ← → = 이전·다음 물건 · Esc = 닫기
   가만히 두면 천천히 혼자 돈다 */
(function () {
  var cards = [].slice.call(document.querySelectorAll('#s5 .ca-card[data-3d-front]'));
  if (!cards.length) return;
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var ov = document.createElement('div'); ov.className = 'v3'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.hidden = true;
  ov.innerHTML = '<p class="v3-lab"></p>'
    + '<button type="button" class="v3-x" aria-label="닫기">Close ✕</button>'
    + '<div class="v3-stage" tabindex="0" aria-label="끌어서 돌려 보기"><div class="v3-floor"></div><div class="v3-obj"></div></div>'
    + '<div class="v3-info"><h2 class="v3-name"></h2><p class="v3-when"></p><p class="v3-why"></p><p class="v3-cap"></p></div>'
    + '<p class="v3-hint">Drag to rotate · Scroll to zoom · Double-click to reset</p>'
    + '<div class="v3-nav"><button type="button" class="v3-prev" aria-label="이전 물건">← Prev</button><span class="v3-no"></span><button type="button" class="v3-next" aria-label="다음 물건">Next →</button></div>';
  document.body.appendChild(ov);
  var stage = ov.querySelector('.v3-stage'), obj = ov.querySelector('.v3-obj'), floor = ov.querySelector('.v3-floor');
  var rx = -8, ry = -24, vx = 0, vy = 0, zoom = 1, dragging = false, idle = 0, raf = 0, cur = 0, lastFocus = null;
  function txt(c, sel) { var e = c.querySelector(sel); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }
  function build(card) {
    obj.innerHTML = '';
    var front = card.getAttribute('data-3d-front'), back = card.getAttribute('data-3d-back') || '', depth = parseFloat(card.getAttribute('data-3d-depth')) || .05;
    var probe = new Image(); probe.src = front;
    function make() {
      var ar = (probe.naturalHeight || 5) / (probe.naturalWidth || 4);
      var vh = innerHeight, vw = innerWidth;
      var W = Math.min(vw * (vw < 769 ? .78 : .44), (vh * .66) / ar), H = W * ar, D = Math.max(2, W * depth);
      obj.style.width = W + 'px'; obj.style.height = H + 'px'; obj.style.setProperty('--d', D + 'px');
      var N = Math.max(2, Math.min(28, Math.round(D / 2.5)));   /* 옆면을 이룰 겹 수 */
      for (var k = 0; k <= N; k++) {
        var z = -D / 2 + (D * k) / N, im = document.createElement('img'); im.alt = ''; im.decoding = 'async'; im.draggable = false;
        if (k === N) { im.src = front; im.className = 'v3-face v3-front'; im.style.transform = 'translateZ(' + z + 'px)'; }
        else if (k === 0 && back) { im.src = back; im.className = 'v3-face v3-back'; im.style.transform = 'translateZ(' + z + 'px) rotateY(180deg)'; }
        else if (k === 0) { im.src = front; im.className = 'v3-backplain'; im.style.transform = 'translateZ(' + z + 'px)'; }   /* 뒷면 사진이 없으면: 돌리지 않은 앞면을 맨 뒤에 둠 — 뒤에서 보면 옆면 겹과 똑같이 좌우가 뒤집혀 보여 실루엣이 하나로 맞는다(X자로 엇갈리던 오류 수정 · 2026-10-27) */
        else { im.src = front; im.className = 'v3-edge'; im.style.transform = 'translateZ(' + z + 'px)'; }
        obj.appendChild(im);
      }
      floor.style.width = W * 1.05 + 'px';
    }
    if (probe.complete && probe.naturalWidth) make(); else probe.onload = make;
    var no = String(cards.indexOf(card) + 1).padStart(2, '0'), name = txt(card, '.ca-name');
    ov.querySelector('.v3-lab').textContent = 'Object ' + no + ' | ' + name;
    ov.querySelector('.v3-name').textContent = name;
    ov.querySelector('.v3-when').textContent = txt(card, '.ca-when');
    ov.querySelector('.v3-why').textContent = txt(card, '.ca-why');
    var fc = card.querySelector('figcaption'); ov.querySelector('.v3-cap').textContent = fc ? fc.textContent.trim() : '';
    ov.querySelector('.v3-no').textContent = no + ' / ' + String(cards.length).padStart(2, '0');
    ov.setAttribute('aria-label', name + ' 3D 보기');
  }
  function paint() {
    obj.style.transform = 'scale(' + zoom.toFixed(3) + ') rotateX(' + rx.toFixed(2) + 'deg) rotateY(' + ry.toFixed(2) + 'deg)';
    var tilt = Math.abs(Math.cos(ry * Math.PI / 180));
    floor.style.transform = 'translateX(-50%) scale(' + (.55 + .45 * tilt).toFixed(3) + ', 1)';
  }
  function loop() {
    if (!dragging) {
      if (Math.abs(vx) > .01 || Math.abs(vy) > .01) { ry += vx; rx += vy; vx *= .94; vy *= .94; }
      else if (!reduce && performance.now() - idle > 2500) ry += .18;   /* 가만히 두면 천천히 혼자 돈다 */
      rx = Math.max(-75, Math.min(75, rx));
    }
    paint(); raf = requestAnimationFrame(loop);
  }
  var px = 0, py = 0, pts = {}, pinch = 0;
  stage.addEventListener('pointerdown', function (e) { stage.setPointerCapture(e.pointerId); pts[e.pointerId] = [e.clientX, e.clientY]; dragging = true; px = e.clientX; py = e.clientY; vx = vy = 0; idle = performance.now(); stage.classList.add('is-grab'); });
  stage.addEventListener('pointermove', function (e) {
    if (!pts[e.pointerId]) return; pts[e.pointerId] = [e.clientX, e.clientY];
    var ids = Object.keys(pts);
    if (ids.length === 2) { var a = pts[ids[0]], b = pts[ids[1]], d = Math.hypot(a[0] - b[0], a[1] - b[1]); if (pinch) zoom = Math.max(.6, Math.min(2.2, zoom * d / pinch)); pinch = d; return; }
    var dx = e.clientX - px, dy = e.clientY - py; px = e.clientX; py = e.clientY;
    ry += dx * .45; rx -= dy * .35; vx = dx * .45; vy = -dy * .35; idle = performance.now();
  });
  function up(e) { delete pts[e.pointerId]; if (!Object.keys(pts).length) { dragging = false; pinch = 0; stage.classList.remove('is-grab'); idle = performance.now(); } }
  stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
  stage.addEventListener('wheel', function (e) { e.preventDefault(); zoom = Math.max(.6, Math.min(2.2, zoom * (e.deltaY < 0 ? 1.08 : .93))); idle = performance.now(); }, { passive: false });
  stage.addEventListener('dblclick', function () { rx = -8; ry = -24; vx = vy = 0; zoom = 1; idle = performance.now(); });
  function open(card) {
    cur = cards.indexOf(card); lastFocus = document.activeElement;
    rx = -8; ry = -24; vx = vy = 0; zoom = 1; idle = performance.now();
    build(card); ov.hidden = false; document.documentElement.classList.add('v3-on');
    requestAnimationFrame(function () { ov.classList.add('is-on'); });
    if (!raf) raf = requestAnimationFrame(loop);
    ov.querySelector('.v3-x').focus();
  }
  function close() {
    ov.classList.remove('is-on'); document.documentElement.classList.remove('v3-on');
    setTimeout(function () { ov.hidden = true; cancelAnimationFrame(raf); raf = 0; }, reduce ? 0 : 350);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  function step(n) { cur = (cur + n + cards.length) % cards.length; rx = -8; ry = -24; vx = vy = 0; zoom = 1; idle = performance.now(); build(cards[cur]); }
  ov.querySelector('.v3-x').addEventListener('click', close);
  ov.querySelector('.v3-prev').addEventListener('click', function () { step(-1); });
  ov.querySelector('.v3-next').addEventListener('click', function () { step(1); });
  document.addEventListener('keydown', function (e) {
    if (ov.hidden) return;
    if (e.key === 'Escape') { e.preventDefault(); close(); }
    else if (e.key === 'ArrowRight') step(1); else if (e.key === 'ArrowLeft') step(-1);
  });
  addEventListener('resize', function () { if (!ov.hidden) build(cards[cur]); });
  window.YH3D = { open: open };
})();
