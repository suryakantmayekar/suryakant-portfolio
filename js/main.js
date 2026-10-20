/* ============================================================
   V2 — Dark editorial theme
   Vanilla JS: reveals, counters, nav, pointer glow, form
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ----------------------------------------------------------
     1. Header state + scroll progress
     ---------------------------------------------------------- */
  var header = document.querySelector('.bar');
  var progress = document.querySelector('.scroll-line span');
  var ticking = false;

  function onScroll() {
    if (ticking) return;
    ticking = true;

    window.requestAnimationFrame(function () {
      var y = window.scrollY || window.pageYOffset;

      if (header) header.classList.toggle('is-scrolled', y > 10);

      if (progress) {
        var doc = document.documentElement;
        var max = doc.scrollHeight - doc.clientHeight;
        progress.style.width = max > 0 ? (y / max) * 100 + '%' : '0%';
      }

      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ----------------------------------------------------------
     2. Mobile menu
     ---------------------------------------------------------- */
  var burger = document.querySelector('.burger');
  var menu = document.querySelector('.menu');

  function closeMenu() {
    if (!burger || !menu) return;
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    menu.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  }

  if (burger && menu) {
    burger.addEventListener('click', function () {
      var open = burger.getAttribute('aria-expanded') === 'true';
      burger.setAttribute('aria-expanded', String(!open));
      burger.setAttribute('aria-label', open ? 'Open menu' : 'Close menu');
      menu.classList.toggle('is-open', !open);
      document.body.classList.toggle('menu-open', !open);
    });

    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeMenu();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });

    var desktop = window.matchMedia('(min-width: 1025px)');
    var onChange = function (e) {
      if (e.matches) closeMenu();
    };
    if (desktop.addEventListener) desktop.addEventListener('change', onChange);
    else if (desktop.addListener) desktop.addListener(onChange);
  }

  /* ----------------------------------------------------------
     3. Reveal on scroll
     ---------------------------------------------------------- */
  var revealEls = document.querySelectorAll('[data-reveal]');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) {
      el.classList.add('in');
    });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('in');
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );

    revealEls.forEach(function (el) {
      revealObserver.observe(el);
    });
  }

  /* ----------------------------------------------------------
     4. Counters
     ---------------------------------------------------------- */
  var counters = document.querySelectorAll('.count');

  function animateCounter(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;

    if (reduceMotion) {
      el.textContent = String(target);
      return;
    }

    var duration = 1300;
    var start = null;

    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(eased * target));
      if (p < 1) window.requestAnimationFrame(step);
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
     5. Active nav link
     ---------------------------------------------------------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.menu a'));
  var sections = navLinks
    .map(function (link) {
      var href = link.getAttribute('href');
      return href && href.charAt(0) === '#' ? document.querySelector(href) : null;
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
      { rootMargin: '-42% 0px -52% 0px', threshold: 0 }
    );

    sections.forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  /* ----------------------------------------------------------
     6. Pointer-follow glow in the hero
     ---------------------------------------------------------- */
  var hero = document.querySelector('.hero');
  var finePointer = window.matchMedia('(pointer: fine)').matches;

  if (hero && finePointer && !reduceMotion) {
    var heroTicking = false;
    var lastEvent = null;

    hero.addEventListener('pointermove', function (e) {
      lastEvent = e;
      if (heroTicking) return;
      heroTicking = true;

      window.requestAnimationFrame(function () {
        var rect = hero.getBoundingClientRect();
        var x = ((lastEvent.clientX - rect.left) / rect.width) * 100;
        var y = ((lastEvent.clientY - rect.top) / rect.height) * 100;
        hero.style.setProperty('--mx', x.toFixed(1) + '%');
        hero.style.setProperty('--my', y.toFixed(1) + '%');
        heroTicking = false;
      });
    });
  }

  /* ----------------------------------------------------------
     7. Custom select (progressively enhances the native <select>)
     ---------------------------------------------------------- */
  var selectWrap = document.querySelector('[data-select]');
  var nativeSelect = document.getElementById('v2-topic');
  var selectTrigger = document.getElementById('topic-trigger');
  var selectValue = document.getElementById('topic-value');
  var selectReset = null;

  if (selectWrap && nativeSelect && selectTrigger && selectValue) {
    var selectMenu = selectWrap.querySelector('.select__menu');
    var selectOptions = Array.prototype.slice.call(
      selectMenu.querySelectorAll('[role="option"]')
    );
    var placeholder = selectValue.textContent;

    nativeSelect.setAttribute('tabindex', '-1');
    nativeSelect.setAttribute('aria-hidden', 'true');

    function setActiveOption(index) {
      selectOptions.forEach(function (option, i) {
        option.classList.toggle('is-active', i === index);
      });
      if (selectOptions[index]) selectOptions[index].focus();
    }

    function openSelect() {
      selectMenu.hidden = false;
      selectTrigger.setAttribute('aria-expanded', 'true');
      selectWrap.classList.add('is-open');

      var selected = selectOptions.findIndex(function (o) {
        return o.getAttribute('aria-selected') === 'true';
      });
      setActiveOption(selected >= 0 ? selected : 0);
    }

    function closeSelect(refocus) {
      selectMenu.hidden = true;
      selectTrigger.setAttribute('aria-expanded', 'false');
      selectWrap.classList.remove('is-open');
      if (refocus) selectTrigger.focus();
    }

    function chooseOption(option) {
      selectOptions.forEach(function (o) {
        o.setAttribute('aria-selected', String(o === option));
      });
      nativeSelect.value = option.getAttribute('data-value');
      selectValue.textContent = option.textContent.trim();
      selectValue.classList.remove('is-placeholder');
      selectTrigger.classList.remove('is-invalid');
      closeSelect(true);
    }

    selectReset = function () {
      selectOptions.forEach(function (o) {
        o.setAttribute('aria-selected', 'false');
        o.classList.remove('is-active');
      });
      nativeSelect.value = '';
      selectValue.textContent = placeholder;
      selectValue.classList.add('is-placeholder');
      closeSelect(false);
    };

    selectTrigger.addEventListener('click', function () {
      if (selectMenu.hidden) openSelect();
      else closeSelect(true);
    });

    selectTrigger.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        openSelect();
      }
    });

    selectOptions.forEach(function (option, index) {
      option.addEventListener('click', function () {
        chooseOption(option);
      });

      option.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setActiveOption((index + 1) % selectOptions.length);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          setActiveOption((index - 1 + selectOptions.length) % selectOptions.length);
        } else if (e.key === 'Home') {
          e.preventDefault();
          setActiveOption(0);
        } else if (e.key === 'End') {
          e.preventDefault();
          setActiveOption(selectOptions.length - 1);
        } else if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          chooseOption(option);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          closeSelect(true);
        } else if (e.key === 'Tab') {
          closeSelect(false);
        }
      });
    });

    document.addEventListener('click', function (e) {
      if (!selectMenu.hidden && !selectWrap.contains(e.target)) closeSelect(false);
    });
  }

  /* ----------------------------------------------------------
     8. Contact form → Netlify Forms
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
      var fields = form.querySelectorAll(
        'input:not([type="hidden"]), select:not(.native-select), textarea'
      );
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

      // custom select (the real value lives in the hidden native select)
      if (nativeSelect && !nativeSelect.value) {
        if (selectTrigger) selectTrigger.classList.add('is-invalid');
        if (!firstInvalid) firstInvalid = selectTrigger;
      }

      return firstInvalid;
    }

    function mailtoFallback(data) {
      var subject = 'Website enquiry — ' + data.get('topic') + ' (' + data.get('name') + ')';
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

      if (isLocal || window.location.protocol === 'file:') {
        setStatus('error', 'Netlify Forms works on the live site — opening your email app instead.');
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
          if (selectReset) selectReset();
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

    form.addEventListener('input', function (e) {
      if (e.target.classList) e.target.classList.remove('is-invalid');
    });
  }

  /* ----------------------------------------------------------
     8. Footer year
     ---------------------------------------------------------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
})();
