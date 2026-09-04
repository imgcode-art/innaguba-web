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

  // ---------- Hero orbit — first video plays immediately, the rest come to life one by one ----------
  const wireOrbitVideoLoop = (iframe) => {
    const attach = () => {
      const player = new Vimeo.Player(iframe);
      let duration = null;
      player.getDuration().then(d => { duration = d; });
      player.on('timeupdate', data => {
        if (duration && data.seconds >= duration - 5) player.setCurrentTime(0);
      });
      player.on('ended', () => player.setCurrentTime(0).then(() => player.play()));
    };
    if (window.Vimeo) attach();
    else document.getElementById('vimeo-player-api')?.addEventListener('load', attach);
  };

  let orbitDelay = 0;
  document.querySelectorAll('.orbit-tile-inner[data-vimeo-id]').forEach(tile => {
    const existingIframe = tile.querySelector('iframe');
    if (existingIframe) { wireOrbitVideoLoop(existingIframe); return; }
    orbitDelay += 200 + Math.random() * 175;
    setTimeout(() => {
      const iframe = document.createElement('iframe');
      iframe.src = `https://player.vimeo.com/video/${tile.dataset.vimeoId}?background=1&autoplay=1&loop=1&muted=1&controls=0&autopause=0&title=0&byline=0&portrait=0`;
      iframe.setAttribute('allow', 'autoplay; fullscreen');
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('title', tile.querySelector('img')?.alt || 'Inna Guba — video');
      tile.appendChild(iframe);
      wireOrbitVideoLoop(iframe);
    }, orbitDelay);
  });

