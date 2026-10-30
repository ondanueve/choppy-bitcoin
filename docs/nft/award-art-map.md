# Mapa de premios e ilustraciones

Fase 1. Una fila por premio de `AWARD_CATALOG` (46). La tabla de trabajo es [`award-art-map.csv`](award-art-map.csv). Este archivo la explica. No es el catálogo público de insignias: los premios `secret` no llevan aquí su texto de obtención, y el manifiesto Nostr tampoco lo publica.

Rareza propuesta, de más fácil a más difícil: `comun`, `poco-comun`, `rara`, `epica`, `legendaria`. Es una propuesta editorial, no una probabilidad medida.

Elegibilidad:

- `ok`: hay una ilustración actual que puede ser la edición vigente.
- `requiere arte nuevo`: no hay ilustración adecuada. El encargo está en las notas. No se generó ninguna imagen en esta fase.
- `excluida`: el premio no puede llevar coleccionable con el arte citado. Ningún premio de los 46 cae aquí, porque ninguno usa arte del Tío Mike. El generador igual rechaza esa combinación si aparece.

`lena_check`: `no` significa que se abrió la imagen elegida para un premio `country` y no aparece Lena. `n/a` significa que el premio no es del arco de la independencia.

Las rutas vintage son relativas a la raíz del repo hub `ondanueve/bitcoinizate`, carpeta `art-archive/choppy/`. Solo entran JPEG que estuvieron en vivo y fueron reemplazados. No entran PNG de trabajo, pruebas en `_rejected/` ni fuentes de generación.

## Exclusiones

Archivos prohibidos para cualquier coleccionable: `chance/unclemike.jpg`, `chance/unclemike-wide.jpg`, y cualquier archivo de archivo cuyo nombre contenga `unclemike`. En el hub clonado el 30 de octubre de 2026 no había ninguno. `chance/uncle-wide.jpg` es la carta del tío Héctor, no es el Tío Mike, y tampoco se asigna: no hay un premio de esa carta.

Lena puede aparecer en premios de `family`. No puede aparecer en premios de `country`. La comparación visual usa su diseño en `date-wide.jpg`, `proposal-wide.jpg`, `proposal-a-wide.jpg`, `wedding-wide.jpg`, `wedding-a-wide.jpg`, `wedding-c-wide.jpg` y `baby-wide.jpg`: pelo oscuro largo y suelto, o moño alto con camisa clara y short en la propuesta.

## Inspección visual del arco country

Se abrió cada candidato de abajo. Resultado:

| Archivo | Lena | Decisión |
| --- | --- | --- |
| `chance/islandInspection-a-wide.jpg` | No. Marek, Nico, Paco y la moneda con una bandera. | Actual de `landowner`. |
| `chance/islandInspection-wide.jpg` | No. Solo la moneda sobre el acantilado. | No es la compra. Vintage de la visita, sí. |
| `art-archive/choppy/replaced-mp188/islandInspection-a-wide.jpg` | No. Misma escena de la bandera, perro distinto. | Vintage de `landowner`. |
| `art-archive/choppy/replaced-mp191/islandInspection-wide.replaced-mp191.jpg` | No. Solo la moneda. | Vintage de la visita, ligada a `landowner` como edición anterior del mismo beat. |
| `chance/anOffer-b-wide.jpg` | No. Tres trajes, Nico y Paco. | Actual de `notForSale`. |
| `art-archive/choppy/replaced-mp191/anOffer-b-wide.replaced-mp191.jpg` | No. Nico, un hombre mayor y un mesero. | Vintage de `notForSale`. |
| `art-archive/choppy/anoffer-mp189/anOffer-b-wide.replaced-mp189.jpg` | Sí. La figura de la izquierda repite el moño alto, la camisa clara y el short de `proposal-a-wide.jpg`. | Rechazada. No es vintage de ningún premio. |
| `chance/anOffer-a-wide.jpg` | No. Solo trajes. | Actual de `sellout`. |
| `art-archive/choppy/replaced-mp191/anOffer-a-wide.replaced-mp191.jpg` | No identificada como Lena. Hay una mujer de saco blanco y moño bajo, distinta del diseño de Lena. | Vintage de `sellout`, vetable por el dueño. |
| `chance/obviously-wide.jpg` | No. Nico y la mina. | Actual de `miner`. |
| `chance/citadelQuestion-a-wide.jpg` | No. Marek con casco de obra, Paco y albañiles. | Actual de `citadel`. |
| `art-archive/choppy/replaced-mp188/citadelQuestion-a-wide.jpg` | No. La misma obra. | Vintage de `citadel`. |
| `chance/citadelQuestion-wide.jpg` | No. Maqueta y figuras diminutas no identificables. | No se usa: es el plano, no la obra. |
| `chance/theQuestion-wide.jpg` | No. Marek y la lista. | Actual de `nodes100`. |
| `chance/theQuestion-a-wide.jpg` | No. Marek, Nico y Paco. | No se usa: es la elección, no el premio de los cien nodos ni el de la declaración. |
| `chance/declaration-wide.jpg` | No. La moneda de espaldas y el pueblo. | Actual de `declared`. |
| `chance/battleWon-wide.jpg` | No. Figuras lejanas, no identificables como Lena. | Actual de `beachHolds`. |
| `chance/fourthColor-wide.jpg` | No. El panadero, Marek y figuras de muelle sin el diseño de Lena. | Actual de `fourth`. |
| `chance/placeNow-wide.jpg` | No identificada. Una comensal de fondo no coincide con Lena. | No se usa: es el pueblo a cincuenta nodos. |
| `chance/stateVisit-wide.jpg` | No identificada. Una mujer de vestido claro entre el público no coincide con Lena. | No se usa: es un nodo diplomático. |
| `chance/protectIsland-c-wide.jpg` | No. Paco con chaleco. | No se usa: no es rechazar la ayuda militar. |
| `chance/proposal-a-wide.jpg`, `wedding-wide.jpg`, `wedding-c-wide.jpg`, `baby-wide.jpg`, `date-wide.jpg` | Lena sí está. | Solo familia. Prohibidas para `country`. |

