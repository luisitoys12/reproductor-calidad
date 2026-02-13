# Instrucciones de la versión

## Cambios realizados en esta versión
- Se rediseñó completamente `novedades.htm` para alinearlo al nuevo formato visual del sitio: cabecera moderna, hero, sistema de tabs y tarjetas tipo panel.
- Se preservó el mini reproductor flotante en `novedades.htm` con sus controles, metadata en vivo y actualización de portada.
- Se rediseñó completamente `noticias.htm` con un layout renovado y modular, manteniendo la lectura de datos desde Firebase.
- Se reforzó el render dinámico en `noticias.htm` para noticias, videos, programas y funciones destacadas, con estados de carga, mensajes vacíos y manejo de error.
- Se mantuvo el mini reproductor flotante en `noticias.htm` sin alterar su funcionalidad de reproducción.

## Requisitos o dependencias nuevas
- No se agregaron nuevas dependencias de build.
- Se continúa usando Firebase compat (`firebase-app-compat` y `firebase-database-compat`) vía CDN en `noticias.htm`.
- Se mantiene uso de Google Fonts, Material Icons y Font Awesome vía CDN.

## Guía paso a paso para probar la funcionalidad
1. Abrir terminal en la raíz del proyecto.
2. Iniciar servidor local:
   ```bash
   python3 -m http.server 4173
   ```
3. Abrir rutas en el navegador:
   - `http://localhost:4173/index.htm`
   - `http://localhost:4173/novedades.htm`
   - `http://localhost:4173/noticias.htm`
4. Validar en **Novedades**:
   - Cambio entre tabs Programas / Eventos / Concursos.
   - Mini reproductor: play/pause, volumen y cierre.
5. Validar en **Noticias**:
   - Carga de bloques desde Firebase: Noticias, Top 10, Programas y Funciones.
   - Botón "Ver Más" en noticias extensas.
   - Mini reproductor funcionando en paralelo.
