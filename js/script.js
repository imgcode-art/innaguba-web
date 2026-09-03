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

document.querySelectorAll('[data-row]').forEach(row => {
    row.addEventListener('click', () => {
      const isOpen = row.classList.contains('open');
      document.querySelectorAll('[data-row]').forEach(r => {
        r.classList.remove('open');
        r.querySelector('.plus').textContent = '+';
      });
      if (!isOpen) {
        row.classList.add('open');
        row.querySelector('.plus').textContent = '×';
      }
    });
  });

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('in'); });
  }, { threshold: 0.1 });
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

  // ---------- Vimeo API loads async now (no longer blocks page render), so wait for it instead of gating on a single check ----------
  const whenVimeoReady = cb => {
    if (window.Vimeo) { cb(); return; }
    const check = setInterval(() => {
      if (window.Vimeo) { clearInterval(check); cb(); }
    }, 100);
  };

  // ---------- Hero orbit — bring videos to life one by one, at an uneven, lively pace ----------
  let orbitDelay = 0;
  document.querySelectorAll('.orbit-tile-inner[data-vimeo-id]').forEach((tile, i) => {
    orbitDelay += i === 0 ? 30 : 200 + Math.random() * 175;
    setTimeout(() => {
      const iframe = document.createElement('iframe');
      iframe.src = `https://player.vimeo.com/video/${tile.dataset.vimeoId}?background=1&autoplay=1&loop=1&muted=1&controls=0&autopause=0`;
      iframe.setAttribute('allow', 'autoplay; fullscreen');
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('title', tile.querySelector('img')?.alt || 'Inna Guba — video');
      tile.appendChild(iframe);
      whenVimeoReady(() => {
        const player = new Vimeo.Player(iframe);
        let duration = null;
        player.getDuration().then(d => { duration = d; });
        player.on('timeupdate', data => {
          if (duration && data.seconds >= duration - 10) player.setCurrentTime(0);
        });
        player.on('ended', () => player.setCurrentTime(0).then(() => player.play()));
      });
    }, orbitDelay);
  });

  // ---------- Mobile hero video — fills the hero on small screens, where the orbit tiles are hidden ----------
  const mobileHeroVideo = document.querySelector('.hc-mobile-video[data-vimeo-id]');
  if (mobileHeroVideo && window.matchMedia('(max-width: 900px)').matches) {
    const iframe = document.createElement('iframe');
    iframe.src = `https://player.vimeo.com/video/${mobileHeroVideo.dataset.vimeoId}?background=1&autoplay=1&loop=1&muted=1&controls=0&autopause=0`;
    iframe.setAttribute('allow', 'autoplay; fullscreen');
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('title', 'Inna Guba — video');
    mobileHeroVideo.appendChild(iframe);
    whenVimeoReady(() => {
      const player = new Vimeo.Player(iframe);
      player.on('ended', () => player.setCurrentTime(0).then(() => player.play()));
    });
  }
