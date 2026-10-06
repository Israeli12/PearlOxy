/* PearlOxy Uganda Limited: main.js
 *
 * Interaction only: mobile menu, accordion, video facade, forms, header state.
 * Every behaviour here has a native Elementor equivalent, so the WordPress
 * rebuild can drop this file entirely and wire the same things with widgets.
 * Motion lives in animations.js.
 */
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

  /* ---------- 2. Header gains a hairline once the page moves ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var syncHeader = function () {
      header.classList.toggle('is-stuck', window.scrollY > 8);
    };
    syncHeader();
    window.addEventListener('scroll', syncHeader, { passive: true });
  }

  /* ---------- 3. Accordion ---------- */
  var setPanelHeight = function (panel, open) {
    panel.style.maxHeight = open ? panel.scrollHeight + 'px' : '0px';
  };

  var accTriggers = document.querySelectorAll('.acc-trigger');
  Array.prototype.forEach.call(accTriggers, function (trigger) {
    var panel = document.getElementById(trigger.getAttribute('aria-controls'));
    if (!panel) return;

    trigger.addEventListener('click', function () {
      var isOpen = trigger.getAttribute('aria-expanded') === 'true';
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
      // Opening a panel changes page height; let the scroll triggers recalculate.
      document.dispatchEvent(new CustomEvent('pearloxy:layoutchange'));
    });
  });

  window.addEventListener('resize', function () {
    Array.prototype.forEach.call(accTriggers, function (trigger) {
      if (trigger.getAttribute('aria-expanded') !== 'true') return;
      var panel = document.getElementById(trigger.getAttribute('aria-controls'));
      if (panel) setPanelHeight(panel, true);
    });
  });

  /* ---------- 4. Video facade, loads YouTube only on click ---------- */
  Array.prototype.forEach.call(document.querySelectorAll('.video__play'), function (btn) {
    btn.addEventListener('click', function () {
      var wrap = btn.closest('.video');
      var frame = wrap.querySelector('.video__frame');
      var id = wrap.getAttribute('data-video-id');
      var title = wrap.getAttribute('data-video-title') || 'PearlOxy video';
      if (!id || !frame) return;

      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + id +
        '?autoplay=1&rel=0&modestbranding=1';
      iframe.title = title;
      iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');

      frame.innerHTML = '';
      frame.appendChild(iframe);
      btn.remove();
    });
  });

  /* ---------- 5. Forms ----------
     Static hosting has no form backend, so submitting opens the visitor's mail
     client with every answer filled in. In the WordPress rebuild this block is
     replaced by a native Elementor Form widget.                              */
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
        lines.push(labelText + ': ' + (el.value || 'not given'));
      });

      var body = lines.join('\n') +
        '\n\nSent from the PearlOxy website, ' + window.location.pathname;

      window.location.href = 'mailto:' + MAILTO +
        '?subject=' + encodeURIComponent('[PearlOxy] ' + subject) +
        '&body=' + encodeURIComponent(body);

      var status = form.querySelector('[data-form-status]');
      if (status) {
        status.textContent = 'Your email app should now be open with this message ready to ' +
          'send. If nothing happened, email ' + MAILTO + ' directly.';
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
