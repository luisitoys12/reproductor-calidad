// === CONFIGURACIÓN ===
const config = {
    nombreRadio: "EKUSFM",
    streamURL: "https://stream.zeno.fm/i6yeiqilxkvuv",
    idzeno: "i6yeiqilxkvuv",
    albumCover: "https://radioaventura-web.vercel.app/img/default.jpg",
    redesSociales: [
        { url: "https://web.facebook.com/ekusfm", icon: "fab fa-facebook" },
        { url: "https://www.instagram.com/estacionkusfm/", icon: "fab fa-instagram" },
        { url: "https://www.youtube.com/estacionkusfm", icon: "fab fa-youtube" },
        { url: "https://chat.whatsapp.com/JSk9LFoclGrFxY7rb4TFWu", icon: "fab fa-whatsapp" }
    ]
};

// === BLOQUEO COPIA ===
(function() {
    const hostname = location.hostname;
    const permitido = (
        hostname === "reproductor-calidad.estacionkusmedios.com" ||
        hostname === "luisitoys12.github.io" ||
        hostname === "repro-ekusmedios.vercel.app" ||
        hostname === "reproductor-calidad.vercel.app"
    );
    if (!permitido) {
        document.body.innerHTML = `
        <div style="text-align:center;padding:40px;color:#fff;background:#1e293b;height:100vh">
            <h1 style="color:#ff4444;font-size:2.5rem;">Página NO Autorizada</h1>
            <p style="font-size:1.2rem;">
                El reproductor no está autorizado para usarse en este dominio.<br>
                Si ves este mensaje es porque el dominio en el que intentas acceder no cuenta con autorización para utilizar este reproductor por motivos de control y seguridad.<br><br>
                Si eres el propietario del sitio y necesitas solicitar autorización para un nuevo dominio, por favor envía un correo a <a href="mailto:estacionkusmedios@hotmail.com" style="color:#0ff;">estacionkusmedios@hotmail.com</a>.<br>
                Gracias por tu comprensión.
            </p>
        </div>`;
        document.title = "No autorizado";
        throw new Error("Sitio no autorizado.");
    }
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey && ['u','s','c','a'].includes(e.key.toLowerCase())) ||
            (e.metaKey && ['u','s','c','a'].includes(e.key.toLowerCase())) ||
            e.key === 'F12') e.preventDefault();
    });
})();

