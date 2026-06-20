(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-button]");
    var menu = document.querySelector("[data-mobile-menu]");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (!slides.length) {
      return;
    }
    var active = 0;
    function show(index) {
      active = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === active);
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
      });
    });
    if (slides.length > 1) {
      window.setInterval(function () {
        show((active + 1) % slides.length);
      }, 5000);
    }
  }

  function normalize(text) {
    return String(text || "").toLowerCase().trim();
  }

  function filterCards(query) {
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    var status = document.querySelector("[data-filter-status]");
    var value = normalize(query);
    var shown = 0;
    cards.forEach(function (card) {
      var blob = normalize(card.getAttribute("data-search"));
      var match = !value || blob.indexOf(value) !== -1;
      card.classList.toggle("is-filter-hidden", !match);
      if (match) {
        shown += 1;
      }
    });
    if (status) {
      status.textContent = shown ? "已匹配到相关影片" : "暂无匹配影片";
    }
  }

  function setupSearch() {
    var forms = Array.prototype.slice.call(document.querySelectorAll("[data-search-form]"));
    var params = new URLSearchParams(window.location.search);
    var incoming = params.get("q") || "";
    forms.forEach(function (form) {
      var input = form.querySelector("[data-site-search]");
      if (input && incoming) {
        input.value = incoming;
        filterCards(incoming);
      }
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var field = form.querySelector("[data-site-search]");
        var value = field ? field.value.trim() : "";
        if (document.querySelector("[data-movie-card]")) {
          filterCards(value);
          return;
        }
        var target = form.getAttribute("data-search-target") || "categories.html";
        var suffix = value ? "?q=" + encodeURIComponent(value) : "";
        window.location.href = target + suffix;
      });
    });
  }

  function setupSmoothLinks() {
    var links = Array.prototype.slice.call(document.querySelectorAll("a[href^='#']"));
    links.forEach(function (link) {
      link.addEventListener("click", function (event) {
        var id = link.getAttribute("href");
        if (!id || id === "#") {
          return;
        }
        var target = document.querySelector(id);
        if (!target) {
          return;
        }
        event.preventDefault();
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  function setupPlayer(mediaUrl) {
    var video = document.getElementById("movie-player");
    var overlay = document.getElementById("player-overlay");
    if (!video || !mediaUrl) {
      return;
    }
    var attached = false;
    function attach() {
      if (attached) {
        return;
      }
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = mediaUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(mediaUrl);
        hls.attachMedia(video);
        video.hlsInstance = hls;
      } else {
        video.src = mediaUrl;
      }
      attached = true;
    }
    function play() {
      attach();
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      var action = video.play();
      if (action && action.catch) {
        action.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    }
    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupSmoothLinks();
  });

  window.initPlayer = setupPlayer;
})();
