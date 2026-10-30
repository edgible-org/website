// The light/dark theme: sets data-theme on <html> before the page paints (the saved choice, else the system's
// preference, else dark), and adds a sun/moon button to the header that flips it and remembers the choice.
(function () {
  var root = document.documentElement;
  var meta;
  function saved() { try { return localStorage.getItem('theme'); } catch (e) { return null; } }
  function system() { return window.matchMedia && matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'; }
  function apply(theme) {
    root.setAttribute('data-theme', theme);
    if (meta) meta.setAttribute('content', theme === 'light' ? '#f6f7fd' : '#111827');
  }
  var theme = saved() === 'light' || saved() === 'dark' ? saved() : system();
  apply(theme);

  document.addEventListener('DOMContentLoaded', function () {
    meta = document.querySelector('meta[name="theme-color"]');
    apply(theme);
    var bar = document.querySelector('header.bar .wrap');
    if (!bar) return;
    var btn = document.createElement('button');
    btn.className = 'theme-btn';
    btn.type = 'button';
    btn.innerHTML =
      '<svg class="sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.5"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/></svg>' +
      '<svg class="moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4 8.5 8.5 0 1 0 20 14.5z"/></svg>';
    function label() { btn.setAttribute('aria-label', theme === 'light' ? 'Switch to the dark theme' : 'Switch to the light theme'); }
    label();
    btn.addEventListener('click', function () {
      theme = theme === 'light' ? 'dark' : 'light';
      apply(theme);
      label();
      try { localStorage.setItem('theme', theme); } catch (e) {}
    });
    bar.appendChild(btn);
  });
})();
