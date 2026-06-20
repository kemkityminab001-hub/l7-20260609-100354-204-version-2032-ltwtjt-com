
(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    ready(function () {
        setupMenu();
        setupHero();
        setupFilters();
        setupPlayers();
        applyQuerySearch();
    });

    function setupMenu() {
        var toggle = document.querySelector('[data-menu-toggle]');
        var menu = document.querySelector('[data-mobile-menu]');
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function setupHero() {
        var hero = document.querySelector('[data-hero]');
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var current = 0;
        var timer;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }

    function setupFilters() {
        var grids = Array.prototype.slice.call(document.querySelectorAll('[data-search-grid]'));
        grids.forEach(function (grid) {
            var section = grid.closest('section') || document;
            var input = section.querySelector('[data-filter-input]');
            var typeButtons = Array.prototype.slice.call(section.querySelectorAll('[data-type-filter]'));
            var categorySelect = section.querySelector('[data-category-filter]');
            var loadButton = section.querySelector('[data-load-more]');
            var emptyState = section.querySelector('[data-empty-state]');
            var cards = Array.prototype.slice.call(grid.querySelectorAll('[data-movie-card]'));
            var pageSize = Number(grid.getAttribute('data-page-size')) || cards.length;
            var visibleLimit = pageSize;
            var activeType = 'all';

            function readKeyword() {
                return input ? input.value.trim().toLowerCase() : '';
            }

            function filterCards(resetLimit) {
                if (resetLimit) {
                    visibleLimit = pageSize;
                }
                var keyword = readKeyword();
                var category = categorySelect ? categorySelect.value : 'all';
                var matched = [];
                cards.forEach(function (card) {
                    var haystack = (card.getAttribute('data-search') || '').toLowerCase();
                    var type = card.getAttribute('data-type') || '';
                    var cardCategory = card.getAttribute('data-category') || '';
                    var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var okType = activeType === 'all' || type.indexOf(activeType) !== -1;
                    var okCategory = category === 'all' || cardCategory === category;
                    if (okKeyword && okType && okCategory) {
                        matched.push(card);
                    }
                });
                cards.forEach(function (card) {
                    card.hidden = true;
                });
                matched.slice(0, visibleLimit).forEach(function (card) {
                    card.hidden = false;
                });
                if (loadButton) {
                    loadButton.hidden = matched.length <= visibleLimit;
                }
                if (emptyState) {
                    emptyState.classList.toggle('is-visible', matched.length === 0);
                }
            }

            if (input) {
                input.addEventListener('input', function () {
                    filterCards(true);
                });
            }
            if (categorySelect) {
                categorySelect.addEventListener('change', function () {
                    filterCards(true);
                });
            }
            typeButtons.forEach(function (button) {
                button.addEventListener('click', function () {
                    activeType = button.getAttribute('data-type-filter') || 'all';
                    typeButtons.forEach(function (item) {
                        item.classList.toggle('is-active', item === button);
                    });
                    filterCards(true);
                });
            });
            if (loadButton) {
                loadButton.addEventListener('click', function () {
                    visibleLimit += pageSize;
                    filterCards(false);
                });
            }
            filterCards(false);
        });
    }

    function applyQuerySearch() {
        var params = new URLSearchParams(window.location.search);
        var query = params.get('q');
        if (!query) {
            return;
        }
        var input = document.querySelector('[data-filter-input]');
        if (input) {
            input.value = query;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            var target = document.querySelector('#all-movies') || input.closest('section');
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }

    function setupPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
        shells.forEach(function (shell) {
            var video = shell.querySelector('video[data-m3u8]');
            var trigger = shell.querySelector('[data-player-trigger]');
            var started = false;
            var hls;
            if (!video) {
                return;
            }

            function startVideo() {
                var source = video.getAttribute('data-m3u8');
                if (!source) {
                    return;
                }
                if (!started) {
                    if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        video.src = source;
                    } else if (window.Hls && window.Hls.isSupported()) {
                        hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                        hls.loadSource(source);
                        hls.attachMedia(video);
                    } else {
                        video.src = source;
                    }
                    started = true;
                }
                if (trigger) {
                    trigger.classList.add('is-hidden');
                }
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        if (trigger) {
                            trigger.classList.remove('is-hidden');
                        }
                    });
                }
            }

            if (trigger) {
                trigger.addEventListener('click', startVideo);
            }
            video.addEventListener('click', function () {
                if (!started) {
                    startVideo();
                }
            });
            video.addEventListener('play', function () {
                if (trigger) {
                    trigger.classList.add('is-hidden');
                }
            });
            video.addEventListener('ended', function () {
                if (hls && typeof hls.destroy === 'function') {
                    hls.destroy();
                    hls = null;
                    started = false;
                }
            });
        });
    }
})();
