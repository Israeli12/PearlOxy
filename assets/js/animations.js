/* PearlOxy Uganda Limited: animations.js
 *
 * A GSAP layer that sits on top of the markup rather than inside it. Every
 * animation targets a CSS class, so the HTML stays plain Elementor-style
 * containers and widgets; in the WordPress rebuild this file loads once from
 * Elementor's Custom Code and keeps working untouched.
 *
 * Nothing is hidden by the stylesheet. The "before" state of every tween is
 * set here with gsap.set(), so if the CDN is blocked, the script fails, or the
 * visitor prefers reduced motion, the page simply renders complete and static.
 */
(function () {
  'use strict';

  var hasGsap = typeof window.gsap !== 'undefined';
  var reduce = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (!hasGsap || reduce) return;

  var gsap = window.gsap;
  var ScrollTrigger = window.ScrollTrigger;
  if (ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  var EASE = 'power3.out';
  var isDesktop = window.matchMedia('(min-width: 992px)').matches;

  /* Every element this file hides, so it can be un-hidden if the frame loop
   * turns out to be starved. A hero that never fades in is far worse than a
   * hero that never animates. */
  var hidden = [];
  function hide(targets, vars) {
    gsap.set(targets, vars);
    track(targets);
  }
  function track(targets) {
    hidden = hidden.concat(gsap.utils.toArray(targets));
  }
  /* Elements whose resting state cannot be recovered by clearProps, because the
   * value is authored in the markup rather than applied here. */
  var stallFixes = [];

  /* Watchdog. Browsers throttle requestAnimationFrame in background tabs, in
   * some embedded webviews and on very low-power devices. If almost no frames
   * have been drawn shortly after load, drop the choreography and strip the
   * inline styles so the finished page is simply there. */
  var startFrame = gsap.ticker.frame;
  window.setTimeout(function () {
    if (gsap.ticker.frame - startFrame > 8) return;
    // Scroll-driven tweens would re-apply their start values on the next scroll
    // event, so the triggers have to go before the inline styles are stripped.
    if (window.ScrollTrigger) {
      window.ScrollTrigger.getAll().forEach(function (st) { st.kill(); });
    }
    gsap.killTweensOf(hidden);
    gsap.set(hidden, { clearProps: 'all' });
    stallFixes.forEach(function (fix) { fix(); });
  }, 1800);

  /* ------------------------------------------------------------------ *
   * 1. Headline split
   * Wraps each word in a masked span so lines can rise into view. An
   * element child (the gradient <em>) is kept whole as a single unit so
   * its background-clip is never broken by a transform on its own text.
   * ------------------------------------------------------------------ */
  function splitWords(el) {
    if (!el || el.classList.contains('split')) return [];
    var parts = [];

    var wrap = function (content) {
      var outer = document.createElement('span');
      outer.className = 'word';
      var inner = document.createElement('span');
      inner.className = 'word__i';
      if (typeof content === 'string') inner.textContent = content;
      else inner.appendChild(content);
      outer.appendChild(inner);
      parts.push(inner);
      return outer;
    };

    var nodes = Array.prototype.slice.call(el.childNodes);
    var frag = document.createDocumentFragment();

    nodes.forEach(function (node) {
      if (node.nodeType === 3) {
        var words = node.nodeValue.split(/(\s+)/);
        words.forEach(function (w) {
          if (!w) return;
          if (/^\s+$/.test(w)) frag.appendChild(document.createTextNode(' '));
          else frag.appendChild(wrap(w));
        });
      } else if (node.nodeType === 1) {
        frag.appendChild(wrap(node));
      }
    });

    el.innerHTML = '';
    el.appendChild(frag);
    el.classList.add('split');
    return parts;
  }

  /* ------------------------------------------------------------------ *
   * 2. Hero entrance
   * ------------------------------------------------------------------ */
  var hero = document.querySelector('.hero, .page-hero');
  if (hero) {
    var h1 = hero.querySelector('h1');
    var words = splitWords(h1);
    var eyebrow = hero.querySelector('.eyebrow');
    var lead = hero.querySelector('.lead');
    var buttons = hero.querySelectorAll('.btn-group .btn');
    var cred = hero.querySelector('.hero__credibility');
    var cue = hero.querySelector('.scroll-cue');
    var art = hero.querySelector('.hero__media img');
    var glow = hero.querySelector('.hero__glow');

    var tl = gsap.timeline({ defaults: { ease: EASE } });

    if (eyebrow) {
      hide(eyebrow, { opacity: 0, y: 14 });
      tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.7 }, 0.05);
    }
    if (words.length) {
      hide(words, { yPercent: 115 });
      tl.to(words, { yPercent: 0, duration: 1.05, stagger: 0.055 }, 0.12);
    }
    if (glow) {
      hide(glow, { scale: 0.82, opacity: 0 });
      tl.to(glow, { scale: 1, opacity: 1, duration: 1.6, ease: 'power2.out' }, 0.1);
    }
    if (art) {
      hide(art, { opacity: 0, y: 46, scale: 0.97 });
      tl.to(art, { opacity: 1, y: 0, scale: 1, duration: 1.3 }, 0.3);
    }
    [lead, cred, cue].forEach(function (el, i) {
      if (!el) return;
      hide(el, { opacity: 0, y: 18 });
      tl.to(el, { opacity: 1, y: 0, duration: 0.8 }, 0.5 + i * 0.1);
    });
    if (buttons.length) {
      hide(buttons, { opacity: 0, y: 18 });
      tl.to(buttons, { opacity: 1, y: 0, duration: 0.8, stagger: 0.08 }, 0.62);
    }
  }

  if (!ScrollTrigger) return;

  /* ------------------------------------------------------------------ *
   * 3. Section reveals
   * A .reveal row animates its own columns in sequence; anything else
   * animates as one block.
   * ------------------------------------------------------------------ */
  gsap.utils.toArray('.reveal').forEach(function (el) {
    var inHero = hero && hero.contains(el);
    if (inHero) return;

    var kids = el.classList.contains('row')
      ? gsap.utils.toArray(el.children)
      : [el];

    hide(kids, { opacity: 0, y: 34 });
    gsap.to(kids, {
      opacity: 1,
      y: 0,
      duration: 0.95,
      ease: EASE,
      stagger: 0.09,
      scrollTrigger: { trigger: el, start: 'top 86%', once: true }
    });
  });

  /* ------------------------------------------------------------------ *
   * 4. Count-up on statistics
   * Reads the figure already printed in the markup, so the number stays
   * correct without this script and is never duplicated in an attribute.
   * ------------------------------------------------------------------ */
  gsap.utils.toArray('.stat__num').forEach(function (el) {
    var textNode = null;
    for (var i = 0; i < el.childNodes.length; i++) {
      if (el.childNodes[i].nodeType === 3 && /\d/.test(el.childNodes[i].nodeValue)) {
        textNode = el.childNodes[i];
        break;
      }
    }
    if (!textNode) return;

    var m = textNode.nodeValue.match(/^(\D*)([\d,]+)(\D*)$/);
    if (!m) return;

    var prefix = m[1], suffix = m[3];
    var grouped = m[2].indexOf(',') !== -1;
    var target = parseInt(m[2].replace(/,/g, ''), 10);
    if (!isFinite(target) || target < 3) return;

    var state = { v: 0 };
    var render = function () {
      var n = Math.round(state.v);
      textNode.nodeValue = prefix + (grouped ? n.toLocaleString('en-US') : n) + suffix;
    };

    ScrollTrigger.create({
      trigger: el,
      start: 'top 88%',
      once: true,
      onEnter: function () {
        render();
        gsap.to(state, {
          v: target,
          duration: 1.6,
          ease: 'power2.out',
          onUpdate: render,
          onComplete: function () {
            textNode.nodeValue = prefix +
              (grouped ? target.toLocaleString('en-US') : target) + suffix;
          }
        });
      }
    });
  });

  /* ------------------------------------------------------------------ *
   * 5. Use-of-funds bars
   * ------------------------------------------------------------------ */
  gsap.utils.toArray('.fund__fill').forEach(function (bar) {
    var width = getComputedStyle(bar).getPropertyValue('--w').trim() || '0%';
    gsap.killTweensOf(bar);
    stallFixes.push(function () { bar.style.width = width; });
    gsap.fromTo(bar,
      { width: '0%' },
      {
        width: width,
        duration: 1.5,
        ease: 'power2.inOut',
        scrollTrigger: { trigger: bar, start: 'top 92%', once: true }
      });
  });

  /* ------------------------------------------------------------------ *
   * 6. Parallax
   * ------------------------------------------------------------------ */
  if (isDesktop) {
    var device = document.querySelector('.hero__media img');
    if (device) {
      gsap.to(device, {
        yPercent: 11,
        ease: 'none',
        scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.6 }
      });
    }

    gsap.utils.toArray('.figure.media-ratio img, .tl-item__media img').forEach(function (img) {
      track(img);
      gsap.fromTo(img,
        { yPercent: -5 },
        {
          yPercent: 5,
          ease: 'none',
          scrollTrigger: { trigger: img, start: 'top bottom', end: 'bottom top', scrub: 0.8 }
        });
    });
  }

  /* ------------------------------------------------------------------ *
   * 7. Process flow: steps settle in order, arrows draw between them
   * ------------------------------------------------------------------ */
  gsap.utils.toArray('.flow').forEach(function (flow) {
    var steps = flow.querySelectorAll('.flow__step');
    var arrows = flow.querySelectorAll('.flow__arrow');
    if (!steps.length) return;

    hide(steps, { opacity: 0, y: 28 });
    hide(arrows, { opacity: 0, scale: 0.4 });

    var seq = gsap.timeline({
      scrollTrigger: { trigger: flow, start: 'top 80%', once: true }
    });
    seq.to(steps, { opacity: 1, y: 0, duration: 0.7, ease: EASE, stagger: 0.13 })
       .to(arrows, { opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(2)', stagger: 0.13 }, 0.28);
  });

  /* ------------------------------------------------------------------ *
   * 8. Timeline: the rule draws down as the entries arrive
   * ------------------------------------------------------------------ */
  gsap.utils.toArray('.timeline').forEach(function (line) {
    // A scrubbed tween starts collapsed, so the rule has to be tracked too:
    // without this it would stay at scaleY(0) if the frame loop never runs.
    track(line);
    gsap.fromTo(line,
      { '--tl-scale': 0 },
      {
        '--tl-scale': 1,
        ease: 'none',
        scrollTrigger: { trigger: line, start: 'top 72%', end: 'bottom 72%', scrub: 0.5 }
      });

    gsap.utils.toArray(line.querySelectorAll('.tl-item')).forEach(function (item) {
      var year = item.querySelector('.tl-item__year');
      var body = item.querySelector('.tl-item__body');
      hide([year, body], { opacity: 0 });
      gsap.set(year, { scale: 0.6 });
      gsap.set(body, { x: 22 });

      gsap.timeline({ scrollTrigger: { trigger: item, start: 'top 84%', once: true } })
        .to(year, { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(1.8)' })
        .to(body, { opacity: 1, x: 0, duration: 0.7, ease: EASE }, 0.08);
    });
  });

  /* ------------------------------------------------------------------ *
   * 9. Magnetic primary buttons, pointer devices only
   * ------------------------------------------------------------------ */
  if (isDesktop && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    gsap.utils.toArray('.btn--primary, .btn--light').forEach(function (btn) {
      var move = function (e) {
        var r = btn.getBoundingClientRect();
        gsap.to(btn, {
          x: (e.clientX - (r.left + r.width / 2)) * 0.18,
          y: (e.clientY - (r.top + r.height / 2)) * 0.3,
          duration: 0.5,
          ease: 'power3.out'
        });
      };
      var reset = function () {
        gsap.to(btn, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.45)' });
      };
      btn.addEventListener('mousemove', move);
      btn.addEventListener('mouseleave', reset);
    });
  }

  /* ------------------------------------------------------------------ *
   * 10. Keep positions honest when layout changes
   * ------------------------------------------------------------------ */
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  document.addEventListener('pearloxy:layoutchange', function () { ScrollTrigger.refresh(); });
})();
