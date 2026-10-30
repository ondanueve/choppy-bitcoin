# Choppy Bitcoin — reglas para agentes

Grok Build carga este archivo al empezar una sesión. Léelo antes de editar.

## Entrega

- Trabaja en una rama nueva y abre un pull request hacia `main`. Nunca hagas push a `main`, nunca force-push y nunca hagas merge. El humano revisa y fusiona.
- Commits pequeños, en inglés, que digan qué cambian.
- El PR lleva resumen, archivos tocados, comandos y resultado de las pruebas, riesgos, y lo que quedó fuera. Un problema fuera del alcance se anota en el PR; no se arregla de paso.
- Este repo es un sitio estático. El hub `ondanueve/bitcoinizate` lo publica en `/choppy-bitcoin/`. Un push aquí no despliega. No toques el repo del hub.
- Si cambias un archivo que `index.html` carga, sube su etiqueta `?v=mpNNN`. El número en producción está en `index.html`. Si otra rama ya usó el siguiente, no lo adivines: déjalo escrito en el PR.

## No volver a romper `main`

Una sesión anterior escribió texto de relleno dentro de `game.js` y `style.css`. Hubo que restaurar y redesplegar.

- Cada edición lleva código o texto real y completo. No dejes marcadores: ni la palabra formada por «PLACE» + «HOLDER», ni «TODO» + «_REPLACE», ni «lo» + «rem» + « ipsum», ni «insert» + « here», ni plantillas de doble llave, ni un comentario que diga que el resto del archivo sigue igual, ni un comentario de bloque vacío o hecho solo de puntos.
- `game.js`, `style.css` e `i18n.js` se editan con reemplazos puntuales. No los reescribas enteros. Después de cada edición corre `git diff --stat`. Si el tamaño no es el que esperabas, restaura con `git checkout -- <archivo>` y repite.
- Antes de cada commit: `node --check` de cada `.js` que hayas tocado, y `node tests/smoke.js`.
- `game.js` y `style.css` no pueden bajar más de un 5 % ni subir más de un 15 % respecto de `origin/main` sin la variable `ALLOW_SIZE_CHANGE=1`.

## Probar el juego

Sírvelo en la misma ruta que producción:

```sh
mkdir -p /tmp/site && ln -sfn "$PWD" /tmp/site/choppy-bitcoin
python3 -m http.server 8080 -d /tmp/site
```

Abre `http://localhost:8080/choppy-bitcoin/`. Tiene que cargar sin errores de consola. Juega una partida corta y comprueba lo que cambiaste. Con Playwright o Chromium: `node tests/boot.js` (la captura queda en `tests/out/`, ignorada por git). En el PR escribe qué probaste y qué no pudiste probar.

## Pruebas automáticas

- `node tests/smoke.js` revisa sintaxis, relleno, nombres prohibidos, tamaño, versiones, imágenes e idiomas. Sin dependencias y sin red. Tiene que pasar en menos de 10 s.
- `node tests/boot.js` es el arranque headless, opcional. Si no hay Playwright ni Chromium, sale con código 0 y avisa «omitido». Para instalar Playwright solo en tu máquina, sin guardarlo en el repo: `npm install --no-save playwright` y `npx playwright install chromium`. Si `google-chrome` o `chromium` ya están en el PATH, `boot.js` los usa sin Playwright.
- GitHub Actions (workflow `ci`, job `ci`) ejecuta el smoke test en cada pull request y en cada push a ramas distintas de `main`. Permisos: solo lectura del repo. Sin secretos y sin despliegue.
- La protección de rama que exige el check `ci` antes de fusionar a `main` se configura a mano en GitHub. Un agente no la activa.

## Dinero, datos y secretos

- No gastes dinero ni actives nada de pago: ni planes, ni pruebas de pago, ni claves de APIs de pago, ni dominios, ni servicios con costo, ni transacciones reales en cadena. Si algo exige pago, detente y escríbelo en el PR.
- No ejecutes SQL contra la base de producción. Los cambios de esquema son archivos `.sql` en `supabase/`, con instrucciones de cómo aplicarlos. No guardes secretos. La clave anónima pública que ya está en `mp.js` y `supabase-lib.js` es la única permitida.
- Cero dependencias npm nuevas. El sitio es JavaScript clásico de navegador, sin build. No añadas peso al arranque ni trabajo por fotograma en el bucle principal sin medirlo. El rendimiento en móvil manda.

## Imágenes y nombres

- No borres imágenes, tampoco las fallidas. Si una se reemplaza, deja en el PR la lista de archivos que habría que archivar en el hub bajo `art-archive/choppy/`. No archives tú. No modifiques `chance/` salvo que el encargo lo pida.
- Está prohibido escribir, en cualquier archivo, test o mensaje de commit, el nombre de la cadena de comida rápida formado por «Mc» + «Donald», y el de la marca de relojes formado por «Tim» + «ex». Para detectarlos, construye la expresión por concatenación. «Tío Mike» tiene unos 60 años, es distinto de Héctor, y solo se parece de lejos a una persona real que no se nombra.

## Historia e idioma

- Lena no aparece en el arco de la independencia, ni en texto ni en ilustración.
- Marek va vestido según la escena. Nunca con ropa deportiva ni de runner.
- Sin spoilers: no reveles finales, ni la descripción de un premio con `secret: true` antes de obtenerlo, ni la solución de un problema de ajedrez. La posición se muestra; la jugada ganadora no.
- A.I. Bud nunca elige adopción.
- Todo texto visible es bilingüe EN/ES, en español neutro (tú, puedes, elige). Sin voseo. El smoke test rechaza las formas «pod»+«és», «ten»+«és», «quer»+«és», «eleg»+«í», «hac»+«é», «mir»+«á», y las palabras sueltas «so»+«s» y «vo»+«s». Esa frontera evita el choque con «esos» y con «vosotros». «eleg»+«í» precedido de «yo» es pretérito estándar y el test lo deja pasar.
- Respeta los TL;DR que ya existen. En los botones, el monto va sin artículo.
- Usa `i18n.js`, `T_UI` en `game.js` y los objetos `{en, es}` de las tarjetas. No dejes una frase visible en un solo idioma.
- Las claves de `dict.en` y `dict.es` tienen que coincidir. Cada premio de `AWARD_CATALOG` lleva `name`, `nameEs`, `why` y `whyEs`, no vacíos y distintos entre sí. El id `nocoiner` usa el mismo préstamo en los dos idiomas. Los ids de `game.js` y los de `u/index.html` son el mismo conjunto: si tocas uno, toca el otro.
