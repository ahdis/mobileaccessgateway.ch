/* www.mobileaccessgateway.ch -- mobile navigation and cookie consent. */
(function () {
  'use strict';

  /* ---- Mobile navigation ------------------------------------------------ */
  var burger = document.querySelector('.header__burger');
  var nav = document.querySelector('.header__nav');

  if (burger && nav) {
    var setNav = function (open) {
      nav.setAttribute('data-open', String(open));
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.setAttribute('data-nav-open', String(open));
    };
    setNav(false);
    burger.addEventListener('click', function () {
      setNav(nav.getAttribute('data-open') !== 'true');
    });
    // Following a link or pressing Escape closes the overlay.
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.getAttribute('data-open') === 'true') {
        setNav(false);
        burger.focus();
      }
    });
    // Leaving the mobile breakpoint must not strand the page in overlay state.
    window.matchMedia('(min-width: 768px)').addEventListener('change', function (m) {
      if (m.matches) setNav(false);
    });
  }

  /* ---- Cookie consent ---------------------------------------------------
     Google Analytics is not loaded until the visitor accepts. Consent Mode is
     initialised to "denied" first so nothing is sent in the meantime.       */
  var STORAGE_KEY = 'mag-consent';
  var GA_ID = 'G-29ZBMN1C2G';
  var banner = document.querySelector('.consent');

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }

  gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    wait_for_update: 500
  });

  var loaded = false;
  function loadAnalytics() {
    if (loaded) return;
    loaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID, { anonymize_ip: true });
  }

  function stored() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function remember(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* private mode */ }
  }

  function decide(value) {
    remember(value);
    if (banner) banner.setAttribute('data-visible', 'false');
    if (value === 'accepted') {
      gtag('consent', 'update', { analytics_storage: 'granted' });
      loadAnalytics();
    }
  }

  var choice = stored();
  if (choice === 'accepted') {
    gtag('consent', 'update', { analytics_storage: 'granted' });
    loadAnalytics();
  } else if (choice !== 'declined' && banner) {
    banner.setAttribute('data-visible', 'true');
  }

  if (banner) {
    var accept = banner.querySelector('.consent__accept');
    var deny = banner.querySelector('.consent__deny');
    if (accept) accept.addEventListener('click', function () { decide('accepted'); });
    if (deny) deny.addEventListener('click', function () { decide('declined'); });
  }

  // The privacy policy states the decision can be changed at any time, so it
  // links here to bring the banner back.
  function reopen() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
    if (banner) {
      banner.setAttribute('data-visible', 'true');
      var first = banner.querySelector('button');
      if (first) first.focus();
    }
  }
  window.magResetConsent = reopen;

  Array.prototype.forEach.call(
    document.querySelectorAll('.js-consent-reopen'),
    function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); reopen(); });
    }
  );
})();
