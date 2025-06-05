// 🎵 VARIABLES CONFIGURABLES 🎵
const config = {
    nombreRadio: "EKUSFM",
    nombreDesarrollador: "ESTACIONKUSMEDIOS",
    logoURL: "https://aventura.estacionkusmedios.com/img/default.jpg",
    fondoURL: "https://images.unsplash.com/photo-1478737270239-2f02b77fc618?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cmFkaW98ZW58MHx8MHx8fDA%3D",
    // Cambia estos dos valores por los de tu AzuraCast:
    streamURL: "https://radio.estacionkusmedios.com/listen/esmerosound/radio.mp3",
    azuracastURL: "https://radio.estacionkusmedios.com",
    azuracastStation: "esmerosound",
    cancionActual: "esmerosound",
    albumCover: "https://aventura.estacionkusmedios.com/img/default.jpg",
    aboutDeveloper: "ESTACIONKUSMEDIOS BASED IN CRISPRO CODE Adapted Azuracast",
    textoEmitiendo: "Transmitiendo en vivo desde nuestra estación 🎙️",
    textoSonandoAhora: "Actualmente en reproducción 🎶",
    textoCompartir: "¡Escucha la mejor música en ESTACIONKUSFM! 🎵🔥",
    redesSociales: [
      { url: "https://web.facebook.com/ekusfm", icon: "fab fa-facebook" },
      { url: "https://www.instagram.com/estacionkusfm/", icon: "fab fa-instagram" },
      { url: "https://www.youtube.com/estacionkusfm", icon: "fab fa-youtube" },
      { url: "https://api.whatsapp.com/send/?phone=51984335569&text&type=phone_number&app_absent=0", icon: "fab fa-whatsapp" }
    ],
    descripcion: "Radio ESTACIONKUSFM es una estación de radio online dedicada a traerte la mejor música y entretenimiento. Disfruta de una selección musical variada y de calidad las 24 horas del día.",
    estado: "online" // online, offline, maintenance, disabled, desactivated
};

// --- REPRODUCTOR Y METADATOS AZURACAST ---
const audio = document.getElementById('audio');
const playPauseBtn = document.getElementById('playPauseBtn');
const volumeControl = document.getElementById('volumeControl');
const songTitle = document.getElementById('song-title');
const artistName = document.getElementById('artist-name');
const coverImg = document.getElementById('cover-img');
const background = document.getElementById('background');

// Inicializa audio
audio.src = config.streamURL;
audio.crossOrigin = "anonymous";
audio.volume = volumeControl.value;

// Play/Pause
playPauseBtn.addEventListener('click', () => {
  if (audio.paused) {
    audio.play();
  } else {
    audio.pause();
  }
});
audio.addEventListener('play', () => {
  playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
});
audio.addEventListener('pause', () => {
  playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
});

// Control de volumen
volumeControl.addEventListener('input', (e) => {
  audio.volume = e.target.value;
});

// Carga metadatos desde AzuraCast API
async function updateMetadata() {
  try {
    const res = await fetch(`${config.azuracastURL}/api/nowplaying/${config.azuracastStation}`);
    if (!res.ok) throw new Error("No se pudo obtener metadatos");
    const data = await res.json();

    songTitle.textContent = data.now_playing.song.title || "Desconocido";
    artistName.textContent = data.now_playing.song.artist || "Desconocido";
    // Portada
    let artUrl = data.now_playing.song.art;
    if (artUrl && artUrl.startsWith('/')) {
      artUrl = config.azuracastURL + artUrl;
    }
    coverImg.src = artUrl || config.albumCover;
    background.src = artUrl || config.fondoURL;
  } catch (e) {
    songTitle.textContent = "Error obteniendo metadatos";
    artistName.textContent = "";
    coverImg.src = config.albumCover;
    background.src = config.fondoURL;
  }
}

// Actualiza metadatos cada 10 segundos
setInterval(updateMetadata, 10000);
updateMetadata();

// Opcional: auto-play al cargar
window.addEventListener('DOMContentLoaded', () => {
  audio.load();
});

// --- MENÚ LATERAL ---
const menuBtn = document.getElementById('menuBtn');
const menu = document.getElementById('menu');
const closeMenuBtn = document.getElementById('close-menu');
const overlay = document.querySelector('.overlay');

