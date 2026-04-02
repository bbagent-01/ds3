/* ============================================
   BB Animations — Brightbase Animation Stack
   Lenis smooth scroll + GSAP ScrollTrigger

   Animation classes:
   .bb-reveal        — headline slide-up from baseline (word stagger)
   .bb-fade-text     — paragraph left-to-right fade (line-level)
   .bb-fade-in       — element fade up on scroll
   .bb-stagger-group — children stagger fade up
   .bb-parallax      — scroll-driven Y transform (data-speed)
   ============================================ */

(function () {
  'use strict';

  // ---- Lenis Smooth Scroll ----
  function initLenis() {
    if (typeof Lenis === 'undefined') return null;

    const lenis = new Lenis({
      lerp: 0.1,
      duration: 1.2,
      smoothWheel: true,
      wheelMultiplier: 1,
    });

    if (typeof gsap !== 'undefined') {
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }

    return lenis;
  }

  // ---- Headline: Slide Up from Baseline (word stagger) ----
  function initHeadlineReveals() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    const revealElements = document.querySelectorAll('.bb-reveal');

    revealElements.forEach((el) => {
      // Split by words using SplitType if available
      if (typeof SplitType !== 'undefined') {
        const split = new SplitType(el, { types: 'words' });

        // Wrap each word in an overflow-hidden container for the clip effect
        split.words.forEach((word) => {
          const wrapper = document.createElement('span');
          wrapper.style.display = 'inline-block';
          wrapper.style.overflow = 'hidden';
          wrapper.style.verticalAlign = 'top';
          wrapper.style.paddingBottom = '0.08em'; // room for descenders
          word.parentNode.insertBefore(wrapper, word);
          wrapper.appendChild(word);
        });

        // Set initial state — pushed below baseline
        gsap.set(split.words, {
          yPercent: 110,
          opacity: 0,
        });

        // Animate up into place
        gsap.to(split.words, {
          yPercent: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.04, // very small word stagger
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        });
      } else {
        // Fallback without SplitType
        gsap.set(el, { y: 40, opacity: 0 });
        gsap.to(el, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            toggleActions: 'play none none none',
          },
        });
      }
    });
  }

  // ---- Paragraph: Left-to-Right Fade (line-level) ----
  function initTextFades() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const fadeTextElements = document.querySelectorAll('.bb-fade-text');

    fadeTextElements.forEach((el) => {
      if (typeof SplitType !== 'undefined') {
        const split = new SplitType(el, { types: 'lines' });

        gsap.set(split.lines, {
          opacity: 0,
          x: -20,
          filter: 'blur(2px)',
        });

        gsap.to(split.lines, {
          opacity: 1,
          x: 0,
          filter: 'blur(0px)',
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        });
      } else {
        // Fallback
        gsap.set(el, { opacity: 0, x: -20 });
        gsap.to(el, {
          opacity: 1,
          x: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        });
      }
    });
  }

  // ---- Fade-in on scroll (single elements) ----
  function initFadeIns() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const elements = document.querySelectorAll('.bb-fade-in');
    if (!elements.length) return;

    elements.forEach((el) => {
      gsap.set(el, { y: 30, opacity: 0 });
      gsap.to(el, {
        y: 0,
        opacity: 1,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          toggleActions: 'play none none none',
        },
      });
    });
  }

  // ---- Staggered fade-in for groups ----
  function initStaggerGroups() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const groups = document.querySelectorAll('.bb-stagger-group');
    groups.forEach((group) => {
      const children = Array.from(group.children);

      // Set initial state explicitly
      gsap.set(children, { y: 40, opacity: 0 });

      gsap.to(children, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: group,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
      });
    });
  }

  // ---- Parallax elements ----
  function initParallax() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const parallaxElements = document.querySelectorAll('.bb-parallax');
    parallaxElements.forEach((el) => {
      const speed = parseFloat(el.dataset.speed) || 0.2;
      gsap.to(el, {
        yPercent: -100 * speed,
        ease: 'none',
        scrollTrigger: {
          trigger: el.closest('.section, section, [class*="bg-"]') || el,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      });
    });
  }

  // ---- Auto-apply fade-in to common elements ----
  function autoApplyAnimations() {
    // Apply bb-fade-in to cards, badges, buttons rows, inputs, demo rows
    // that don't already have an animation class
    const autoTargets = document.querySelectorAll(
      '.bb-card:not(.bb-fade-in):not(.bb-stagger-group *), ' +
      '.bb-card-dark:not(.bb-fade-in):not(.bb-stagger-group *), ' +
      '.demo-card-grid:not(.bb-stagger-group), ' +
      '.swatch-row, ' +
      '.demo-row:not(.bb-stagger-group *)'
    );

    autoTargets.forEach((el) => {
      if (!el.closest('.bb-stagger-group')) {
        el.classList.add('bb-fade-in');
      }
    });

    // Apply bb-fade-text to body text that doesn't have an animation class
    const autoText = document.querySelectorAll(
      '.bb-body:not(.bb-fade-text):not(.bb-reveal):not(.bb-fade-in), ' +
      '.bb-body-sm:not(.bb-fade-text):not(.bb-reveal):not(.bb-fade-in):not(.bb-stagger-group *):not(.bb-card *):not(.bb-card-dark *):not(.bb-grid-cell *)'
    );

    autoText.forEach((el) => {
      // Only top-level body text, not inside cards
      if (!el.closest('.bb-card, .bb-card-dark, .bb-grid-cell, .bb-grid-figure, .bb-stagger-group, footer')) {
        el.classList.add('bb-fade-text');
      }
    });
  }

  // ---- Initialize everything on DOM ready ----
  document.addEventListener('DOMContentLoaded', () => {
    initLenis();

    // Small delay to ensure fonts/SplitType are ready
    requestAnimationFrame(() => {
      autoApplyAnimations();
      initHeadlineReveals();
      initTextFades();
      initFadeIns();
      initStaggerGroups();
      initParallax();
    });
  });
})();