`citadelProblem-wide.jpg` no se abrió para asignarla: el premio `citadel` es la obra de `citadelQuestion`, no la conversación del libro. Esa carta describe una corrida por las colinas y no debe reutilizarse si Marek apareciera en ropa de correr.

## Tabla

| award_id | categoría | secret | elegibilidad | rareza | ilustración actual | vintage |
| --- | --- | --- | --- | --- | --- | --- |
| `maxi` | trading | false | requiere arte nuevo | poco-comun | — | — |
| `nocoiner` | trading | false | requiere arte nuevo | comun | — | — |
| `paper` | trading | false | requiere arte nuevo | comun | — | — |
| `doubler` | trading | false | requiere arte nuevo | poco-comun | — | — |
| `tenx` | trading | false | requiere arte nuevo | rara | — | — |
| `dayTrader` | trading | false | requiere arte nuevo | poco-comun | — | — |
| `cap21` | trading | false | requiere arte nuevo | legendaria | — | — |
| `halver` | survival | false | requiere arte nuevo | poco-comun | — | — |
| `greedy` | survival | false | requiere arte nuevo | rara | — | — |
| `opsec` | survival | false | requiere arte nuevo | comun | — | — |
| `longHaul` | survival | false | requiere arte nuevo | poco-comun | — | — |
| `marathon` | survival | false | requiere arte nuevo | rara | — | — |
| `swanHunter` | survival | false | requiere arte nuevo | rara | — | — |
| `laserEyes` | survival | false | requiere arte nuevo | poco-comun | — | — |
| `maxedPerk` | perks | false | requiere arte nuevo | poco-comun | — | — |
| `perkHoarder` | perks | false | requiere arte nuevo | rara | — | — |
| `goodBud` | perks | false | requiere arte nuevo | poco-comun | — | — |
| `career` | perks | false | requiere arte nuevo | rara | — | — |
| `engaged` | family | true | ok | rara | chance/proposal-a-wide.jpg | — |
| `married` | family | true | ok | rara | chance/wedding-wide.jpg | art-archive/choppy/replaced-mp191/wedding-b-wide.replaced-mp191.jpg<br>art-archive/choppy/replaced-mp188/wedding-a-wide.jpg<br>art-archive/choppy/replaced-mp188/wedding-b-wide.jpg |
| `runaway` | family | true | ok | epica | chance/wedding-c-wide.jpg | art-archive/choppy/replaced-mp188/wedding-c-wide.jpg |
| `babyBoard` | family | true | ok | rara | chance/baby-wide.jpg | — |
| `familyOffice` | family | true | requiere arte nuevo | epica | — | — |
| `classicFartface` | family | true | requiere arte nuevo | rara | — | — |
| `landowner` | country | true | ok | rara | chance/islandInspection-a-wide.jpg | art-archive/choppy/replaced-mp188/islandInspection-a-wide.jpg<br>art-archive/choppy/replaced-mp191/islandInspection-wide.replaced-mp191.jpg |
| `notForSale` | country | true | ok | epica | chance/anOffer-b-wide.jpg | art-archive/choppy/replaced-mp191/anOffer-b-wide.replaced-mp191.jpg |
| `sellout` | country | true | ok | rara | chance/anOffer-a-wide.jpg | art-archive/choppy/replaced-mp191/anOffer-a-wide.replaced-mp191.jpg |
| `miner` | country | true | ok | rara | chance/obviously-wide.jpg | — |
| `citadel` | country | true | ok | rara | chance/citadelQuestion-a-wide.jpg | art-archive/choppy/replaced-mp188/citadelQuestion-a-wide.jpg |
| `nodes100` | country | true | ok | epica | chance/theQuestion-wide.jpg | — |
| `declared` | country | true | ok | epica | chance/declaration-wide.jpg | — |
| `beachHolds` | country | true | ok | epica | chance/battleWon-wide.jpg | — |
| `fourth` | country | true | ok | legendaria | chance/fourthColor-wide.jpg | — |
| `noAid` | country | true | requiere arte nuevo | legendaria | — | — |
| `freeNation` | country | true | requiere arte nuevo | epica | — | — |
| `chessWin` | challenge | true | ok | poco-comun | chance/chess-opera-wide.jpg | — |
| `chess3` | challenge | true | requiere arte nuevo | epica | — | — |
| `chess7` | challenge | true | requiere arte nuevo | legendaria | — | — |
| `scoop` | challenge | true | ok | rara | chance/poker-wide.jpg | — |
| `unicorn` | challenge | true | ok | rara | chance/startup-wide.jpg | — |
| `highRoller` | challenge | true | ok | rara | chance/casino-wide.jpg | — |
| `soldPump` | challenge | true | ok | rara | chance/cousin-wide.jpg | — |
| `regular` | meta | false | requiere arte nuevo | poco-comun | — | — |
| `veteran` | meta | false | requiere arte nuevo | epica | — | — |
| `collector` | meta | false | requiere arte nuevo | poco-comun | — | — |
| `curator` | meta | false | requiere arte nuevo | epica | — | — |

