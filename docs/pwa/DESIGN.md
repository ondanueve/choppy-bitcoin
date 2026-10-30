# PWA e instalación sin conexión

Choppy Bitcoin puede instalarse y abrir el modo principal sin red. El service worker es **opt-in**. Sin `?pwa=1` y sin el interruptor de Opciones, la página no lo registra y no pide `sw.js`.

El alcance es solo `/choppy-bitcoin/`. El manifiesto del hub, en `/`, no se toca. Un worker publicado en `/choppy-bitcoin/sw.js` no puede controlar la raíz del hub.

`CACHE_VERSION` en `sw.js` es la misma etiqueta `?v=mpNNN` de `game.js` en `index.html`. En esta rama es `mp195`. `main` ya estaba en `mp194` cuando se abrió la rama (el brief citaba `mp192`, que ya había quedado atrás).

## Qué entra en la caché

Solo respuestas `GET` propias, con `ok`, tipo `basic` o `default`, y sin `Cache-Control: no-store`.

| Grupo | Ejemplos | Estrategia | Dónde |
| --- | --- | --- | --- |
| Documentos | `/choppy-bitcoin/`, `index.html`, otras páginas `.html` del alcance, `site.webmanifest` | Red primero. Si la red falla, la copia guardada. Si tampoco hay copia, una página corta EN/ES que dice que el juego aún no está guardado. | `choppy-shell-mp195` |
| Shell con versión | `game.js`, `i18n.js`, `i18n-extra.js`, `auth.js`, `supabase-lib.js`, `run-stats.js`, `audio.js`, `nozoom.js`, `style.css`, iconos, `favicon.svg` | Stale-while-revalidate. Se sirve la copia y se refresca en segundo plano. La query `?v=` forma parte de la clave: un `mp` nuevo es otra entrada. | `choppy-shell-mp195` |
| Arte reciente | `chance/*.jpg`, `chance/*.png`, `chance/*.webp`, `chance/*.gif` | Caché con tope. Si no está y la red falla, un SVG de degradado (`200`, `Cache-Control: no-store`) que **no** se guarda. | `choppy-art` |

La instalación no precarga el catálogo ni el shell. La caché se llena con lo que el jugador pide después de registrarse. Hace falta una recarga controlada para que el documento quede bajo el worker. Si esa visita lleva query (`?pwa=1`), el mismo HTML también se guarda bajo `start_url` (`/choppy-bitcoin/`) y bajo `index.html`, para que la app instalada abra sin red.

`choppy-art` no lleva el número de versión. Un cambio de shell no borra las ilustraciones ya guardadas. Al activar un shell nuevo se borran solo las cachés `choppy-shell-*` que no sean la actual.

No hay fuentes locales. `style.css` nombra «IBM Plex Mono» y cae en la mono del sistema. No hay archivo de fuente que cachear.

## Qué no se guarda

- Supabase (`*.supabase.co`): login, puntajes, ELO, perfiles. Si la red falla, el worker responde `503` con `{ "offline": true }` y no lo almacena. Así el navegador no deja un error de red en la consola y un token caducado no se borra solo por estar sin conexión.
- Cualquier URL con `access_token` o `refresh_token`.
- `mp.js` y el resto de versus. El realtime no pasa por esta caché.
- Vídeo (`.mp4`, `.webm`, `.mov`, `.m4v`), también dentro de `chance/`.
- `abcjs` en cdnjs. Misma respuesta sintética de sin conexión, sin guardarla. El jukebox no es el modo principal.
- `sw.js` y `sw-kill.json`. El interruptor tiene que leerse de la red.
- La raíz del hub y cualquier otro origen que no sea Supabase o cdnjs (esos dos solo se interceptan para no cachear y para fallar en silencio).
- `localStorage`. Ni una actualización ni el kill switch lo vacían.

## Tope del arte

Como máximo **40 imágenes** y **30 MiB** (`30 * 1024 * 1024` bytes). Se conservan las más recientes que quepan. Una imagen mayor que 30 MiB no se guarda. Antes de escribir se calcula el conjunto final y se borran las que sobran, así el almacenamiento no se pasa del tope ni un instante por esa escritura. Las escrituras van en serie.

El degradado de respaldo no cuenta: lleva `no-store` y el worker no hace `cache.put` con él.

## Presupuesto medido

