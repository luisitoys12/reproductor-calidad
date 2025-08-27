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

// === REPRODUCTOR ===
const audio = document.getElementById('audio');
const playPauseBtn = document.getElementById('playPauseBtn');
const volumeControl = document.getElementById('volumeControl');
audio.src = config.streamURL;
audio.crossOrigin = "anonymous";
audio.volume = volumeControl.value;

playPauseBtn.addEventListener('click', () => {
    if (audio.paused) audio.play();
    else audio.pause();
});
audio.addEventListener('play', () => playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>');
audio.addEventListener('pause', () => playPauseBtn.innerHTML = '<i class="fas fa-play"></i>');
volumeControl.addEventListener('input', (e) => audio.volume = e.target.value);

// === METADATOS ZENO.FM ===
const songTitle = document.getElementById('song-title');
const artistName = document.getElementById('artist-name');
const coverImg = document.getElementById('cover-img');
const serviceBtns = document.getElementById('service-btns');
let lastSong = "";

async function updateMetadata() {
    try {
        const res = await fetch(`https://zenoplay.zenomedia.com/api/zenofm/nowplaying/${config.idzeno}?ra=${Math.random()}`);
        const data = await res.json();
        const currentSong = data.title || "Sin datos";
        if (currentSong === lastSong) return;
        lastSong = currentSong;

        let [artist, title] = currentSong.split(" - ");
        title = title || currentSong;
        artist = artist || "EKUSFM";
        songTitle.textContent = title;
        artistName.textContent = artist;

        // Buscar carátula en iTunes
        let coverUrl = config.albumCover;
        try {
            const r = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(artist)}&media=music&limit=1`);
            const cdata = await r.json();
            if (cdata.results && cdata.results[0]?.artworkUrl100) {
                coverUrl = cdata.results[0].artworkUrl100.replace("100x100bb", "600x600bb");
            }
        } catch {}
        coverImg.src = coverUrl;

        serviceBtns.innerHTML = makeSpotifyAppleBtns(title, artist);
    } catch (e) {
        songTitle.textContent = "Sin datos";
        artistName.textContent = "";
        coverImg.src = config.albumCover;
        serviceBtns.innerHTML = "";
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

// === MODAL HISTORIAL ===
const modalHistory = document.getElementById('modalHistory');
const historyLink = document.getElementById('historyLink');
const closeHistoryModal = document.getElementById('closeHistoryModal');
const historyList = document.getElementById('historyList');

historyLink.addEventListener('click', (e) => {
    e.preventDefault();
    historyList.innerHTML = '';
    const songs = [
        {
            title: 'Canción 1',
            artist: 'Artista A',
            time: '10:15 AM',
            cover: config.albumCover
        },
        {
            title: 'Canción 2',
            artist: 'Artista B',
            time: '10:20 AM',
            cover: config.albumCover
        },
        {
            title: 'Canción 3',
            artist: 'Artista C',
            time: '10:25 AM',
            cover: config.albumCover
        },
        {
            title: 'Canción 4',
            artist: 'Artista D',
            time: '10:30 AM',
            cover: config.albumCover
        }
    ];
    songs.forEach(song => {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.alignItems = 'center';
        li.style.marginBottom = '12px';
        li.style.gap = '12px';

        const img = document.createElement('img');
        img.src = song.cover;
        img.alt = `${song.title} cover`;
        img.style.width = '50px';
        img.style.height = '50px';
        img.style.borderRadius = '8px';
        img.style.objectFit = 'cover';

        const infoDiv = document.createElement('div');
        infoDiv.style.flexGrow = '1';

        const titleDiv = document.createElement('div');
        titleDiv.textContent = song.title;
        titleDiv.style.fontWeight = 'bold';
        titleDiv.style.fontSize = '1.1em';

        const artistDiv = document.createElement('div');
        artistDiv.textContent = song.artist;
        artistDiv.style.color = '#38bdf8';

        infoDiv.appendChild(titleDiv);
        infoDiv.appendChild(artistDiv);

        const timeDiv = document.createElement('div');
        timeDiv.textContent = song.time;
        timeDiv.style.fontSize = '0.9em';
        timeDiv.style.color = '#94a3b8';

        li.appendChild(img);
        li.appendChild(infoDiv);
        li.appendChild(timeDiv);

        historyList.appendChild(li);
    });
    modalHistory.style.display = 'flex';
});
closeHistoryModal.addEventListener('click', () => {
    modalHistory.style.display = 'none';
});

// === MODAL ACERCA DE ===
const modalAbout = document.getElementById('modalAbout');
const aboutLink = document.getElementById('aboutLink');
const closeAboutModal = document.getElementById('closeAboutModal');

aboutLink.addEventListener('click', (e) => {
    e.preventDefault();
    modalAbout.style.display = 'flex';
});
closeAboutModal.addEventListener('click', () => {
    modalAbout.style.display = 'none';
});

// === MODAL COMPARTIR ===
const modalShare = document.getElementById('modalShare');
const shareLink = document.getElementById('shareLink');
const closeShareModal = document.getElementById('closeShareModal');

shareLink.addEventListener('click', (e) => {
    e.preventDefault();
    modalShare.style.display = 'flex';
});
closeShareModal.addEventListener('click', () => {
    modalShare.style.display = 'none';
});

// Copy link button
const copyLinkBtn = document.getElementById('copyLinkBtn');
const shareLinkInput = document.getElementById('shareLinkInput');
copyLinkBtn.addEventListener('click', () => {
    shareLinkInput.select();
    document.execCommand('copy');
    copyLinkBtn.textContent = '¡Copiado!';
    setTimeout(() => {
        copyLinkBtn.textContent = 'Copiar enlace';
    }, 2000);
});

// Share on Facebook
const shareFacebookBtn = document.getElementById('shareFacebookBtn');
shareFacebookBtn.addEventListener('click', () => {
    const url = encodeURIComponent(shareLinkInput.value);
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    window.open(facebookUrl, '_blank', 'width=600,height=400');
});

// Share on WhatsApp
const shareWhatsAppBtn = document.getElementById('shareWhatsAppBtn');
shareWhatsAppBtn.addEventListener('click', () => {
    const url = encodeURIComponent(shareLinkInput.value);
    const message = encodeURIComponent('¡Escucha EstacionKUSFM! La mejor música y entretenimiento online.');
    const whatsappUrl = `https://api.whatsapp.com/send?text=${message}%20${url}`;
    window.open(whatsappUrl, '_blank');
});

// Dark mode toggle
const btnDarkMode = document.getElementById('btnDarkMode');
btnDarkMode.addEventListener('click', () => {
  document.body.classList.toggle('light-mode');
  if (document.body.classList.contains('light-mode')) {
    btnDarkMode.textContent = 'Modo Claro';
  } else {
    btnDarkMode.textContent = 'Modo Oscuro';
  }
});

// Peticiones button click handler
const btnPeticiones = document.getElementById('btnPeticiones');
btnPeticiones.addEventListener('click', () => {
  alert('Funcionalidad de peticiones aún no implementada.');
});

// Recargar button click handler
const btnRecargar = document.getElementById('btnRecargar');
btnRecargar.addEventListener('click', () => {
  location.reload();
});

// Fix button click handler
const btnFix = document.getElementById('btnFix');
btnFix.addEventListener('click', () => {
  alert('Funcionalidad de reparación aún no implementada.');
});
};

// MINI REPRODUCTOR FOOTER
const audio = document.getElementById('audio-mini');
const playBtn = document.getElementById('playPauseMiniBtn');
const playIcon = document.getElementById('miniPlayIcon');
const songTitle = document.getElementById('miniSongTitle');
const artistName = document.getElementById('miniArtistName');
const coverImg = document.getElementById('miniCoverImg');
const volumeSlider = document.getElementById('miniVolumeControl');
const loader = document.getElementById('audioLoader');

audio.src = config.streamURL;
audio.crossOrigin = "anonymous";
audio.volume = volumeSlider.valueAsNumber || 1;

// PLAY/PAUSE TOGGLE
playBtn.onclick = function() {
  if (audio.paused) audio.play();
  else audio.pause();
};
audio.onplay = function() {
  playIcon.classList.remove("fa-play");
  playIcon.classList.add("fa-pause");
  loader.classList.add('loading');
};
audio.onpause = function() {
  playIcon.classList.remove("fa-pause");
  playIcon.classList.add("fa-play");
  loader.classList.remove('loading');
};

// VOLUME CONTROL
volumeSlider.oninput = function() {
  audio.volume = volumeSlider.valueAsNumber;
};