## Justificación y notas

### `maxi`

No vender en toda la partida no tiene carta. Ninguna ilustración de chance/ muestra ese gesto.

Encargo 1920x800: la moneda, con la bandana, delante de una vela roja, sin soltar el stack. Sin Lena, sin Tío Mike, sin marcas comerciales.

### `nocoiner`

No comprar BTC en la partida no tiene ilustración propia. wallet-wide.jpg es la billetera perdida en el autobús, otra historia.

Encargo 1920x800: la moneda vuela entre velas con las manos vacías y un billete, sin alcanzar una moneda de BTC.

### `paper`

Vender en un bear market no tiene carta ni archivo wide que lo muestre.

Encargo 1920x800: la moneda suelta BTC mientras una vela roja ocupa el fondo.

### `doubler`

Duplicar el patrimonio inicial en BTC es un resultado de partida, no una carta.

Encargo 1920x800: dos stacks iguales junto a la moneda, al cierre de una partida. Dinero de juego, sin cotización real.

### `tenx`

Multiplicar por diez el patrimonio inicial no tiene ilustración.

Encargo 1920x800: un stack cuya altura se lee como diez veces el stack de salida. Sin logos de mercado.

### `dayTrader`

Cincuenta operaciones en una partida no tienen carta.

Encargo 1920x800: un escritorio con muchos tickets pequeños y la moneda en el centro. Sin marca de exchange.

### `cap21`

Juntar 21M BTC es el tope de la partida y no tiene ilustración de carta. No reutilizar arte del arco de la independencia.

Encargo 1920x800: la moneda frente a un muro de monedas que se lea como el tope de 21M del juego. Dinero de juego.

### `halver`

Comer los halvings que salen es un objeto del vuelo, no una carta de chance/.

Encargo 1920x800: la moneda atrapa en el aire la ficha de halving del juego.

### `greedy`

El texto del premio habla de no comer halvings. No hay ilustración. El código de runAwardIds empuja este id cuando halvings spawn es 0, no cuando se esquivan. Eso queda fuera de esta fase.

