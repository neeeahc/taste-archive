/* 4장 물건 판 — Yaheng Li(yahengli.co) 메인의 배치·동작만 옮김(2026-10-27 학생 요청). 사진·문구·로고는 가져오지 않음
   ① 물건마다 칸 하나: 위에 작은 라벨 "OBJECT 01 | 이름", 아래 누끼 사진(카드 썸네일 = 첫 사진)
   ② 칸은 3열 × 2줄 격자 · 처음 들어올 때 칸이 차례로 떠오름
   ③ 사진에 마우스를 올리면 사진이 마우스를 따라 떠서 각도가 바뀜(3D 기울기) · 다른 사진이 있으면 그 사진으로 바뀜 · 누르면 그 물건 상세
   ④ 왼쪽 막대의 물건 목록: 올리면 그 칸이 강조, 누르면 상세 */
(function () {
  var grid = document.querySelector('.yh-grid'), list = document.querySelector('.yh-list'); if (!grid) return;
  var cells = [];
  document.querySelectorAll('#s5 .ca-card').forEach(function (card, i) {
    var name = ((card.querySelector('.ca-name') || {}).textContent || '').trim();
    var imgs = [].slice.call(card.querySelectorAll('.ca-fig img'));
    if (!imgs.length) return;
    var no = String(i + 1).padStart(2, '0');
    var a = document.createElement('button'); a.type = 'button'; a.className = 'yh-cell'; a.style.setProperty('--i', i);
    a.setAttribute('aria-label', 'Object ' + no + ' ' + name + ' · 자세히 보기');
    var lab = document.createElement('p'); lab.className = 'yh-lab'; lab.textContent = 'Object ' + no + ' | ' + name;
    if (card.hasAttribute('data-no-swap')) imgs = imgs.slice(0, 1);   /* data-no-swap = 사진을 바꾸지 않고 썸네일 그대로 기울이기만 */
    var box = document.createElement('div'); box.className = 'yh-img' + (imgs.length > 1 ? ' has-alt' : '');
    imgs.slice(0, 2).forEach(function (im, k) {
      var n = document.createElement('img'); n.src = im.getAttribute('src'); n.alt = k ? '' : (im.getAttribute('alt') || ''); n.width = +im.getAttribute('width') || 4; n.height = +im.getAttribute('height') || 5; n.loading = 'lazy'; n.decoding = 'async';
      n.className = k ? 'yh-alt' : 'yh-main'; box.appendChild(n);
    });
    a.append(lab, box); grid.appendChild(a); cells.push(a);
    function open() { if (window.YH3D && card.hasAttribute('data-3d-front')) { window.YH3D.open(card); return; } var o = card.querySelector('.ca-open'); if (o) o.click(); }   /* 3D 보기(obj3d.js)가 있으면 그것으로 */
    /* ③ 올리면 각도가 바뀜 — 원본(yahengli.co)처럼 사진이 마우스를 따라 떠서 움직이고, 마우스 위치에 따라 앞뒤·좌우로 기울어진다(3D) */
    a.addEventListener('mousemove', function (e) {
      var r = box.getBoundingClientRect(), nx = ((e.clientX - r.left) / r.width) * 2 - 1, ny = ((e.clientY - r.top) / r.height) * 2 - 1;
      nx = Math.max(-1, Math.min(1, nx)); ny = Math.max(-1, Math.min(1, ny));
      box.style.setProperty('--rx', (-ny * 16).toFixed(2) + 'deg'); box.style.setProperty('--ry', (nx * 22).toFixed(2) + 'deg');
      box.style.setProperty('--rz', (nx * 4).toFixed(2) + 'deg');
      box.style.setProperty('--tx', (nx * 6).toFixed(2) + '%'); box.style.setProperty('--ty', (ny * 5).toFixed(2) + '%');
      a.classList.add('is-tilt');
    });
    a.addEventListener('mouseleave', function () {
      ['--rx', '--ry', '--rz', '--tx', '--ty'].forEach(function (v) { box.style.removeProperty(v); });
      a.classList.remove('is-tilt');
    });
    a.addEventListener('click', open);
    if (list) {
      var li = document.createElement('button'); li.type = 'button'; li.textContent = name; list.appendChild(li);
      li.addEventListener('click', open);
      li.addEventListener('mouseenter', function () { a.classList.add('is-hot'); });
      li.addEventListener('mouseleave', function () { a.classList.remove('is-hot'); });
    }
  });
  /* ② 3×2 격자(2026-10-27 학생 요청) — 칸을 차례로 3열에 놓는다(폰 폭 2열은 CSS가 맡음) */
  function build() { cells.forEach(function (c) { grid.appendChild(c); }); }
  build();
  /* 처음 들어올 때 차례로 떠오름 */
  requestAnimationFrame(function () { setTimeout(function () { grid.classList.add('is-in'); }, 60); });
})();
