/* 1장 사진 줄(카드 줄 대신) — Jacky Winter Gallery 메인 상단의 배치·동작만 옮김(2026-10-27 학생 요청)
   ① 첫 동작: 작은 사진 한 장이 가운데에 떴다가 커지며 나머지 사진이 펼쳐진다
   ② 배치: 지금 사진이 가장 크고(4:5), 오른쪽 둘째·셋째가 점점 작아지며 겹치고, 그 뒤는 같은 크기로 줄 선다
   ③ 넘기기: 오른쪽 사진을 누르면(또는 → 키·밀기) 앞 장이 왼쪽으로 빠지고 그 장이 커진다. 지금 사진을 누르면 그 묶음의 상세가 열린다. ← 키로 뒤로
   사진은 아래 1장 카드(#s2)의 사진을 카드 순서대로 읽어 쓴다 — 사진을 바꾸려면 카드 사진만 바꾸면 된다 */
(function () {
  var hero = document.querySelector('.jw-stage'); if (!hero) return;
  var track = hero.querySelector('.jw-track'), info = hero.querySelector('.jw-cap');
  function q(c) { return info ? info.querySelector(c) : null; }
  var items = [], cards = [];
  document.querySelectorAll('#s2 .ca-card').forEach(function (card, ci) {
    cards.push(card);
    var name = (card.querySelector('.ca-name') || {}).textContent || '', why = (card.querySelector('.ca-why') || {}).textContent || '';
    card.querySelectorAll('.ca-fig img').forEach(function (im) { var fig = im.closest('figure'), src = im.getAttribute('src') || '';
      var m = src.split('/').pop().match(/^w\d+_[a-z]+\d+_([a-z]+)_([^.]+)\./);   /* w04_sky01_unsplash_jordansteranka.jpg → Unsplash · jordansteranka */
      var site = m ? m[1].charAt(0).toUpperCase() + m[1].slice(1) : '', who = m ? m[2] : '';
      items.push({ src: src, alt: im.getAttribute('alt') || '', name: name.trim(), why: why.trim(), title: fig ? (fig.getAttribute('data-title') || '').trim() : '', site: site, who: who, card: ci }); });
  });
  if (!items.length) { hero.hidden = true; return; }
  var slides = items.map(function (it, i) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'jw-slide';
    b.setAttribute('aria-label', it.name + ' 사진 ' + (i + 1) + ' / ' + items.length);
    var im = document.createElement('img'); im.src = it.src; im.alt = it.alt; im.decoding = 'async'; if (i > 3) im.loading = 'lazy';
    b.appendChild(im); track.appendChild(b);
    b.addEventListener('click', function () { if (i === cur) { var o = cards[it.card] && cards[it.card].querySelector('.ca-open'); if (o) o.click(); else go(cur + 1); } else go(i); });   /* 지금 사진 = 그 묶음 상세 열기 */
    return b;
  });
  var cur = 0, N = slides.length;
  var SC = [1, 0.833, 0.655, 0.484];          /* 지금 · 둘째 · 셋째 · 그 뒤 크기 비율(레퍼런스 실측 628·523·411·304) */
  var OV = [0.686, 0.84, 1, 1];               /* 다음 장이 앞 장 너비의 몇 배 지점에서 시작하나(겹침) */
  function layout() {
    var r = track.getBoundingClientRect(), capH = info ? info.offsetHeight : 0, W = r.width;
    /* 카드 크기 = 원본(jackywinter.gallery, 1280 폭 실측)과 같은 비율: 첫 장 너비 = 화면 폭의 49%(628/1280) · 4:5 → 큰 카드 셋이 화면 폭을 채움(2026-10-27 학생 요청) */
    var w0 = W < 769 ? W * 0.78 : W * 0.4906, h0 = w0 / 0.8, H = h0;
    hero.style.height = Math.round(h0 + capH) + 'px';   /* 판 높이 = 첫 장 + 설명판 */
    var x = 0, prevW = 0;
    slides.forEach(function (s, i) {
      var d = i - cur, k = Math.min(Math.max(d, 0), 3), w = w0 * SC[k], h = w / 0.8;
      var left;
      if (d < 0) left = -w0 * (1 + (-d - 1) * 0.15) - 40;
      else if (d === 0) { left = 0; x = 0; prevW = w; }
      else { left = x + prevW * OV[Math.min(d - 1, 3)]; x = left; prevW = w; }
      s.style.width = w + 'px'; s.style.height = h + 'px';
      s.style.transform = 'translate(' + left + 'px,' + ((H - h) / 2) + 'px)';
      s.style.zIndex = String(1000 - Math.abs(d));
      s.classList.toggle('is-cur', d === 0);
      s.tabIndex = (d === 0 || d === 1) ? 0 : -1;
      s.setAttribute('aria-hidden', (d < 0 || left > W) ? 'true' : 'false');
      if (d === 0 && info) { info.style.width = w + 'px'; info.style.transform = 'translate(0px,' + ((H - h) / 2 + h) + 'px)'; }
    });
    fillInfo();
  }
  function fillInfo() {
    var it = items[cur], no = String(cur + 1).padStart(2, '0');
    if (!info) return;
    q('.jw-title').textContent = it.title || it.why || ('No. ' + no);
    q('.jw-who').textContent = it.who || '미확인';
    q('.jw-meta').textContent = (it.site ? it.site + ' · ' : '') + no + ' / ' + String(N).padStart(2, '0');
    q('.jw-tag').textContent = it.name;
  }
  function go(i) {
    cur = (i + N) % N;
    if (info) { info.classList.add('is-swap'); setTimeout(function () { info.classList.remove('is-swap'); }, 520); }
    layout();
  }
  if (info) q('.jw-go').addEventListener('click', function (e) { e.stopPropagation(); var o = cards[items[cur].card] && cards[items[cur].card].querySelector('.ca-open'); if (o) o.click(); });
  hero.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight') { go(cur + 1); e.preventDefault(); } if (e.key === 'ArrowLeft') { go(cur - 1); e.preventDefault(); } });
  var sx = null;
  hero.addEventListener('pointerdown', function (e) { sx = e.clientX; });
  hero.addEventListener('pointerup', function (e) { if (sx === null) return; var dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 50) { go(cur + (dx < 0 ? 1 : -1)); } });
  window.addEventListener('resize', layout);
  /* ① 첫 동작 — 가운데 작은 한 장 → 펼침 */
  fillInfo();
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) { layout(); hero.classList.add('is-ready'); return; }
  hero.classList.add('is-intro');
  var r = track.getBoundingClientRect();
  slides.forEach(function (s, i) { s.style.width = '44px'; s.style.height = '55px'; s.style.transform = 'translate(' + (r.width / 2 - 22) + 'px,' + (r.height / 2 - 28) + 'px)'; s.style.zIndex = String(1000 - i); s.style.opacity = i === 0 ? '1' : '0'; });
  function open() {
    setTimeout(function () {
      hero.classList.remove('is-intro'); hero.classList.add('is-ready');
      slides.forEach(function (s) { s.style.opacity = ''; });
      layout();
    }, 700);
  }
  var opened = false;
  function openOnce() { if (opened) return; opened = true; open(); }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); openOnce(); } }, { threshold: 0.2 });
    io.observe(hero);
    setTimeout(openOnce, 2500);   /* 화면 판정이 늦어도 2.5초 뒤에는 펼친다 */
  } else openOnce();
})();
