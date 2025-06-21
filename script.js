// === CONFIGURACIÓN ===
const config = {
    nombreRadio: "EKUSFM",
    azuracastURL: "https://radio.estacionkusmedios.com",
    azuracastStation: "esmerosound",
    streamURL: "https://radio.estacionkusmedios.com/listen/esmerosound/radio.mp3",
    albumCover: "https://aventura.estacionkusmedios.com/img/default.jpg",
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
        hostname === "reproductor-calidad.vercel.app" ||
        hostname === "estacionkusmedios.com" ||
        hostname.endsWith(".estacionkusmedios.com")
    );
    if (!permitido) {
        document.body.innerHTML = `
        <div style="text-align:center;padding:40px;color:#fff;background:#1e293b;height:100vh">
            <h1 style="color:#ff4444;font-size:2.5rem;">Página NO Autorizada</h1>
            <p style="font-size:1.2rem;">Esta web solo puede ser utilizada por <b>EKUSFM</b> en <b>estacionkusmedios.com</b> o <b>reproductor-calidad.vercel.app</b>.<br>
            Si eres el responsable, contacta a <a href="https://estacionkusmedios.org" style="color:#0ff;" target="_blank">estacionkusmedios.org</a>
            </p>
        </div>`;
        document.title = "No autorizado";
        throw new Error("Sitio no autorizado por estacionkusmedios.org");
    }
    document.addEventListener('contextmenu', e => e.preventDefault());
    document.addEventListener('keydown', function(e) {
        if ((e.ctrlKey && ['u','s','c','a'].includes(e.key.toLowerCase())) ||
            (e.metaKey && ['u','s','c','a'].includes(e.key.toLowerCase())) ||
            e.key === 'F12') e.preventDefault();
    });
})();

// === REPRODUCTOR ===
const audio = document.getElementById('audio');
const playPauseBtn = document.getElementById('playPauseBtn');
const volumeControl = document.getElementById('volumeControl');
audio.src = config.streamURL;
audio.volume = volumeControl.value;
audio.crossOrigin = "anonymous";

playPauseBtn.addEventListener('click', () => {
    if (audio.paused) audio.play();
    else audio.pause();
});
audio.addEventListener('play', () => playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>');
audio.addEventListener('pause', () => playPauseBtn.innerHTML = '<i class="fas fa-play"></i>');
volumeControl.addEventListener('input', (e) => audio.volume = e.target.value);

// === METADATOS ===
const songTitle = document.getElementById('song-title');
const artistName = document.getElementById('artist-name');
const coverImg = document.getElementById('cover-img');
const serviceBtns = document.getElementById('service-btns');

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

let lastMetadata = { title: "", artist: "" }; // Para historial

async function updateMetadata() {
    try {
        const url = `${config.azuracastURL}/api/nowplaying/${config.azuracastStation}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("HTTP status: " + res.status);
        const data = await res.json();

        let title = data.now_playing?.song?.title || data.now_playing?.song?.text || "Sin datos";
        let artist = data.now_playing?.song?.artist || "";
        let artUrl = data.now_playing?.song?.art || "";

        // Fallbacks
        if ((!title || title === "Sin datos") && data.song?.title) title = data.song.title;
        if (!artist && data.song?.artist) artist = data.song.artist;
        if (!artUrl && data.song?.art) artUrl = data.song.art;
        if ((!title || !artist) && title && title.includes(" - ")) {
            const [maybeArtist, maybeTitle] = title.split(" - ");
            if (!artist) artist = maybeArtist.trim();
            title = maybeTitle.trim();
        }
        if (artUrl && artUrl.startsWith("/")) artUrl = config.azuracastURL + artUrl;
        if (!artUrl) artUrl = config.albumCover;

        songTitle.textContent = title || "Sin datos";
        artistName.textContent = artist || "";
        coverImg.src = artUrl;
        serviceBtns.innerHTML = makeSpotifyAppleBtns(title, artist);

        // === AGREGAR AL HISTORIAL SOLO SI CAMBIA LA CANCIÓN ===
        if (title && artist && (title !== lastMetadata.title || artist !== lastMetadata.artist)) {
            addSongToHistory({
                title,
                artist,
                spotify: `https://open.spotify.com/search/${encodeURIComponent(title + " " + artist)}`,
                apple: `https://music.apple.com/search?term=${encodeURIComponent(title + " " + artist)}`,
                cover: artUrl
            });
            lastMetadata = { title, artist };
        }
    } catch (e) {
        songTitle.textContent = "Sin datos";
        artistName.textContent = "";
        coverImg.src = config.albumCover;
        serviceBtns.innerHTML = "";
    }
}
setInterval(updateMetadata, 10000);
updateMetadata();

