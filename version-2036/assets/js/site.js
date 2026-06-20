(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileMenu = document.querySelector('[data-mobile-menu]');

    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('is-open');
            document.body.classList.toggle('menu-open', mobileMenu.classList.contains('is-open'));
        });
    }

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.classList.add('is-missing');
        });
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var index = 0;

        function showSlide(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
            });
        });

        setInterval(function () {
            showSlide(index + 1);
        }, 5600);
    }

    var filterList = document.querySelector('[data-filter-list]');
    if (filterList) {
        var cards = Array.prototype.slice.call(filterList.querySelectorAll('[data-card]'));
        var input = document.querySelector('[data-filter-input]');
        var kind = document.querySelector('[data-filter-kind]');
        var year = document.querySelector('[data-filter-year]');
        var region = document.querySelector('[data-filter-region]');

        function applyFilters() {
            var keyword = input ? input.value.trim().toLowerCase() : '';
            var kindValue = kind ? kind.value : '';
            var yearValue = year ? year.value : '';
            var regionValue = region ? region.value : '';

            cards.forEach(function (card) {
                var text = (card.getAttribute('data-search') || '').toLowerCase();
                var matchKeyword = !keyword || text.indexOf(keyword) !== -1;
                var matchKind = !kindValue || card.getAttribute('data-kind') === kindValue;
                var matchYear = !yearValue || card.getAttribute('data-year') === yearValue;
                var matchRegion = !regionValue || card.getAttribute('data-region') === regionValue;
                card.classList.toggle('is-hidden', !(matchKeyword && matchKind && matchYear && matchRegion));
            });
        }

        [input, kind, year, region].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });
    }
})();
