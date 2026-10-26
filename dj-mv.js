/* [커스텀] 이유 세 가지 맨 위 영상 — 화면에 보이면 재생, 벗어나면 멈춘다(소리 없음·반복)
   브라우저가 자동 재생을 막아 두었으면 첫 스크롤·마우스 움직임·클릭 때 다시 재생을 시도한다 */
(function () {
  var v = document.querySelector('.dj-mv');
  if (!v) return;
  v.muted = true; v.defaultMuted = true; v.playsInline = true;
  function play() { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { if (en[0].isIntersecting) play(); else v.pause(); }, { threshold: .15 }).observe(v);
  } else play();
  ['scroll', 'pointermove', 'click', 'keydown', 'touchstart'].forEach(function (t) {
    addEventListener(t, function retry() {
      var r = v.getBoundingClientRect();
      if (v.paused && r.bottom > 0 && r.top < innerHeight) play();
    }, { passive: true });
  });
})();
