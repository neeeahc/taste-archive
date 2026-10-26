/* [커스텀] 이유 세 가지 — 스크롤 프레젠테이션(한화 사이트처럼)
   · 섹션이 길게 늘어나 있고(장면 수 × 화면 높이), 그 안의 화면(.dj-tour-pin)은 영상과 함께 고정(sticky)된다
   · 스크롤을 내린 만큼 장면이 바뀐다: 장면마다 ① 작은 번호 줄 ② 큰 문장을 단어별로(흐릿하게 미끄러져 들어와 선명해짐)
     ③ 설명 줄을 한 줄씩 아래에서 위로(한화식 줄 가림) ④ 링크. 다음 장면으로 넘어가면 단어가 옆으로 흐려지며 빠진다
   · 아래 진행 막대: 지난 장면은 다 차고, 지금 장면은 스크롤한 만큼 찬다. 막대를 누르면 그 장면 위치로 부드럽게 스크롤
   · 참고: 학생이 녹화해 온 키네틱 타이포 + hanwha.co.kr */
(function () {
  var sec = document.querySelector('.kb-tour');
  var stage = document.querySelector('.dj-cap-stage');
  if (!sec || !stage) return;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var caps = [].slice.call(stage.querySelectorAll('.dj-cap'));
  var bars = [].slice.call(stage.querySelectorAll('.dj-cap-progress i'));
  var N = caps.length;
  if (!N) return;
  sec.style.setProperty('--dj-steps', N);

  /* 큰 문장을 단어 단위로 쪼갠다(강조어 <em> 은 통째로 한 덩어리) · 설명 줄은 줄마다 가림막으로 감싼다 */
  caps.forEach(function (cap) {
    var n = 0;
    cap.querySelectorAll('.dj-cap-big').forEach(function (big) {
      var host = big.querySelectorAll(':scope > span').length ? [].slice.call(big.querySelectorAll(':scope > span')) : [big];
      host.forEach(function (line) {
        var parts = [].slice.call(line.childNodes);
        line.innerHTML = '';
        parts.forEach(function (node) {
          if (node.nodeType === 3) {
            node.textContent.split(/(\s+)/).forEach(function (w) {
              if (!w) return;
              if (/^\s+$/.test(w)) { line.appendChild(document.createTextNode(' ')); return; }
              var s = document.createElement('span'); s.className = 'dj-w'; s.textContent = w; s.style.setProperty('--i', n++); line.appendChild(s);
            });
          } else {
            var e = node.cloneNode(true); e.classList.add('dj-w'); e.style.setProperty('--i', n++); line.appendChild(e);
          }
        });
      });
    });
    cap.style.setProperty('--n', n);
    cap.querySelectorAll('.dj-cap-sub > span').forEach(function (l, i) {
      var w = document.createElement('span'); w.className = 'dj-line'; l.parentNode.insertBefore(w, l); w.appendChild(l); l.style.setProperty('--j', i);
    });
  });

  var cur = -1;
  function show(i) {
    if (i === cur) return;
    var prev = caps[cur];
    if (prev) { prev.classList.remove('is-on'); prev.classList.add('is-out'); (function (p) { setTimeout(function () { p.classList.remove('is-out'); }, 700); })(prev); }
    cur = i;
    var cap = caps[cur];
    if (!cap) return;
    cap.classList.remove('is-out');
    setTimeout(function () { if (caps[cur] === cap) cap.classList.add('is-on'); }, prev && !reduce ? 380 : 0);
  }
  /* 스크롤 위치 → 장면 번호와 진행 막대 */
  function progress() {
    var r = sec.getBoundingClientRect(), run = sec.offsetHeight - innerHeight;
    return run > 0 ? Math.min(Math.max(-r.top / run, 0), .9999) : 0;
  }
  function onScroll() {
    var p = progress() * N, i = Math.floor(p), f = p - i;
    var r = sec.getBoundingClientRect();
    var inView = r.top < innerHeight * .6 && r.bottom > innerHeight * .4;
    show(inView ? i : (r.top >= innerHeight * .6 ? -1 : i));
    bars.forEach(function (b, k) { b.style.setProperty('--p', k < i ? 1 : k === i ? f.toFixed(3) : 0); });
  }
  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; onScroll(); }); } }, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();

  /* 진행 막대를 누르면 그 장면이 막 시작하는 스크롤 위치로 */
  [].slice.call(stage.querySelectorAll('.dj-cap-progress button')).forEach(function (b, k) {
    b.addEventListener('click', function () {
      var top = sec.getBoundingClientRect().top + scrollY, run = sec.offsetHeight - innerHeight;
      window.scrollTo({ top: Math.round(top + run * (k + .15) / N), behavior: reduce ? 'auto' : 'smooth' });
    });
  });
})();
