function normalizeText(value) {
  return String(value || "").toLowerCase().trim();
}

function setupMobileNavigation() {
  var button = document.querySelector(".menu-button");
  var nav = document.querySelector(".mobile-nav");

  if (!button || !nav) {
    return;
  }

  button.addEventListener("click", function () {
    var isOpen = nav.classList.toggle("is-open");
    button.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });
}

function setupHeroCarousel() {
  var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
  var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));

  if (slides.length < 2) {
    return;
  }

  var activeIndex = 0;

  function showSlide(nextIndex) {
    activeIndex = (nextIndex + slides.length) % slides.length;

    slides.forEach(function (slide, index) {
      slide.classList.toggle("is-active", index === activeIndex);
    });

    dots.forEach(function (dot, index) {
      dot.classList.toggle("is-active", index === activeIndex);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
    });
  });

  setInterval(function () {
    showSlide(activeIndex + 1);
  }, 5200);
}

function setupMovieFiltering() {
  var searchInputs = Array.prototype.slice.call(document.querySelectorAll(".movie-search"));
  var filters = Array.prototype.slice.call(document.querySelectorAll(".movie-filter"));
  var cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card, .ranking-item"));

  if (!cards.length) {
    return;
  }

  function currentQuery() {
    for (var i = 0; i < searchInputs.length; i += 1) {
      var value = normalizeText(searchInputs[i].value);
      if (value) {
        return value;
      }
    }
    return "";
  }

  function currentFilter() {
    for (var i = 0; i < filters.length; i += 1) {
      var value = normalizeText(filters[i].value);
      if (value) {
        return value;
      }
    }
    return "";
  }

  function applyFilter() {
    var query = currentQuery();
    var channel = currentFilter();

    cards.forEach(function (card) {
      var haystack = normalizeText([
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-year"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-channel"),
        card.getAttribute("data-tags")
      ].join(" "));

      var matchesQuery = !query || haystack.indexOf(query) !== -1;
      var matchesChannel = !channel || haystack.indexOf(channel) !== -1;
      card.classList.toggle("is-filtered-out", !(matchesQuery && matchesChannel));
    });
  }

  searchInputs.forEach(function (input) {
    input.addEventListener("input", applyFilter);
  });

  filters.forEach(function (select) {
    select.addEventListener("change", applyFilter);
  });
}

function initializeMoviePlayer(streamUrl) {
  var video = document.querySelector("[data-player-video]");
  var cover = document.querySelector("[data-player-cover]");
  var startButton = document.querySelector("[data-player-start]");
  var attached = false;
  var hlsInstance = null;

  if (!video || !streamUrl) {
    return;
  }

  function attachStream() {
    if (attached) {
      return;
    }

    attached = true;

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(streamUrl);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = streamUrl;
  }

  function beginPlayback() {
    attachStream();

    if (cover) {
      cover.classList.add("is-hidden");
    }

    video.setAttribute("controls", "controls");

    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  if (cover) {
    cover.addEventListener("click", beginPlayback);
  }

  if (startButton) {
    startButton.addEventListener("click", function (event) {
      event.stopPropagation();
      beginPlayback();
    });
  }

  video.addEventListener("click", function () {
    if (video.paused) {
      beginPlayback();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}

window.initializeMoviePlayer = initializeMoviePlayer;

document.addEventListener("DOMContentLoaded", function () {
  setupMobileNavigation();
  setupHeroCarousel();
  setupMovieFiltering();
});
