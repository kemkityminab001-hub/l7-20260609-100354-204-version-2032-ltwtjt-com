(function () {
  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMenu() {
    var toggle = document.querySelector('.js-menu-toggle');
    var panel = document.querySelector('.js-mobile-panel');
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener('click', function () {
      var open = panel.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
  }

  function initSearchForms() {
    document.querySelectorAll('.js-search-form').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[type="search"]');
        var query = input ? input.value.trim() : '';
        var target = './search.html';
        if (query) {
          target += '?q=' + encodeURIComponent(query);
        }
        window.location.href = target;
      });
    });
  }

  function initHero() {
    document.querySelectorAll('.js-hero').forEach(function (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
      var prev = hero.querySelector('.hero-prev');
      var next = hero.querySelector('.hero-next');
      var index = 0;
      var timer;
      if (!slides.length) {
        return;
      }
      function show(nextIndex) {
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle('is-active', slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle('is-active', dotIndex === index);
        });
      }
      function start() {
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }
      function restart() {
        window.clearInterval(timer);
        start();
      }
      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          restart();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          restart();
        });
      }
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          show(dotIndex);
          restart();
        });
      });
      start();
    });
  }

  function initFilters() {
    document.querySelectorAll('[data-filter-board]').forEach(function (board) {
      var input = board.querySelector('.js-filter-input');
      var year = board.querySelector('.js-filter-year');
      var type = board.querySelector('.js-filter-type');
      var cards = Array.prototype.slice.call(board.querySelectorAll('.js-card'));
      var empty = board.querySelector('.js-empty-state');
      var params = new URLSearchParams(window.location.search);
      var query = params.get('q') || '';
      if (board.hasAttribute('data-search-page') && input && query) {
        input.value = query;
      }
      function apply() {
        var term = normalize(input ? input.value : '');
        var chosenYear = normalize(year ? year.value : '');
        var chosenType = normalize(type ? type.value : '');
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-tags'),
            card.getAttribute('data-year'),
            card.getAttribute('data-type'),
            card.getAttribute('data-region'),
            card.getAttribute('data-category')
          ].join(' '));
          var matchTerm = !term || haystack.indexOf(term) !== -1;
          var matchYear = !chosenYear || normalize(card.getAttribute('data-year')) === chosenYear;
          var matchType = !chosenType || normalize(card.getAttribute('data-type')) === chosenType;
          var show = matchTerm && matchYear && matchType;
          card.style.display = show ? '' : 'none';
          if (show) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('is-visible', visible === 0);
        }
      }
      [input, year, type].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function initPlayers() {
    document.querySelectorAll('.js-player').forEach(function (player) {
      var video = player.querySelector('video');
      var cover = player.querySelector('[data-play]');
      var url = player.getAttribute('data-stream');
      var hlsInstance;
      if (!video || !url) {
        return;
      }
      function attach() {
        if (video.getAttribute('data-ready') === 'true') {
          return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = url;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hlsInstance.loadSource(url);
          hlsInstance.attachMedia(video);
        } else {
          video.src = url;
        }
        video.setAttribute('data-ready', 'true');
      }
      function play() {
        attach();
        player.classList.add('is-playing');
        video.setAttribute('controls', 'controls');
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }
      if (cover) {
        cover.addEventListener('click', play);
      }
      video.addEventListener('click', function () {
        if (video.getAttribute('data-ready') !== 'true') {
          play();
        }
      });
      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
    document.querySelectorAll('[data-scroll-player]').forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.preventDefault();
        var player = document.querySelector('.js-player');
        if (player) {
          player.scrollIntoView({ behavior: 'smooth', block: 'center' });
          var button = player.querySelector('[data-play]');
          if (button) {
            button.click();
          }
        }
      });
    });
  }

  ready(function () {
    initMenu();
    initSearchForms();
    initHero();
    initFilters();
    initPlayers();
  });
})();
