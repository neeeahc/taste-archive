/* 3장 사진 판 — GRAS(gras.co) 메인 페이지의 배치·동작만 옮김(2026-10-27 학생 요청). 사진·문구·로고는 가져오지 않음
   ① 첫 동작: 흰 화면 가운데 "3장 공간" → 검은 판이 살짝 커졌다가 제자리로 열림
   ② 배치: 화면보다 넓은 격자(넓은 화면 150%)에 사진을 원본 비율 · 같은 높이(화면 높이 30%)로 칸 가운데 놓음
   ③ 마우스를 움직이면 판이 반대 방향으로 천천히 따라 움직여 가려진 사진이 드러남(손가락 화면은 밀어서 스크롤)
   ④ 사진에 마우스를 올리면 나머지 사진이 어두워지고 그 공간 이름이 화면 가운데 크게 뜸 · 누르면 그 공간 상세가 열림
   사진은 아래 3장 카드(#s4)의 사진을 카드 순서대로 읽는다 — 공간 사이사이 섞어 놓는다 */
(function () {
  var stage = document.querySelector('.gr-stage'); if (!stage) return;
  var pan = stage.querySelector('.gr-pan'), grid = stage.querySelector('.gr-grid'), title = stage.querySelector('.gr-title');
  var groups = [];
  document.querySelectorAll('#s4 .ca-card').forEach(function (card) {
    var name = ((card.querySelector('.ca-name') || {}).textContent || '').trim(), g = [];
    card.querySelectorAll('.ca-fig img').forEach(function (im) {
      var fc = im.closest('figure') && im.closest('figure').querySelector('figcaption');
      g.push({ src: im.getAttribute('src'), alt: im.getAttribute('alt') || '', w: +im.getAttribute('width') || 4, h: +im.getAttribute('height') || 3, name: name, cap: fc ? fc.textContent.trim() : '', card: card });
    });
    groups.push(g);
  });
  var items = [], more = true, k = 0;
  while (more) { more = false; groups.forEach(function (g) { if (g[k]) { items.push(g[k]); more = true; } }); k++; }   /* 공간을 번갈아 섞음 */
  if (!items.length) { stage.hidden = true; return; }
  items.forEach(function (it) {
    var cell = document.createElement('div'); cell.className = 'gr-cell';
    var b = document.createElement('button'); b.type = 'button'; b.className = 'gr-item';
    b.setAttribute('aria-label', it.name + (it.cap ? ' — ' + it.cap : '') + ' · 자세히 보기');
    var im = document.createElement('img'); im.src = it.src; im.alt = it.alt; im.width = it.w; im.height = it.h; im.loading = 'lazy'; im.decoding = 'async';
    b.appendChild(im); cell.appendChild(b); grid.appendChild(cell);
    function on() { stage.classList.add('is-hover'); b.classList.add('is-hot'); title.textContent = it.name; }
    function off() { stage.classList.remove('is-hover'); b.classList.remove('is-hot'); }
    b.addEventListener('mouseenter', on); b.addEventListener('focus', on);
    b.addEventListener('mouseleave', off); b.addEventListener('blur', off);
    b.addEventListener('click', function () { var o = it.card.querySelector('.ca-open'); if (o) o.click(); });
  });
  /* ③ 마우스 따라 판 움직이기(부드럽게 따라붙음) */
  var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var tx = 0, ty = 0, x = 0, y = 0, raf = 0;
  function range() { var r = stage.getBoundingClientRect(); return { r: r, mx: Math.max(0, grid.scrollWidth - r.width), my: Math.max(0, grid.scrollHeight - r.height) }; }
  function tick() {
    x += (tx - x) * 0.08; y += (ty - y) * 0.08;
    pan.style.transform = 'translate3d(' + (-x).toFixed(1) + 'px,' + (-y).toFixed(1) + 'px,0)';
    if (Math.abs(tx - x) > 0.3 || Math.abs(ty - y) > 0.3) raf = requestAnimationFrame(tick); else raf = 0;
  }
  function center() { var g = range(); tx = g.mx / 2; ty = g.my / 2; if (!raf) raf = requestAnimationFrame(tick); }
  if (fine) {
    stage.addEventListener('mousemove', function (e) {
      var g = range(), px = (e.clientX - g.r.left) / g.r.width, py = (e.clientY - g.r.top) / g.r.height;
      tx = Math.min(Math.max(px, 0), 1) * g.mx; ty = Math.min(Math.max(py, 0), 1) * g.my;
      if (reduce) { x = tx; y = ty; tick(); } else if (!raf) raf = requestAnimationFrame(tick);
    });
    window.addEventListener('resize', center);
  } else stage.classList.add('is-touch');
  /* ① 첫 동작 */
  function open() { stage.classList.add('is-open'); if (fine) { var g = range(); x = tx = g.mx / 2; y = ty = g.my / 2; tick(); } }
  if (reduce) open(); else setTimeout(open, 1100);
})();