// === RELOJ CDMX ===
function updateRadioClock() {
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
        document.getElementById('radio-clock').textContent = now.toLocaleTimeString('es-MX', options);
        document.getElementById('radio-clock-date').textContent = now.toLocaleDateString('es-MX', optionsDate);
    } catch (e) {
        document.getElementById('radio-clock').textContent = '--:--:--';
        document.getElementById('radio-clock-date').textContent = 'Fecha no disponible';
    }
}
setInterval(updateRadioClock, 1000);
updateRadioClock();

// === BOTÓN FIX ===
document.getElementById('fixBtn').onclick = function() {
    updateMetadata();
    audio.pause();
    audio.currentTime = 0;
    audio.play();
};

// === MENU ===
const menu = document.getElementById('menu');
const menuBtn = document.getElementById('menuBtn');
const closeMenuBtn = document.getElementById('close-menu');

menuBtn.addEventListener('click', () => {
    menu.classList.add('open');
});
closeMenuBtn.addEventListener('click', () => {
    menu.classList.remove('open');
});

// === REDES SOCIALES ===
const menuSocialLinks = document.getElementById('menu-social-links');
const redesTextos = {
    "web.facebook.com/ekusfm": "Síguenos en Facebook",
    "www.instagram.com/estacionkusfm/": "Síguenos en Instagram",
    "www.youtube.com/estacionkusfm": "Síguenos en YouTube",
    "chat.whatsapp.com/JSk9LFoclGrFxY7rb4TFWu": "Únete al WhatsApp"
};
config.redesSociales.forEach(({ url, icon }) => {
    const a = document.createElement('a');
    a.href = url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'menu-link';
    // Elegir el texto adecuado para el enlace
    const key = url.replace(/^https?:\/\//, '');
    const texto = redesTextos[key] || "Red social";
    a.innerHTML = `<i class="${icon}"></i> ${texto}`;
    menuSocialLinks.appendChild(a);
});

// === PERSONALIZACIÓN ===
const customizeBtn = document.getElementById('customizeBtn');
const customizePanel = document.getElementById('customizePanel');
const bgColorPicker = document.getElementById('bgColorPicker');
const animationSelect = document.getElementById('animationSelect');
const addStickerBtn = document.getElementById('addStickerBtn');
const resetCustomizationBtn = document.getElementById('resetCustomizationBtn');
const customStickersArea = document.getElementById('customStickersArea');
const stickerCatalog = document.getElementById('stickerCatalog');

customizeBtn.addEventListener('click', () => {
    customizePanel.style.display = 'flex';
});
resetCustomizationBtn.addEventListener('click', () => {
    document.body.style.background = '#0f172a';
    document.body.style.animation = '';
    customStickersArea.innerHTML = '';
    bgColorPicker.value = '#0f172a';
    animationSelect.value = '';
    customizePanel.style.display = 'none';
});
bgColorPicker.addEventListener('input', (e) => {
    document.body.style.background = e.target.value;
});
animationSelect.addEventListener('change', (e) => {
    const val = e.target.value;
    if (val === 'confetti') {
        document.body.style.animation = 'confetti 5s linear infinite';
    } else if (val === 'wave') {
        document.body.style.animation = 'wave 2s ease-in-out infinite';
    } else {
        document.body.style.animation = '';
    }
});
addStickerBtn.addEventListener('click', () => {
    stickerCatalog.style.display = 'flex';
});
stickerCatalog.addEventListener('click', (e) => {
    if (e.target.classList.contains('sticker-option')) {
        const img = document.createElement('img');
        img.src = e.target.src;
        img.className = 'sticker-option';
        img.style.position = 'absolute';
        img.style.left = Math.random() * (window.innerWidth - 50) + 'px';
        img.style.top = Math.random() * (window.innerHeight - 50) + 'px';
        img.style.width = '50px';
        img.style.height = '50px';
        img.style.pointerEvents = 'auto';
        customStickersArea.appendChild(img);
        stickerCatalog.style.display = 'none';
    }
});

// === MODAL BASTA ===
const modalBasta = document.getElementById('modalBasta');
const bastaBullyingLink = document.getElementById('bastaBullyingLink');
const closeBastaModal = document.getElementById('closeBastaModal');

bastaBullyingLink.addEventListener('click', (e) => {
    e.preventDefault();
    modalBasta.style.display = 'flex';
});
closeBastaModal.addEventListener('click', () => {
    modalBasta.style.display = 'none';
});


/* === HISTORIAL DE CANCIONES PROFESIONAL === */

// Mostrar historial de canciones
document.getElementById("historyLink").addEventListener("click", function(e) {
    e.preventDefault();
    showHistory();
});

function showHistory() {
    const history = JSON.parse(localStorage.getItem("ekusfm_historial") || "[]");
    const ul = document.getElementById("historial-list");
    if (!history.length) {
        ul.innerHTML = `<div style="padding:22px 0;text-align:center;color:#64748b;">No hay historial aún.</div>`;
        document.getElementById("historyModal").style.display = "flex";
        return;
    }
    ul.innerHTML = history.map(song => `
      <div class="song-card">
        <img class="song-cover" src="${song.cover ? song.cover : 'https://aventura.estacionkusmedios.com/img/default.jpg'}" alt="cover">
        <div class="song-info-hist">
          <div class="song-title-hist" title="${song.title}">${song.title}</div>
          <div class="song-artist-hist" title="${song.artist}">${song.artist}</div>
          <div class="song-meta-row">
            <span class="song-time-hist"><i class="fas fa-clock"></i>${song.time}</span>
            <div class="song-btns-hist">
              <a class="song-btn-hist spotify" href="${song.spotify}" target="_blank"><i class="fab fa-spotify"></i>Spotify</a>
              <a class="song-btn-hist apple" href="${song.apple}" target="_blank"><i class="fab fa-apple"></i>Apple</a>
            </div>
          </div>
        </div>
      </div>
    `).join("");
    document.getElementById("historyModal").style.display = "flex";
}

function addSongToHistory({ title, artist, spotify, apple, cover }) {
    const history = JSON.parse(localStorage.getItem("ekusfm_historial") || "[]");
    const now = new Date();
    const hora = now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    // Evita repetidos consecutivos
    if (history[0] && history[0].title === title && history[0].artist === artist) return;
    history.unshift({ title, artist, time: hora, spotify, apple, cover });
    if (history.length > 15) history.pop();
    localStorage.setItem("ekusfm_historial", JSON.stringify(history));
}

// Cerrar modal historial
document.getElementById("historyModal").addEventListener("click", function(e) {
    if (e.target === this) this.style.display = "none";
});
document.querySelector("#historyModal button").addEventListener("click", function() {
    document.getElementById("historyModal").style.display = "none";
});

/* === MODAL ACERCA DE === */
document.getElementById("aboutLink").addEventListener("click", function(e) {
    e.preventDefault();
    document.getElementById("aboutModal").style.display = "flex";
});
document.getElementById("aboutModal").addEventListener("click", function(e) {
    if (e.target === this) this.style.display = "none";
});
document.querySelector("#aboutModal button").addEventListener("click", function() {
    document.getElementById("aboutModal").style.display = "none";
});

/* === BOTÓN COMPARTIR === */
document.getElementById("shareLink").addEventListener("click", function(e) {
    e.preventDefault();
    if (navigator.share) {
        navigator.share({
            title: "EKUSFM Radio",
            text: "¡Escucha EKUSFM, la mejor radio online!",
            url: window.location.href
        });
    } else {
        prompt("Copia este enlace para compartir:", window.location.href);
    }
});