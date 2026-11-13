# Arc card TLDR review (mp231)

Rewrite of every arc-card TLDR so each one is as short as possible—ideally one brief sentence—without turning into nonsense or dropping essential plot. English and Spanish stay equivalent. Spanish is neutral (tú, not voseo). Card body text, choices, and mechanics are unchanged.

The work starts with the fine cards (`speeding`, `tow`), which barely compressed the body before.

`firstBloc`, `rearmament`, and `threeColors` TLDRs are generated at runtime because each run draws three of four blocs. The table shows the default order (Meridian Pact, Red Ledger, Crown Lattice). Member-country lists moved out of the TLDR; the full names stay in the card body. Other bloc combinations use the same short templates with that run's bloc names.

Battle briefing and after-action TLDRs (`blocAssault`, `battleWon`) and the dynamic `blocTriumph` line were already short, so they were left as they are. Job-career TLDRs were already one compact sentence each and were left unchanged.

## Summary

| | |
|---|---:|
| TLDR lines reviewed (EN+ES) | 186 |
| Lines changed | 115 |
| Lines left unchanged | 71 |
| Unique cards with a change | 58 |
| Average length, changed lines, before | 133.9 |
| Average length, changed lines, after | 94.0 |
| Average reduction, changed lines | 39.9 characters (29.8%) |
| Average length, all reviewed lines, before | 106.2 |
| Average length, all reviewed lines, after | 81.5 |
| Average reduction, all reviewed lines | 24.7 characters |

Reviewed set: 62 chance/arc cards × 2 languages, plus `blocReplies` × 2, plus 30 job-career cards × 2. The 20 already-short battle briefing / after-action lines are listed below and were not rewritten.

## Fine cards

These are the cases the request called out: TLDRs that almost restated the card, starting with the one where Choppy is fined.

| card id | lang | before | after | chars before→after |
|---|---|---|---|---|
| `speeding` | EN | Six miles per hour over the limit, on the same corner, with the same officer. He recognizes you before you lower the window. | The same officer stops you again, barely over the limit on the same corner. | 124→75 (−49) |
| `speeding` | ES | Diez kilómetros por hora por encima del límite, en la misma esquina y con el mismo oficial. Te reconoce antes de que bajes la ventanilla. | El mismo oficial te detiene otra vez, apenas por encima del límite, en la misma esquina. | 137→88 (−49) |
| `tow` | EN | A nine-minute coffee stop in a no-parking zone ends with a ticket and a tow truck idling behind your car. | A quick coffee in a no-parking zone leaves you a ticket and a waiting tow truck. | 105→80 (−25) |
| `tow` | ES | Una parada de nueve minutos por un café en zona prohibida termina en multa, con una grúa esperando detrás. | Un café rápido en zona prohibida te deja una multa y una grúa esperando. | 106→72 (−34) |
| `taxbill` | EN | The quarterly tax bill arrives. You check the total twice in case it was blurry. It was not. | The quarterly tax bill is no smaller on a second look. | 92→54 (−38) |
| `taxbill` | ES | Llega la factura trimestral de impuestos. Revisas el total dos veces por si estaba borroso. No lo estaba. | La factura trimestral de impuestos no se reduce al mirarla otra vez. | 105→68 (−37) |

## All rewritten TLDRs

