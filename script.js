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
      { url: "https://chat.whatsapp.com/JSk9LFoclGrFxY7rb4TFWu", icon: "fab fa-whatsapp" }
    ],
    descripcion: "Radio ESTACIONKUSFM es una estación de radio online dedicada a traerte la mejor música y entretenimiento. Disfruta de una selección musical variada y de calidad las 24 horas del día.",
    estado: "online"
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
const liveBtn = document.getElementById('live-announcer-btn') || {style:{},innerHTML:""};
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

// FUNCIÓN ROBUSTA PARA DETECTAR METADATOS EN CUALQUIER ESTRUCTURA
async function updateMetadata() {
  try {
    const url = `${config.azuracastURL}/api/nowplaying/${config.azuracastStation}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("HTTP status: " + res.status);
    const data = await res.json();

    // Busca metadatos en varias ubicaciones posibles
    let title = "", artist = "", artUrl = "";
    // Estructura clásica AzuraCast
    if (data.now_playing && data.now_playing.song) {
      title = data.now_playing.song.title || "";
      artist = data.now_playing.song.artist || "";
      artUrl = data.now_playing.song.art || "";
    }
    // Alternativa actual de AzuraCast
    if ((!title || !artist) && data.current_song) {
      title = data.current_song.title || title;
      artist = data.current_song.artist || artist;
      artUrl = data.current_song.art || artUrl;
    }
    // Otros posibles lugares
    if ((!title || !artist) && data.song) {
      title = data.song.title || title;
      artist = data.song.artist || artist;
      artUrl = data.song.art || artUrl;
    }
    // Asegura que el cover sea absoluto
    if (artUrl && artUrl.startsWith('/')) artUrl = config.azuracastURL + artUrl;
    if (!artUrl) artUrl = config.albumCover;

    songTitle.textContent = title || "Desconocido";
    artistName.textContent = artist || "Desconocido";
    coverImg.src = artUrl;
    serviceBtns.innerHTML = makeSpotifyAppleBtns(title, artist);

    // Locutor en vivo (Automático por AzuraCast)
    if (data.live && (data.live.is_live || data.live.isLive) && (data.live.streamer_name || data.live.streamerName)) {
      let dj = data.live.streamer_name || data.live.streamerName || "Locutor";
      liveBtn.style.display = "inline-block";
      liveBtn.innerHTML = `<i class="fas fa-microphone"></i> Locutor en vivo: ${dj}`;
    } else {
      liveBtn.style.display = "none";
    }

    updateMenuStatus(data.live && (data.live.is_live || data.live.isLive) ? "online" : config.estado);
  } catch (e) {
    songTitle.textContent = "Sin datos";
    artistName.textContent = "";
    coverImg.src = config.albumCover;
    serviceBtns.innerHTML = "";
    updateMenuStatus("offline");
    console.error("Error obteniendo metadatos:", e);
  }
}
setInterval(updateMetadata, 10000);
updateMetadata();
window.addEventListener('DOMContentLoaded', () => { audio.load(); });

// --- RELOJ HORA OFICIAL MÉXICO CENTRAL ---
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
    const time = now.toLocaleTimeString('es-MX', options);
    const date = now.toLocaleDateString('es-MX', optionsDate);
    document.getElementById('radio-clock').textContent = time;
    document.getElementById('radio-clock-date').textContent = date.charAt(0).toUpperCase() + date.slice(1);
  } catch(e) {
    document.getElementById('radio-clock').textContent = '--:--:--';
    document.getElementById('radio-clock-date').textContent = 'Fecha no disponible';
  }
}
setInterval(updateRadioClock, 1000);
updateRadioClock();

// --- PERSONALIZACIÓN Y STICKERS ---
document.getElementById('customizeBtn').onclick = () => {
  document.getElementById('customizePanel').style.display = 'flex';
};
const bgPicker = document.getElementById('bgColorPicker');
bgPicker.value = localStorage.getItem('radioBgColor') || '#1e293b';
bgPicker.oninput = () => {
  document.body.style.background = bgPicker.value;
  localStorage.setItem('radioBgColor', bgPicker.value);
};
document.body.style.background = bgPicker.value;
const animationSelect = document.getElementById('animationSelect');
animationSelect.value = localStorage.getItem('radioAnimation') || '';
animationSelect.oninput = () => {
  localStorage.setItem('radioAnimation', animationSelect.value);
  applyAnimation(animationSelect.value);
};
function applyAnimation(anim) {
  document.body.style.animation = '';
  if(anim === 'confetti') document.body.style.animation = 'confetti 1.5s infinite linear';
  else if(anim === 'wave') document.body.style.animation = 'wave 1.2s infinite alternate';
}
applyAnimation(animationSelect.value);
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

// --- MENÚ LATERAL ---
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

// --- BOTÓN FIX ---
const fixBtn = document.getElementById('fixBtn');
fixBtn.onclick = function() {
  audio.src = config.streamURL;
  audio.load();
  audio.play();
  // Si quieres mostrar un alert usa: alert("¡Radio reparada!");
};

// --- MODAL BASTA DE BULLYING ---
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

// --- REDES SOCIALES DINÁMICAS (menú y footer) ---
const menuSocialLinks = document.getElementById('menu-social-links');
if (menuSocialLinks && config.redesSociales) {
  menuSocialLinks.innerHTML = config.redesSociales.map(rs =>
    `<li><a href="${rs.url}" class="menu-link" target="_blank"><i class="${rs.icon}"></i> ${rs.icon === "fab fa-whatsapp" ? "WhatsApp" : (rs.icon === "fab fa-facebook" ? "Facebook" : (rs.icon === "fab fa-instagram" ? "Instagram" : "YouTube"))}</a></li>`
  ).join('');
}
const socialBtns = document.getElementById('social-buttons');
if (socialBtns && config.redesSociales) {
  socialBtns.innerHTML = config.redesSociales.map(rs =>
    `<a href="${rs.url}" target="_blank"><i class="${rs.icon}"></i></a>`
  ).join('');
}