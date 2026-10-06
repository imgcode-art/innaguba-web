(() => {
  const page = location.pathname.split('/').pop() || 'index.html';
  const galleryPages = ['galerie-rodinna-fotografie.html', 'galerie-detsky-portret.html', 'galerie-video-pribeh.html'];
  const activePage = galleryPages.includes(page) ? 'portfolio.html' : page;
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href.includes('#')) return;
    if (href === activePage) a.classList.add('active');
  });
})();

// ---------- Mobile nav hamburger menu ----------
document.querySelectorAll('.nav-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const links = btn.closest('.nav').querySelector('.nav-links');
    const isOpen = links.classList.toggle('open');
    btn.setAttribute('aria-expanded', isOpen);
    document.body.classList.toggle('nav-open', isOpen);
  });
});
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    a.closest('.nav-links').classList.remove('open');
    a.closest('.nav').querySelector('.nav-toggle')?.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('nav-open');
  });
});

document.querySelectorAll('[data-row]').forEach(row => {
    const toggleRow = () => {
      const isOpen = row.classList.contains('open');
      document.querySelectorAll('[data-row]').forEach(r => {
        r.classList.remove('open');
        r.querySelector('.plus').textContent = '+';
        r.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        row.classList.add('open');
        row.querySelector('.plus').textContent = '×';
        row.setAttribute('aria-expanded', 'true');
      }
    };
    row.addEventListener('click', toggleRow);
    row.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleRow(); }
    });
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0, rootMargin: '0px 0px -5% 0px' });
  document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));

  // ---------- Mobile hero slideshow — prev/next hint arrows ----------
  document.querySelectorAll('.hc-mobile-slideshow').forEach(wrap => {
    const track = wrap.querySelector('.hc-mobile-slides');
    const prev = wrap.querySelector('.hc-mobile-nav-prev');
    const next = wrap.querySelector('.hc-mobile-nav-next');
    const step = () => track.querySelector('.hc-mobile-slide').getBoundingClientRect().width;
    const update = () => {
      wrap.classList.toggle('at-start', track.scrollLeft < 10);
      wrap.classList.toggle('at-end', track.scrollLeft > track.scrollWidth - track.clientWidth - 10);
    };
    prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
    track.addEventListener('scroll', update, { passive: true });
    update();
  });

  // ---------- Video gallery lightbox ----------
  const lightbox = document.querySelector('.video-lightbox');
  if (lightbox) {
    const frame = lightbox.querySelector('.lb-frame');
    const openVideo = (id) => {
      frame.innerHTML = `<iframe src="https://player.vimeo.com/video/${id}?autoplay=1" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Video"></iframe>`;
      lightbox.classList.add('open');
    };
    const closeVideo = () => {
      lightbox.classList.remove('open');
      frame.innerHTML = '';
    };
    document.querySelectorAll('.vcard[data-vimeo-id]').forEach(card => {
      card.addEventListener('click', () => openVideo(card.dataset.vimeoId));
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openVideo(card.dataset.vimeoId); }
      });
    });
    lightbox.querySelector('.lb-close').addEventListener('click', closeVideo);
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeVideo(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeVideo(); });
  }

  // ---------- Like buttons on video cards ----------
  document.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      btn.classList.toggle('liked');
    });
  });

  // ---------- Mobile hero slides — only the slide currently in view plays; the other two
  // stay paused (not just muted) so the phone is never decoding 3 videos at once for a
  // row the user can only ever look at one panel of ----------
  document.querySelectorAll('[data-scroll-video-play] video').forEach(video => {
    let hasFinished = false;
    video.addEventListener('ended', () => { hasFinished = true; });
    const slideObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { if (!hasFinished) video.play().catch(() => {}); }
        else video.pause();
      });
    }, { threshold: 0.6 });
    slideObserver.observe(video);
  });

  // ---------- Banner videos — each stays grayscale until scrolled into view, then fades to color and plays ----------
  document.querySelectorAll('[data-scroll-video]').forEach(scrollVideo => {
    const scrollVideoEl = scrollVideo.querySelector('video');
    if (!scrollVideoEl) return;
    let scrollVideoStarted = false;
    const scrollVideoObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !scrollVideoStarted) {
          scrollVideoStarted = true;
          scrollVideo.classList.remove('video-bw');
          scrollVideoEl.play().catch(() => {});
        }
      });
    }, { threshold: 0.5 });
    scrollVideoObserver.observe(scrollVideo);
  });

  // ---------- QR discount banner (shown only when arriving via ?vizitka link on the business card) ----------
  (() => {
    const banner = document.querySelector('#qr-banner');
    if (!banner) return;
    if (!new URLSearchParams(location.search).has('vizitka')) return;
    banner.hidden = false;
    banner.querySelector('.qr-banner-close')?.addEventListener('click', () => { banner.hidden = true; });
  })();

  // ---------- Cookie consent bar ----------
  (() => {
    const KEY = 'cookie-consent';
    const bar = document.querySelector('.cookie-bar');
    if (!bar) return;
    if (!localStorage.getItem(KEY)) bar.hidden = false;
    bar.querySelector('.cookie-accept')?.addEventListener('click', () => {
      localStorage.setItem(KEY, 'accepted');
      bar.hidden = true;
    });
    bar.querySelector('.cookie-reject')?.addEventListener('click', () => {
      localStorage.setItem(KEY, 'rejected');
      bar.hidden = true;
    });
  })();

  // ---------- Contact form (sends via Web3Forms, no backend needed) ----------
  const WEB3FORMS_ACCESS_KEY = '678c6592-26f3-4337-82fc-1c2fd2dc5074';
  document.querySelectorAll('.contact-form').forEach(form => {
    const submitBtn = form.querySelector('.cf-submit');
    let status = form.querySelector('.cf-status');
    if (!status) {
      status = document.createElement('p');
      status.className = 'cf-status';
      submitBtn.insertAdjacentElement('afterend', status);
    }
    form.querySelectorAll('input, textarea').forEach(field => {
      field.addEventListener('input', () => field.classList.remove('cf-invalid'));
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();

      const invalidFields = Array.from(form.querySelectorAll('input, textarea')).filter(f => !f.checkValidity());
      form.querySelectorAll('.cf-invalid').forEach(f => f.classList.remove('cf-invalid'));
      if (invalidFields.length) {
        invalidFields.forEach(f => f.classList.add('cf-invalid'));
        status.textContent = 'Zkontrolujte prosím vyplněné údaje — jméno, e-mail a zprávu je potřeba vyplnit správně.';
        status.setAttribute('data-state', 'error');
        invalidFields[0].focus();
        return;
      }

      const name = form.querySelector('[name="jmeno"]').value.trim();
      const email = form.querySelector('[name="email"]').value.trim();
      const message = form.querySelector('[name="zprava"]').value.trim();
      const sluzba = form.querySelector('[name="sluzba"]')?.value;
      const termin = form.querySelector('[name="termin"]')?.value;

      submitBtn.disabled = true;
      submitBtn.textContent = 'Odesílám…';
      status.removeAttribute('data-state');
      status.textContent = '';

      try {
        const res = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: WEB3FORMS_ACCESS_KEY,
            subject: `Zpráva z webu od ${name}`,
            jmeno: name,
            email,
            'o co má zájem': sluzba || '',
            'kdy chce fotit': termin || '',
            zprava: message,
          }),
        });
        const data = await res.json();
        if (data.success) {
          form.reset();
          submitBtn.textContent = 'Odesláno ✓';
          submitBtn.setAttribute('data-state', 'success');
          status.textContent = 'Děkuji, zpráva byla odeslána. Ozvu se vám co nejdřív.';
          setTimeout(() => {
            submitBtn.textContent = 'Odeslat zprávu';
            submitBtn.removeAttribute('data-state');
            submitBtn.disabled = false;
          }, 4000);
        } else {
          throw new Error(data.message || 'Odeslání se nezdařilo');
        }
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Odeslat zprávu';
        status.textContent = 'Něco se nepovedlo. Napište mi prosím přímo na innaguba@seznam.cz.';
        status.setAttribute('data-state', 'error');
      }
    });
  });

  // ---------- Hero orbit — one tile plays at a time, in sequence, instead of all five running
  // (and looping) simultaneously. Each clip has no loop attribute, so it naturally stops on its
  // own last frame when it ends; that 'ended' event is what hands off to the next tile. Calmer,
  // and actually followable — a wall of five looping videos reads as noise, one moment at a
  // time reads as a story. ----------
  (() => {
    const sequenceVideos = Array.from(document.querySelectorAll('.orbit-tile-inner video'));
    if (!sequenceVideos.length) return;
    const playSequenceVideo = (i) => {
      const video = sequenceVideos[i];
      video.currentTime = 0;
      // wait until the video actually has enough buffered data to play smoothly — the later
      // tiles only preload metadata, so the first time it's their turn the frames may not be
      // ready yet
      const tryPlay = () => video.play().catch(() => {});
      if (video.readyState >= 3) tryPlay();
      else video.addEventListener('canplay', tryPlay, { once: true });
    };
    sequenceVideos.forEach((video, i) => {
      video.addEventListener('ended', () => playSequenceVideo((i + 1) % sequenceVideos.length));
    });
    setTimeout(() => playSequenceVideo(0), 300);
  })();

  // ---------- Custom cursor — a circle that trails the pointer with a little lag, grows over
  // links/buttons. Only on devices with a real mouse (hover:hover + pointer:fine), never on touch. ----------
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const cursorDot = document.createElement('div');
    cursorDot.className = 'cursor-dot';
    document.body.appendChild(cursorDot);
    const cursorPoint = document.createElement('div');
    cursorPoint.className = 'cursor-point';
    document.body.appendChild(cursorPoint);
    document.body.classList.add('has-custom-cursor');

    let mouseX = 0, mouseY = 0, curX = 0, curY = 0, started = false;
    window.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      cursorPoint.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0)`;
      if (!started) {
        curX = mouseX;
        curY = mouseY;
        started = true;
        cursorDot.classList.add('is-visible');
        cursorPoint.classList.add('is-visible');
      }
    });
    document.addEventListener('mouseleave', () => {
      cursorDot.classList.remove('is-visible');
      cursorPoint.classList.remove('is-visible');
    });
    document.addEventListener('mouseenter', () => {
      cursorDot.classList.add('is-visible');
      cursorPoint.classList.add('is-visible');
    });

    const HOVER_TARGETS = 'a, button, .cf-radio, input, textarea, [role="button"], [data-row]';
    document.addEventListener('mouseover', e => {
      if (e.target.closest(HOVER_TARGETS)) cursorDot.classList.add('is-active');
    });
    document.addEventListener('mouseout', e => {
      if (e.target.closest(HOVER_TARGETS)) cursorDot.classList.remove('is-active');
    });

    const renderCursor = () => {
      curX += (mouseX - curX) * 0.7;
      curY += (mouseY - curY) * 0.7;
      cursorDot.style.transform = `translate3d(${curX}px, ${curY}px, 0)`;
      requestAnimationFrame(renderCursor);
    };
    requestAnimationFrame(renderCursor);
  }

  // ---------- Re-snap to a #kontakt link target after everything (images, widgets) has
  // finished loading — late-loading content above the form can otherwise push it down and
  // undo the browser's initial anchor jump. ----------
  if (location.hash === '#kontakt') {
    const snapToTarget = () => {
      const target = document.getElementById('kontakt');
      if (!target) return;
      const top = target.getBoundingClientRect().top + window.scrollY - 24;
      window.scrollTo(0, top);
    };
    window.addEventListener('load', snapToTarget);
    setTimeout(snapToTarget, 600);
  }

  // ---------- Ceník: align "V každém balíčku..." with the photo in the card above it (desktop
  // only) — measured directly against the real rendered photo position rather than mirrored via
  // CSS, since subtle flex differences made a pure-CSS mirror drift out of sync. ----------
  const cenikIncludedBody = document.querySelector('.cenik-included-body');
  if (cenikIncludedBody) {
    const alignCenikIncluded = () => {
      if (window.innerWidth < 901) {
        cenikIncludedBody.style.marginLeft = '';
        return;
      }
      const photos = document.querySelectorAll('.pb-featured .pb-photo');
      const referencePhoto = photos[photos.length - 1];
      const wrap = cenikIncludedBody.closest('.wrap');
      if (!referencePhoto || !wrap) return;
      const offset = referencePhoto.getBoundingClientRect().left - wrap.getBoundingClientRect().left;
      cenikIncludedBody.style.marginLeft = `${Math.max(offset, 0)}px`;
    };
    alignCenikIncluded();
    window.addEventListener('load', alignCenikIncluded);
    window.addEventListener('resize', alignCenikIncluded);
  }

  // ---------- O mně: widen the "Svatba tety" polaroid photo (desktop only) so its right edge
  // lines up with the "Proč právě já" photo further up the page — measured directly, same
  // reasoning as the Ceník alignment above. ----------
  const storyPhotoWide = document.querySelector('.story-photo-wide');
  if (storyPhotoWide) {
    const alignStoryPhotoWide = () => {
      if (window.innerWidth < 901) {
        storyPhotoWide.style.flex = '';
        storyPhotoWide.style.width = '';
        return;
      }
      const referencePhoto = document.querySelector('.proc-ja-photo');
      const wrap = storyPhotoWide.closest('.wrap');
      if (!referencePhoto || !wrap) return;
      const width = referencePhoto.getBoundingClientRect().right - wrap.getBoundingClientRect().left;
      storyPhotoWide.style.flex = 'none';
      storyPhotoWide.style.width = `${width}px`;
    };
    alignStoryPhotoWide();
    window.addEventListener('load', alignStoryPhotoWide);
    window.addEventListener('resize', alignStoryPhotoWide);
  }

  // ---------- Homepage: align the "Nemusí..." paragraph block to start where the left photo
  // of the proof-block section above ends (its right edge), so the page keeps one consistent
  // left-edge instead of following whatever's directly above it. ----------
  const reassureNarrow = document.querySelector('.reassure-narrow');
  if (reassureNarrow) {
    const alignReassureNarrow = () => {
      if (window.innerWidth < 901) {
        reassureNarrow.style.marginLeft = '';
        return;
      }
      const referencePhoto = document.querySelector('.proof-photo-col .proof-photo');
      const wrap = reassureNarrow.closest('.wrap');
      if (!referencePhoto || !wrap) return;
      const offset = referencePhoto.getBoundingClientRect().right - wrap.getBoundingClientRect().left;
      reassureNarrow.style.marginLeft = `${Math.max(offset, 0)}px`;
    };
    alignReassureNarrow();
    window.addEventListener('load', alignReassureNarrow);
    window.addEventListener('resize', alignReassureNarrow);
  }

  // ---------- Reference cards (testimonials): mobile shows them as a sticky card-stack where
  // each card must be at least as tall as the one before it to fully cover it while scrolling.
  // Martina's shorter quote left her card ~1 line short of Hanka's, so Hanka's card peeked out
  // from under it — equalize every card to the tallest one's natural height to guarantee coverage. ----------
  const refCards = document.querySelectorAll('.rg .card');
  if (refCards.length) {
    const equalizeRefCards = () => {
      refCards.forEach(c => { c.style.minHeight = ''; });
      if (window.innerWidth > 900) return;
      const max = Math.max(...[...refCards].map(c => c.getBoundingClientRect().height));
      refCards.forEach(c => { c.style.minHeight = `${max}px`; });
    };
    equalizeRefCards();
    window.addEventListener('load', equalizeRefCards);
    window.addEventListener('resize', equalizeRefCards);
  }

  // ---------- Homepage: align the "Příběh, když se z malého světa..." line under the
  // proof-block photos to start at the same left edge as the "Děti rostou..." hero-lead
  // paragraph above it. ----------
  const proofQuote = document.querySelector('.proof-quote');
  if (proofQuote) {
    const alignProofQuote = () => {
      if (window.innerWidth < 901) {
        proofQuote.style.marginLeft = '';
        return;
      }
      const heroLead = document.querySelector('.hero-lead');
      const wrap = proofQuote.closest('.wrap');
      if (!heroLead || !wrap) return;
      const offset = heroLead.getBoundingClientRect().left - wrap.getBoundingClientRect().left;
      proofQuote.style.marginLeft = `${Math.max(offset, 0)}px`;
    };
    alignProofQuote();
    window.addEventListener('load', alignProofQuote);
    window.addEventListener('resize', alignProofQuote);
  }

  // ---------- Homepage: hero curtain reveal — proof-block's min-height (css/
  // home-theme.css, .hero-curtain-stack .proof-block) needs to match hero's
  // rendered height exactly, so proof-block always fully covers hero before
  // hero stops being pinned, with no leftover gap on either side. CSS alone
  // can't read a sibling's height, so this measures it and writes it to
  // --hero-h on load/resize. ----------
  const curtainHero = document.querySelector('.hero-curtain-stack .hero-collage');
  if (curtainHero) {
    const syncCurtainHeroHeight = () => {
      document.documentElement.style.setProperty('--hero-h', `${curtainHero.getBoundingClientRect().height}px`);
    };
    syncCurtainHeroHeight();
    window.addEventListener('load', syncCurtainHeroHeight);
    window.addEventListener('resize', syncCurtainHeroHeight);
  }

  // ---------- Homepage: scroll-drift ("parallax") — shared helper for any image/video whose
  // CSS already expects it (130%-tall, centered via top:50% + translateY(-50% + var(--parallax-y)),
  // its container position:relative + overflow:hidden). This just computes, per matching element,
  // how far its container has scrolled through the viewport (0 = container's top just entering
  // from the bottom, 1 = its bottom just exiting at the top) and writes that as --parallax-y —
  // a CUSTOM PROPERTY, not the `transform` itself, specifically so it can coexist with a separate
  // :hover rule (on the same element, for the cards that have one) that writes --hover-scale;
  // the CSS rule combines both into one transform, instead of the two fighting to own it outright.
  // Skipped entirely under prefers-reduced-motion, matching [data-reveal]'s own handling. ----------
  const initScrollDrift = (selector) => {
    const els = [...document.querySelectorAll(selector)];
    if (!els.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      els.forEach(el => {
        const rect = el.parentElement.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)));
        const range = rect.height * 0.15; // half of the 30% extra height, in each direction
        el.style.setProperty('--parallax-y', `${(progress - 0.5) * range * 2}px`);
      });
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  };
  // "Nejen fotografie... Vzpomínky" photo, the two proof-block then/now photos, the 3
  // "Jak můžeme zachytit vaši rodinu?" cards (same selector also matches portfolio.html's
  // own 3 category cards — same .pg .pcard .thumb img markup), the 2 full-bleed video
  // banners, the video gallery's thumbnails, and the "O mně" story photos.
  initScrollDrift('.memory-photo img');
  initScrollDrift('.proof-photo img');
  initScrollDrift('.pg .pcard .thumb img');
  initScrollDrift('.video-embed video');
  initScrollDrift('.reassure-video img');
  initScrollDrift('.ab-hero-photo img');
  initScrollDrift('.story-photo-drift img');
  initScrollDrift('.vcard .thumb img');

  // ---------- Photo gallery masonry (.pgg-item) — same idea as initScrollDrift above, but
  // each item keeps its own native aspect ratio (CSS multi-column masonry) instead of a
  // fixed-ratio crop box, so there's no 130%-tall image to shift inside an overflow-hidden
  // frame. Drifts the whole card by a small fixed amount instead — nothing is cropped, so
  // there's no edge to reveal, and the range is a flat pixel amount (not a % of the item's
  // own height) so tall portrait photos don't swing further than short ones. ----------
  const initScrollFloat = (selector, maxRange) => {
    const els = [...document.querySelectorAll(selector)];
    if (!els.length || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let ticking = false;
    const update = () => {
      const vh = window.innerHeight;
      els.forEach(el => {
        const rect = el.getBoundingClientRect();
        const progress = Math.min(1, Math.max(0, (vh - rect.top) / (vh + rect.height)));
        el.style.setProperty('--float-y', `${(progress - 0.5) * maxRange * 2}px`);
      });
      ticking = false;
    };
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  };
  initScrollFloat('.pgg-item', 12);

  // ---------- Homepage: hero bento grid — mouse parallax on the 4 video tiles.
  // Scroll-tied movement doesn't work here (hero is pinned via position:sticky for
  // the whole "curtain reveal" — see home-theme.css — so its own on-screen position
  // barely changes while it's visible), but mouse-tied movement does: hero sticks
  // around on screen for a while, giving a cursor-driven effect time to be noticed.
  // Each tile moves by its own data-parallax-depth (closer tiles "layer" further
  // than farther ones) instead of all 4 sliding together as one flat sheet. Desktop-
  // with-a-mouse only (mousemove doesn't mean anything on touch), and skipped under
  // prefers-reduced-motion. The videos' own breathing-zoom animation was removed
  // (css/style.css) specifically so this wouldn't be competing with a second motion
  // on the same tiles. ----------
  const parallaxTiles = [...document.querySelectorAll('.hc-bento [data-parallax-depth]')];
  if (parallaxTiles.length && window.matchMedia('(hover:hover) and (pointer:fine)').matches
      && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const parallaxGrid = document.querySelector('.hc-split');
    const maxShift = 14; // px, at the strongest (depth:1) tile
    parallaxGrid.addEventListener('mousemove', e => {
      const rect = parallaxGrid.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      parallaxTiles.forEach(tile => {
        const depth = parseFloat(tile.dataset.parallaxDepth) || 1;
        tile.style.transform = `translate(${nx * maxShift * depth}px, ${ny * maxShift * depth}px)`;
      });
    });
    parallaxGrid.addEventListener('mouseleave', () => {
      parallaxTiles.forEach(tile => { tile.style.transform = ''; });
    });
  }