`node tests/sw-sim.js` suma los archivos de shell listados en `SHELL_PATHS` y le suma el tope de arte.

Medido en esta rama:

- Shell: **1 275 071 bytes** (1,22 MiB). Incluye `game.js`, el CSS, los scripts de arranque, el manifiesto y los iconos, entre ellos `favicon-512.png` (32 083 bytes) y `favicon-maskable-512.png` (21 754 bytes).
- Arte: **31 457 280 bytes** (30 MiB) como máximo.
- Techo si se llega a pedir todo el shell y se llena el arte: **32 732 351 bytes** (31,22 MiB).

Eso es un techo, no lo que se descarga al instalar. La instalación no precarga. `nft-preview.js` y el HTML de `about/` solo entran en la caché de shell si el jugador abre esas URLs.

`game.js` pasó de 820 142 a 829 465 bytes (+1,1 %). `style.css` pasó de 68 986 a 70 124 bytes (+1,6 %). No hay dependencia nueva. El registro ocurre en el evento `load`, después del primer pintado.

## Versión nueva

1. Se publica otro `sw.js` (cambia `CACHE_VERSION` junto con los `?v=` de `index.html`).
2. En la visita siguiente el navegador ve bytes distintos. El worker nuevo espera. No llama a `skipWaiting` solo.
3. La página muestra un aviso discreto, abajo: «A new version is ready.» / «Hay una versión nueva.» con «Reload» / «Recargar» y «Not now» / «Ahora no».
4. Recargar manda `skip-waiting`, espera el `controllerchange` y recarga una vez. `localStorage` no se toca.
5. El HTML sigue siendo red primero, así que un `index.html` nuevo no se queda atrás mientras haya red. La caché vieja de shell se borra al activar.

La primera vez que alguien activa la app sin conexión, el aviso pide una recarga para guardar el juego. No es automática: una partida en curso no se corta sola.

## Kill switch

`sw-kill.json` en la raíz del juego:

```json
{ "kill": false }
```

El worker lo pide con `cache: "no-store"` al activarse y, como mucho, una vez por minuto al pedir un documento. Si el JSON tiene `"kill": true` o `"disabled": true`, deja de escribir cachés, borra solo las que empiezan por `choppy-`, se desregistra y avisa a la página. Una escritura que ya iba en curso y termina después se borra sola. La página quita `choppy-pwa` de `localStorage`, avisa al worker y borra esas cachés otra vez, sin esperar a que `unregister` se quede colgado. Además, en cada arranque con la opción ya encendida (o con `?pwa=1`), la página lee ese JSON una vez antes de llamar a `register`. Si la bandera está activa, no registra y borra las cachés `choppy-`. Si ese archivo no se puede leer (sin red, o aún no está desplegado), **no** se apaga: un fallo de red no puede dejar a nadie sin la copia local. Con el registro apagado no se pide `sw-kill.json`.

También vale `?pwa=0`, o apagar el interruptor de Opciones. Los dos desregistran el worker de este alcance y borran las cachés `choppy-`.

### Si el worker queda roto

No borres el almacenamiento del origen entero. El hub comparte el origen y puede tener otras cachés. Solo importan los nombres `choppy-*`.

1. Publica `sw-kill.json` con `"kill": true` y despliega. Quien entre con red lo aplica en el siguiente arranque.
2. Si el `sw.js` desplegado ni siquiera llega a leer ese JSON, sustituye `/choppy-bitcoin/sw.js` por el contenido de `docs/pwa/sw-self-destruct.js` y despliega. Ese archivo no cachea nada: en `activate` hace `skipWaiting`, borra `choppy-*`, se desregistra y manda `{ "type": "killed" }`.
3. Cuando las visitas ya no tengan worker, vuelve `sw-kill.json` a `"kill": false` antes de publicar un `sw.js` normal. Si lo dejas en `true`, el worker nuevo también se desregistra.
4. Un jugador puede forzar el apagado abriendo `/choppy-bitcoin/?pwa=0`.
5. En DevTools: Application → Service Workers → Unregister, y borra a mano solo las cachés `choppy-shell-*` y `choppy-art`. No uses «Clear site data» del origen completo si no quieres llevarte el almacenamiento del hub.

## Registro

Por defecto no hay registro.

Se enciende con cualquiera de estas dos cosas:

