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
  });
});
document.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => {
    a.closest('.nav-links').classList.remove('open');
    a.closest('.nav').querySelector('.nav-toggle')?.setAttribute('aria-expanded', 'false');
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

  // ---------- Mobile hero video — retry play if the browser blocked autoplay ----------
  const heroVideo = document.querySelector('.hc-mobile-video video');
  if (heroVideo) {
    heroVideo.muted = true;
    heroVideo.playsInline = true;
    heroVideo.load();
    const tryPlay = () => heroVideo.play().catch(() => {});
    tryPlay();
    ['loadeddata', 'loadedmetadata', 'canplay', 'canplaythrough', 'playing'].forEach(evt => {
      heroVideo.addEventListener(evt, tryPlay);
    });
    ['touchstart', 'click', 'scroll'].forEach(evt => {
      document.addEventListener(evt, tryPlay, { once: true, passive: true });
    });
    document.addEventListener('visibilitychange', () => { if (!document.hidden) tryPlay(); });
    window.addEventListener('pageshow', tryPlay);
    if ('IntersectionObserver' in window) {
      const heroVideoObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => { if (entry.isIntersecting) tryPlay(); });
      }, { threshold: 0.1 });
      heroVideoObserver.observe(heroVideo);
    }
  }

  // ---------- Banner video — grayscale until scrolled into view, then fades to color and plays ----------
  const scrollVideo = document.querySelector('[data-scroll-video]');
  if (scrollVideo && window.Vimeo) {
    const scrollVideoPlayer = new Vimeo.Player(scrollVideo.querySelector('iframe'));
    scrollVideoPlayer.pause().catch(() => {});
    let scrollVideoStarted = false;
    const scrollVideoObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !scrollVideoStarted) {
          scrollVideoStarted = true;
          scrollVideo.classList.remove('video-bw');
          scrollVideoPlayer.play().catch(() => {});
        }
      });
    }, { threshold: 0.5 });
    scrollVideoObserver.observe(scrollVideo);
  }

  // ---------- Gallery hero video — background=1 keeps it chrome-free (no title/byline, no Vimeo
  // end-card with related videos), but background mode always loops no matter what the URL or
  // setLoop() say. Waiting for the actual loop restart and snapping back caused a visible flicker
  // (a flash of the very first frame right before jumping back to the end), so instead we pause
  // just shy of the real duration — before it ever gets the chance to loop — and then immediately
  // seek forward to the exact last frame while paused, so what freezes on screen is the true
  // ending, not the slightly-earlier frame where we intervened. ----------
  const heroVideoIframe = document.querySelector('.gallery-hero .video-embed iframe');
  if (heroVideoIframe && window.Vimeo) {
    const heroVideoPlayer = new Vimeo.Player(heroVideoIframe);
    let heroVideoDuration = null;
    let heroVideoStopped = false;
    heroVideoPlayer.getDuration().then(d => { heroVideoDuration = d; });
    heroVideoPlayer.on('timeupdate', data => {
      if (heroVideoStopped || !heroVideoDuration) return;
      if (data.seconds >= heroVideoDuration - 0.4) {
        heroVideoStopped = true;
        heroVideoPlayer.pause()
          .then(() => heroVideoPlayer.setCurrentTime(heroVideoDuration))
          .catch(() => {});
      }
    });
  }

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

  // ---------- Contact form (opens a pre-filled e-mail, no backend) ----------
  document.querySelectorAll('.contact-form').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = form.querySelector('[name="jmeno"]').value.trim();
      const email = form.querySelector('[name="email"]').value.trim();
      const message = form.querySelector('[name="zprava"]').value.trim();
      const subject = encodeURIComponent(`Zpráva z webu od ${name}`);
      const body = encodeURIComponent(`Jméno: ${name}\nE-mail: ${email}\n\n${message}`);
      window.location.href = `mailto:ig.mimifoto@gmail.com?subject=${subject}&body=${body}`;
    });
  });

  // ---------- Hero orbit — videos start one by one (first almost immediately), and once a video is
  // playing it just stays playing and in color, looping on its own for good (no cutoff, no reverting
  // back to grayscale). The 'play' listener is always wired up BEFORE play() is called, so we can
  // never miss the event and leave a tile stuck grayscale despite actually playing underneath.
  const buildOrbitIframe = (tile, title) => {
    const iframe = document.createElement('iframe');
    iframe.src = `https://player.vimeo.com/video/${tile.dataset.vimeoId}?background=1&loop=1&muted=1&controls=0&autopause=0&title=0&byline=0&portrait=0`;
    iframe.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media; web-share');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('title', title);
    return iframe;
  };

  const wireOrbitVideoLoop = (iframe, tile, attempt = 0) => {
    if (!window.Vimeo) return;
    const player = new Vimeo.Player(iframe);
    // 'play' fires as soon as Vimeo accepts the play command, which can be a beat before any frame
    // actually advances — colorizing right then made photos look "colored but still frozen" for a
    // moment before real motion appeared. The first 'timeupdate' means playback has genuinely moved,
    // so the color change lands exactly when the user actually sees the video come alive.
    let started = false;
    player.on('timeupdate', () => {
      if (started) return;
      started = true;
      tile.classList.add('is-playing');
    });

    const playAttempt = player.ready().then(() => player.play());
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('orbit-video-timeout')), 4000));
    Promise.race([playAttempt, timeout]).catch(() => {
      // A hung play() never recovers on retry — swap in a brand new iframe/player session instead,
      // up to twice more, before giving up on that tile.
      if (attempt >= 2) return;
      const title = iframe.getAttribute('title');
      iframe.remove();
      const fresh = buildOrbitIframe(tile, title);
      tile.appendChild(fresh);
      wireOrbitVideoLoop(fresh, tile, attempt + 1);
    });
  };

  let orbitDelay = 0;
  document.querySelectorAll('.orbit-tile-inner[data-vimeo-id]').forEach(tile => {
    const runDelay = orbitDelay;
    orbitDelay += 300 + Math.random() * 200;
    setTimeout(() => {
      let iframe = tile.querySelector('iframe');
      if (!iframe) {
        iframe = buildOrbitIframe(tile, tile.querySelector('img')?.alt || 'Inna Guba — video');
        tile.appendChild(iframe);
      }
      wireOrbitVideoLoop(iframe, tile);
    }, runDelay);
  });

  // ---------- Hero orbit — pinned while it collapses into a stack on scroll, unstacks when scrolling back ----------
  const orbitWrap = document.querySelector('.hc-orbit-wrap');
  const scrollPin = document.querySelector('.hc-scroll-pin');
  const heroClaim = document.querySelector('.hc-center');
  if (orbitWrap && scrollPin) {
    const STACK_END = 0.6;    // videos finish collapsing by 60% through the pinned scroll
    const CLAIM_START = 0.38; // claim starts fading in earlier, well before the stack finishes
    const CLAIM_END = 0.55;   // ...and is fully visible shortly before it — then holds until 100%
    const updateOrbitStack = () => {
      const scrollable = scrollPin.offsetHeight - window.innerHeight;
      const scrolled = -scrollPin.getBoundingClientRect().top;
      const raw = scrollable > 0 ? Math.min(Math.max(scrolled / scrollable, 0), 1) : 0;
      const stackProgress = Math.min(raw / STACK_END, 1);
      const claimOpacity = scrollable > 0
        ? Math.min(Math.max((raw - CLAIM_START) / (CLAIM_END - CLAIM_START), 0), 1)
        : 1;
      orbitWrap.style.setProperty('--progress', stackProgress);
      orbitWrap.classList.toggle('is-stacked', stackProgress > 0);
      heroClaim?.style.setProperty('--claim-opacity', claimOpacity);
    };
    window.addEventListener('scroll', updateOrbitStack, { passive: true });
    window.addEventListener('resize', updateOrbitStack);
    updateOrbitStack();
  }

