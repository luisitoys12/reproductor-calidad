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

// === BLOQUEO COPIA (respetando tu sistema) ===
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
    audio.src = config.streamURL;
    audio.load();
    audio.play();
    updateMetadata();
};

// === PERSONALIZACIÓN ===
document.getElementById('customizeBtn').onclick = function() {
    document.getElementById('customizePanel').style.display = 'flex';
};
document.getElementById('bgColorPicker').oninput = function() {
    document.body.style.background = this.value;
    localStorage.setItem('radioBgColor', this.value);
};
document.getElementById('animationSelect').oninput = function() {
    localStorage.setItem('radioAnimation', this.value);
    applyAnimation(this.value);
};
function applyAnimation(anim) {
    document.body.style.animation = '';
    if(anim === 'confetti') document.body.style.animation = 'confetti 1.5s infinite linear';
    else if(anim === 'wave') document.body.style.animation = 'wave 1.2s infinite alternate';
}
(function() {
    const color = localStorage.getItem('radioBgColor');
    if (color) { document.body.style.background = color; document.getElementById('bgColorPicker').value = color; }
    const anim = localStorage.getItem('radioAnimation');
    if (anim) { document.getElementById('animationSelect').value = anim; applyAnimation(anim); }
})();

// === STICKERS ===
document.getElementById('addStickerBtn').onclick = () => {
    document.getElementById('stickerCatalog').style.display = 'flex';
};
document.querySelectorAll('.sticker-option').forEach(img => {
    img.onclick = () => {
        const sticker = img.cloneNode();
        sticker.style.position = 'absolute';
        sticker.style.left = (10 + Math.random() * 70) + '%';
        sticker.style.top = (10 + Math.random() * 60) + '%';
        sticker.style.pointerEvents = 'none';
        document.getElementById('customStickersArea').appendChild(sticker);
        let stickers = JSON.parse(localStorage.getItem('radioStickers') || '[]');
        stickers.push({src: sticker.src, left: sticker.style.left, top: sticker.style.top});
        localStorage.setItem('radioStickers', JSON.stringify(stickers));
        document.getElementById('stickerCatalog').style.display = 'none';
    };
});
window.addEventListener('DOMContentLoaded', ()=>{
    let stickers = JSON.parse(localStorage.getItem('radioStickers') || '[]');
    stickers.forEach(s => {
        let img = document.createElement('img');
        img.src = s.src; img.style.position='absolute';
        img.style.left = s.left; img.style.top = s.top;
        img.style.width = '38px'; img.style.pointerEvents='none';
        document.getElementById('customStickersArea').appendChild(img);
    });
});
document.getElementById('resetCustomizationBtn').onclick = () => {
    localStorage.removeItem('radioBgColor');
    localStorage.removeItem('radioAnimation');
    localStorage.removeItem('radioStickers');
    document.body.style.background = '#1e293b';
    document.body.style.animation = '';
    document.getElementById('customStickersArea').innerHTML = '';
    document.getElementById('bgColorPicker').value = '#1e293b';
    document.getElementById('animationSelect').value = '';
};

// === MENÚ LATERAL Y MODAL BULLYING ===
document.getElementById('menuBtn').onclick = function() {
    document.getElementById('menu').classList.add('open');
};
document.getElementById('close-menu').onclick = function() {
    document.getElementById('menu').classList.remove('open');
};
document.addEventListener('click', function(e){
    var menu = document.getElementById('menu');
    if(menu.classList.contains('open') && !menu.contains(e.target) && e.target.id !== 'menuBtn'){
        menu.classList.remove('open');
    }
});
if(document.getElementById('bastaBullyingLink')) {
    document.getElementById('bastaBullyingLink').onclick = function(e){
        e.preventDefault();
        document.getElementById('modalBasta').style.display = 'flex';
    };
}
if(document.getElementById('closeBastaModal')) {
    document.getElementById('closeBastaModal').onclick = function(){
        document.getElementById('modalBasta').style.display = 'none';
    };
}

// === REDES SOCIALES ===
const menuSocialLinks = document.getElementById('menu-social-links');
if (menuSocialLinks && config.redesSociales) {
    menuSocialLinks.innerHTML = config.redesSociales.map(rs =>
        `<li><a href="${rs.url}" class="menu-link" target="_blank"><i class="${rs.icon}"></i> ${
            rs.icon === "fab fa-whatsapp" ? "WhatsApp" :
            rs.icon === "fab fa-facebook" ? "Facebook" :
            rs.icon === "fab fa-instagram" ? "Instagram" : "YouTube"
        }</a></li>`
    ).join('');
}
const socialBtns = document.getElementById('social-buttons');
if (socialBtns && config.redesSociales) {
    socialBtns.innerHTML = config.redesSociales.map(rs =>
        `<a href="${rs.url}" target="_blank"><i class="${rs.icon}"></i></a>`
    ).join('');
}