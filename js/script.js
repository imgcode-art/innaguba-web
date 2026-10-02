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
  // time reads as a story. Idle tiles keep the gentle breathing-zoom (is-playing is removed on
  // 'ended') so the hero never looks fully frozen while waiting its turn. ----------
  (() => {
    const sequenceVideos = Array.from(document.querySelectorAll('.orbit-tile-inner video'));
    if (!sequenceVideos.length) return;
    const playSequenceVideo = (i) => {
      const video = sequenceVideos[i];
      const tile = video.closest('.orbit-tile-inner');
      video.currentTime = 0;
      video.addEventListener('playing', () => tile.classList.add('is-playing'), { once: true });
      // wait until the video actually has enough buffered data to play smoothly — the later
      // tiles only preload metadata, so the first time it's their turn the frames may not be
      // ready yet
      const tryPlay = () => video.play().catch(() => {});
      if (video.readyState >= 3) tryPlay();
      else video.addEventListener('canplay', tryPlay, { once: true });
    };
    sequenceVideos.forEach((video, i) => {
      const tile = video.closest('.orbit-tile-inner');
      video.addEventListener('ended', () => {
        tile.classList.remove('is-playing');
        playSequenceVideo((i + 1) % sequenceVideos.length);
      });
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

