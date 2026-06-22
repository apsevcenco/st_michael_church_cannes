(function () {
  // Hero slideshow
  var slides = document.querySelectorAll('.hero-slide');
  if (slides.length >= 2) {
    var current = 0;
    setInterval(function () {
      slides[current].classList.remove('active');
      current = (current + 1) % slides.length;
      slides[current].classList.add('active');
    }, 5000);
  }

  // Mobile hamburger menu
  var header = document.querySelector('.site-header');
  var nav = document.querySelector('.main-nav');
  if (!header || !nav) return;

  var btn = document.createElement('button');
  btn.className = 'hamburger-btn';
  btn.setAttribute('aria-label', 'Меню');
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '<span></span><span></span><span></span>';
  header.appendChild(btn);

  // Keep CSS var --header-h in sync so the fixed nav dropdown
  // knows exactly where to appear (just below the sticky header)
  function syncHeaderH() {
    document.documentElement.style.setProperty('--header-h', header.offsetHeight + 'px');
  }
  syncHeaderH();
  window.addEventListener('resize', syncHeaderH);

  function closeMenu() {
    nav.classList.remove('nav-open');
    btn.classList.remove('is-open');
    btn.setAttribute('aria-expanded', 'false');
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    // Re-sync height in case header reflowed (e.g. soft keyboard open)
    syncHeaderH();
    var isOpen = nav.classList.toggle('nav-open');
    btn.classList.toggle('is-open', isOpen);
    btn.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('click', function (e) {
    if (!header.contains(e.target)) closeMenu();
  });

  nav.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') closeMenu();
  });
})();
