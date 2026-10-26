/* Phamilia 규칙 덮개 — 위 바 상태(2026-10-27): 맨 위에서는 큰 글자, 내려가면 작은 글자 · 첫 화면 사진 위에서는 투명 바탕 흰 글자 */
(function () {
  var g = document.querySelector('.ca-gnb'), h = document.querySelector('.ph-hero');
  if (!g) return;
  function set() {
    g.classList.toggle('ph-small', window.scrollY > 24);
    g.classList.toggle('ph-over', !!h && h.getBoundingClientRect().bottom > g.offsetHeight);
    document.documentElement.style.setProperty('--ca-gnb-h', Math.ceil(g.getBoundingClientRect().height) + 'px');
  }
  window.addEventListener('scroll', set, { passive: true });
  window.addEventListener('resize', set);
  g.addEventListener('transitionend', set);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(set);
  set();
})();