// Abrir menú
menuBtn.addEventListener('click', () => {
  menu.classList.add('open');
  overlay.classList.add('active');
});
// Cerrar menú
closeMenuBtn.addEventListener('click', () => {
  menu.classList.remove('open');
  overlay.classList.remove('active');
});
overlay.addEventListener('click', () => {
  menu.classList.remove('open');
  overlay.classList.remove('active');
});

// --- MODALES ---
function openModal(modalId) {
  document.getElementById(modalId).style.display = 'block';
  overlay.classList.add('active');
}
function closeModal(modalId) {
  document.getElementById(modalId).style.display = 'none';
  overlay.classList.remove('active');
}

// Historial de canciones
const historyLink = document.getElementById('historyLink');
const historyModal = document.getElementById('historyModal');
const closeHistoryModal = document.getElementById('closeHistoryModal');
historyLink.addEventListener('click', (e) => {
  e.preventDefault();
  openModal('historyModal');
});
closeHistoryModal.addEventListener('click', () => closeModal('historyModal'));

// Acerca de
const aboutLink = document.getElementById('aboutLink');
const aboutModal = document.getElementById('aboutModal');
const closeAboutModal = document.getElementById('closeAboutModal');
aboutLink.addEventListener('click', (e) => {
  e.preventDefault();
  openModal('aboutModal');
});
closeAboutModal.addEventListener('click', () => closeModal('aboutModal'));

// Compartir
const shareLink = document.getElementById('shareLink');
const shareModal = document.getElementById('shareModal');
const closeShareModal = document.getElementById('closeShareModal');
shareLink.addEventListener('click', (e) => {
  e.preventDefault();
  openModal('shareModal');
});
closeShareModal.addEventListener('click', () => closeModal('shareModal'));

// --- COPIAR ENLACE DE COMPARTIR ---
const shareUrl = document.getElementById('shareUrl');
const copyLinkBtn = document.getElementById('copyLink');
if(shareUrl && copyLinkBtn) {
  shareUrl.value = window.location.href;
  copyLinkBtn.addEventListener('click', () => {
    shareUrl.select();
    document.execCommand('copy');
    copyLinkBtn.textContent = '¡Copiado!';
    setTimeout(() => (copyLinkBtn.textContent = 'Copiar'), 1500);
  });
}

// --- ALERTA OFFLINE ---
const offlineAlert = document.getElementById('offlineAlert');
function checkOnlineStatus() {
  if (navigator.onLine) {
    offlineAlert.style.display = 'none';
  } else {
    offlineAlert.style.display = 'block';
  }
}
window.addEventListener('online', checkOnlineStatus);
window.addEventListener('offline', checkOnlineStatus);
checkOnlineStatus();

// --- LLENAR ENLACES SOCIALES ---
const menuSocialLinks = document.getElementById('menu-social-links');
if (menuSocialLinks && config.redesSociales) {
  menuSocialLinks.innerHTML = config.redesSociales.map(rs =>
    `<li><a href="${rs.url}" class="menu-link" target="_blank"><i class="${rs.icon}"></i></a></li>`
  ).join('');
}

// --- LLENAR SOBRE NOSOTROS ---
const aboutLogo = document.getElementById('aboutLogo');
const aboutDescription = document.getElementById('aboutDescription');
const aboutDeveloper = document.getElementById('aboutDeveloper');
if (aboutLogo) aboutLogo.src = config.logoURL;
if (aboutDescription) aboutDescription.textContent = config.descripcion;
if (aboutDeveloper) aboutDeveloper.textContent = config.nombreDesarrollador;

// --- COMPARTIR EN REDES ---
const shareWhatsapp = document.getElementById('shareWhatsapp');
const shareFacebook = document.getElementById('shareFacebook');
const shareTwitter = document.getElementById('shareTwitter');
if (shareWhatsapp) {
  shareWhatsapp.onclick = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(config.textoCompartir + " " + window.location.href)}`, "_blank");
  };
}
if (shareFacebook) {
  shareFacebook.onclick = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, "_blank");
  };
}
if (shareTwitter) {
  shareTwitter.onclick = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(config.textoCompartir)}`, "_blank");
  };
}
