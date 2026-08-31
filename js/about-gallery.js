(function () {
  'use strict';

  const gallery = [
    {
      title: 'MD OF ADJP CREATIVE — SRUTHIY PRABHA',
      src:   'assets/images/Profile%20Picture/Sruthiy%20Prabha%2010.jpg',
      alt:   'Portrait of Sruthiy Prabha'
    },
    {
      title: 'MD OF ADJP CREATIVE — SRUTHIY PRABHA',
      src:   'assets/images/Profile%20Picture/Sruthiy%20Prabha%206.jpg',
      alt:   'Portrait of Sruthiy Prabha 6'
    },
    {
      title: 'LB FINANCE BTS',
      src:   'assets/images/behind%20the%20scenes%20images/Jaffna%203.jpg',
      alt:   'Behind the scenes — Jaffna'
    },
    {
      title: 'LB FINANCE BTS',
      src:   'assets/images/behind%20the%20scenes%20images/jaffna%2012.jpg',
      alt:   'Behind the scenes — Jaffna 12'
    },
    {
      title: 'LB FINANCE BTS',
      src:   'assets/images/behind%20the%20scenes%20images/jaffna%2014.jpg',
      alt:   'Behind the scenes — Jaffna 14'
    },
    {
      title: 'LB FINANCE BTS',
      src:   'assets/images/behind%20the%20scenes%20images/jaffna%2017.jpg',
      alt:   'Behind the scenes — Jaffna 17'
    },
    {
      title: 'LB FINANCE BTS',
      src:   'assets/images/behind%20the%20scenes%20images/jaffna%2018.jpg',
      alt:   'Behind the scenes — Jaffna 18'
    },
    {
      title: 'MADHAVI',
      src:   'assets/images/behind%20the%20scenes%20images/Madhavi%202.jpg',
      alt:   'Behind the scenes — Madhavi'
    },
    {
      title: 'MADHAVI',
      src:   'assets/images/behind%20the%20scenes%20images/Madhavi%207.jpg',
      alt:   'Behind the scenes — Madhavi 7'
    },
    {
      title: 'MUTHU KARUPPAN',
      src:   'assets/images/behind%20the%20scenes%20images/muthu%20karuppan%201.jpg',
      alt:   'Behind the scenes — Muthu Karuppan'
    },
    {
      title: 'MUTHU KARUPPAN',
      src:   'assets/images/behind%20the%20scenes%20images/muthu%20karuppan%202.jpg',
      alt:   'Behind the scenes — Muthu Karuppan 2'
    },
    {
      title: 'ONDIKKU ONDI',
      src:   'assets/images/behind%20the%20scenes%20images/Ondikku%20ondi.jpg',
      alt:   'Feature film — Ondikku Ondi'
    },
    {
      title: 'PADHANY',
      src:   'assets/images/behind%20the%20scenes%20images/padhany.jpg',
      alt:   'Feature film — Padhany'
    },
    {
      title: 'PLMTT',
      src:   'assets/images/behind%20the%20scenes%20images/PLMTT%202.jpg',
      alt:   'Production — PLMTT'
    },
    {
      title: 'PLMTT',
      src:   'assets/images/behind%20the%20scenes%20images/PLMTT%203.jpg',
      alt:   'Production — PLMTT 3',
      position: 'right center'
    },
    {
      title: 'PLMTT',
      src:   'assets/images/behind%20the%20scenes%20images/PLMTT%205.jpg',
      alt:   'Production — PLMTT 5'
    },
    {
      title: 'PLMTT',
      src:   'assets/images/behind%20the%20scenes%20images/PLMTT%207.jpg',
      alt:   'Production — PLMTT 7'
    },
    {
      title: 'PLMTT',
      src:   'assets/images/behind%20the%20scenes%20images/PLMTT%208.jpg',
      alt:   'Production — PLMTT 8'
    },
    {
      title: 'PLMTT',
      src:   'assets/images/behind%20the%20scenes%20images/PLMTT%209.jpg',
      alt:   'Production — PLMTT 9'
    },
    {
      title: 'CHENNAI',
      src:   'assets/images/behind%20the%20scenes%20images/shoot%20in%20chennai%203.jpg',
      alt:   'Production shoot in Chennai'
    }
  ];

  const mainImg    = document.getElementById('galleryImg');
  const labelText  = document.getElementById('galleryLabelText');
  const counter    = document.getElementById('galleryCounter');
  const rail       = document.getElementById('galleryRail');
  const arrowUp    = document.getElementById('galleryArrowUp');
  const arrowDown  = document.getElementById('galleryArrowDown');

  if (!mainImg || !rail) return;

  /* How many thumbs visible in the rail window at once */
  var WINDOW_SIZE  = 5;
  var windowStart  = 0; /* first visible gallery index */
  var activeIndex  = 0;
  var animating    = false;
  var thumbEls     = [];

  function pad(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  /* Build all thumbnail elements once */
  gallery.forEach(function (item, i) {
    var btn = document.createElement('button');
    btn.className    = 'gallery-thumb' + (i === 0 ? ' active' : '');
    btn.dataset.index = i;
    btn.setAttribute('aria-label', 'View ' + item.alt);
    btn.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');

    var img = document.createElement('img');
    img.src = item.src;
    img.alt = item.alt;

    var overlay = document.createElement('span');
    overlay.className = 'gallery-thumb__overlay';

    var marker = document.createElement('span');
    marker.className = 'gallery-thumb__marker';

    btn.appendChild(img);
    btn.appendChild(overlay);
    btn.appendChild(marker);
    thumbEls.push(btn);
  });

  /* Render the visible window of thumbs into the rail */
  function renderRail() {
    rail.innerHTML = '';
    var end = Math.min(windowStart + WINDOW_SIZE, gallery.length);
    for (var i = windowStart; i < end; i++) {
      rail.appendChild(thumbEls[i]);
    }
    arrowUp.disabled   = windowStart === 0;
    arrowDown.disabled = windowStart + WINDOW_SIZE >= gallery.length;
  }

  /* Scroll the window so the active thumb is visible */
  function ensureActiveVisible() {
    if (activeIndex < windowStart) {
      windowStart = activeIndex;
      renderRail();
    } else if (activeIndex >= windowStart + WINDOW_SIZE) {
      windowStart = activeIndex - WINDOW_SIZE + 1;
      renderRail();
    }
  }

  /* Initialise — explicit set so browser cache never shows stale src */
  mainImg.src                    = gallery[0].src;
  mainImg.alt                    = gallery[0].alt;
  mainImg.style.objectPosition   = gallery[0].position || 'center center';
  labelText.textContent    = gallery[0].title;
  counter.textContent      = '01 / ' + pad(gallery.length);

  renderRail();

  function switchTo(index) {
    if (index === activeIndex || animating) return;
    animating = true;

    mainImg.style.opacity   = '0';
    mainImg.style.transform = 'scale(1.015)';

    setTimeout(function () {
      mainImg.src   = gallery[index].src;
      mainImg.alt   = gallery[index].alt;
      mainImg.style.objectPosition = gallery[index].position || 'center center';

      labelText.textContent = gallery[index].title;
      counter.textContent   = pad(index + 1) + ' / ' + pad(gallery.length);

      mainImg.style.transform = 'scale(1.02)';
      void mainImg.offsetWidth;
      mainImg.style.opacity   = '1';
      mainImg.style.transform = 'scale(1)';

      thumbEls.forEach(function (t, i) {
        var isActive = i === index;
        t.classList.toggle('active', isActive);
        t.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });

      activeIndex = index;
      ensureActiveVisible();

      setTimeout(function () { animating = false; }, 420);
    }, 360);
  }

  /* Wire thumb click + keyboard nav */
  thumbEls.forEach(function (btn, i) {
    btn.addEventListener('click', function () { switchTo(i); });

    btn.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        var next = (i + 1) % thumbEls.length;
        switchTo(next);
        thumbEls[next].focus();
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        var prev = (i - 1 + thumbEls.length) % thumbEls.length;
        switchTo(prev);
        thumbEls[prev].focus();
      }
    });
  });

  /* Arrow buttons scroll one at a time */
  arrowUp.addEventListener('click', function () {
    if (windowStart > 0) {
      windowStart -= 1;
      renderRail();
    }
  });

  arrowDown.addEventListener('click', function () {
    if (windowStart + WINDOW_SIZE < gallery.length) {
      windowStart += 1;
      renderRail();
    }
  });

})();
