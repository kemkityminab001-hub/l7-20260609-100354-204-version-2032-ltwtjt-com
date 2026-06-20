(function () {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector('.nav-toggle');
    var mobileNav = document.querySelector('.mobile-nav');
    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        var open = mobileNav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
    var prev = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');
    var index = 0;
    var timer = null;

    function showSlide(nextIndex) {
      if (!slides.length) return;
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function startHero() {
      if (timer) clearInterval(timer);
      if (slides.length > 1) {
        timer = setInterval(function () {
          showSlide(index + 1);
        }, 5200);
      }
    }

    if (slides.length) {
      showSlide(0);
      startHero();
      if (prev) {
        prev.addEventListener('click', function () {
          showSlide(index - 1);
          startHero();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          showSlide(index + 1);
          startHero();
        });
      }
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          showSlide(dotIndex);
          startHero();
        });
      });
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var filterSelects = Array.prototype.slice.call(document.querySelectorAll('[data-filter-select]'));
    var filterItems = Array.prototype.slice.call(document.querySelectorAll('.filter-item'));
    var emptyState = document.querySelector('.empty-state');

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function filterCards() {
      if (!filterItems.length) return;
      var query = normalize(filterInput ? filterInput.value : '');
      var active = {};
      filterSelects.forEach(function (select) {
        active[select.getAttribute('data-filter-select')] = normalize(select.value);
      });
      var visible = 0;
      filterItems.forEach(function (item) {
        var text = normalize([
          item.getAttribute('data-title'),
          item.getAttribute('data-year'),
          item.getAttribute('data-type'),
          item.getAttribute('data-region'),
          item.getAttribute('data-genre'),
          item.getAttribute('data-keywords')
        ].join(' '));
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchSelects = true;
        Object.keys(active).forEach(function (key) {
          var value = active[key];
          if (value && normalize(item.getAttribute('data-' + key)) !== value) {
            matchSelects = false;
          }
        });
        var match = matchQuery && matchSelects;
        item.hidden = !match;
        if (match) visible += 1;
      });
      if (emptyState) {
        emptyState.classList.toggle('is-visible', visible === 0);
      }
    }

    if (filterInput) {
      filterInput.addEventListener('input', filterCards);
    }
    filterSelects.forEach(function (select) {
      select.addEventListener('change', filterCards);
    });

    var player = document.querySelector('[data-player]');
    if (player) {
      var video = player.querySelector('video');
      var overlay = player.querySelector('.player-overlay');
      var startButton = player.querySelector('.player-start');
      var source = typeof movieStream === 'string' ? movieStream : '';
      var attached = false;
      var hlsObject = null;

      function attachSource() {
        if (!video || !source || attached) return;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          attached = true;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          hlsObject = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsObject.loadSource(source);
          hlsObject.attachMedia(video);
          attached = true;
          return;
        }
        video.src = source;
        attached = true;
      }

      function beginPlay() {
        if (!video) return;
        attachSource();
        video.controls = true;
        if (overlay) overlay.classList.add('is-hidden');
        var action = video.play();
        if (action && typeof action.catch === 'function') {
          action.catch(function () {
            if (overlay) overlay.classList.remove('is-hidden');
          });
        }
      }

      if (overlay) {
        overlay.addEventListener('click', beginPlay);
      }
      if (startButton) {
        startButton.addEventListener('click', function (event) {
          event.stopPropagation();
          beginPlay();
        });
      }
      if (video) {
        video.addEventListener('click', function () {
          if (!attached || video.paused) {
            beginPlay();
          }
        });
        video.addEventListener('play', function () {
          if (overlay) overlay.classList.add('is-hidden');
        });
      }
      window.addEventListener('pagehide', function () {
        if (hlsObject) {
          hlsObject.destroy();
        }
      });
    }
  });
})();
