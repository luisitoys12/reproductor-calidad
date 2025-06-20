// 🎵 VARIABLES CONFIGURABLES 🎵
const config = {
    nombreRadio: "EKUSFM",
    nombreDesarrollador: "ESTACIONKUSMEDIOS",
    logoURL: "https://aventura.estacionkusmedios.com/img/default.jpg",
    fondoURL: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmFkaW98ZW58MHx8MHx8fDA%3D",
    streamURL: "https://radio.estacionkusmedios.com/listen/esmerosound/radio.mp3",
    azuracastURL: "https://radio.estacionkusmedios.com",
    azuracastStation: "esmerosound",
    albumCover: "https://aventura.estacionkusmedios.com/img/default.jpg",
    aboutDeveloper: "ESTACIONKUSMEDIOS BASED IN CRISPRO CODE Adapted Azuracast",
    textoEmitiendo: "Transmitiendo en vivo desde nuestra estación 🎙️",
    textoSonandoAhora: "Actualmente en reproducción 🎶",
    textoCompartir: "¡Escucha la mejor música en ESTACIONKUSFM! 🎵🔥",
    redesSociales: [
      { url: "https://web.facebook.com/ekusfm", icon: "fab fa-facebook" },
      { url: "https://www.instagram.com/estacionkusfm/", icon: "fab fa-instagram" },
      { url: "https://www.youtube.com/estacionkusfm", icon: "fab fa-youtube" },
      // WhatsApp grupo de peticiones
      { url: "https://chat.whatsapp.com/JSk9LFoclGrFxY7rb4TFWu", icon: "fab fa-whatsapp" }
    ],
    descripcion: "Radio ESTACIONKUSFM es una estación de radio online dedicada a traerte la mejor música y entretenimiento. Disfruta de una selección musical variada y de calidad las 24 horas del día.",
    estado: "online" // online, offline, maintenance, etc.
};

