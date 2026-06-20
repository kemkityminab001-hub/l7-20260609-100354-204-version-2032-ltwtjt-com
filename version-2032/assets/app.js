(function () {
    var menuButton = document.querySelector("[data-menu-toggle]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer;

        function showSlide(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === current);
            });
        }

        function startTimer() {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function restartTimer() {
            window.clearInterval(timer);
            startTimer();
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                showSlide(index);
                restartTimer();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                restartTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                restartTimer();
            });
        }

        if (slides.length > 1) {
            startTimer();
        }
    }

    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-card]"));
    var emptyState = document.querySelector("[data-empty-state]");
    var searchInput = document.querySelector("[data-search-input]");
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim();
    var activeFilter = "";

    if (searchInput && query) {
        searchInput.value = query;
    }

    function normalize(value) {
        return String(value || "").toLowerCase().trim();
    }

    function applyCards() {
        if (!cards.length) {
            return;
        }

        var q = normalize(searchInput ? searchInput.value : query);
        var filter = normalize(activeFilter);
        var visible = 0;

        cards.forEach(function (card) {
            var terms = normalize(card.getAttribute("data-terms"));
            var matchQuery = !q || terms.indexOf(q) !== -1;
            var matchFilter = !filter || terms.indexOf(filter) !== -1;
            var shouldShow = matchQuery && matchFilter;
            card.classList.toggle("is-hidden-card", !shouldShow);
            if (shouldShow) {
                visible += 1;
            }
        });

        if (emptyState) {
            emptyState.classList.toggle("show", visible === 0);
        }
    }

    if (searchInput) {
        searchInput.addEventListener("input", applyCards);
    }

    document.querySelectorAll("[data-filter-value]").forEach(function (button) {
        button.addEventListener("click", function () {
            document.querySelectorAll("[data-filter-value]").forEach(function (item) {
                item.classList.remove("active");
            });
            button.classList.add("active");
            activeFilter = button.getAttribute("data-filter-value") || "";
            applyCards();
        });
    });

    if (cards.length) {
        applyCards();
    }
})();

function initMoviePlayer(streamUrl) {
    var video = document.querySelector("[data-player-video]");
    var mask = document.querySelector("[data-player-mask]");
    var trigger = document.querySelector("[data-player-trigger]");
    var hlsInstance = null;
    var hasStarted = false;

    if (!video || !streamUrl) {
        return;
    }

    function attachStream() {
        if (hasStarted) {
            return;
        }

        hasStarted = true;

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = streamUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(streamUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = streamUrl;
        }
    }

    function playVideo() {
        attachStream();

        if (mask) {
            mask.classList.add("is-hidden");
        }

        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {});
        }
    }

    if (mask) {
        mask.addEventListener("click", playVideo);
    }

    if (trigger) {
        trigger.addEventListener("click", playVideo);
    }

    video.addEventListener("click", function () {
        if (!hasStarted || video.paused) {
            playVideo();
        }
    });

    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
            hlsInstance = null;
        }
    });
}
