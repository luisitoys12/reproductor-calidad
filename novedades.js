document.addEventListener('DOMContentLoaded', function() {
    // Get all tab links and content
    const tabLinks = document.querySelectorAll('.tab-link');
    const tabContents = document.querySelectorAll('.tab-content');

    // Add click event to each tab
    tabLinks.forEach(link => {
        link.addEventListener('click', () => {
            // Remove active class from all tabs and contents
            tabLinks.forEach(tab => tab.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));

            // Add active class to clicked tab and corresponding content
            link.classList.add('active');
            const tabId = link.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Mini player controls
    const audioMini = document.getElementById('audio-mini');
    const playPauseMiniBtn = document.getElementById('playPauseMiniBtn');
    const miniVolumeControl = document.getElementById('miniVolumeControl');
    const miniSongTitle = document.getElementById('miniSongTitle');
    const miniArtistName = document.getElementById('miniArtistName');

    playPauseMiniBtn.addEventListener('click', () => {
        if (audioMini.paused) {
            audioMini.play();
        } else {
            audioMini.pause();
        }
    });

    audioMini.addEventListener('play', () => {
        playPauseMiniBtn.innerHTML = '<i class="fas fa-pause"></i>';
    });

    audioMini.addEventListener('pause', () => {
        playPauseMiniBtn.innerHTML = '<i class="fas fa-play"></i>';
    });

    miniVolumeControl.addEventListener('input', (e) => {
        audioMini.volume = e.target.value;
    });

    // Set initial volume
    audioMini.volume = miniVolumeControl.value;

    // Optional: Update song info if metadata available
    // For now, static text
    miniSongTitle.textContent = "EKUSFM Radio";
    miniArtistName.textContent = "";

    // Set audio source (already set in HTML, but ensure)
    audioMini.src = "https://radio.trabullnetwork.pro/listen/esmerosound/radio.mp3";
    audioMini.crossOrigin = "anonymous";

    // Fetch metadata and listeners count periodically
    async function updateMiniMetadata() {
        try {
            const url = "https://radio.estacionkusmedios.com/api/nowplaying/esmerosound";
            const res = await fetch(url);
            if (!res.ok) throw new Error("HTTP status: " + res.status);
            const data = await res.json();

            let title = data.now_playing?.song?.title || data.now_playing?.song?.text || "Sin datos";
            let artist = data.now_playing?.song?.artist || "";
            let listeners = data.listeners?.current || 0;

            // Fallbacks
            if ((!title || title === "Sin datos") && data.song?.title) title = data.song.title;
            if (!artist && data.song?.artist) artist = data.song.artist;
            if ((!title || !artist) && title && title.includes(" - ")) {
                const [maybeArtist, maybeTitle] = title.split(" - ");
                if (!artist) artist = maybeArtist.trim();
                title = maybeTitle.trim();
            }

            miniSongTitle.textContent = title || "Sin datos";
            miniArtistName.textContent = artist || "";
            const miniListenersCount = document.getElementById('miniListenersCount');
            if (miniListenersCount) {
                miniListenersCount.textContent = `Oyentes: ${listeners}`;
            }
        } catch (e) {
            miniSongTitle.textContent = "Sin datos";
            miniArtistName.textContent = "";
            const miniListenersCount = document.getElementById('miniListenersCount');
            if (miniListenersCount) {
                miniListenersCount.textContent = "";
            }
        }
    }
    setInterval(updateMiniMetadata, 10000);
    updateMiniMetadata();
});