| card id | lang | before | after | chars before→after |
|---|---|---|---|---|
| `speeding` | EN | Six miles per hour over the limit, on the same corner, with the same officer. He recognizes you before you lower the window. | The same officer stops you again, barely over the limit on the same corner. | 124→75 (−49) |
| `speeding` | ES | Diez kilómetros por hora por encima del límite, en la misma esquina y con el mismo oficial. Te reconoce antes de que bajes la ventanilla. | El mismo oficial te detiene otra vez, apenas por encima del límite, en la misma esquina. | 137→88 (−49) |
| `tow` | EN | A nine-minute coffee stop in a no-parking zone ends with a ticket and a tow truck idling behind your car. | A quick coffee in a no-parking zone leaves you a ticket and a waiting tow truck. | 105→80 (−25) |
| `tow` | ES | Una parada de nueve minutos por un café en zona prohibida termina en multa, con una grúa esperando detrás. | Un café rápido en zona prohibida te deja una multa y una grúa esperando. | 106→72 (−34) |
| `taxbill` | EN | The quarterly tax bill arrives. You check the total twice in case it was blurry. It was not. | The quarterly tax bill is no smaller on a second look. | 92→54 (−38) |
| `taxbill` | ES | Llega la factura trimestral de impuestos. Revisas el total dos veces por si estaba borroso. No lo estaba. | La factura trimestral de impuestos no se reduce al mirarla otra vez. | 105→68 (−37) |
| `justInCase` | EN | A new emergency law widens government power whenever the economy looks unstable. They call it temporary. The definition seems to cover most years. | A new “temporary” emergency law widens government power whenever the economy looks unstable. | 146→92 (−54) |
| `justInCase` | ES | Una nueva ley de emergencia amplía las facultades del Estado ante la inestabilidad económica. La llaman temporal, aunque la definición parece abarcar casi todos los años. | Una nueva ley de emergencia «temporal» amplía las facultades del Estado cuando la economía se ve inestable. | 170→107 (−63) |
| `nothingToHide` | EN | An optional digital ID spreads to airports, banks, and public services. A TV host asks what the problem is. | An optional digital ID spreads everywhere, and a TV host asks what the problem is. | 107→82 (−25) |
| `nothingToHide` | ES | Un documento digital opcional se extiende a aeropuertos, bancos y servicios públicos. Un presentador pregunta cuál es el problema. | Un documento digital opcional se extiende a todas partes, y un presentador pregunta cuál es el problema. | 130→104 (−26) |
| `somethingBetter` | EN | On a walk with Marek and Paco you say that, with enough money, you could build something better than a company or a charity. You do not yet know what. | You tell Marek you could build something better than a company or a charity; you do not yet know what. | 150→102 (−48) |
| `somethingBetter` | ES | Mientras caminas con Marek y Paco, dices que con suficiente dinero podrías construir algo mejor que una empresa o una organización benéfica. Aún no sabes qué sería. | Le dices a Marek que podrías construir algo mejor que una empresa o una organización benéfica; aún no sabes qué sería. | 164→118 (−46) |
| `timeTraveler` | EN | An old post claims to be from a future of citadels. A search turns up a self-published book, THE BITCOIN STATE, for $666. | An old post about a future of citadels leads to a self-published book, THE BITCOIN STATE, for $666. | 121→99 (−22) |
| `timeTraveler` | ES | Una publicación antigua describe un futuro de ciudadelas y gobiernos debilitados. La búsqueda te lleva a un libro autoeditado, THE BITCOIN STATE, por $666. | Una publicación antigua sobre un futuro de ciudadelas te lleva a un libro autoeditado, THE BITCOIN STATE, por $666. | 155→115 (−40) |
| `temporaryMeasures` | EN | A financial emergency brings transfer limits and payment apps that stop working. Officials promise ninety days; the previous temporary measures are entering their fourth year. | A financial emergency brings transfer limits, promised for ninety days; the last temporary measures are entering their fourth year. | 175→131 (−44) |
| `temporaryMeasures` | ES | Una emergencia financiera impone límites a las transferencias y al efectivo, y varias aplicaciones de pago dejan de funcionar. Las autoridades prometen noventa días; las medidas temporales anteriores están por cumplir cuatro años. | Una emergencia financiera impone límites a las transferencias, prometidos por noventa días; las últimas medidas temporales van por su cuarto año. | 230→145 (−85) |
| `citadelProblem` | EN | You tell Marek you want to build a country. He laughs, then asks how much land, and adds a flag to your list. | You tell Marek you want to build a country; he laughs, then asks how much land and adds a flag. | 109→95 (−14) |
| `citadelProblem` | ES | Le dices a Marek que quieres construir un país. Se ríe, pero luego pregunta cuánta tierra y agrega una bandera a tu lista. | Le dices a Marek que quieres construir un país; se ríe, pero luego pregunta cuánta tierra y agrega una bandera. | 122→111 (−11) |
| `pieceWorld` | EN | Nico finds a listing for an isolated island that calls itself a sovereign opportunity. It is not sovereign. | Nico finds an island listed as a sovereign opportunity; it is not. | 107→66 (−41) |
| `pieceWorld` | ES | Nico encuentra el anuncio de una isla aislada que se presenta como una oportunidad para una vida soberana. La isla no es soberana. | Nico encuentra una isla anunciada como oportunidad soberana; no lo es. | 130→70 (−60) |
| `islandInspection` | EN | At sunrise the island is more beautiful than the listing. At sunset the seller's offer arrives. | The island is more beautiful than the listing; at sunset, the seller's offer arrives. | 95→85 (−10) |
| `islandInspection` | ES | Al amanecer, la isla resulta más hermosa que en el anuncio. Después de recorrerla, al atardecer llega la oferta del vendedor. | La isla es más hermosa que en el anuncio; al atardecer llega la oferta del vendedor. | 125→84 (−41) |
| `paperwork` | EN | Lawyers turn the purchase into something that looks serious. Nico signs in the wrong place. Paco eats a corner of the last page. | Lawyers formalize the purchase; Nico signs in the wrong place, and Paco eats a corner of the last page. | 128→103 (−25) |
| `paperwork` | ES | Los abogados formalizan la compra. Nico firma donde no corresponde y Paco se come una esquina del documento final. | Los abogados formalizan la compra; Nico firma donde no corresponde y Paco se come una esquina de la última página. | 114→114 (−0) |
| `nobodyKnows` | EN | You have land and paperwork, and almost no reason for anyone to care. The only name you are given is Madame Luck. | You have land and paperwork, but almost no one has a reason to care; the only name you get is Madame Luck. | 113→106 (−7) |
| `nobodyKnows` | ES | Tienes tierra y documentos, pero aún no tienes ciudadanos, reconocimiento ni atención. La única pista es Madame Luck. | Tienes tierra y documentos, pero casi nadie tiene motivo para interesarse; el único nombre que te dan es Madame Luck. | 117→117 (−0) |
| `theOg` | EN | Madame Luck asks very good questions, says she will tell some people, and your phone starts vibrating. | Madame Luck asks sharp questions, says she will tell some people, and your phone starts vibrating. | 102→98 (−4) |
| `theOg` | ES | Madame Luck hace preguntas muy acertadas, dice que hablará del proyecto con algunas personas y tu teléfono empieza a vibrar. | Madame Luck hace preguntas agudas, dice que hablará con algunas personas y tu teléfono empieza a vibrar. | 124→104 (−20) |
| `peopleAsking` | EN | People ask if they can move in. Nico makes a spreadsheet. There are no houses. | People want to move in; Nico makes a list, but there are no houses. | 78→67 (−11) |
| `peopleAsking` | ES | Desarrolladores, mineros y familias quieren mudarse a la isla. Nico organiza los nombres, pero Marek señala que no hay viviendas. | La gente quiere mudarse, pero mientras Nico arma una lista, Marek señala que no hay viviendas. | 129→94 (−35) |
| `extensionCord` | EN | The new residents bring more machines than the island can feed. The lights go out. Someone asks who was mining. | New residents overload the island's power, the lights go out, and someone asks who was mining. | 111→94 (−17) |
| `extensionCord` | ES | Los nuevos residentes conectan más equipos de los que la isla puede abastecer. La energía se corta y alguien pregunta quién estaba minando. | Los nuevos residentes sobrecargan la energía de la isla, se corta la luz y alguien pregunta quién estaba minando. | 139→113 (−26) |
| `obviously` | EN | The grid works. Nico says you should mine Bitcoin. The proposal is four words: cheap power, we mine. | With the grid working, Nico's proposal is four words: cheap power, we mine. | 100→75 (−25) |
| `obviously` | ES | La red eléctrica funciona y Nico propone minar Bitcoin. Su propuesta se resume en cuatro palabras: energía barata, minamos Bitcoin. | Con la red ya funcionando, la propuesta de Nico es de cuatro palabras: energía barata, minamos. | 131→95 (−36) |
| `stateVisit` | EN | San Arnaldo, whose government sits in a former restaurant, asks for a Bitcoin node; you could gain your first ally. | San Arnaldo, run from a former restaurant, asks for a Bitcoin node and could become your first ally. | 115→100 (−15) |
| `stateVisit` | ES | San Arnaldo, cuyo gobierno funciona en un antiguo restaurante, pide un nodo de Bitcoin; podrías ganar tu primer aliado. | San Arnaldo, cuyo gobierno funciona en un antiguo restaurante, pide un nodo de Bitcoin y podría ser tu primer aliado. | 119→117 (−2) |
| `firstBloc` | EN | Germany, France, Italy, Spain, the Netherlands, Belgium, and Austria form the Meridian Stability Pact. Its language is administrative; its restrictions are not optional. | The Meridian Pact is formed; its restrictions are not optional. | 169→63 (−106) |
| `firstBloc` | ES | Alemania, Francia, Italia, España, los Países Bajos, Bélgica y Austria forman el Pacto de Estabilidad Meridiano. Su lenguaje es administrativo, pero sus restricciones no son opcionales. | Se forma el Pacto Meridiano; sus restricciones no son opcionales. | 185→65 (−120) |
| `protectIsland` | EN | A boat disappears from the dock overnight. One camera caught nothing, and Paco slept through it. The island now needs a security plan. | A boat vanishes overnight while Paco sleeps, and the island now needs a security plan. | 134→86 (−48) |
| `protectIsland` | ES | Un bote desaparece del muelle durante la noche. La única cámara no registró nada y Paco no despertó. La isla necesita un plan de seguridad. | Un bote desaparece durante la noche mientras Paco duerme, y la isla necesita un plan de seguridad. | 139→98 (−41) |
| `placeNow` | EN | At fifty nodes, the island gains a coffee shop, a bakery, a bar, and a newspaper. Its first editorial criticizes you. Nico calls that progress. | At fifty nodes the island has shops and a newspaper whose first editorial criticizes you; Nico calls that progress. | 143→115 (−28) |
| `placeNow` | ES | Al alcanzar cincuenta nodos, la isla ya tiene cafetería, panadería, bar y periódico. Su primer editorial te critica. Nico considera que eso es progreso. | Al llegar a cincuenta nodos, la isla tiene comercios y un periódico que te critica; Nico lo llama progreso. | 152→107 (−45) |
| `citadelQuestion` | EN | Marek proposes a citadel with protected power, walls, and a hardened center. It could defend the community, but it would also turn their home into a fortress. | Marek proposes a citadel that could defend the community—or turn its home into a fortress. | 158→90 (−68) |
| `citadelQuestion` | ES | Marek propone una ciudadela con energía protegida, muros y un centro reforzado. Podría defender a la comunidad, pero también convertiría su hogar en una fortaleza. | Marek propone una ciudadela que podría defender a la comunidad, o convertir su hogar en una fortaleza. | 163→102 (−61) |
| `rearmament` | EN | The Meridian Pact announces a frigate program and calls it maintenance. Russia, Belarus, China, North Korea, and Cuba answer by forming the Red Ledger Compact. Both blocs begin building warships. | The Meridian Pact announces a frigate program and calls it maintenance. The Red Ledger answers, and both start building warships. | 195→129 (−66) |
| `rearmament` | ES | El Pacto Meridiano anuncia un programa de fragatas y lo llama mantenimiento. Rusia, Bielorrusia, China, Corea del Norte y Cuba responden con el Compacto del Libro Rojo. Ambos bloques comienzan a construir buques de guerra. | El Pacto Meridiano anuncia un programa de fragatas y lo llama mantenimiento. El Libro Rojo responde, y ambos empiezan a construir buques de guerra. | 222→147 (−75) |
| `anOffer` | EN | A private consortium offers {offer} for the island and everything built on it. Selling would secure the profit and end Bitcoin Country. Madame Luck asks why you began. | A consortium offers {offer} for the island; selling would end Bitcoin Country, and Madame Luck asks why you began. | 167→114 (−53) |
| `anOffer` | ES | Un consorcio privado ofrece {offer} por la isla y todo lo construido en ella. Vender aseguraría la ganancia y pondría fin a Bitcoin Country. Madame Luck pregunta por qué comenzaste. | Un consorcio ofrece {offer} por la isla; vender pondría fin a Bitcoin Country, y Madame Luck pregunta por qué comenzaste. | 181→121 (−60) |
| `ambassador` | EN | An ambassador makes an unofficial visit, inspects the island, and leaves a direct number. If Bitcoin Country becomes more than a project, she wants the first call. | An ambassador inspects the island unofficially and leaves a number: call her first if this becomes more than a project. | 163→119 (−44) |
| `ambassador` | ES | Una embajadora realiza una visita extraoficial, recorre la isla y deja un número directo. Si Bitcoin Country se convierte en algo más que un proyecto, quiere recibir la primera llamada. | Una embajadora recorre la isla de forma extraoficial y deja un número: llámala primero si esto llega a ser más que un proyecto. | 185→127 (−58) |
| `threeColors` | EN | Saudi Arabia, Jordan, Morocco, Thailand, and Brunei form the Crown Lattice, the third bloc surrounding Bitcoin Country. To High Warden Soren Pell, a people who will not kneel is an administrative error. | The Crown Lattice becomes the third bloc surrounding Bitcoin Country. | 202→69 (−133) |
| `threeColors` | ES | Arabia Saudita, Jordania, Marruecos, Tailandia y Brunéi forman la Celosía de la Corona, el tercer bloque que rodea a Bitcoin Country. Para el Alto Guardián Soren Pell, un pueblo que no se arrodilla es un error administrativo. | La Celosía de la Corona se convierte en el tercer bloque que rodea a Bitcoin Country. | 225→85 (−140) |
| `ortegaCalls` | EN | Mr Ortega & Gambette has a ninety-three-page diplomatic package covering recognition, treaties, fisheries, and protocol. He offers the complete service, or a shorter review that may still help. | Ortega & Gambette offers a 93-page diplomatic package, or a shorter review that may still help. | 193→95 (−98) |
| `ortegaCalls` | ES | El señor Ortega & Gambette ofrece un paquete diplomático de 93 páginas sobre reconocimiento, tratados, pesca y protocolo. Ofrece el servicio completo, aunque una revisión más breve también podría ayudar. | Ortega & Gambette ofrece un paquete diplomático de 93 páginas, o una revisión más breve que aún podría ayudar. | 203→110 (−93) |
| `theQuestion` | EN | Land, power, water, people, money, rules, security, and recognition are checked off, or close enough. Only one line remains: independence. Declaring it will turn the project into a country—and make the three blocs respond. | The checklist is complete enough; only independence remains, and declaring it will force the three blocs to respond. | 222→116 (−106) |
| `theQuestion` | ES | Tierra, energía, agua, población, dinero, normas, seguridad y reconocimiento ya están marcados, o casi. Solo queda una línea: independencia. Declararla convertirá el proyecto en un país y obligará a los tres bloques a responder. | La lista está lo bastante completa; solo queda la independencia, y declararla obligará a los tres bloques a responder. | 228→118 (−110) |
| `cabinet` | EN | Bitcoin Country forms its first cabinet: you become Head of State, Marek takes Finance, Nico takes Commerce, and Paco becomes Minister of Defense. Madame Luck declines a ministry. | Bitcoin Country names you Head of State, Marek Finance, Nico Commerce, and Paco Defense; Madame Luck declines a ministry. | 179→121 (−58) |
| `cabinet` | ES | Bitcoin Country forma su primer gabinete: asumes la jefatura de Estado, Marek asume Finanzas, Nico se encarga de Comercio y Paco se convierte en ministro de Defensa. Madame Luck rechaza un ministerio. | Bitcoin Country te nombra jefe de Estado, a Marek Finanzas, a Nico Comercio y a Paco Defensa; Madame Luck rechaza un ministerio. | 200→128 (−72) |
| `declaration` | EN | The declaration is signed and published. San Arnaldo recognizes Bitcoin Country thirty-seven seconds later. Ortega replies with a thumbs-up and a fourteen-page protocol memo. | You publish the declaration; San Arnaldo recognizes you in 37 seconds, and Ortega sends a thumbs-up plus a 14-page memo. | 174→120 (−54) |
| `declaration` | ES | La declaración queda firmada y publicada. San Arnaldo reconoce a Bitcoin Country 37 segundos después. Ortega responde con un pulgar arriba y un memorando de protocolo de 14 páginas. | Publicas la declaración; San Arnaldo te reconoce en 37 segundos, y Ortega envía un pulgar arriba y un memorando de 14 páginas. | 181→126 (−55) |
| `theAnswer` | EN | The blocs use different words, but their answer is the same: Bitcoin Country will not be allowed to stand outside their map. Their fleets are already moving. | Whatever words they use, the blocs will not let Bitcoin Country stand, and their fleets are already moving. | 157→107 (−50) |
| `theAnswer` | ES | Los bloques usan palabras distintas, pero su respuesta es la misma: no permitirán que Bitcoin Country permanezca fuera de su mapa. Sus flotas ya están en movimiento. | Usen las palabras que usen, los bloques no dejarán en pie a Bitcoin Country, y sus flotas ya están en movimiento. | 165→113 (−52) |
| `fourthColor` | EN | All three blocs attacked and failed. The island still stands: Bitcoin Country is independent. | All three blocs failed; the island still stands, and Bitcoin Country is independent. | 93→84 (−9) |
| `fourthColor` | ES | Los tres bloques atacaron y fracasaron. La isla sigue en pie: Bitcoin Country es independiente. | Los tres bloques fracasaron; la isla sigue en pie, y Bitcoin Country es independiente. | 95→86 (−9) |
| `landfill` | EN | At 1:14 a.m., Nico wants a partner to dig up a hard drive that supposedly holds 8,000 BTC. Lena threatens to call you Fartface if you fund it. | Nico wants a partner to dig up 8,000 BTC; Lena threatens to call you Fartface if you fund it. | 142→93 (−49) |
| `landfill` | ES | A la 1:14 a. m., Nico busca un socio para desenterrar un disco duro que supuestamente guarda 8000 BTC. Lena amenaza con llamarte Cara de Pedo si lo financias. | Nico busca un socio para desenterrar 8000 BTC; Lena amenaza con llamarte Cara de Pedo si lo financias. | 158→102 (−56) |
| `nicoWedding` | EN | At Nico's 400-guest wedding, you recognize twelve people. Lena warns you about his schemes before you choose a gift. | At Nico's packed wedding, Lena warns you about his schemes before you choose a gift. | 116→84 (−32) |
| `nicoWedding` | ES | En la boda de Nico hay 400 invitados y solo reconoces a doce. Lena te advierte sobre sus planes antes de que elijas un regalo. | En la boda masiva de Nico, Lena te advierte sobre sus planes antes de que elijas un regalo. | 126→91 (−35) |
| `mexico` | EN | Lena wants five days in Tulum; you would settle for three. Paco has already voted. | Lena wants five days in Tulum; you would take three, and Paco has already voted. | 82→80 (−2) |
| `flu` | EN | Lena wakes with the flu. You spend the day bringing her water, medicine, and soup; Paco quietly eats half the soup. | You spend the day nursing Lena's flu; Paco quietly eats half the soup. | 115→70 (−45) |
| `flu` | ES | Lena despierta con gripe. Pasas el día llevándole agua, medicinas y sopa; Paco se come la mitad de la sopa sin que ella lo note. | Pasas el día cuidando la gripe de Lena; Paco se come la mitad de la sopa sin que lo note. | 128→89 (−39) |
| `phish` | EN | Support emails you about a problem with your account. To verify your identity, it asks you to enter your seed phrase. | A support email asks you to enter your seed phrase to verify your account. | 117→74 (−43) |
| `phish` | ES | Soporte te escribe por un problema con tu cuenta. Para verificar tu identidad, te pide ingresar tu frase semilla. | Un correo de soporte te pide ingresar tu frase semilla para verificar tu cuenta. | 113→80 (−33) |
| `crash` | EN | A delivery rider bumps your car at a red light and apologizes six times. You apologize twice without knowing why. | A delivery rider bumps your car and apologizes six times; you apologize twice. | 113→78 (−35) |
| `crash` | ES | Un repartidor en moto te choca el auto en un semáforo y se disculpa seis veces. Tú te disculpas dos, sin saber por qué. | Un repartidor te choca el auto y se disculpa seis veces; tú te disculpas dos. | 119→77 (−42) |
| `wine` | EN | Friday at Marek's is wine and 12 Monkeys on pause. The talk turns to A.I., as usual. Neither of you wins. | Friday wine at Marek's turns, as usual, into an argument about A.I. that neither of you wins. | 105→93 (−12) |
| `wine` | ES | Una noche de vino y 12 Monkeys en casa de Marek termina en otra discusión sobre la IA y el futuro. Ninguno convence al otro. | El vino del viernes en casa de Marek termina, como siempre, en una discusión sobre la IA que nadie gana. | 124→104 (−20) |
| `casino` | EN | Nico calls late. He found a table at a casino and has already decided the game is interesting. | Nico calls late from a casino; he has already picked a game, and you go anyway. | 94→79 (−15) |
| `casino` | ES | Nico llama tarde desde un casino y ya eligió un juego. Deberías hacer más preguntas, pero vas igual. | Nico llama tarde desde un casino; ya eligió un juego, y tú vas igual. | 100→69 (−31) |
| `poker` | EN | Marek invites you to a late poker game with people he knows. It is not a casino. He nods at the empty chair: are you playing? | Marek invites you to a late private poker game and nods at the empty chair. | 125→75 (−50) |
| `poker` | ES | Marek te invita a una partida de póker de madrugada con gente conocida. No es un casino. Señala la silla vacía: ¿juegas? | Marek te invita a un póker privado de madrugada y señala la silla vacía. | 120→72 (−48) |
| `school` | EN | Nico's daughter Sofi has a school trip to the Mint Museum, and money is tight at home. Lena wants you to chip in. | Nico's daughter Sofi needs help paying for a school trip, and Lena wants you to chip in. | 113→88 (−25) |
| `school` | ES | Sofi, la hija de Nico, tiene una excursión al museo de la Casa de Moneda y en su casa no alcanza. Lena quiere que ayudes. | Sofi, la hija de Nico, necesita ayuda para una excursión escolar, y Lena quiere que aportes. | 121→92 (−29) |
| `roof` | EN | Paco finds the leak and sits under it. When the workers arrive, he finds another place to sit. | Paco sits under the leak, then finds a new spot when the workers arrive. | 94→72 (−22) |
| `roof` | ES | Paco encuentra la gotera y se sienta debajo. Cuando llegan los reparadores, busca otro lugar donde sentarse. | Paco se sienta bajo la gotera y, cuando llegan los reparadores, busca otro lugar. | 108→81 (−27) |
| `hospital` | EN | You need stitches. Lena drives you to the hospital and, on the way home, tells you not to bleed on anything. | Lena takes you for stitches and, on the way home, tells you not to bleed on anything. | 108→85 (−23) |
| `hospital` | ES | Necesitas puntos de sutura. Lena te lleva al hospital y, de regreso, te pide que no sangres sobre nada. | Lena te lleva a que te den puntos y, de regreso, te pide que no sangres sobre nada. | 103→83 (−20) |
| `startup` | EN | Nico has a long deck for an app that mixes subscriptions, A.I., and something he calls community ownership. He says the upside is enormous. | Nico pitches an app of subscriptions, A.I., and “community ownership,” and promises a huge upside. | 139→98 (−41) |
| `startup` | ES | Nico preparó una presentación para una app que combina suscripciones, IA y propiedad comunitaria. Dice que el potencial de ganancias es enorme. | Nico presenta una app de suscripciones, IA y «propiedad comunitaria», y promete una ganancia enorme. | 143→100 (−43) |
| `courage` | EN | At Marek's, with 12 Monkeys paused, you mention Lena. He says you may be waiting for certainty, then presses play. | When you mention Lena, Marek says you may be waiting for certainty, then presses play. | 114→86 (−28) |
| `courage` | ES | En casa de Marek, con 12 Monkeys en pausa, mencionas a Lena. Dice que tal vez esperas certeza absoluta y reanuda la película. | Cuando mencionas a Lena, Marek dice que tal vez esperas certeza absoluta y reanuda la película. | 125→95 (−30) |
| `ring` | EN | You are in the jewelry store, and you know why. You do not know which diamond looks responsible. | You are in the jewelry store, unsure which diamond looks responsible. | 96→69 (−27) |
| `ring` | ES | Estás en la joyería y sabes por qué. No sabes qué diamante te hace ver responsable. | Estás en la joyería, sin saber qué diamante te hace ver responsable. | 83→68 (−15) |
| `date` | EN | The ring is in your pocket and Lena is waiting by the door. Dinner first, then the lake at sunset. Even Paco is behaving, which feels suspicious. | The ring is in your pocket: dinner, then the lake at sunset. Even Paco is behaving, which feels suspicious. | 145→107 (−38) |
| `date` | ES | El anillo está en tu bolsillo y Lena espera junto a la puerta. Primero la cena, después el lago al atardecer. Hasta Paco se porta bien, lo cual resulta sospechoso. | El anillo está en tu bolsillo: cena y luego el lago al atardecer. Hasta Paco se porta bien, lo cual resulta sospechoso. | 163→119 (−44) |
| `proposal` | EN | The lake is getting dark and the ring is in your pocket. You have not asked yet. | The ring is still in your pocket by the lake, and you have not asked yet. | 80→73 (−7) |
| `proposal` | ES | El lago se oscurece y el anillo está en tu bolsillo. Todavía no hiciste la pregunta. | El anillo sigue en tu bolsillo junto al lago, y todavía no has hecho la pregunta. | 84→81 (−3) |
| `honeymoon` | EN | You and Lena leave with one rule: no checking the portfolio. She takes your phone. There are three possible trips. | Lena takes your phone so you will not check the portfolio; there are three possible trips. | 114→90 (−24) |
| `honeymoon` | ES | Se van de viaje con una sola regla: no revisar el portafolio. Ella te quita el teléfono. Hay tres viajes posibles. | Lena te quita el teléfono para que no revises el portafolio; hay tres viajes posibles. | 114→86 (−28) |
| `pregnancy` | EN | Two lines on a test: you and Lena are having a baby. Paco yawns. You look at him and say, “Four.” | You and Lena are having a baby. You look at Paco and say, “Four.” | 97→65 (−32) |
| `pregnancy` | ES | Dos líneas en una prueba: Lena y tú van a tener un bebé. Paco bosteza. Lo miras y dices: “Cuatro”. | Lena y tú van a tener un bebé. Miras a Paco y dices: “Cuatro”. | 98→62 (−36) |
| `baby` | EN | The baby arrives. Everyone is tired, including Paco. You start thinking about the future you want. | The baby arrives, everyone is exhausted, and you start thinking about the future. | 98→81 (−17) |
| `baby` | ES | Llega el bebé. Todos están cansados, incluido Paco. Empiezas a pensar en el futuro que quieres. | Llega el bebé, todos están agotados, y empiezas a pensar en el futuro. | 95→70 (−25) |
| `cousin` | EN | Nico found FridayCoin ($FRY) and swears it will multiply by Friday. What it does is not the important part, he says. | Nico swears FridayCoin ($FRY) will multiply by Friday; what it does, he says, is not the point. | 116→95 (−21) |
| `cousin` | ES | Nico encontró FridayCoin ($FRY) y jura que multiplicará su valor para el viernes. Según él, lo que hace no es lo importante. | Nico jura que FridayCoin ($FRY) multiplicará su valor para el viernes; lo que hace, dice, no importa. | 124→101 (−23) |
| `potluck` | EN | Lena signs you and Paco up for the neighborhood potluck. He eats half of what you brought before you arrive. | Lena signs you and Paco up for a potluck; he eats half the food before you arrive. | 108→82 (−26) |
| `potluck` | ES | Lena los anota a ti y a Paco en la comida comunitaria del vecindario. Paco se come la mitad de lo que prepararon antes de llegar. | Lena los anota a ti y a Paco en una comida vecinal; él se come la mitad antes de llegar. | 129→88 (−41) |
| `usedcar` | EN | Nico has found a 2009 Honda Fit. He looks under the hood, sees Sharpie, and calls it basically new. | Nico finds a 2009 Honda Fit, sees Sharpie under the hood, and calls it basically new. | 99→85 (−14) |
| `usedcar` | ES | Nico encontró un Honda Fit 2009. Mira debajo del capó, ve una marca de Sharpie y lo considera básicamente nuevo. | Nico encuentra un Honda Fit 2009, ve una marca de Sharpie bajo el capó y lo llama básicamente nuevo. | 112→100 (−12) |
| `tetris` | EN | Marek takes you to a bar with a Tetris cabinet nobody uses. He plays, then says it is your turn. | Marek takes you to a bar with a neglected Tetris cabinet and then gives you a turn. | 96→83 (−13) |
| `tetris` | ES | Marek te lleva a un bar con una máquina de Tetris que nadie usa. Juega un rato y luego te cede el turno. | Marek te lleva a un bar con una máquina de Tetris que nadie usa y después te cede el turno. | 104→91 (−13) |
| `unclemike` | EN | Dinner with Uncle Mike is excellent until the check. He will not tip, because he thinks the restaurant should pay its staff. The waiter is still standing there. | Uncle Mike refuses to tip after dinner, arguing the restaurant should pay its staff, while the waiter waits. | 160→108 (−52) |
| `unclemike` | ES | La cena con el tío Mike es excelente hasta que llega la cuenta. Se niega a dejar propina porque cree que el restaurante debería pagarle sueldos dignos a los empleados. El mesero sigue esperando de pie. | El tío Mike se niega a dejar propina, argumentando que el restaurante debería pagar a su personal, mientras el mesero espera. | 201→125 (−76) |
| `blocReplies` | EN | The three blocs answer differently: recognition, rejection, delay, or a demand for payment. By the end of the week, all three are mobilizing their fleets. | The three blocs answer differently, but all three end the week mobilizing their fleets. | 154→87 (−67) |
| `blocReplies` | ES | Los tres bloques responden de forma distinta: reconocimiento, rechazo, demora o una exigencia de pago. Al final de la semana, los tres están movilizando sus flotas. | Los tres bloques responden de forma distinta, pero al final de la semana los tres movilizan sus flotas. | 164→103 (−61) |