Encargo 1920x800: la moneda pasa junto a una ficha de halving sin tocarla. No encargar hasta aclarar la condición del código.

### `opsec`

No perder cold storage no es la carta de la billetera del autobús (wallet-wide.jpg) ni la carta de phishing.

Encargo 1920x800: un dispositivo de cold storage cerrado, intacto, en las manos de la moneda.

### `longHaul`

Mil velas en una partida no tienen ilustración.

Encargo 1920x800: una cinta larga de velas detrás de la moneda.

### `marathon`

2.100 velas no tienen ilustración. No usar arte de carrera a pie: Marek no va en ropa deportiva, y este premio no es una carrera.

Encargo 1920x800: la misma cinta de velas, más larga, con la moneda todavía en el aire.

### `swanHunter`

Vaporizar tres cisnes negros es un evento del vuelo, sin carta.

Encargo 1920x800: tres siluetas de cisne oscuro disolviéndose. Sin gore.

### `laserEyes`

Agarrar ojos láser cinco veces no tiene ilustración de carta.

Encargo 1920x800: la moneda con ojos brillantes y cinco fichas pequeñas del power-up. No es el rostro de una persona real.

### `maxedPerk`

Llevar una perk a su tope no tiene una sola ilustración. Los tier 6 de oficio son de una profesión concreta y no valen para cualquier perk.

Encargo 1920x800: una fila de pips de perk llena hasta el último. Icono neutro, sin personaje de la historia.

### `perkHoarder`

Quince niveles de perk en una partida no tienen ilustración.

Encargo 1920x800: muchas fichas de perk, quince, en un bolso junto a la moneda.

### `goodBud`

El A.I. bud en ganancia no tiene carta. La regla de historia prohíbe mostrarlo eligiendo adopción.

Encargo 1920x800: el bud junto a un gráfico en positivo. Sin papeles de adopción y sin elegir un hogar.

### `career`

El premio es cualquier oficio al máximo. Hay diez archivos jobCareer*Tier6-wide.jpg (acting, athletic, aviation, culinary, diving, law, maritime, medical, music, science). Usar uno fijaría una profesión que el jugador puede no tener.

Encargo 1920x800: la moneda en lo alto de una escalera neutra o frente a una puerta sin nombre de oficio. Ropa de la escena, no ropa de correr. Decisión abierta: ediciones por pista usando los tier 6 ya dibujados.

### `engaged`

La carta proposal, opción a, es la que deja el compromiso. proposal-a-wide.jpg es el arte posterior: la moneda ofrece el anillo junto al lago. proposal-wide.jpg es el momento anterior, sin la pregunta.

Lena está en la imagen. Es arco de familia, no de independencia. No hay archivo replaced de proposal-a. Metadatos públicos sin la frase de la escena.

### `married`

El premio se otorga con la boda grande o la pequeña (opciones a y b). wedding-wide.jpg es la ceremonia compartida. wedding-a-wide.jpg y wedding-b-wide.jpg son los dos festejos y no deben ser la única imagen canónica.

Vintage: festejo pequeño reemplazado en mp191 y las dos bodas archivadas en replaced-mp188. Lena aparece; es familia. La opción c es otro premio.

### `runaway`

La opción c de wedding es irse de la boda. wedding-c-wide.jpg muestra a la moneda con el bolso, de noche, y a Lena en la puerta. Es el arte de esa elección.

Vintage: replaced-mp188/wedding-c-wide.jpg. Lena está en la puerta. Arco de familia. Metadatos públicos sin el diálogo.

### `babyBoard`

Cualquier opción de la carta baby otorga este premio. baby-wide.jpg es la llegada, en la habitación. No hay baby-a, baby-b ni baby-c wide.

La misma imagen no distingue las tres opciones. Las otras dos tienen premio propio y piden arte nuevo. Lena está; es familia.

### `familyOffice`

La opción a de baby aparta dinero y un dispositivo de cold storage. baby-wide.jpg muestra la llegada y no el dispositivo. No hay otra imagen.

Encargo 1920x800: la habitación de baby-wide, con un dispositivo cerrado sobre la mesa de lado. Lena puede aparecer: es familia. No mostrar las otras opciones.

### `classicFartface`

La opción c de baby no tiene arte posterior propio. baby-wide.jpg es la llegada, no esa elección.

Encargo 1920x800: Lena mira una hoja impresa y la moneda se encoge. No escribir la frase de la escena en la imagen. Metadatos públicos sin esa frase.

### `landowner`

