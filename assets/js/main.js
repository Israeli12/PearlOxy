/* PearlOxy Uganda Limited — main.js
   Scope is deliberately small so every behaviour has a native Elementor equivalent:
   mobile menu, accordion, scroll reveal, video facade, form mailto handoff. */
(function () {
  'use strict';

  /* ---------- 1. Mobile navigation ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.nav');

  if (toggle && nav) {
    var closeNav = function () {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.classList.remove('nav-open');
    };

    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.classList.toggle('nav-open', open);
    });

    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) closeNav();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('is-open')) {
        closeNav();
        toggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      // Matches the CSS nav breakpoint (max-width:1151px).
      if (window.innerWidth > 1151 && nav.classList.contains('is-open')) closeNav();
    });
  }

  /* ---------- 2. Accordion ---------- */
  var setPanelHeight = function (panel, open) {
    panel.style.maxHeight = open ? panel.scrollHeight + 'px' : '0px';
  };

  var accTriggers = document.querySelectorAll('.acc-trigger');
  Array.prototype.forEach.call(accTriggers, function (trigger) {
    var panel = document.getElementById(trigger.getAttribute('aria-controls'));
    if (!panel) return;

    trigger.addEventListener('click', function () {
      var isOpen = trigger.getAttribute('aria-expanded') === 'true';
      // Close siblings within the same accordion group.
      var group = trigger.closest('.accordion');
      if (group && !isOpen) {
        Array.prototype.forEach.call(group.querySelectorAll('.acc-trigger'), function (t) {
          if (t === trigger) return;
          t.setAttribute('aria-expanded', 'false');
          var p = document.getElementById(t.getAttribute('aria-controls'));
          if (p) setPanelHeight(p, false);
        });
      }
      trigger.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      setPanelHeight(panel, !isOpen);
    });
  });

  window.addEventListener('resize', function () {
    Array.prototype.forEach.call(accTriggers, function (trigger) {
      if (trigger.getAttribute('aria-expanded') !== 'true') return;
      var panel = document.getElementById(trigger.getAttribute('aria-controls'));
      if (panel) setPanelHeight(panel, true);
    });
  });

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- 2b. Header gains a hairline once the page moves ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var syncHeader = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });
  }

  /* ---------- 2c. Stagger siblings inside a revealed row ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.row.reveal'), function (row) {
    var kids = row.children;
    for (var i = 0; i < kids.length; i++) {
      kids[i].style.setProperty('--d', (i % 4) * 90 + 'ms');
    }
  });

  /* ---------- 3. Scroll reveal ---------- */
  var revealTargets = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(revealTargets, function (el) { el.classList.add('is-visible'); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(revealTargets, function (el) { observer.observe(el); });

    // Failsafe: if the observer never fires (background tab, odd viewport),
    // show everything rather than leaving the page blank.
    window.setTimeout(function () {
      Array.prototype.forEach.call(revealTargets, function (el) { el.classList.add('is-visible'); });
    }, 2500);
  }

  /* ---------- 3b. Count-up on stat figures ----------
     Reads the figure already in the markup, so the number stays correct with
     JavaScript off and nothing has to be duplicated in a data attribute.    */
  var animateCount = function (el) {
    if (el.dataset.counted) return;
    // Only the element's own text, so a trailing <small> unit is left alone.
    var textNode = null;
    for (var i = 0; i < el.childNodes.length; i++) {
      if (el.childNodes[i].nodeType === 3 && /\d/.test(el.childNodes[i].nodeValue)) {
        textNode = el.childNodes[i];
        break;
      }
    }
    if (!textNode) return;
    var match = textNode.nodeValue.match(/^(\D*)([\d,]+)(\D*)$/);
    if (!match) return;
    var prefix = match[1], suffix = match[3];
    var grouped = match[2].indexOf(',') !== -1;
    var target = parseInt(match[2].replace(/,/g, ''), 10);
    if (!isFinite(target) || target < 3) return;

    el.dataset.counted = '1';
    var format = function (n) {
      return grouped ? n.toLocaleString('en-US') : String(n);
    };
    if (reduceMotion) return;

    var duration = 1500, start = null;
    var step = function (ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      textNode.nodeValue = prefix + format(Math.round(target * eased)) + suffix;
      if (p < 1) window.requestAnimationFrame(step);
      else textNode.nodeValue = prefix + format(target) + suffix;
    };
    textNode.nodeValue = prefix + format(0) + suffix;
    window.requestAnimationFrame(step);
    // rAF is paused in background tabs; make sure the real figure always lands.
    window.setTimeout(function () {
      textNode.nodeValue = prefix + format(target) + suffix;
    }, duration + 1200);
  };

  if ('IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    Array.prototype.forEach.call(document.querySelectorAll('.stat__num'), function (el) {
      countObserver.observe(el);
    });
  }

  /* ---------- 3c. Parallax-lite on the hero device ---------- */
  var heroArt = document.querySelector('.hero__media img');
  if (heroArt && !reduceMotion) {
    var ticking = false;
    var shift = function () {
      var y = window.scrollY;
      if (y < 900) heroArt.style.transform = 'translate3d(0,' + (y * 0.07) + 'px,0)';
      ticking = false;
    };
    window.addEventListener('scroll', function () {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(shift);
    }, { passive: true });
  }

  /* ---------- 4. Video facade — loads YouTube only on click ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.video__play'), function (btn) {
    btn.addEventListener('click', function () {
      var wrap = btn.closest('.video');
      var frame = wrap.querySelector('.video__frame');
      var id = wrap.getAttribute('data-video-id');
      var title = wrap.getAttribute('data-video-title') || 'PearlOxy video';
      if (!id || !frame) return;

      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1';
      iframe.title = title;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');

      frame.innerHTML = '';
      frame.appendChild(iframe);
      btn.remove();
    });
  });

  /* ---------- 5. Forms — compose an email to PearlOxy ----------
     Static hosting has no form backend, so submitting opens the visitor's mail
     client with every answer pre-filled. In the WordPress rebuild this whole
     block is replaced by a native Elementor Form widget.                      */
  var MAILTO = 'cathybertainembabazi@gmail.com';

  Array.prototype.forEach.call(document.querySelectorAll('form[data-mailto-form]'), function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.reportValidity()) return;

      var subjectField = form.querySelector('[name="subject"]');
      var subject = (subjectField && subjectField.value) ||
                    form.getAttribute('data-subject') ||
                    'Website enquiry';

      var lines = [];
      Array.prototype.forEach.call(form.elements, function (el) {
        if (!el.name || el.type === 'submit' || el.name === 'subject') return;
        var label = form.querySelector('label[for="' + el.id + '"]');
        var labelText = label ? label.textContent.replace('*', '').trim() : el.name;
        lines.push(labelText + ': ' + (el.value || '—'));
      });

      var body = lines.join('\n') +
        '\n\n— Sent from pearloxy website, ' + window.location.pathname;

      var href = 'mailto:' + MAILTO +
        '?subject=' + encodeURIComponent('[PearlOxy] ' + subject) +
        '&body=' + encodeURIComponent(body);

      window.location.href = href;

      var status = form.querySelector('[data-form-status]');
      if (status) {
        status.textContent = 'Your email app should now be open with this message ready to send. ' +
          'If nothing happened, email ' + MAILTO + ' directly.';
        status.hidden = false;
      }
    });
  });

  /* ---------- 6. Pre-select a form subject from the URL hash ---------- */
  var preselect = function () {
    var hash = window.location.hash;
    if (!hash || hash.indexOf('=') === -1) return;
    var parts = hash.replace('#', '').split('=');
    var select = document.querySelector('select[name="' + parts[0] + '"]');
    if (!select) return;
    var wanted = decodeURIComponent(parts[1]).replace(/\+/g, ' ');
    Array.prototype.forEach.call(select.options, function (opt) {
      if (opt.value.toLowerCase() === wanted.toLowerCase()) select.value = opt.value;
    });
    var card = select.closest('.form-card');
    if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };
  preselect();
  window.addEventListener('hashchange', preselect);
})();