## Unchanged chance/war TLDRs

Already a short sentence that carried the plot, so they were left as they are.

| card id | lang | before | after | chars before→after |
|---|---|---|---|---|
| `principality` | EN | A micro-state of 614 claimed citizens writes to propose diplomatic relations. | A micro-state of 614 claimed citizens writes to propose diplomatic relations. | 77→77 (unchanged) |
| `principality` | ES | Un microestado de 614 ciudadanos declarados te escribe para proponer relaciones diplomáticas. | Un microestado de 614 ciudadanos declarados te escribe para proponer relaciones diplomáticas. | 93→93 (unchanged) |
| `notYet` | EN | The defense collapses, Bitcoin Country loses the island, and the run ends. | The defense collapses, Bitcoin Country loses the island, and the run ends. | 74→74 (unchanged) |
| `notYet` | ES | La defensa colapsa, Bitcoin Country pierde la isla y la partida termina. | La defensa colapsa, Bitcoin Country pierde la isla y la partida termina. | 72→72 (unchanged) |
| `mexico` | ES | Lena quiere cinco días en Tulum; a ti te alcanzan tres. Paco ya votó. | Lena quiere cinco días en Tulum; a ti te alcanzan tres. Paco ya votó. | 69→69 (unchanged) |
| `uncle` | EN | Uncle Héctor wires you money and refuses to say why. | Uncle Héctor wires you money and refuses to say why. | 52→52 (unchanged) |
| `uncle` | ES | El tío Héctor te transfiere dinero y se niega a decir por qué. | El tío Héctor te transfiere dinero y se niega a decir por qué. | 62→62 (unchanged) |
| `wedding` | EN | You and Lena are getting married, and every detail turns into a negotiation she wins. | You and Lena are getting married, and every detail turns into a negotiation she wins. | 85→85 (unchanged) |
| `wedding` | ES | Lena y tú se van a casar, y cada detalle se vuelve una negociación que gana ella. | Lena y tú se van a casar, y cada detalle se vuelve una negociación que gana ella. | 81→81 (unchanged) |
| `wallet` | EN | You forget your wallet on the bus and get it back at the terminal, minus the cash. | You forget your wallet on the bus and get it back at the terminal, minus the cash. | 82→82 (unchanged) |
| `wallet` | ES | Olvidas la billetera en el autobús y la recuperas en la terminal, sin el efectivo. | Olvidas la billetera en el autobús y la recuperas en la terminal, sin el efectivo. | 82→82 (unchanged) |

