(function () {
    function preparePlayer(shell) {
        var video = shell.querySelector('video');
        var button = shell.querySelector('[data-play]');
        var stream = shell.getAttribute('data-stream');
        var initialized = false;
        var hlsInstance = null;

        function attachStream() {
            if (!video || !stream || initialized) {
                return;
            }
            initialized = true;

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else {
                video.src = stream;
            }
        }

        function startPlayback() {
            attachStream();
            shell.classList.add('is-ready');
            if (video) {
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {
                        shell.classList.remove('is-ready');
                    });
                }
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                startPlayback();
            });
        }

        shell.addEventListener('click', function (event) {
            if (event.target === video && initialized) {
                return;
            }
            if (event.target.closest('[data-play]')) {
                return;
            }
            if (!initialized) {
                startPlayback();
            }
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    }

    document.querySelectorAll('[data-player]').forEach(preparePlayer);
})();
