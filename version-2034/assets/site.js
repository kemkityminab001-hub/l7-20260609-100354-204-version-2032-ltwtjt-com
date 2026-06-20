(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function play() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      play();
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot') || 0));
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    show(0);
    play();
  }

  var filterForms = document.querySelectorAll('[data-filter-form]');

  filterForms.forEach(function (form) {
    var list = document.querySelector('[data-filter-list]');
    var input = form.querySelector('[data-filter-input]');
    var year = form.querySelector('[data-year-filter]');
    var region = form.querySelector('[data-region-filter]');
    var type = form.querySelector('[data-type-filter]');
    var cards = list ? Array.prototype.slice.call(list.querySelectorAll('.movie-card')) : [];
    var params = new URLSearchParams(window.location.search);

    if (input && params.get('q')) {
      input.value = params.get('q');
    }

    function testCard(card) {
      var text = [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-category'),
        card.textContent
      ].join(' ').toLowerCase();
      var q = input ? input.value.trim().toLowerCase() : '';
      var yearValue = year ? year.value : '';
      var regionValue = region ? region.value : '';
      var typeValue = type ? type.value : '';
      var matchText = !q || text.indexOf(q) !== -1;
      var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
      var matchRegion = !regionValue || card.getAttribute('data-region') === regionValue;
      var matchType = !typeValue || text.indexOf(typeValue.toLowerCase()) !== -1;
      return matchText && matchYear && matchRegion && matchType;
    }

    function applyFilter() {
      cards.forEach(function (card) {
        card.hidden = !testCard(card);
      });
    }

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      applyFilter();
    });

    [input, year, region, type].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilter);
        control.addEventListener('change', applyFilter);
      }
    });

    applyFilter();
  });
})();
