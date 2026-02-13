const STATION = {
  name: "EKUSFM",
  streamUrl: "https://stream.zeno.fm/7mk2bzwy5x8uv",
  zenoId: "7mk2bzwy5x8uv",
  fallbackCover: "https://radioaventura-web.vercel.app/img/default.jpg",
  social: [
    { name: "Facebook", icon: "fa-brands fa-facebook", url: "https://web.facebook.com/ekusfm" },
    { name: "Instagram", icon: "fa-brands fa-instagram", url: "https://www.instagram.com/estacionkusfm/" },
    { name: "YouTube", icon: "fa-brands fa-youtube", url: "https://www.youtube.com/estacionkusfm" },
    { name: "WhatsApp", icon: "fa-brands fa-whatsapp", url: "https://chat.whatsapp.com/JSk9LFoclGrFxY7rb4TFWu" }
  ]
};

const ui = {
  audio: document.querySelector("#audio"),
  playPauseBtn: document.querySelector("#playPauseBtn"),
  volumeControl: document.querySelector("#volumeControl"),
  volumeIcon: document.querySelector("#volumeIcon"),
  songTitle: document.querySelector("#songTitle"),
  artistName: document.querySelector("#artistName"),
  coverImage: document.querySelector("#coverImage"),
  listenersCount: document.querySelector("#listenersCount"),
  musicLinks: document.querySelector("#musicLinks"),
  historyList: document.querySelector("#historyList"),
  refreshHistoryBtn: document.querySelector("#refreshHistoryBtn"),
  clockTime: document.querySelector("#clockTime"),
  themeToggle: document.querySelector("#themeToggle"),
  socialLinks: document.querySelector("#socialLinks")
};

let isFetchingMeta = false;
let currentSongKey = "";

function setTheme() {
  const preferredTheme = localStorage.getItem("ekus-theme");
  const shouldUseLight = preferredTheme === "light";
  document.body.classList.toggle("light", shouldUseLight);
  ui.themeToggle.innerHTML = shouldUseLight
    ? '<i class="fa-solid fa-sun"></i>'
    : '<i class="fa-solid fa-moon"></i>';
}

function updateVolumeIcon(volumeValue) {
  if (volumeValue === 0) {
    ui.volumeIcon.className = "fa-solid fa-volume-xmark";
    return;
  }
  if (volumeValue < 0.55) {
    ui.volumeIcon.className = "fa-solid fa-volume-low";
    return;
  }
  ui.volumeIcon.className = "fa-solid fa-volume-high";
}

function parseSong(song = "") {
  const [artistRaw, titleRaw] = song.split(" - ");
  return {
    artist: artistRaw?.trim() || STATION.name,
    title: titleRaw?.trim() || song || "Transmitiendo en vivo"
  };
}

function renderStreamingLinks({ artist, title }) {
  const query = encodeURIComponent(`${artist} ${title}`);
  ui.musicLinks.innerHTML = `
    <a class="btn btn--small" target="_blank" rel="noopener" href="https://open.spotify.com/search/${query}">
      <i class="fa-brands fa-spotify"></i> Spotify
    </a>
    <a class="btn btn--small" target="_blank" rel="noopener" href="https://music.apple.com/search?term=${query}">
      <i class="fa-brands fa-apple"></i> Apple Music
    </a>
  `;
}

async function findCover(artist, title) {
  const response = await fetch(
    `https://itunes.apple.com/search?term=${encodeURIComponent(`${artist} ${title}`)}&media=music&limit=1`
  );
  if (!response.ok) {
    return STATION.fallbackCover;
  }
  const payload = await response.json();
  return payload.results?.[0]?.artworkUrl100?.replace("100x100bb", "600x600bb") || STATION.fallbackCover;
}