La opción a de islandInspection es comprar la isla. El wide de la opción muestra la bandera en el alto, con Marek, Nico y Paco. islandInspection-wide.jpg es la visita, antes de comprar.

Inspección: sin Lena en el actual, en replaced-mp188/islandInspection-a-wide.jpg y en islandInspection-wide.replaced-mp191.jpg (solo la moneda). El fondo del actual ya muestra un pueblo amurallado; es un anacronismo de arte, no una aparición de Lena.

### `notForSale`

La opción b de anOffer rechaza la venta. anOffer-b-wide.jpg es el rechazo en la cubierta, con el contrato cerrado, Nico y Paco.

Inspección del actual y de anOffer-b-wide.replaced-mp191.jpg: sin Lena. Rechazado y no listado como vintage: art-archive/choppy/anoffer-mp189/anOffer-b-wide.replaced-mp189.jpg . Esa imagen repite el moño alto, la camisa clara y el short de Lena en proposal-a-wide.jpg.

### `sellout`

La opción a de anOffer vende la isla. anOffer-a-wide.jpg es el apretón de manos sobre el contrato, en el yate.

Inspección del actual: solo trajes, sin Lena. Vintage mp191: hay una mujer de saco blanco y moño bajo. No coincide con Lena (pelo largo suelto en date, wedding y baby, o moño alto y short en proposal-a). Queda como vintage y el dueño puede vetarla.

### `miner`

La opción a de obviously enciende la mina. obviously-wide.jpg muestra los contenedores de máquinas, a Nico con el portapapeles y a la moneda. No hay archivo replaced de esta carta.

Inspección: sin Lena. El JPEG pesa 420594 bytes, por encima del margen de 390000 unidades de peso de un relay estándar. La derivada pequeña es obligatoria para inscribir este archivo.

### `citadel`

La opción a de citadelQuestion construye la ciudadela. El arte posterior es la obra, con Marek en casco de la escena. citadelQuestion-wide.jpg es la maqueta, antes de construir. citadelProblem-wide.jpg es el libro, no la obra.

Inspección del actual y de replaced-mp188/citadelQuestion-a-wide.jpg: sin Lena. Marek va con ropa de obra, acorde a la escena. La maqueta citadelQuestion-wide.jpg se abrió: figuras diminutas, ninguna identificable como Lena; no se usa porque no es la ciudadela construida.

### `nodes100`

La carta theQuestion solo aparece al llegar a 100 nodos. theQuestion-wide.jpg es esa mesa, con la lista y un casillero vacío. placeNow-wide.jpg es el pueblo a 50 nodos. stateVisit-wide.jpg es un nodo diplomático, no cien.

Inspección: sin Lena. placeNow tiene una comensal de fondo con pelo oscuro que no es el diseño de Lena; no se usa. stateVisit tiene una mujer de vestido claro entre el público, tampoco el diseño de Lena; no se usa. theQuestion-a-wide.jpg es la firma de la elección y queda para no confundirla con declared.

### `declared`

El premio es publicar la declaración. declaration-wide.jpg es esa firma, de espaldas, sobre el pueblo. theQuestion-a-wide.jpg es la elección anterior.

Inspección: sin Lena. No hay archivo replaced de declaration-wide.jpg. theQuestion-a-wide.jpg se abrió (Marek, Nico, Paco): sin Lena, y no se asigna para no duplicar la firma.

### `beachHolds`

La carta battleWon se llama como el premio: el desembarco rechazado. battleWon-wide.jpg es la playa con la lancha varada. Los battle-*-win son la caída de un bloque, un beat distinto.

Inspección: figuras lejanas en la arena, no identificables como Lena. El JPEG pesa 390223 bytes, en el límite de relay; inscribir la derivada, no el original.

### `fourth`

El premio se otorga en la carta fourthColor. fourthColor-wide.jpg es la mañana siguiente, con la panadería abierta, Marek y la moneda. No hay otro archivo de ese beat.

Inspección: el panadero y Marek. Las figuras del muelle no tienen el diseño de Lena. No reutilizar esta imagen para freeNation.

### `noAid`

El premio es ganar la independencia con bcAidUsed en cero. No hay carta ni archivo de rechazar la ayuda militar de pago. protectIsland es el plan local de seguridad, antes de la guerra.

