/* ============================================================
   Suryakant Mayekar — Freelance Profile
   Vanilla JS: scroll reveals, counters, nav, form
   No dependencies.
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------
     1. Header state + scroll progress bar
     ---------------------------------------------------------- */
  var header = document.querySelector('.site-header');
  var progressBar = document.querySelector('.scroll-progress__bar');
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      var y = window.scrollY || window.pageYOffset;

      if (header) header.classList.toggle('is-scrolled', y > 12);

      if (progressBar) {
        var doc = document.documentElement;
        var max = doc.scrollHeight - doc.clientHeight;
        progressBar.style.width = max > 0 ? (y / max) * 100 + '%' : '0%';
      }

      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ----------------------------------------------------------
     2. Mobile navigation
     ---------------------------------------------------------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');

  function closeMenu() {
    if (!toggle || !nav) return;
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open menu');
    nav.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  }

  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      toggle.setAttribute('aria-expanded', String(!open));
      toggle.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
      nav.classList.toggle('is-open', !open);
      document.body.classList.toggle('menu-open', !open);
    });

    // Close when a link is chosen
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    // Reset when switching back to desktop
    var desktop = window.matchMedia('(min-width: 1025px)');
    var onChange = function (e) {
      if (e.matches) closeMenu();
    };
    if (desktop.addEventListener) desktop.addEventListener('change', onChange);
    else if (desktop.addListener) desktop.addListener(onChange);
  }

  /* ----------------------------------------------------------
     3. On-scroll reveal animations
     ---------------------------------------------------------- */
  var revealEls = document.querySelectorAll('[data-reveal]');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) {
      el.classList.add('is-visible');
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ----------------------------------------------------------
     4. Animated counters (hero stats)
     ---------------------------------------------------------- */
  var counters = document.querySelectorAll('.counter');

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    if (reduceMotion) {
      el.textContent = String(target);
      return;
    }

    var duration = 1400;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      // ease-out cubic
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = String(Math.round(eased * target));
      if (progress < 1) window.requestAnimationFrame(step);
    }

    window.requestAnimationFrame(step);
  }

  if (counters.length) {
    if (!('IntersectionObserver' in window)) {
      counters.forEach(animateCounter);
    } else {
      var counterObserver = new IntersectionObserver(
        function (entries, obs) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      counters.forEach(function (el) {
        counterObserver.observe(el);
      });
    }
  }

  /* ----------------------------------------------------------
     5. Active nav link highlighting
     ---------------------------------------------------------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
  var sections = navLinks
    .map(function (link) {
      var id = link.getAttribute('href');
      return id && id.charAt(0) === '#' ? document.querySelector(id) : null;
    })
    .filter(Boolean);

  if (sections.length && 'IntersectionObserver' in window) {
    var visible = new Set();

    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        });

        var currentId = null;
        for (var i = 0; i < sections.length; i++) {
          if (visible.has(sections[i].id)) {
            currentId = sections[i].id;
            break;
          }
        }

        navLinks.forEach(function (link) {
          link.classList.toggle(
            'is-active',
            currentId !== null && link.getAttribute('href') === '#' + currentId
          );
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  /* ----------------------------------------------------------
     6. Contact form → Netlify Forms
     ---------------------------------------------------------- */
  var form = document.getElementById('contact-form');
  var statusEl = document.getElementById('form-status');
  var submitBtn = form ? form.querySelector('button[type="submit"]') : null;

  if (form) {
    var CONTACT_EMAIL = 'suryakantmayekar@gmail.com';
    var isLocal = /^(localhost|127\.0\.0\.1|\[::1\]|)$/.test(window.location.hostname);

    function escapeHtml(str) {
      return String(str).replace(/[&<>"']/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
      });
    }

    function setStatus(type, message) {
      if (!statusEl) return;
      statusEl.className = 'form-status' + (type ? ' is-' + type : '');
      statusEl.innerHTML = message || '';
    }

    function setLoading(loading) {
      if (!submitBtn) return;
      submitBtn.disabled = loading;
      var label = submitBtn.querySelector('.btn__label');
      if (label) label.textContent = loading ? 'Sending…' : 'Send enquiry';
    }

    function validate() {
      var fields = form.querySelectorAll('input:not([type="hidden"]), select, textarea');
      var firstInvalid = null;

      fields.forEach(function (field) {
        if (field.name === 'bot-field') return;

        var invalid = !field.value.trim();
        if (field.type === 'email' && field.value.trim()) {
          invalid = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
        }
        field.classList.toggle('is-invalid', invalid);
        if (invalid && !firstInvalid) firstInvalid = field;
      });

      return firstInvalid;
    }

    function mailtoFallback(data) {
      var subject =
        'Website enquiry — ' + data.get('topic') + ' (' + data.get('name') + ')';
      var body =
        'Name: ' + data.get('name') + '\n' +
        'Email: ' + data.get('email') + '\n' +
        'Service needed: ' + data.get('topic') + '\n\n' +
        'Project details:\n' + data.get('message') + '\n';

      window.location.href =
        'mailto:' + CONTACT_EMAIL +
        '?subject=' + encodeURIComponent(subject) +
        '&body=' + encodeURIComponent(body);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      setStatus('', '');

      var firstInvalid = validate();
      if (firstInvalid) {
        firstInvalid.focus();
        setStatus('error', 'Please complete the highlighted fields.');
        return;
      }

      var data = new FormData(form);

      // Netlify Forms only accepts submissions on the deployed site
      if (isLocal || window.location.protocol === 'file:') {
        setStatus('error', 'Netlify Forms works on your live site — opening your email app instead.');
        mailtoFallback(data);
        return;
      }

      setLoading(true);

      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString()
      })
        .then(function (res) {
          if (!res.ok) throw new Error('HTTP ' + res.status);

          var firstName = String(data.get('name') || '').trim().split(' ')[0];
          setStatus(
            'success',
            'Thanks' + (firstName ? ', ' + escapeHtml(firstName) : '') +
              '. Your enquiry has been sent — I will get back to you soon.'
          );
          form.reset();
        })
        .catch(function () {
          setStatus(
            'error',
            'Something went wrong sending the form. Please email me directly at ' +
              '<a href="mailto:' + CONTACT_EMAIL + '">' + CONTACT_EMAIL + '</a>.'
          );
        })
        .finally(function () {
          setLoading(false);
        });
    });

    // Clear invalid state while typing
    form.addEventListener('input', function (e) {
      if (e.target.classList) e.target.classList.remove('is-invalid');
    });
  }

  /* ----------------------------------------------------------
     7. Footer year
     ---------------------------------------------------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
