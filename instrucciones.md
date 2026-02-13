# Instrucciones de la versión

## Cambios realizados en esta versión
- Rediseño integral del sitio principal (`index.htm`) con una arquitectura visual moderna basada en secciones (hero, reproductor, historial y comunidad).
- Reescritura completa de estilos (`style.css`) con sistema de diseño por variables CSS, modo claro/oscuro y layout responsive con CSS Grid.
- Reimplementación total de la lógica de frontend (`script.js`) con módulos claros para:
  - Reproducción en vivo y controles de volumen.
  - Consumo de metadata de Zeno.fm.
  - Recuperación de portada dinámica vía iTunes.
  - Carga de historial reciente.
  - Renderizado de enlaces sociales y de búsqueda musical.
  - Reloj en zona horaria de CDMX.

## Requisitos o dependencias nuevas
- No se agregaron dependencias de build ni paquetes nuevos.
- Se mantiene el uso de Font Awesome y Google Fonts vía CDN en el HTML.

## Guía paso a paso para probar la funcionalidad
1. Abrir una terminal en la raíz del proyecto.
2. Levantar servidor local:
   ```bash
   python3 -m http.server 4173
   ```
3. Abrir en navegador:
   - `http://localhost:4173/index.htm`
4. Validar puntos clave:
   - Botón **Escuchar ahora** reproduce/pausa stream.
   - Slider de volumen modifica audio e icono.
   - Se muestran canción/artista y portada dinámica.
   - Botón **Actualizar** refresca historial.
   - Botón de luna/sol cambia entre tema oscuro/claro.