// --- SEGURIDAD Y BLOQUEO COPIA ---
(function() {
  const hostname = location.hostname;
  const permitido = (
    hostname === "reproductor-calidad.vercel.app" ||
    hostname === "estacionkusmedios.com" ||
    hostname.endsWith(".estacionkusmedios.com")
  );
  if (
    typeof config === "undefined" ||
    config.nombreRadio !== "EKUSFM" ||
    !permitido
  ) {
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

// --- REPRODUCTOR Y METADATOS AZURACAST ---
const audio = document.getElementById('audio');
const playPauseBtn = document.getElementById('playPauseBtn');
const volumeControl = document.getElementById('volumeControl');
const songTitle = document.getElementById('song-title');
const artistName = document.getElementById('artist-name');
const coverImg = document.getElementById('cover-img');
const serviceBtns = document.getElementById('service-btns');
const liveBtn = document.getElementById('live-announcer-btn');
audio.src = config.streamURL;
audio.crossOrigin = "anonymous";
audio.volume = volumeControl.value;

playPauseBtn.addEventListener('click', () => {
  if (audio.paused) audio.play();
  else audio.pause();
});
audio.addEventListener('play', () => {
  playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
});
audio.addEventListener('pause', () => {
  playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
});
volumeControl.addEventListener('input', (e) => {
  audio.volume = e.target.value;
});

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
    const res = await fetch(`${config.azuracastURL}/api/nowplaying/${config.azuracastStation}`);
    if (!res.ok) throw new Error("No se pudo obtener metadatos");
    const data = await res.json();
    const title = data.now_playing.song.title || "Desconocido";
    const artist = data.now_playing.song.artist || "Desconocido";
    let artUrl = data.now_playing.song.art;
    if (artUrl && artUrl.startsWith('/')) { artUrl = config.azuracastURL + artUrl; }
    songTitle.textContent = title;
    artistName.textContent = artist;
    coverImg.src = artUrl || config.albumCover;
    serviceBtns.innerHTML = makeSpotifyAppleBtns(title, artist);

    // LOCUTOR EN VIVO (AUTOMÁTICO SI HAY DJ)
    if (data.live && data.live.is_live && data.live.streamer_name) {
      liveBtn.style.display = "inline-block";
      liveBtn.innerHTML = `<i class="fas fa-microphone"></i> Locutor en vivo: ${data.live.streamer_name}`;
    } else {
      liveBtn.style.display = "none";
    }

    // Estado automático en menú
    updateMenuStatus(data.live && data.live.is_live ? "online" : config.estado);
  } catch (e) {
    songTitle.textContent = "Error obteniendo metadatos";
    artistName.textContent = "";
    coverImg.src = config.albumCover;
    serviceBtns.innerHTML = "";
    updateMenuStatus("offline");
  }
}
setInterval(updateMetadata, 10000);
updateMetadata();
window.addEventListener('DOMContentLoaded', () => { audio.load(); });

// --- HISTORIAL Y ESTADÍSTICAS ---
async function loadHistoryAndStats() {
  const historyCont = document.getElementById('historyModalContent');
  historyCont.innerHTML = "Cargando historial...";
  try {
    const url = `${config.azuracastURL}/api/nowplaying/${config.azuracastStation}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error();
    const data = await res.json();
    const history = data.song_history || [];
    if (history.length === 0) { historyCont.innerHTML = "Sin historial."; }
    else {
      historyCont.innerHTML = history.slice(0, 10).map(item => {
        const title = item.song.title || "Desconocido";
        const artist = item.song.artist || "Desconocido";
        const playedAt = new Date(item.played_at * 1000);
        const hora = playedAt.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        const query = encodeURIComponent(`${title} ${artist}`);
        return `<div style="margin-bottom:11px;">
          <b>${title}</b><br>
          <span style="color:#38bdf8;font-size:.97em;">${artist}</span>
          <span style="color:#64748b;font-size:.95em;"> · ${hora}</span>
          <div class="service-btns" style="margin-top:3px;">
            <button class="service-btn spotify" onclick="window.open('https://open.spotify.com/search/${query}','_blank')">
              <i class="fab fa-spotify"></i> Spotify
            </button>
            <button class="service-btn apple" onclick="window.open('https://music.apple.com/search?term=${query}','_blank')">
              <i class="fab fa-apple"></i> Apple Music
            </button>
          </div>
        </div>`;
      }).join('');
    }
    document.getElementById('stat-listeners').textContent = data.listeners.current ?? "-";
    let todayCount = 0;
    const today = new Date().toISOString().slice(0,10);
    if (history) {
      todayCount = history.filter(item => {
        const d = new Date(item.played_at * 1000).toISOString().slice(0,10);
        return d === today;
      }).length;
    }
    document.getElementById('stat-today').textContent = todayCount;
    document.getElementById('stat-history').textContent = history.length;
    if (data.station?.uptime) {
      let up = data.station.uptime;
      let h = Math.floor(up/3600), m = Math.floor((up%3600)/60), s = up%60;
      let upstr = (h>0 ? `${h}h ` : "") + (m>0 ? `${m}m ` : "") + `${s}s`;
      document.getElementById('stat-uptime').textContent = upstr;
    } else {
      document.getElementById('stat-uptime').textContent = "-";
    }
  } catch {
    document.getElementById('stat-listeners').textContent = "-";
    document.getElementById('stat-today').textContent = "-";
    document.getElementById('stat-history').textContent = "-";
    document.getElementById('stat-uptime').textContent = "-";
    document.getElementById('historyModalContent').innerHTML = "Error obteniendo historial.";
  }
}
setInterval(loadHistoryAndStats, 20000);
document.getElementById('menuBtn').addEventListener('click', loadHistoryAndStats);

// --- MENÚ Y MODALES ---
const menuBtn = document.getElementById('menuBtn');
const menu = document.getElementById('menu');
const closeMenuBtn = document.getElementById('close-menu');
const overlay = document.querySelector('.overlay');
menuBtn.addEventListener('click', (e) => {
  e.stopPropagation(); menu.classList.add('open'); overlay.classList.add('active'); document.body.classList.add('menu-open');
});
closeMenuBtn.addEventListener('click', (e) => {
  e.stopPropagation(); menu.classList.remove('open'); overlay.classList.remove('active'); document.body.classList.remove('menu-open');
});
overlay.addEventListener('click', () => {
  menu.classList.remove('open'); overlay.classList.remove('active'); document.body.classList.remove('menu-open');
});
document.addEventListener('click', function(e) {
  if (menu.classList.contains('open') && !menu.contains(e.target) && !menuBtn.contains(e.target)) {
    menu.classList.remove('open'); overlay.classList.remove('active'); document.body.classList.remove('menu-open');
  }
});
menu.addEventListener('click', function(e) { e.stopPropagation(); });
document.addEventListener('keydown', function(e) {
  if (e.key === "Escape") {
    menu.classList.remove('open'); overlay.classList.remove('active'); document.body.classList.remove('menu-open');
  }
});
window.addEventListener('pageshow', function() {
  menu.classList.remove('open'); overlay.classList.remove('active'); document.body.classList.remove('menu-open');
});

// --- MODALES ---
function openModal(modalId) { document.getElementById(modalId).style.display = 'flex'; }
function closeModal(modalId) { document.getElementById(modalId).style.display = 'none'; }
document.getElementById('historyLink').onclick = (e) => { e.preventDefault(); openModal('historyModal'); loadHistoryAndStats(); };
document.getElementById('aboutLink').onclick = (e) => { e.preventDefault(); openModal('aboutModal'); };
document.getElementById('shareLink').onclick = (e) => { e.preventDefault(); openModal('shareModal'); };
document.getElementById('closeHistoryModal').onclick = () => closeModal('historyModal');
document.getElementById('closeAboutModal').onclick = () => closeModal('aboutModal');
document.getElementById('closeShareModal').onclick = () => closeModal('shareModal');
document.querySelectorAll('.modal').forEach(modal => {
  modal.addEventListener('click', function(e) { if (e.target === modal) closeModal(modal.id); });
});

// --- BOTÓN FIX ---
const fixBtn = document.getElementById('fixBtn');
const fixAlert = document.getElementById('fixAlert');
function showFixAlert(text, time=3500) {
  fixAlert.textContent = text;
  fixAlert.style.display = 'block';
  setTimeout(() => { fixAlert.style.display = 'none'; }, time);
}
fixBtn.onclick = () => {
  menuBtn.disabled = false;
  closeMenuBtn.disabled = false;
  menu.classList.remove('open'); overlay.classList.remove('active'); document.body.classList.remove('menu-open');
  audio.src = config.streamURL; audio.load(); audio.volume = volumeControl.value;
  showFixAlert('¡Solucionado! Si persiste el problema, recarga la página.');
};

// --- SOCIAL LINKS / MODAL INFO ---
const menuSocialLinks = document.getElementById('menu-social-links');
if (menuSocialLinks && config.redesSociales) {
  menuSocialLinks.innerHTML = config.redesSociales.map(rs =>
    `<li><a href="${rs.url}" class="menu-link" target="_blank"><i class="${rs.icon}"></i> ${rs.icon === "fab fa-whatsapp" ? "Grupo de Peticiones" : ""}</a></li>`
  ).join('');
}
const socialBtns = document.getElementById('social-buttons');
if (socialBtns && config.redesSociales) {
  socialBtns.innerHTML = config.redesSociales.map(rs =>
    `<a href="${rs.url}" target="_blank"><i class="${rs.icon}"></i></a>`
  ).join('');
}
document.getElementById('aboutLogo').src = config.logoURL;
document.getElementById('aboutDescription').textContent = config.descripcion;
document.getElementById('aboutDeveloper').textContent = config.nombreDesarrollador;

// --- COMPARTIR EN REDES ---
document.getElementById('shareUrl').value = window.location.href;
document.getElementById('copyLink').onclick = function() {
  navigator.clipboard.writeText(window.location.href)
    .then(() => showFixAlert('Enlace copiado!'))
    .catch(() => showFixAlert('No se pudo copiar el enlace'));
};
document.getElementById('shareWhatsapp').onclick = function() {
  window.open('https://wa.me/?text=' + encodeURIComponent(config.textoCompartir + " " + window.location.href),'_blank');
};
document.getElementById('shareFacebook').onclick = function() {
  window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href),'_blank');
};
document.getElementById('shareTwitter').onclick = function() {
  window.open('https://twitter.com/intent/tweet?url=' + encodeURIComponent(window.location.href) + '&text=' + encodeURIComponent(config.textoCompartir),'_blank');
};

// --- ESTADO EN MENÚ LATERAL ---
function updateMenuStatus(estadoAuto) {
  let estado = estadoAuto || config.estado || "online";
  let icon = document