async function refreshMetadata() {
  if (isFetchingMeta) {
    return;
  }

  isFetchingMeta = true;
  try {
    const response = await fetch(
      `https://zenoplay.zenomedia.com/api/zenofm/nowplaying/${STATION.zenoId}?_=${Date.now()}`
    );

    if (!response.ok) {
      throw new Error("No fue posible obtener metadata");
    }

    const payload = await response.json();
    const nowPlaying = payload?.title || "";
    const listeners = payload?.listeners ?? "--";
    const { artist, title } = parseSong(nowPlaying);
    const songKey = `${artist}|${title}`;

    ui.listenersCount.textContent = listeners;
    ui.songTitle.textContent = title;
    ui.artistName.textContent = artist;

    if (songKey !== currentSongKey) {
      currentSongKey = songKey;
      ui.coverImage.src = await findCover(artist, title);
      renderStreamingLinks({ artist, title });
    }
  } catch (error) {
    ui.songTitle.textContent = "Sin datos disponibles";
    ui.artistName.textContent = "Verifica conexión";
    ui.coverImage.src = STATION.fallbackCover;
  } finally {
    isFetchingMeta = false;
  }
}

async function refreshHistory() {
  ui.historyList.innerHTML = "<li>Cargando historial...</li>";
  try {
    const response = await fetch(`https://zenoplay.zenomedia.com/api/zenofm/recent/${STATION.zenoId}`);
    if (!response.ok) {
      throw new Error("No se pudo cargar historial");
    }
    const payload = await response.json();
    const recentSongs = Array.isArray(payload) ? payload.slice(0, 7) : [];

    if (!recentSongs.length) {
      ui.historyList.innerHTML = "<li>No hay canciones recientes por el momento.</li>";
      return;
    }

    ui.historyList.innerHTML = recentSongs
      .map((song) => {
        const parsed = parseSong(song?.song || song?.title || "");
        return `<li><strong>${parsed.title}</strong> · ${parsed.artist}</li>`;
      })
      .join("");
  } catch (error) {
    ui.historyList.innerHTML = "<li>No se pudo obtener el historial.</li>";
  }
}

function initClock() {
  const formatter = new Intl.DateTimeFormat("es-MX", {
    timeZone: "America/Mexico_City",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });

  setInterval(() => {
    ui.clockTime.textContent = formatter.format(new Date());
  }, 1000);
}

function bootstrapPlayer() {
  ui.audio.src = STATION.streamUrl;
  ui.audio.volume = Number(ui.volumeControl.value);
  updateVolumeIcon(ui.audio.volume);

  ui.playPauseBtn.addEventListener("click", async () => {
    try {
      if (ui.audio.paused) {
        await ui.audio.play();
      } else {
        ui.audio.pause();
      }
    } catch (error) {
      ui.songTitle.textContent = "No se pudo iniciar el audio";
      ui.artistName.textContent = "Interacción requerida por el navegador";
    }
  });

  ui.audio.addEventListener("play", () => {
    ui.playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i><span>Pausar</span>';
  });

  ui.audio.addEventListener("pause", () => {
    ui.playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i><span>Escuchar ahora</span>';
  });

  ui.volumeControl.addEventListener("input", (event) => {
    const value = Number(event.target.value);
    ui.audio.volume = value;
    updateVolumeIcon(value);
  });
}

function mountSocialLinks() {
  ui.socialLinks.innerHTML = STATION.social
    .map(
      ({ url, icon, name }) =>
        `<a href="${url}" target="_blank" rel="noopener"><i class="${icon}"></i> ${name}</a>`
    )
    .join("");
}

function registerEvents() {
  ui.refreshHistoryBtn.addEventListener("click", refreshHistory);
  ui.themeToggle.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("light") ? "dark" : "light";
    localStorage.setItem("ekus-theme", nextTheme);
    setTheme();
  });
}

function init() {
  setTheme();
  bootstrapPlayer();
  mountSocialLinks();
  initClock();
  registerEvents();
  refreshMetadata();
  refreshHistory();

  setInterval(refreshMetadata, 12000);
}

init();