- `?pwa=1` en el juego. Se recuerda en `localStorage` (`choppy-pwa=1`) para que la app instalada, cuyo `start_url` no lleva la query, siga comprobando actualizaciones.
- Opciones → «OFFLINE APP» / «APP SIN CONEXIÓN».

`?pwa=0` apaga y olvida la preferencia. El alta es:

```js
navigator.serviceWorker.register("/choppy-bitcoin/sw.js", { scope: "/choppy-bitcoin/", updateViaCache: "none" })
```

dentro del evento `load`. No bloquea el primer pintado.

## Sin conexión

| Acción | Qué ve el jugador |
| --- | --- |
| Iniciar sesión | Panel EN/ES. Puede seguir como invitado. No se envían credenciales. |
| Puntaje ranked | Si no hay sesión, no se envía nada. Si hay sesión y no hay red, el puntaje queda en `localStorage` y el panel dice que no se envió y que no se enviará solo más tarde. No hay cola ni reintento automático. El reintento inmediato que ya existía, solo cuando el servidor rechaza `p_stats`, se mantiene en línea y no corre si el fallo es de red. |
| Versus | No se abre la sala ni se carga `mp.js`. El mismo panel lo explica. Ranked y entrenamiento siguen. |
| Ilustración no guardada | El worker devuelve un degradado. Si no hay worker, la imagen prueba un archivo de respaldo y, si también falla o no hay red, el juego la cambia por un bloque con el mismo degradado. No se pide una URL que vaya a fallar cuando `navigator.onLine` es falso. |

Un invitado nunca entra en `submit_choppy_score`. La partida ranked local usa la puntuación del dispositivo, como ya hacía el juego.

## Manifiesto

`theme_color` y `background_color` quedan en `#0a0a0c`, el mismo `theme-color` de `index.html` y el `--bg` de la página. Se conservan los iconos 48, 96, 192 y el apple touch. Se añaden `favicon-512.png` (`purpose: any`) y `favicon-maskable-512.png` (`purpose: maskable`), generados con `tools/make-pwa-icons.py` desde `favicon-192.png` sin sustituir ese archivo. El maskable deja el emblema al 72 % del lado, dentro de la zona segura, y pinta el resto con el color de la esquina del icono original.

Hay `description`, `lang`, `id` y dos atajos: «Play · Jugar» abre el juego, y «Versus» abre `/choppy-bitcoin/?versus=1`. No se incluyen capturas del instalador: pesarían de más en el aviso de instalación y el brief las deja como opcionales.

## Prueba manual

Sirve el repo como en producción:

```sh
mkdir -p /tmp/site && ln -sfn "$PWD" /tmp/site/choppy-bitcoin
python3 -m http.server 8080 -d /tmp/site
```

Abre `http://127.0.0.1:8080/choppy-bitcoin/`.

1. Sin la query, en la red no aparece `sw.js`. El menú y una partida corta se comportan como antes.
2. Abre `?pwa=1`. Tras `load` se registra el worker y sale el aviso de recargar una vez. Recarga.
3. En DevTools, pasa a Offline. Recarga. El menú sigue. Pulsa Ranked y juega un poco como invitado. Iniciar sesión y Versus muestran el panel bilingüe. Una ilustración que no esté en `choppy-art` se ve como degradado, sin error de consola por esa petición.
4. Vuelve a tener red. Cambia un byte de `sw.js` (o sube `CACHE_VERSION` y los `?v=` juntos) y recarga. Sale «Hay una versión nueva.» / «A new version is ready.». Recarga desde el aviso. Una clave de `localStorage` puesta antes sigue ahí.
5. Publica `sw-kill.json` con `"kill": true` y recarga. En el siguiente arranque el worker se va y las cachés `choppy-*` desaparecen. Deja el JSON otra vez en `"kill": false`.

Automático, sin navegador: `node tests/sw-sim.js` y `node tests/smoke.js`.

## Fuera de este cambio

- No se cachea el catálogo de `chance/` (unos 60 MB). Solo lo reciente, con el tope de arriba.
- No hay cola de puntajes para cuando vuelva la red. Hace falta una partida nueva, ya en línea, para volver a intentar un envío.
- El jukebox sigue necesitando cdnjs la primera vez que se abre.
- Versus no funciona sin red.
- Las capturas del instalador no se añadieron.
- El registro sigue apagado hasta que el dueño lo encienda con la query, con Opciones, o cambie el valor por defecto en un PR posterior.