Encargo 1920x800: la moneda en la orilla, con la palma abierta, rechaza un cajón que baja de un bote. Marek con chaqueta de la escena, no ropa deportiva. Paco puede estar. Sin Lena. Sin bandera de un país real. El cajón va sin marcas. protectIsland-c-wide.jpg se abrió: Paco con chaleco, sin Lena, y es otra elección.

### `freeNation`

El premio es elegir seguir jugando en fourthColor. La ilustración de esa carta es la mañana de la victoria y ya está asignada a fourth. No hay una imagen de seguir operando después.

Encargo 1920x800: la moneda otra vez entre velas, con una bandera pequeña de la isla en el horizonte. Distinta de la panadería de fourthColor. Sin Lena.

### `chessWin`

El premio es resolver un problema del pool. La imagen canónica es la del palco de la ópera, que es el problema emblema. Muestra la posición y no escribe la jugada. chess-wide.jpg es el tablero genérico de respaldo, no este problema.

Inspección: posición en el palco, sin flechas ni jugada escrita. Los metadatos no llevan la línea. No hay replaced de opera. chess-wide.replaced-mp191.jpg es otro tablero y no es vintage de esta imagen. Decisión abierta: emitir la imagen del problema que el jugador resolvió, entre los siete, siempre sin la jugada.

### `chess3`

Resolver tres problemas distintos no cabe en un solo tablero de los siete. Usar uno afirmaría un problema que el jugador puede no haber visto.

Encargo 1920x800: tres posiciones del pool, solo piezas, sin flechas, sin notación y sin la jugada. Placas: chess-opera, chess-immortal y chess-evergreen wide.

### `chess7`

Los siete problemas tienen cada uno su wide. No existe una imagen de los siete juntos. Un solo tablero no representa el salón completo.

Encargo 1920x800: siete tableros en una pared, posiciones solas, sin la jugada. Placas vivas: chess-opera, immortal, evergreen, saavedra, kinghunt, goldcoins, century. Archivo anterior de cuatro de ellos: replaced-mp192/chess-saavedra-wide.replaced-mp192.jpg, chess-kinghunt-wide.replaced-mp192.jpg, chess-goldcoins-wide.replaced-mp192.jpg, chess-century-wide.replaced-mp192.jpg. Esas cuatro no son la edición de este premio.

### `scoop`

El premio sale de la carta poker, en el resultado de llevarse la mesa. poker-wide.jpg es la mesa de esa carta, con Marek. No hay arte posterior del pozo ganado.

La imagen es la mesa, no el pozo ya ganado. Sirve como emblema de la carta. No revela una línea de juego fuera de las dos cartas visibles de la ilustración.

### `unicorn`

El premio sale de la carta startup cuando el proyecto llega a lanzar. startup-wide.jpg es esa reunión, con Nico y el portátil. No hay una imagen del lanzamiento aparte.

Inspección: una comensal de fondo, de espaldas, no es Lena. La imagen es la propuesta, no el lanzamiento. Decisión abierta si más adelante se encarga el momento del envío.

### `highRoller`

El premio sale de la apuesta grande de la carta casino. casino-wide.jpg es el salón de esa carta. No hay una ruleta ni un número pintado aparte.

La imagen es una mesa de cartas dentro del salón, no el número de la apuesta. Es el único arte de la carta. Encargo opcional posterior: la rueda, sin marcas de casino real.

### `soldPump`

El premio sale de la carta cousin, el token de Nico, cuando la salida es con ganancia. cousin-wide.jpg es esa oferta. No hay arte del momento de vender.

La imagen es la oferta en el teléfono, no la venta. Es el único arte del beat. El símbolo de la pantalla no es una marca real. Encargo opcional: la moneda alejándose de un gráfico que sube.

### `regular`

Diez partidas ranked de 420 velas o más no tienen ilustración.

Encargo 1920x800: diez marcas de partida en una pared y la moneda repasándolas. Sin escenas secretas.

### `veteran`

Cincuenta partidas ranked largas no tienen ilustración.

Encargo 1920x800: la misma pared, con cincuenta marcas ya gastadas. Sin escenas secretas.

### `collector`

Juntar diez premios no tiene ilustración. Un collage de cartas secretas revelaría beats no obtenidos.

Encargo 1920x800: un estante con diez medallas lisas. Sin Lena, sin Tío Mike, sin escenas de cartas secretas.

### `curator`

Juntar veinticinco premios no tiene ilustración. Misma restricción que collector: el arte público no puede mostrar premios secretos.

Encargo 1920x800: un estante más largo, veinticinco medallas lisas, con las mismas exclusiones.
