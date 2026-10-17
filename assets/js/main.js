/**
 * Ahmed Kullab Portfolio - Core Interaction Engine
 * Features:
 * - Multilingual Engine (EN, SL, AR with full RTL, IT)
 * - Kinetic Reveal-on-Scroll animations
 * - Interactive Lightbox with touch/keyboard support
 * - Dynamic Spotlight Card hover effect
 * - Direct Contact copy-to-clipboard & WhatsApp integration
 * - Mobile Navigation Drawer
 * - Counter Animations
 */

(function () {
  'use strict';

  // --- 1. State Management ---
  const state = {
    currentLang: 'en',
    lightboxIndex: 0,
    galleryItems: []
  };

  // Supported languages
  const SUPPORTED_LANGS = ['en', 'sl', 'ar', 'it'];

  // --- 2. Language Switching Engine ---
  function initLanguage() {
    // Check URL param first, then localStorage, then default to English (or user browser language)
    const urlParams = new URLSearchParams(window.location.search);
    const paramLang = urlParams.get('lang');
    const storedLang = localStorage.getItem('ahmed_portfolio_lang');

    let initialLang = 'en';
    if (paramLang && SUPPORTED_LANGS.includes(paramLang)) {
      initialLang = paramLang;
    } else if (storedLang && SUPPORTED_LANGS.includes(storedLang)) {
      initialLang = storedLang;
    }

    setLanguage(initialLang, false);

    // Bind language selector buttons (desktop & mobile)
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const selected = btn.getAttribute('data-lang');
        if (selected && SUPPORTED_LANGS.includes(selected)) {
          setLanguage(selected, true);
        }
      });
    });
  }

  function setLanguage(lang, persist) {
    if (!TRANSLATIONS[lang]) return;
    state.currentLang = lang;
    const t = TRANSLATIONS[lang];

    if (persist) {
      localStorage.setItem('ahmed_portfolio_lang', lang);
      const url = new URL(window.location.href);
      url.searchParams.set('lang', lang);
      window.history.replaceState({}, '', url);
    }

    // Direction & HTML lang
    const isRtl = t.meta && t.meta.dir === 'rtl';
    document.documentElement.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);

    if (isRtl) {
      document.body.classList.add('rtl-mode');
    } else {
      document.body.classList.remove('rtl-mode');
    }

    // Update document title
    if (t.meta && t.meta.title) {
      document.title = t.meta.title;
    }

    // Update Meta Description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && t.meta && t.meta.desc) {
      metaDesc.setAttribute('content', t.meta.desc);
    }

    // Translate all data-i18n elements
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = getNestedTranslation(t, key);
      if (text !== undefined) {
        el.textContent = text;
      }
    });

    // Translate placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      const text = getNestedTranslation(t, key);
      if (text !== undefined) {
        el.setAttribute('placeholder', text);
      }
    });

    // Update active class on language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => {
      if (btn.getAttribute('data-lang') === lang) {
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
      } else {
        btn.classList.remove('active');
        btn.setAttribute('aria-pressed', 'false');
      }
    });

    // Update contact cards & mobile action bar based on Italian manager requirement
    updateContactForLanguage(lang);

    // Re-render gallery captions if lightbox is open
    updateLightboxCaption();
  }

  function updateContactForLanguage(lang) {
    const isItalian = lang === 'it';
    const ahmedWrapper = document.querySelector('.contact-card-ahmed-wrapper');
    const italyWrapper = document.querySelector('.contact-card-italy-wrapper');
    const mobileCall = document.querySelector('.mobile-action-bar a[href^="tel:"]');
    const mobileWa = document.querySelector('.mobile-action-bar a[href*="wa.me"]');
    const mobileEmail = document.querySelector('.mobile-action-bar a[href^="mailto:"]');

    if (isItalian) {
      if (ahmedWrapper) ahmedWrapper.style.display = 'none';
      if (italyWrapper) {
        italyWrapper.style.display = 'block';
        italyWrapper.classList.add('italy-solo');
      }
      if (mobileCall) mobileCall.setAttribute('href', 'tel:+393391344646');
      if (mobileWa) mobileWa.setAttribute('href', 'https://wa.me/393391344646?text=Salve%20Lara,%20vorrei%20informazioni%20su%20Ahmed%20Kullab');
      if (mobileEmail) mobileEmail.setAttribute('href', 'mailto:laramiglietti@virgilio.it');
    } else {
      if (ahmedWrapper) ahmedWrapper.style.display = '';
      if (italyWrapper) {
        italyWrapper.style.display = '';
        italyWrapper.classList.remove('italy-solo');
      }
      if (mobileCall) mobileCall.setAttribute('href', 'tel:+38669760818');
      if (mobileWa) mobileWa.setAttribute('href', 'https://wa.me/38669760818?text=Hello%20Ahmed');
      if (mobileEmail) mobileEmail.setAttribute('href', 'mailto:kollabahmad@gmail.com');
    }
  }

  function getNestedTranslation(obj, path) {
    if (!path) return undefined;
    const parts = path.split('.');
    let curr = obj;
    for (const part of parts) {
      if (curr && typeof curr === 'object' && part in curr) {
        curr = curr[part];
      } else {
        return undefined;
      }
    }
    return curr;
  }

  // --- 3. Sticky Header & Scrollspy ---
  function initHeaderAndNav() {
    const header = document.querySelector('.site-header');
    const navLinks = document.querySelectorAll('.nav-menu a[href^="#"]');
    const sections = document.querySelectorAll('section[id]');
    const mobileToggle = document.querySelector('.mobile-nav-toggle');
    const mobileDrawer = document.querySelector('.mobile-drawer');
    const drawerOverlay = document.querySelector('.drawer-overlay');

    // Header scroll background
    function handleScroll() {
      if (window.scrollY > 40) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }

      // Scrollspy
      let currentSectionId = '';
      const scrollPos = window.scrollY + 200;

      sections.forEach(sec => {
        const top = sec.offsetTop;
        const height = sec.offsetHeight;
        if (scrollPos >= top && scrollPos < top + height) {
          currentSectionId = sec.getAttribute('id');
        }
      });

      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + currentSectionId) {
          link.classList.add('active');
        }
      });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    // Mobile drawer toggle
    function toggleDrawer(open) {
      const isOpen = open !== undefined ? open : !mobileDrawer.classList.contains('open');
      if (isOpen) {
        mobileDrawer.classList.add('open');
        drawerOverlay.classList.add('open');
        mobileToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
      } else {
        mobileDrawer.classList.remove('open');
        drawerOverlay.classList.remove('open');
        mobileToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
      }
    }

    if (mobileToggle) {
      mobileToggle.addEventListener('click', () => toggleDrawer());
    }

    if (drawerOverlay) {
      drawerOverlay.addEventListener('click', () => toggleDrawer(false));
    }

    // Close mobile drawer on link click
    document.querySelectorAll('.mobile-drawer a, .mobile-drawer .lang-btn').forEach(item => {
      item.addEventListener('click', () => {
        if (!item.classList.contains('lang-btn')) {
          toggleDrawer(false);
        }
      });
    });
  }

  // --- 4. Lightbox Gallery Engine ---
  function initGallery() {
    const galleryGrid = document.querySelector('.gallery-grid');
    const lightbox = document.querySelector('.lightbox-modal');
    if (!lightbox || !galleryGrid) return;

    const lightboxImg = lightbox.querySelector('.lightbox-image');
    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const lightboxCounter = lightbox.querySelector('.lightbox-counter');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    const filterBtns = document.querySelectorAll('.gallery-filter-btn');

    // Collect all gallery items
    const cards = Array.from(galleryGrid.querySelectorAll('.gallery-item'));
    state.galleryItems = cards.map((card, idx) => {
      const img = card.querySelector('img');
      return {
        element: card,
        src: card.getAttribute('data-full') || (img ? img.getAttribute('src') : ''),
        webp: card.getAttribute('data-webp') || '',
        category: card.getAttribute('data-category') || 'all',
        captionKey: card.getAttribute('data-caption-key') || `gallery.img${idx + 1}`
      };
    });

    // Attach click listeners to cards
    cards.forEach((card, index) => {
      card.addEventListener('click', () => {
        openLightbox(index);
      });
    });

    function openLightbox(index) {
      state.lightboxIndex = index;
      renderLightboxSlide();
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }

    function renderLightboxSlide() {
      const item = state.galleryItems[state.lightboxIndex];
      if (!item) return;

      lightboxImg.style.opacity = '0';
      lightboxImg.src = item.src;
      lightboxImg.onload = () => {
        lightboxImg.style.opacity = '1';
      };

      updateLightboxCaption();

      if (lightboxCounter) {
        lightboxCounter.textContent = `${state.lightboxIndex + 1} / ${state.galleryItems.length}`;
      }
    }

    function showNext() {
      state.lightboxIndex = (state.lightboxIndex + 1) % state.galleryItems.length;
      renderLightboxSlide();
    }

    function showPrev() {
      state.lightboxIndex = (state.lightboxIndex - 1 + state.galleryItems.length) % state.galleryItems.length;
      renderLightboxSlide();
    }

    if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
    if (nextBtn) nextBtn.addEventListener('click', showNext);
    if (prevBtn) prevBtn.addEventListener('click', showPrev);

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox || e.target.classList.contains('lightbox-backdrop')) {
        closeLightbox();
      }
    });

    // Keyboard navigation
    window.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    });

    // Touch swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    lightbox.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    function handleSwipe() {
      const diff = touchEndX - touchStartX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) showPrev();
        else showNext();
      }
    }

    // Category Filtering
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const cat = btn.getAttribute('data-filter');
        cards.forEach(card => {
          const itemCat = card.getAttribute('data-category');
          if (cat === 'all' || itemCat === cat) {
            card.style.display = 'block';
            setTimeout(() => {
              card.style.opacity = '1';
              card.style.transform = 'scale(1)';
            }, 30);
          } else {
            card.style.opacity = '0';
            card.style.transform = 'scale(0.95)';
            setTimeout(() => {
              card.style.display = 'none';
            }, 250);
          }
        });
      });
    });
  }

  function updateLightboxCaption() {
    const lightbox = document.querySelector('.lightbox-modal');
    if (!lightbox || !lightbox.classList.contains('active')) return;

    const lightboxCaption = lightbox.querySelector('.lightbox-caption');
    const item = state.galleryItems[state.lightboxIndex];
    if (lightboxCaption && item) {
      const t = TRANSLATIONS[state.currentLang];
      const translatedCaption = getNestedTranslation(t, item.captionKey);
      lightboxCaption.textContent = translatedCaption || '';
    }
  }

  // --- 5. Interactive Cards Spotlight Effect ---
  function initSpotlightCards() {
    const cards = document.querySelectorAll('.spotlight-card');
    cards.forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
  }

  // --- 6. Scroll Reveal Observer ---
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      revealElements.forEach(el => el.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.12,
      rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => observer.observe(el));
  }

  // --- 7. Numbers Counter Animation ---
  function initStatsCounter() {
    const statNumbers = document.querySelectorAll('.stat-number[data-count]');
    if (!statNumbers.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const target = parseInt(el.getAttribute('data-count'), 10);
          const suffix = el.getAttribute('data-suffix') || '';
          let count = 0;
          const duration = 1600;
          const stepTime = Math.max(20, Math.floor(duration / target));

          const timer = setInterval(() => {
            count++;
            el.textContent = count + suffix;
            if (count >= target) {
              clearInterval(timer);
              el.textContent = target + suffix;
            }
          }, stepTime);

          observer.unobserve(el);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(el => observer.observe(el));
  }

  // --- 8. Contact & Copy to Clipboard Actions ---
  function initContactActions() {
    // Copy buttons
    document.querySelectorAll('.copy-trigger').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const textToCopy = btn.getAttribute('data-copy');
        if (!textToCopy) return;

        navigator.clipboard.writeText(textToCopy).then(() => {
          const badge = btn.querySelector('.copy-feedback');
          const originalText = btn.getAttribute('data-original-label') || btn.textContent;
          btn.setAttribute('data-original-label', originalText);

          const t = TRANSLATIONS[state.currentLang];
          const copiedLabel = (t && t.contact && t.contact.copied_btn) || 'Copied!';

          if (badge) {
            badge.textContent = copiedLabel;
            badge.classList.add('show');
            setTimeout(() => badge.classList.remove('show'), 2000);
          } else {
            btn.classList.add('copied-active');
            btn.textContent = copiedLabel;
            setTimeout(() => {
              btn.textContent = originalText;
              btn.classList.remove('copied-active');
            }, 2000);
          }
        }).catch(err => {
          console.warn('Could not copy to clipboard:', err);
        });
      });
    });

  }

  // --- 9. Floating Particles / Ambient Stage Glow ---
  function initStageCanvas() {
    const canvas = document.getElementById('stageCanvas');
    if (!canvas) return;

    // Completely bypass particle animation on mobile viewports to prevent GPU memory lockup
    if (window.innerWidth <= 768) {
      canvas.style.display = 'none';
      return;
    }

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
      if (window.innerWidth <= 768) {
        canvas.style.display = 'none';
        return;
      } else {
        canvas.style.display = '';
      }
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }, { passive: true });

    // Gold dust / stage sparks
    const particles = [];
    const PARTICLE_COUNT = Math.min(28, Math.floor(window.innerWidth / 45));

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 2 + 0.6,
        alpha: Math.random() * 0.4 + 0.15,
        speedY: -(Math.random() * 0.35 + 0.1),
        speedX: (Math.random() - 0.5) * 0.2,
        pulseSpeed: Math.random() * 0.02 + 0.01,
        color: Math.random() > 0.4 ? '229, 173, 82' : '244, 63, 94' // Gold & stage crimson
      });
    }

    function animate() {
      ctx.clearRect(0, 0, width, height);

      for (let p of particles) {
        p.y += p.speedY;
        p.x += p.speedX;
        p.alpha += Math.sin(Date.now() * p.pulseSpeed) * 0.005;

        // Loop boundaries
        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${Math.max(0.05, Math.min(0.65, p.alpha))})`;
        ctx.fill();
      }

      requestAnimationFrame(animate);
    }

    // Only run if user does not prefer reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!prefersReducedMotion) {
      animate();
    }
  }

  // --- Initialize Everything on DOM Ready ---
  document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
    initHeaderAndNav();
    initGallery();
    initSpotlightCards();
    initScrollReveal();
    initStatsCounter();
    initContactActions();
    initStageCanvas();
  });

})();