// === MINI REPRODUCTOR FOOTER ===
(function(){
    const audio = document.getElementById('audio-mini');
    if (!audio) return;
    const playBtn = document.getElementById('playPauseMiniBtn');
    const playIcon = document.getElementById('miniPlayIcon');
    const songTitle = document.getElementById('miniSongTitle');
    const artistName = document.getElementById('miniArtistName');
    const coverImg = document.getElementById('miniCoverImg');
    const volumeSlider = document.getElementById('miniVolumeControl');
    const loader = document.getElementById('audioLoader');

    audio.src = config.streamURL;
    audio.crossOrigin = "anonymous";
    audio.volume = volumeSlider ? (volumeSlider.valueAsNumber || 1) : 1;

    if(playBtn) {
        playBtn.onclick = function() {
            if (audio.paused) audio.play();
            else audio.pause();
        };
    }
    audio.onplay = function() {
        if(playIcon) {
            playIcon.classList.remove("fa-play");
            playIcon.classList.add("fa-pause");
        }
        if(loader) loader.classList.add('loading');
    };
    audio.onpause = function() {
        if(playIcon) {
            playIcon.classList.remove("fa-pause");
            playIcon.classList.add("fa-play");
        }
        if(loader) loader.classList.remove('loading');
    };

    if(volumeSlider) {
        volumeSlider.oninput = function() {
            audio.volume = volumeSlider.valueAsNumber;
        };
    }
    if(loader) {
        audio.onwaiting = function() { loader.classList.add('loading'); };
        audio.oncanplay = function() { loader.classList.remove('loading'); };
    }

    // METADATOS ZENO.FM + carátula iTunes
    let lastSong = "";
    async function updateMetadata() {
        try {
            const res = await fetch(`https://zenoplay.zenomedia.com/api/zenofm/nowplaying/${config.idzeno}?ra=${Math.random()}`);
            const data = await res.json();
            const currentSong = data.title || config.nombreRadio;
            if (currentSong === lastSong) return;
            lastSong = currentSong;
            let [artist, title] = currentSong.split(" - ");
            title = title ? title.trim() : currentSong;
            artist = artist ? artist.trim() : config.nombreRadio;
            if(songTitle) songTitle.textContent = title;
            if(artistName) artistName.textContent = artist;
            // Carátula
            let coverUrl = config.albumCover;
            try {
                const r = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(artist + " " + title)}&media=music&limit=1`);
                const cdata = await r.json();
                if (cdata.results && cdata.results[0]?.artworkUrl100) {
                    coverUrl = cdata.results[0].artworkUrl100.replace("100x100bb", "600x600bb");
                }
            } catch {}
            if(coverImg) coverImg.src = coverUrl;
        } catch {
            if(songTitle) songTitle.textContent = config.nombreRadio;
            if(artistName) artistName.textContent = "En Vivo";
            if(coverImg) coverImg.src = config.albumCover;
        }
    }
    setInterval(updateMetadata, 10000);
    updateMetadata();
})();

// === REPRODUCTOR CLÁSICO (opcional, si existe en la página) ===
(function(){
    const audio = document.getElementById('audio');
    if (!audio) return;
    const playPauseBtn = document.getElementById('playPauseBtn');
    const volumeControl = document.getElementById('volumeControl');
    const songTitle = document.getElementById('song-title');
    const artistName = document.getElementById('artist-name');
    const coverImg = document.getElementById('cover-img');
    const serviceBtns = document.getElementById('service-btns');
    audio.src = config.streamURL;
    audio.crossOrigin = "anonymous";
    audio.volume = volumeControl ? (volumeControl.valueAsNumber || 1) : 1;

    if(playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            if (audio.paused) audio.play();
            else audio.pause();
        });
    }
    if(audio && playPauseBtn){
        audio.addEventListener('play', () => playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>');
        audio.addEventListener('pause', () => playPauseBtn.innerHTML = '<i class="fas fa-play"></i>');
    }
    if(volumeControl){
        volumeControl.addEventListener('input', (e) => audio.volume = e.target.valueAsNumber);
    }
    // METADATOS
    let lastSong = "";
    async function updateMetadata() {
        try {
            const res = await fetch(`https://zenoplay.zenomedia.com/api/zenofm/nowplaying/${config.idzeno}?ra=${Math.random()}`);
            const data = await res.json();
            const currentSong = data.title || config.nombreRadio;
            if (currentSong === lastSong) return;
            lastSong = currentSong;
            let [artist, title] = currentSong.split(" - ");
            title = title ? title.trim() : currentSong;
            artist = artist ? artist.trim() : config.nombreRadio;
            if(songTitle) songTitle.textContent = title;
            if(artistName) artistName.textContent = artist;
            // Carátula
            let coverUrl = config.albumCover;
            try {
                const r = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(artist + " " + title)}&media=music&limit=1`);
                const cdata = await r.json();
                if (cdata.results && cdata.results[0]?.artworkUrl100) {
                    coverUrl = cdata.results[0].artworkUrl100.replace("100x100bb", "600x600bb");
                }
            } catch {}
            if(coverImg) coverImg.src = coverUrl;
            if(serviceBtns) serviceBtns.innerHTML = makeSpotifyAppleBtns(title, artist);
        } catch (e) {
            if(songTitle) songTitle.textContent = "Sin datos";
            if(artistName) artistName.textContent = "";
            if(coverImg) coverImg.src = config.albumCover;
            if(serviceBtns) serviceBtns.innerHTML = "";
        }
    }
    setInterval(updateMetadata, 10000);
    updateMetadata();

    function makeSpotifyAppleBtns(title, artist) {
        if (!title || !artist) return "";
        const query = encodeURIComponent(`${title} ${artist}`);
        return `
          <button class="service-btn spotify" onclick="window.open('https://open.spotify.com/search/${query}','_blank')">
            <i class="fab fa-spotify"></i> Spotify
          </button>
          <button class="service-btn apple" onclick="window.open('https://music.apple.com/search?term=${query}','_blank')">
            <i class="fab fa-apple"></i> Apple Music
          </button>
        `;
    }
})();

// === RELOJ CDMX ===
(function(){
    function updateRadioClock() {
        const clock = document.getElementById('radio-clock');
        const date = document.getElementById('radio-clock-date');
        if (!clock || !date) return;
        try {
            const now = new Date();
            const options = {
                timeZone: 'America/Mexico_City',
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            };
            const optionsDate = {
                timeZone: 'America/Mexico_City',
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            };
            clock.textContent = now.toLocaleTimeString('es-MX', options);
            date.textContent = now.toLocaleDateString('es-MX', optionsDate);
        } catch (e) {
            clock.textContent = '--:--:--';
            date.textContent = 'Fecha no disponible';
        }
    }
    setInterval(updateRadioClock, 1000);
    updateRadioClock();
})();

// === MENÚS Y BOTONES (solo si existen) ===
(function(){
    // Menú lateral
    const menu = document.getElementById('menu');
    const menuBtn = document.getElementById('menuBtn');
    const closeMenuBtn = document.getElementById('close-menu');
    if (menu && menuBtn) menuBtn.addEventListener('click', () => menu.classList.add('open'));
    if (menu && closeMenuBtn) closeMenuBtn.addEventListener('click', () => menu.classList.remove('open'));

    // Redes sociales menú
    const menuSocialLinks = document.getElementById('menu-social-links');
    if (menuSocialLinks) {
        config.redesSociales.forEach(({ url, icon }) => {
            const a = document.createElement('a');
            a.href = url;
            a.target = '_blank';
            a.rel = 'noopener noreferrer';
            a.className = 'menu-link';
            let displayName = '';
            if (url.includes('facebook.com')) displayName = 'Síguenos en Facebook';
            else if (url.includes('instagram.com')) displayName = 'Síguenos en Instagram';
            else if (url.includes('youtube.com')) displayName = 'Síguenos en YouTube';
            else if (url.includes('whatsapp.com')) displayName = 'Únete a WhatsApp';
            else displayName = 'Síguenos';
            a.innerHTML = `<i class="${icon}"></i> ${displayName}`;
            menuSocialLinks.appendChild(a);
        });
    }

    // Botón fix (clásico)
    const fixBtn = document.getElementById('fixBtn');
    if(fixBtn){
        fixBtn.onclick = function() {
            const audio = document.getElementById('audio');
            if(audio){
                audio.pause();
                audio.currentTime = 0;
                audio.load();
                audio.play();
            }
        };
    }

    // Botón recargar
    const btnRecargar = document.getElementById('btnRecargar');
    if(btnRecargar){ btnRecargar.addEventListener('click', () => location.reload()); }

    // Botón peticiones
    const btnPeticiones = document.getElementById('btnPeticiones');
    if(btnPeticiones){ btnPeticiones.addEventListener('click', () => alert('Funcionalidad de peticiones aún no implementada.')); }

    // Botón dark mode
    const btnDarkMode = document.getElementById('btnDarkMode');
    if(btnDarkMode){
        btnDarkMode.addEventListener('click', () => {
            document.body.classList.toggle('light-mode');
            btnDarkMode.textContent = document.body.classList.contains('light-mode') ? 'Modo Claro' : 'Modo Oscuro';
        });
    }
})();
