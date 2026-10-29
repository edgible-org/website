// The header menu button: opens and closes the links, and closes them again on a link, Escape or a click outside.
(function () {
  var bar = document.querySelector('header.bar');
  var btn = bar && bar.querySelector('.menu-btn');
  if (!btn) return;
  function set(open) {
    bar.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  }
  btn.addEventListener('click', function () { set(!bar.classList.contains('open')); });
  bar.addEventListener('click', function (e) { if (e.target.closest('nav a')) set(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { set(false); btn.focus(); } });
  document.addEventListener('click', function (e) { if (!bar.contains(e.target)) set(false); });
})();