## Job-career TLDRs (unchanged)

These were already one brief sentence. They are included so the review covers every adventure.

| card id | lang | before | after | chars before→after |
|---|---|---|---|---|
| `jobCareeractingTier2` | EN | A missed stage cue becomes a lesson for the company. | A missed stage cue becomes a lesson for the company. | 52→52 (unchanged) |
| `jobCareeractingTier2` | ES | Una entrada perdida se convierte en una lección para el elenco. | Una entrada perdida se convierte en una lección para el elenco. | 63→63 (unchanged) |
| `jobCareeractingTier4` | EN | A sound failure improves the scene when you keep filming. | A sound failure improves the scene when you keep filming. | 57→57 (unchanged) |
| `jobCareeractingTier4` | ES | Una falla de sonido mejora la escena cuando decides seguir filmando. | Una falla de sonido mejora la escena cuando decides seguir filmando. | 68→68 (unchanged) |
| `jobCareeractingTier6` | EN | You keep a film set moving while protecting the stunt crew. | You keep a film set moving while protecting the stunt crew. | 59→59 (unchanged) |
| `jobCareeractingTier6` | ES | Mantienes el rodaje en marcha y proteges al equipo de especialistas. | Mantienes el rodaje en marcha y proteges al equipo de especialistas. | 68→68 (unchanged) |
| `jobCareerdivingTier2` | EN | You find the snagged line that kept a workboat drifting. | You find the snagged line that kept a workboat drifting. | 56→56 (unchanged) |
| `jobCareerdivingTier2` | ES | Encuentras la línea enganchada que hacía derivar una lancha. | Encuentras la línea enganchada que hacía derivar una lancha. | 60→60 (unchanged) |
| `jobCareerdivingTier4` | EN | A restless gauge reveals a leak before the pump restarts. | A restless gauge reveals a leak before the pump restarts. | 57→57 (unchanged) |
| `jobCareerdivingTier4` | ES | Un medidor inestable revela una fuga antes de reiniciar la bomba. | Un medidor inestable revela una fuga antes de reiniciar la bomba. | 65→65 (unchanged) |
| `jobCareerdivingTier6` | EN | You guide a survey team out of a split passage and save its records. | You guide a survey team out of a split passage and save its records. | 68→68 (unchanged) |
| `jobCareerdivingTier6` | ES | Guías al equipo fuera del pasaje y salvas sus registros. | Guías al equipo fuera del pasaje y salvas sus registros. | 56→56 (unchanged) |
| `jobCareerscienceTier2` | EN | You catch a mislabeled control before the lab publishes a false result. | You catch a mislabeled control before the lab publishes a false result. | 71→71 (unchanged) |
| `jobCareerscienceTier2` | ES | Detectas una muestra mal rotulada antes de publicar un resultado falso. | Detectas una muestra mal rotulada antes de publicar un resultado falso. | 71→71 (unchanged) |
| `jobCareerscienceTier4` | EN | You trace a repeated discrepancy to a calibration fault. | You trace a repeated discrepancy to a calibration fault. | 56→56 (unchanged) |
| `jobCareerscienceTier4` | ES | Encuentras una falla de calibración detrás de una discrepancia repetida. | Encuentras una falla de calibración detrás de una discrepancia repetida. | 72→72 (unchanged) |
| `jobCareerscienceTier6` | EN | You protect archived samples after a power interruption. | You protect archived samples after a power interruption. | 56→56 (unchanged) |
| `jobCareerscienceTier6` | ES | Proteges las muestras archivadas tras un corte de energía. | Proteges las muestras archivadas tras un corte de energía. | 58→58 (unchanged) |
| `jobCareerlawTier2` | EN | You catch a date mismatch before filing the hearing packet. | You catch a date mismatch before filing the hearing packet. | 59→59 (unchanged) |
| `jobCareerlawTier2` | ES | Detectas una fecha incorrecta antes de presentar el expediente. | Detectas una fecha incorrecta antes de presentar el expediente. | 63→63 (unchanged) |
| `jobCareerlawTier4` | EN | You rebuild the timeline when a witness changes their account. | You rebuild the timeline when a witness changes their account. | 62→62 (unchanged) |
| `jobCareerlawTier4` | ES | Reconstruyes la cronología cuando un testigo cambia su versión. | Reconstruyes la cronología cuando un testigo cambia su versión. | 63→63 (unchanged) |
| `jobCareerlawTier6` | EN | You surface a costly term and give your client a clear choice. | You surface a costly term and give your client a clear choice. | 62→62 (unchanged) |
| `jobCareerlawTier6` | ES | Señalas una cláusula costosa y das a tu cliente una decisión clara. | Señalas una cláusula costosa y das a tu cliente una decisión clara. | 67→67 (unchanged) |
| `jobCareerculinaryTier2` | EN | You reorganize service around a failed burner. | You reorganize service around a failed burner. | 46→46 (unchanged) |
| `jobCareerculinaryTier2` | ES | Reorganizas el servicio tras la falla de un quemador. | Reorganizas el servicio tras la falla de un quemador. | 53→53 (unchanged) |
| `jobCareerculinaryTier4` | EN | You catch an allergy note and remake the dish safely. | You catch an allergy note and remake the dish safely. | 53→53 (unchanged) |
| `jobCareerculinaryTier4` | ES | Detectas una alergia y preparas el plato de forma segura. | Detectas una alergia y preparas el plato de forma segura. | 57→57 (unchanged) |
| `jobCareerculinaryTier6` | EN | You adapt the galley service to rough seas. | You adapt the galley service to rough seas. | 43→43 (unchanged) |
| `jobCareerculinaryTier6` | ES | Adaptas el servicio de cocina al oleaje. | Adaptas el servicio de cocina al oleaje. | 40→40 (unchanged) |
| `jobCareeraviationTier2` | EN | You divert early when weather closes the short runway. | You divert early when weather closes the short runway. | 54→54 (unchanged) |
| `jobCareeraviationTier2` | ES | Te desvías a tiempo cuando el clima cierra la pista corta. | Te desvías a tiempo cuando el clima cierra la pista corta. | 58→58 (unchanged) |
| `jobCareeraviationTier4` | EN | You reject an unstable approach and prepare a safer landing. | You reject an unstable approach and prepare a safer landing. | 60→60 (unchanged) |
| `jobCareeraviationTier4` | ES | Interrumpes una aproximación inestable y preparas un aterrizaje más seguro. | Interrumpes una aproximación inestable y preparas un aterrizaje más seguro. | 75→75 (unchanged) |
| `jobCareeraviationTier6` | EN | You coordinate a medical diversion before the passenger worsens. | You coordinate a medical diversion before the passenger worsens. | 64→64 (unchanged) |
| `jobCareeraviationTier6` | ES | Coordinas un desvío médico antes de que empeore el pasajero. | Coordinas un desvío médico antes de que empeore el pasajero. | 60→60 (unchanged) |
| `jobCareermusicTier2` | EN | You keep a wedding set going through a power outage. | You keep a wedding set going through a power outage. | 52→52 (unchanged) |
| `jobCareermusicTier2` | ES | Mantienes la música de una boda durante un corte de luz. | Mantienes la música de una boda durante un corte de luz. | 56→56 (unchanged) |
| `jobCareermusicTier4` | EN | You recover a live set when the chart does not match. | You recover a live set when the chart does not match. | 53→53 (unchanged) |
| `jobCareermusicTier4` | ES | Recuperas el concierto cuando la partitura no coincide. | Recuperas el concierto cuando la partitura no coincide. | 55→55 (unchanged) |
| `jobCareermusicTier6` | EN | You adapt a solo after a string breaks. | You adapt a solo after a string breaks. | 39→39 (unchanged) |
| `jobCareermusicTier6` | ES | Adaptas el solo tras romperse una cuerda. | Adaptas el solo tras romperse una cuerda. | 41→41 (unchanged) |
| `jobCareerathleticTier2` | EN | You turn a repeatable move on film into a useful drill. | You turn a repeatable move on film into a useful drill. | 55→55 (unchanged) |
| `jobCareerathleticTier2` | ES | Conviertes un movimiento repetido en video en un ejercicio útil. | Conviertes un movimiento repetido en video en un ejercicio útil. | 64→64 (unchanged) |
| `jobCareerathleticTier4` | EN | You read the defense's weak side before the trap closes. | You read the defense's weak side before the trap closes. | 56→56 (unchanged) |
| `jobCareerathleticTier4` | ES | Lees el punto débil de la defensa antes de que cierre la trampa. | Lees el punto débil de la defensa antes de que cierre la trampa. | 64→64 (unchanged) |
| `jobCareerathleticTier6` | EN | You protect final preparation while meeting a sponsor's request. | You protect final preparation while meeting a sponsor's request. | 64→64 (unchanged) |
| `jobCareerathleticTier6` | ES | Proteges la preparación para la final y atiendes al patrocinador. | Proteges la preparación para la final y atiendes al patrocinador. | 65→65 (unchanged) |
| `jobCareermedicalTier2` | EN | You catch a medication mismatch before the next round. | You catch a medication mismatch before the next round. | 54→54 (unchanged) |
| `jobCareermedicalTier2` | ES | Detectas una discrepancia en la medicación antes de la siguiente ronda. | Detectas una discrepancia en la medicación antes de la siguiente ronda. | 71→71 (unchanged) |
| `jobCareermedicalTier4` | EN | You connect a returning fever with the latest labs before discharge. | You connect a returning fever with the latest labs before discharge. | 68→68 (unchanged) |
| `jobCareermedicalTier4` | ES | Relacionas el regreso de la fiebre con los análisis antes del alta. | Relacionas el regreso de la fiebre con los análisis antes del alta. | 67→67 (unchanged) |
| `jobCareermedicalTier6` | EN | You rebalance a thin night roster during two emergencies. | You rebalance a thin night roster during two emergencies. | 57→57 (unchanged) |
| `jobCareermedicalTier6` | ES | Reorganizas un turno nocturno reducido durante dos emergencias. | Reorganizas un turno nocturno reducido durante dos emergencias. | 63→63 (unchanged) |
| `jobCareermaritimeTier2` | EN | You replace a damaged mooring line before departure. | You replace a damaged mooring line before departure. | 52→52 (unchanged) |
| `jobCareermaritimeTier2` | ES | Cambias un cabo dañado antes de la partida. | Cambias un cabo dañado antes de la partida. | 43→43 (unchanged) |
| `jobCareermaritimeTier4` | EN | You secure a shifted pallet before the next swell. | You secure a shifted pallet before the next swell. | 50→50 (unchanged) |
| `jobCareermaritimeTier4` | ES | Aseguras una tarima desplazada antes de la siguiente ola. | Aseguras una tarima desplazada antes de la siguiente ola. | 57→57 (unchanged) |
| `jobCareermaritimeTier6` | EN | You bring a disabled fishing boat safely through a closing harbor. | You bring a disabled fishing boat safely through a closing harbor. | 66→66 (unchanged) |
| `jobCareermaritimeTier6` | ES | Llevas a puerto un pesquero averiado antes del cierre del canal. | Llevas a puerto un pesquero averiado antes del cierre del canal. | 64→64 (unchanged) |

