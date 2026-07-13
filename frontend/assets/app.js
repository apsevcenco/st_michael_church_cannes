(function () {
  var currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  var blockedLanguagePage = currentPage === 'fr.html' || currentPage === 'en.html' || /-(fr|en)\.html$/.test(currentPage);

  if (blockedLanguagePage) {
    window.location.replace('index.html');
    return;
  }

  function isBlockedLanguageHref(href) {
    var page = String(href || '').split('#')[0].split('?')[0].split('/').pop().toLowerCase();
    return page === 'fr.html' || page === 'en.html' || /-(fr|en)\.html$/.test(page);
  }

  document.querySelectorAll('.church-lang-switch a').forEach(function (link) {
    if (!isBlockedLanguageHref(link.getAttribute('href'))) return;
    link.classList.add('lang-disabled');
    link.setAttribute('aria-disabled', 'true');
    link.setAttribute('title', 'Временно недоступно');
    link.removeAttribute('href');
    link.addEventListener('click', function (event) {
      event.preventDefault();
    });
  });

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

  // Inject hamburger button
  var btn = document.createElement('button');
  btn.className = 'hamburger-btn';
  btn.setAttribute('aria-label', 'Меню');
  btn.setAttribute('aria-expanded', 'false');
  btn.innerHTML = '<span></span><span></span><span></span>';
  header.appendChild(btn);

  // Clone language flags into the bottom of the dropdown nav
  var langSwitch = document.querySelector('.church-lang-switch');
  if (langSwitch) {
    var langRow = langSwitch.cloneNode(true);
    langRow.className = 'nav-lang-row';
    nav.appendChild(langRow);
  }

  // Keep --header-h in sync so the fixed nav panel appears just below the sticky header
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
