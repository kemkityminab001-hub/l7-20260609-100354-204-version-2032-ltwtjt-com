(function () {
    var form = document.querySelector('[data-search-form]');
    var input = document.querySelector('[data-search-input]');
    var results = document.querySelector('[data-search-results]');
    var hint = document.querySelector('[data-search-hint]');
    var items = window.__siteSearch || [];

    function escapeHtml(value) {
        return String(value || '')
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    function card(item) {
        return '<article class="movie-card hover-lift">' +
            '<a href="' + item.url + '" aria-label="' + escapeHtml(item.title) + ' 在线观看">' +
            '<div class="poster" style="background-image: url(\'' + item.image + '\')">' +
            '<img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
            '<span class="card-badge">' + escapeHtml(item.kind) + '</span>' +
            '<span class="card-year">' + escapeHtml(item.year) + '</span>' +
            '</div>' +
            '<div class="card-body">' +
            '<h3>' + escapeHtml(item.title) + '</h3>' +
            '<p>' + escapeHtml(item.intro) + '</p>' +
            '<div class="card-meta"><span>' + escapeHtml(item.region) + '</span><span>' + escapeHtml(item.genre) + '</span></div>' +
            '</div>' +
            '</a>' +
            '</article>';
    }

    function render(query) {
        var keyword = String(query || '').trim().toLowerCase();
        var matched = items.filter(function (item) {
            return !keyword || String(item.text || '').toLowerCase().indexOf(keyword) !== -1;
        }).slice(0, 120);

        if (hint) {
            hint.textContent = keyword ? '搜索结果' : '热门影片与口碑佳作';
        }

        if (results) {
            results.innerHTML = matched.map(card).join('');
            results.querySelectorAll('img').forEach(function (image) {
                image.addEventListener('error', function () {
                    image.classList.add('is-missing');
                });
            });
        }
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (input) {
        input.value = initial;
    }
    render(initial);

    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var query = input ? input.value : '';
            var url = new URL(window.location.href);
            if (query.trim()) {
                url.searchParams.set('q', query.trim());
            } else {
                url.searchParams.delete('q');
            }
            history.replaceState(null, '', url.toString());
            render(query);
        });
    }

    if (input) {
        input.addEventListener('input', function () {
            render(input.value);
        });
    }
})();