## Battle briefing and after-action TLDRs (unchanged)

Already compact, one line each. Left as they are. `blocTriumph` also stays dynamic (recognition, optional bakery/holiday beat, rebuild note, and the 210-candle warning when another bloc remains).

| # | lang | text | chars |
|---|---|---|---|
| war short 1 | EN | The Meridian Pact attacks right on schedule. | 44 (unchanged) |
| war short 1 | ES | El Pacto Meridiano ataca puntualmente. | 38 (unchanged) |
| war short 2 | EN | The Pact lands again, this time with tanks. | 43 (unchanged) |
| war short 2 | ES | El Pacto vuelve a desembarcar, esta vez con tanques. | 52 (unchanged) |
| war short 3 | EN | The Pact sends everything it has left. | 38 (unchanged) |
| war short 3 | ES | El Pacto envía todo lo que le queda. | 36 (unchanged) |
| war short 4 | EN | The Red Ledger attacks after a very long speech. | 48 (unchanged) |
| war short 4 | ES | El Libro Rojo ataca después de un discurso larguísimo. | 54 (unchanged) |
| war short 5 | EN | The Ledger comes back, louder than before. | 42 (unchanged) |
| war short 5 | ES | El Libro vuelve, más ruidoso que antes. | 39 (unchanged) |
| war short 6 | EN | The Ledger makes its last push. | 31 (unchanged) |
| war short 6 | ES | El Libro hace su último intento. | 32 (unchanged) |
| war short 7 | EN | The Crown Lattice demands that the island kneel, then attacks. | 62 (unchanged) |
| war short 7 | ES | La Celosía de la Corona exige que la isla se arrodille y ataca. | 63 (unchanged) |
| war short 8 | EN | The Lattice lands below the eastern cliff. | 42 (unchanged) |
| war short 8 | ES | La Celosía desembarca bajo el acantilado oriental. | 50 (unchanged) |
| war short 9 | EN | The Lattice sends its royal guard. | 34 (unchanged) |
| war short 9 | ES | La Celosía envía su guardia real. | 33 (unchanged) |
| war short 10 | EN | The Hemisphere Trust suspends the island's account and attacks. | 63 (unchanged) |
| war short 10 | ES | El Fideicomiso del Hemisferio suspende la cuenta de la isla y ataca. | 68 (unchanged) |
| war short 11 | EN | The Trust attacks again, with more drones. | 42 (unchanged) |
| war short 11 | ES | El Fideicomiso vuelve a atacar, con más drones. | 47 (unchanged) |
| war short 12 | EN | The Trust sends everything it has left. | 39 (unchanged) |
| war short 12 | ES | El Fideicomiso envía todo lo que le queda. | 42 (unchanged) |
| war short 13 | EN | The Pact's landing collapses. Paco brings back the clerk's rubber stamp. | 72 (unchanged) |
| war short 13 | ES | El desembarco del Pacto se derrumba. Paco trae el sello de goma de su funcionario. | 82 (unchanged) |
| war short 14 | EN | The tanks never clear the hill. Marek will not call it a victory; Nico opens the bar. | 85 (unchanged) |
| war short 14 | ES | Los tanques no superan la colina. Marek no lo llama victoria; Nico abre el bar. | 79 (unchanged) |
| war short 15 | EN | The Ledger's posters reach the water before its soldiers. Kade's radio ends up in the sea. | 90 (unchanged) |
| war short 15 | ES | Los carteles del Libro llegan al agua antes que sus soldados. La radio de Kade termina en el mar. | 97 (unchanged) |
| war short 16 | EN | The Ledger's line breaks against the wall. The island exhales. | 62 (unchanged) |
| war short 16 | ES | La línea del Libro se rompe contra el muro. La isla respira. | 60 (unchanged) |
| war short 17 | EN | The Lattice's procession breaks up on the reef. The island does not kneel. | 74 (unchanged) |
| war short 17 | ES | La procesión de la Celosía se desarma en el arrecife. La isla no se arrodilla. | 78 (unchanged) |
| war short 18 | EN | The Lattice burns below the cliff. By dusk the cliff is the island's again. | 75 (unchanged) |
| war short 18 | ES | La Celosía arde bajo el acantilado. Al anochecer, vuelve a ser de la isla. | 74 (unchanged) |
| war short 19 | EN | The Trust's feed cuts out when its first boat turns back. | 57 (unchanged) |
| war short 19 | ES | La transmisión del Fideicomiso se corta cuando su primer bote da la vuelta. | 75 (unchanged) |
| war short 20 | EN | The Trust's boats run aground on a reef it had rated low risk. | 62 (unchanged) |
| war short 20 | ES | Los botes del Fideicomiso encallan en un arrecife que había calificado de bajo riesgo. | 86 (unchanged) |

## Notes

- The `{offer}` token in `anOffer` is still replaced at runtime with the consortium's price.
- The `uncle` fallback in `cardTldr()` still matches the unchanged TLDR.
- Outcome punchlines (`OUTCOME_TLDR`, `punchline()`) were not changed; this review is the card-level TLDR shown before a choice or on a report card.
