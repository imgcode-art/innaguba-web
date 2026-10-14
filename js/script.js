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
    if (!prev || !next) return;
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
    let retryQueued = false;
    video.addEventListener('ended', () => { hasFinished = true; });
    // on a slow mobile connection the video can still be buffering when it scrolls into
    // view, so play() silently rejects and it's stuck on the poster frame until the user
    // scrolls it out and back in — retrying once it's actually ready to play fixes that
    // without needing the user to re-trigger the intersection themselves.
    const tryPlay = () => {
      if (hasFinished) return;
      video.play().catch(() => {
        if (retryQueued) return;
        retryQueued = true;
        video.addEventListener('canplay', () => {
          retryQueued = false;
          if (!hasFinished) video.play().catch(() => {});
        }, { once: true });
      });
    };
    const slideObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) tryPlay();
        else video.pause();
      });
    }, { threshold: 0.6 });
    slideObserver.observe(video);
  });

  // ---------- Desktop hero video — plays through once, then just sits on its last frame
  // (no loop) instead of jumping back to the start or flashing black. Restarts from 0 the
  // next time it scrolls back into view (page load counts as the first entry, same as
  // [data-scroll-video-play] above) — but unlike that one, every re-entry replays it, not
  // just the first. ----------
  // The push-in onto the parents' kiss and the dissolve into the sharp photo
  // (images/hero/video-hero-end.jpg) are baked into the clip itself (frame-accurate, made
  // with ffmpeg) — the in-browser version (CSS transform + opacity crossfade, timed off
  // 'timeupdate') never lined up exactly and read as a glitch, per direct feedback. The
  // clip's last 1.6s already show that photo full-frame, so on 'ended' the panel only
  // swaps in the original JPG (.is-ended, style.css) for full sharpness after video
  // compression — same framing, so the swap itself is invisible. Cleared on replay.
  document.querySelectorAll('[data-replay-on-enter] video').forEach(video => {
    const panel = video.closest('[data-replay-on-enter]');
    video.addEventListener('ended', () => panel.classList.add('is-ended'));
    const replayObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { panel.classList.remove('is-ended'); video.currentTime = 0; video.play().catch(() => {}); }
        else video.pause();
      });
    }, { threshold: 0.6 });
    replayObserver.observe(video);
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

  // ---------- Contact form: prefill from the link that brought you here — a ceník package
  // (?sluzba=…&balicek=…) or the business-card discount (?vizitka) — so nobody has to
  // repeat what they already clicked on ----------
  (() => {
    const form = document.querySelector('[data-contact-form]');
    if (!form) return;
    const params = new URLSearchParams(location.search);
    const sluzba = params.get('sluzba');
    const select = form.querySelector('[name="sluzba"]');
    if (sluzba && select && [...select.options].some(o => o.value === sluzba)) select.value = sluzba;
    const balicek = params.get('balicek');
    const lines = [];
    if (balicek) lines.push(`Mám zájem o balíček ${balicek}.`);
    if (params.has('vizitka')) lines.push('Mám slevu 10 % z vizitky.');
    const zprava = form.querySelector('[name="zprava"]');
    if (lines.length && zprava && !zprava.value) zprava.value = lines.join(' ') + ' ';
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
    // gentle per-field hints instead of one red sentence for the whole form — each
    // missing field gets its own soft note right under it, and it disappears as soon
    // as you start typing there
    const hintFor = f => {
      if (f.name === 'jmeno') return 'Napište mi prosím, jak vám mám říkat.';
      if (f.name === 'email') return f.value.trim() ? 'Tenhle e-mail vypadá neúplně, mrkněte na něj prosím.' : 'Na jaký e-mail vám mám odpovědět?';
      return 'Doplňte prosím.';
    };
    const clearHint = f => {
      f.classList.remove('cf-invalid');
      f.removeAttribute('aria-invalid');
      const h = f.nextElementSibling;
      if (h && h.classList.contains('cf-hint')) h.remove();
    };
    const showHint = f => {
      clearHint(f);
      f.classList.add('cf-invalid');
      f.setAttribute('aria-invalid', 'true');
      const h = document.createElement('p');
      h.className = 'cf-hint';
      h.textContent = hintFor(f);
      if (f.id) { h.id = `${f.id}-hint`; f.setAttribute('aria-describedby', h.id); }
      f.insertAdjacentElement('afterend', h);
    };
    form.querySelectorAll('input, textarea').forEach(field => {
      field.addEventListener('input', () => clearHint(field));
    });

    form.addEventListener('submit', async e => {
      e.preventDefault();

      const invalidFields = Array.from(form.querySelectorAll('input, textarea')).filter(f => !f.checkValidity());
      form.querySelectorAll('.cf-invalid').forEach(clearHint);
      if (invalidFields.length) {
        invalidFields.forEach(showHint);
        status.textContent = '';
        status.removeAttribute('data-state');
        invalidFields[0].focus();
        return;
      }

      const name = form.querySelector('[name="jmeno"]').value.trim();
      const email = form.querySelector('[name="email"]').value.trim();
      const message = form.querySelector('[name="zprava"]').value.trim();
      const sluzba = form.querySelector('[name="sluzba"]')?.value;
      const termin = form.querySelector('[name="termin"]')?.value;
      const misto = form.querySelector('[name="misto"]')?.value;

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
            'kde chce fotit': misto || '',
            zprava: message,
          }),
        });
        const data = await res.json();
        if (data.success) {
          form.reset();
          submitBtn.textContent = 'Odesláno ✓';
          submitBtn.setAttribute('data-state', 'success');
          status.textContent = 'Děkuji, zpráva byla odeslána. Ozvu se vám do 24 hodin.';
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

  // ---------- Kontakt: smooth scroll — the main CTA glides down to the form instead of
  // jumping, so it's clear the form is further down the page. Scoped to this one link
  // (not a global scroll-behavior:smooth) so the instant scrollTo calls elsewhere keep
  // working as before. ----------
  const writeLink = document.querySelector('.contact-info-cta');
  const writeTarget = document.getElementById('kontakt');
  if (writeLink && writeTarget) {
    writeLink.addEventListener('click', e => {
      e.preventDefault();
      const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
      const top = writeTarget.getBoundingClientRect().top + window.scrollY - header - 40;
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
      history.replaceState(null, '', '#kontakt');
    });
  }

  // ---------- Re-snap to a #kontakt link target after everything (images, widgets) has
  // finished loading — late-loading content above the form can otherwise push it down and
  // undo the browser's initial anchor jump. ----------
  if (location.hash === '#kontakt') {
    const snapToTarget = () => {
      const target = document.getElementById('kontakt');
      if (!target) return;
      const header = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 72;
      const top = target.getBoundingClientRect().top + window.scrollY - header - 24;
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

  // ---------- Homepage: footer reveal — the stage before the footer is position:sticky
  // (css/home-theme.css, .footer-reveal-stage) and pins while the footer slides up over it.
  // Its top offset has to depend on its own height: if it fits under the header it pins
  // right there, if it's taller it pins only once its bottom edge is in view (negative top).
  // The Google reviews widget inside loads late and changes height, hence ResizeObserver. ----------
  const revealStage = document.querySelector('.footer-reveal-stage');
  if (revealStage) {
    const syncRevealTop = () => {
      const headerH = document.querySelector('header')?.getBoundingClientRect().height || 72;
      const top = Math.min(headerH, window.innerHeight - revealStage.getBoundingClientRect().height);
      revealStage.style.setProperty('--reveal-top', `${top}px`);
    };
    syncRevealTop();
    window.addEventListener('resize', syncRevealTop);
    if ('ResizeObserver' in window) new ResizeObserver(syncRevealTop).observe(revealStage);

    // "Rack focus" transition (css/home-theme.css): progress = how far the footer's top edge
    // has travelled from the viewport bottom up to the header. --fr-dim recedes/blurs/fades
    // the stage across the whole slide; --fr-develop sharpens the quote, starting a little
    // later and finishing before the footer arrives, so it settles while still in motion.
    const revealFooter = document.querySelector('.footer-reveal');
    const desktopMotion = window.matchMedia('(min-width:901px) and (prefers-reduced-motion: no-preference)');
    if (revealFooter) {
      const clamp01 = (v) => Math.min(1, Math.max(0, v));
      let ticking = false;
      const syncDarkroom = () => {
        ticking = false;
        if (!desktopMotion.matches) return;
        const headerH = document.querySelector('header')?.getBoundingClientRect().height || 72;
        const travel = window.innerHeight - headerH;
        const p = clamp01((window.innerHeight - revealFooter.getBoundingClientRect().top) / travel);
        // dim/blur only starts once the footer has covered ~40% of the way up — starting
        // at once blurred the reviews while they were still being read (per direct feedback)
        revealStage.style.setProperty('--fr-dim', clamp01((p - 0.4) / 0.6).toFixed(3));
        revealFooter.style.setProperty('--fr-develop', clamp01((p - 0.15) / 0.6).toFixed(3));
      };
      const requestDarkroom = () => { if (!ticking) { ticking = true; requestAnimationFrame(syncDarkroom); } };
      syncDarkroom();
      window.addEventListener('scroll', requestDarkroom, { passive: true });
      window.addEventListener('resize', requestDarkroom);
      // late-loading content (reviews widget, lazy images above) shifts the footer without
      // any scroll event — re-sync on layout changes too, or the stage can stick mid-fade
      if ('ResizeObserver' in window) new ResizeObserver(requestDarkroom).observe(document.body);
    }
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
  // "Jak můžeme zachytit vaše nejbližší?" cards (same selector also matches portfolio.html's
  // own 3 category cards — same .pg .pcard .thumb img markup), the 2 full-bleed video
  // banners, the video gallery's thumbnails, and the "O mně" story photos.
  // .proof-photo img used to be in this list too — dropped per direct instruction, the
  // 130%-tall overscan the effect needs was cropping into the photo itself.
  initScrollDrift('.memory-photo img');
  initScrollDrift('.pg .pcard .thumb img');
  initScrollDrift('.video-embed video');
  initScrollDrift('.reassure-video img');
  initScrollDrift('.ab-hero-photo img');
  initScrollDrift('.story-photo-drift img');
  initScrollDrift('.vcard .thumb img');
  initScrollDrift('.story-photo-polaroid img, .story-photo-polaroid video');
  initScrollDrift('.contact-info-photo img');

  // ---------- Photo gallery masonry (.pgg) — same idea as initScrollDrift above, but each
  // photo keeps its own native aspect ratio (CSS multi-column masonry) instead of a
  // fixed-ratio crop box, so there's no 130%-tall image to shift inside an overflow-hidden
  // frame without cropping it to a different shape than composed. Drifts the whole .pgg grid
  // (one photo series) as a single rigid unit instead of each item independently — items
  // drifting on their own computed each from its own height, so same-row neighbors (different
  // photo heights) drifted by very slightly different amounts, reading as the gaps between
  // photos randomly changing rather than a floating effect. Moving the whole grid together
  // means the spacing between photos never changes, only the series as a whole. ----------
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
  initScrollFloat('.pgg', 14);

  // ---------- Mouse parallax — tiles/photos tagged [data-parallax-depth] inside
  // gridSelector shift toward the cursor, closer ones (higher depth) moving further
  // than farther ones, instead of the whole group sliding as one flat sheet. Desktop-
  // with-a-mouse only (mousemove doesn't mean anything on touch), and skipped under
  // prefers-reduced-motion. Originally built for the homepage hero bento grid, where
  // scroll-tied movement doesn't work (hero is pinned via position:sticky for the
  // whole "curtain reveal" — see home-theme.css — so its own on-screen position barely
  // changes while visible) but mouse-tied movement does, since hero sticks around on
  // screen for a while, giving a cursor-driven effect time to be noticed. ----------
  const initMouseParallax = (gridSelector, maxShift) => {
    const grid = document.querySelector(gridSelector);
    const tiles = [...document.querySelectorAll(`${gridSelector} [data-parallax-depth]`)];
    if (!grid || !tiles.length || !window.matchMedia('(hover:hover) and (pointer:fine)').matches
        || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    grid.addEventListener('mousemove', e => {
      const rect = grid.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5; // -0.5..0.5
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      tiles.forEach(tile => {
        const depth = parseFloat(tile.dataset.parallaxDepth) || 1;
        tile.style.transform = `translate(${nx * maxShift * depth}px, ${ny * maxShift * depth}px)`;
      });
    });
    grid.addEventListener('mouseleave', () => {
      tiles.forEach(tile => { tile.style.transform = ''; });
    });
  };
  // O mně: the two stacked intro photos — same layered "floating" feel the homepage
  // hero bento grid used to have, so the back photo peeking out behind the front one
  // reads as its own depth layer rather than one flat composition.
  initMouseParallax('.about-intro-photo-stack', 10);
  // O mně: "Proč právě já" photo — used to use scroll-drift like the other story photos,
  // but this photo's face sits close enough to the frame edge that panning it on scroll
  // cropped the face out at some scroll positions. Mouse parallax instead (css/style.css
  // oversizes the img only under the same hover+pointer-fine media query this needs).
  initMouseParallax('.why-photo', 5);

  // ---------- Footer "Nahoru": scroll back to the top without leaving a "#" in the URL.
  // On long pages (the galleries run to ~17 000px) it first jumps instantly to within one
  // screen of the top and only animates that last stretch — a smooth scroll across the
  // whole page is slow and easily interrupted. Instant jump under prefers-reduced-motion. ----------
  document.querySelectorAll('.to-top').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.scrollTo(0, 0);
        return;
      }
      const nearTop = window.innerHeight * 1.5;
      if (window.scrollY > nearTop) window.scrollTo(0, nearTop);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });

// ---------- "Jak focení probíhá": lights up the step currently being read
// and dims the rest (style.css, .js-process-focus), so attention moves one step at a
// time as you scroll — the derfleratelier.cz process-section idea. Skipped under
// prefers-reduced-motion: all steps then just stay fully visible. ----------
(() => {
  const steps = [...document.querySelectorAll('.process-step')];
  if (!steps.length) return;
  // the static thread line through the numerals (style.css, .process-steps::before): its
  // ends sit on the first and last numeral's centre
  const list = steps[0].parentElement;
  const numMid = step => { const n = step.querySelector('.process-num').getBoundingClientRect(); return n.top + n.height / 2 - list.getBoundingClientRect().top; };
  const placeThread = () => {
    list.style.setProperty('--steps-top', `${numMid(steps[0])}px`);
    list.style.setProperty('--steps-bottom', `${list.offsetHeight - numMid(steps[steps.length - 1])}px`);
  };
  placeThread();
  window.addEventListener('resize', placeThread);
  window.addEventListener('load', placeThread);
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  document.documentElement.classList.add('js-process-focus');
  let ticking = false;
  const update = () => {
    ticking = false;
    // the last step whose top has crossed 60 % of the screen height (the first step
    // before any has) — "nearest the middle" never reached the last step, since the
    // section ends before it can scroll that far up
    const line = window.innerHeight * 0.6;
    let best = steps[0];
    steps.forEach(step => { if (step.getBoundingClientRect().top < line) best = step; });
    steps.forEach(step => step.classList.toggle('is-active', step === best));
  };
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();
})();

// ---------- Homepage trust numbers — count up once when they scroll into view (12 let,
// 900+), and "0 %" counts DOWN from 100, so "no posing" lands as the punchline. The final
// text is in the HTML, so without JS (or with reduced motion) they simply show as written. ----------
(() => {
  const nums = [...document.querySelectorAll('.proof-stats li strong')];
  if (!nums.length || !('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const run = el => {
    const m = el.textContent.match(/^(\d+)(.*)$/);
    if (!m) return;
    const to = +m[1], suffix = m[2], from = to === 0 ? 100 : 0;
    const start = performance.now(), dur = 1600;
    const tick = now => {
      const t = Math.min(1, Math.max(0, (now - start) / dur)), e = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(from + (to - from) * e) + suffix;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const io = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      io.unobserve(entry.target);
      run(entry.target);
    });
  }, { threshold: 0.6 });
  nums.forEach(el => io.observe(el));
})();
