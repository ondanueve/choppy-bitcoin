# Coleccionables de premios — Fase 1

## English summary

Phase 1 designs how each Choppy Bitcoin award can later become a digital collectible tied to a game illustration, including archived “vintage” editions. Nothing in this branch is signed, broadcast, or inscribed. No wallet is asked for a private key. No fee is paid.

The recommended model is hybrid.

- Free badge on Nostr, [NIP-58](https://github.com/nostr-protocol/nips/blob/master/58.md) (draft, optional). The issuer publishes a kind `30009` badge definition and a kind `8` award. The player publishes a kind `10008` profile list with their own key. Kind `30008` is a badge set in the current text of the NIP. Older drafts used `30008` with `d=profile_badges` as the profile list. The issuer key stays outside this repository and outside the game client.
- Optional Bitcoin Ordinal. The player asks for a file and metadata, then inscribes it from their own wallet and pays the miner fee. The project prepares bytes. It does not custody funds, charge a price, or pay the fee. See the [Ordinal Theory Handbook, Inscriptions](https://docs.ordinals.com/inscriptions.html).

Public Nostr metadata for a `secret: true` award stays spoiler-free: name `???`, description `Hidden award. / Premio oculto.` The readable id must not be used as the public `d` tag until the owner picks an opaque id. The in-game collection, after the player has earned the award, may show the illustration. An ordinal the player chooses to publish can carry the earned name, because that publication is the player’s act.

Server trust is the critical gap. `profiles_update_own` lets a signed-in user write `profiles.awards` directly. There is no trigger on that column. A console update is enough to claim every award. That column must not back a badge. The design below sketches `grant_award` (`security definer`) and `guard_awards`, on the same pattern as `guard_elo`. The sketch is not applied.

Ranked solo runs do not keep `S.worldSeed`. Replaying a run on the server is out of this phase. The recommendation is plausibility checks patterned on `submit_choppy_score`, server-side counts where the database already has the facts, and manual review for the rarest awards. No option removes cheating from a pure client game.

Illustrations of 1920×800 are about 219–421 KB. Two chosen files, `chance/obviously-wide.jpg` (420594 bytes) and `chance/battleWon-wide.jpg` (390223 bytes), are at or past a standard 400000-weight-unit relay transaction. Inscribe a derivative of at most 60 KB (960×400). Fee figures below are arithmetic examples, not quotes.

The legal notice at the end is a draft for a human lawyer. It is not published in `about/` by this branch.

## Qué produce esta fase

Documentos y un prototipo local:

- [`award-art-map.csv`](award-art-map.csv) y [`award-art-map.md`](award-art-map.md): 46 premios, la misma lista que `AWARD_CATALOG`.
- Este diseño, con el SQL de verificación solo escrito aquí.
- [`manifest.json`](manifest.json), generado por `tools/nft-manifest.js`: eventos NIP-58 de ejemplo sin firmar y metadatos de ordinal de ejemplo. `unsigned: true`. No se difunden.
- Una vista de colección en el perfil propio, solo con `?nftpreview=1`. No emite nada.

Esta rama no cambia `AWARD_CATALOG`, no cambia `grantAward` ni `persistAwards`, no aplica SQL, no crea la derivada de imagen y no genera ilustraciones.

## Hallazgo: `profiles.awards` lo escribe el cliente

`supabase/supabase-profiles.sql` define la política `profiles_update_own`: cada usuario autenticado puede hacer `update` de su fila (`auth.uid() = id`). `supabase/supabase-awards.sql` añade `awards text[]` y no añade un trigger. `auth.js` persiste con:

```js
supabase.from("profiles").update({ awards: ids }).eq("id", currentUser.id)
```

Cualquier sesión puede ejecutar ese `update` desde la consola y ponerse los 46 ids. `localStorage["choppy-awards"]` es igual de maleable. Los premios en pantalla pueden seguir así. Un coleccionable no puede usar esa lista como prueba.

El patrón que sí existe es otro. `submit_versus_result` es `security definer`, pone `app.elo_ok` en `'1'` y solo entonces el trigger `guard_elo` deja cambiar `elo`. Sin esa variable, `guard_elo` restaura el valor anterior. `submit_choppy_score` hace lo mismo con `app.score_ok`, límites de puntaje, velas y vida, y una pausa de 15 segundos. En el SQL versionado no hay un trigger `guard_highscore` que lea `app.score_ok`. Queda anotado como tema fuera de esta fase. El modelo a copiar para premios es `guard_elo`, que sí restaura la columna.

`score_log` se inserta desde `submit_choppy_score` (`user_id`, `score`, `life_t`, `candles`). El `create table` no está en el repositorio. La migración futura tiene que crear esa tabla si falta, o añadirle una clave si ya existe con otra forma, antes de usarla como `run_ref`.

## Mapa de arte

La tabla de trabajo está en [`award-art-map.md`](award-art-map.md). Resumen medido el 30 de octubre de 2026:

| Elegibilidad | Filas |
| --- | ---: |
| `ok` | 18 |
| `requiere arte nuevo` | 28 |
| `excluida` | 0 |

Cero filas `excluida` es el resultado correcto: ningún premio usa al Tío Mike. La prohibición igual está en el generador. Una fila `ok` cuyo archivo contenga `unclemike` hace fallar `node tools/nft-manifest.js`.

Archivos prohibidos para cualquier coleccionable: `chance/unclemike.jpg`, `chance/unclemike-wide.jpg`, y cualquier ruta con `unclemike`. En el hub clonado ese día no había ninguno. `chance/uncle-wide.jpg` es el tío Héctor. No hay premio de esa carta y no se asigna.

Lena puede aparecer en `family`. No puede aparecer en `country`. Cada candidato country usado se abrió. El resultado está en el mapa. `art-archive/choppy/anoffer-mp189/anOffer-b-wide.replaced-mp189.jpg` repite el moño alto, la camisa clara y el short de Lena en `proposal-a-wide.jpg`. No es vintage de ningún premio. El generador rechaza esa ruta.

`art-archive/choppy/replaced-mp191/anOffer-a-wide.replaced-mp191.jpg` tiene una mujer de saco blanco y moño bajo. No coincide con el diseño de Lena. Queda como vintage de `sellout` y el dueño puede vetarla.

`chance/obviously-wide.jpg` pesa 420594 bytes. `chance/battleWon-wide.jpg` pesa 390223 bytes. El resto de los actuales elegidos pesa entre 218739 y 364983 bytes, todos 1920×800. Esas medidas salen del SOF del JPEG en `chance/`.

## Exclusiones y spoilers

El catálogo público de la insignia no lista el nombre ni el motivo de un premio `secret` que el jugador no haya obtenido. En el juego, `awardRowHtml` ya muestra `???` mientras el premio no está en la lista local. El manifiesto de esta fase hace lo mismo en los eventos de ejemplo.

El `d` de ejemplo es `choppy-` más el id, para poder revisar el archivo. Varios ids secretos son palabras de la historia (`married`, `declared`, `sellout`). Publicar un kind `30009` con ese `d` revela el premio aunque el `name` sea `???`. Antes de escribir en un relay, los premios secretos necesitan un `d` opaco guardado en el servidor. Está en las decisiones abiertas. Los eventos de ejemplo llevan `broadcast: false`.

`docs/nft/` explica qué carta corresponde a cada premio secreto. Hace falta para el mapa. Si el sitio estático se publica tal cual, esa carpeta queda en la web. `game.js` ya lleva los nombres secretos en el cliente. Aun así, la decisión de no desplegar `docs/nft/` está abierta y es prioritaria.

Las posiciones de ajedrez se muestran sin la jugada. El manifiesto no lleva notación ni flechas. El encargo de `chess3` y `chess7` pide tableros solos.

El A.I. bud no aparece eligiendo adopción. Marek, en los encargos country, va con ropa de la escena.

## Modelo híbrido

### Nostr (NIP-58)

Fuente: [nips/58.md en master](https://github.com/nostr-protocol/nips/blob/master/58.md), texto vigente revisado el 30 de octubre de 2026, más el cambio de [PR 2276](https://github.com/nostr-protocol/nips/pull/2276) (kind `10008` para la lista de perfil; kind `30008` pasa a ser un conjunto de insignias). El NIP está marcado draft y optional.

Tres eventos, más el conjunto opcional:

1. Definición, kind `30009`, addressable. El tag `d` es obligatorio y nombra la insignia de forma única para esa clave emisora. Pueden ir `name`, `description`, `image` (URL y, si hace falta, `ancho x alto`) y `thumb`. La definición se puede reemplazar: un evento nuevo con el mismo `d` y una fecha mayor gana.
2. Otorgamiento, kind `8`. Un solo tag `a` con la forma `30009:<pubkey emisora>:<d>`, y uno o más tags `p`, uno por persona premiada. El evento es inmutable. La insignia no se transfiere.
3. Lista de perfil, kind `10008`, replaceable, lista NIP-51. Pares ordenados de `a` (la definición) y `e` (el id del kind `8`). La publica el jugador con su clave, después de aceptar la insignia. No la publica el emisor.
4. Conjunto, kind `30008`, addressable, para grupos con nombre. No es la lista principal del perfil. Un cliente viejo puede seguir leyendo un `30008` con `d` igual a `profile_badges`. Al emitir, la lista que manda es la `10008`.

Quién firma:

- El emisor del proyecto firma `30009` y `8`. La clave privada vive fuera del repo, fuera del cliente y fuera de Supabase. Este diseño no elige el dispositivo. Tiene que ser una decisión del dueño (hardware, máquina aparte, persona concreta).
- El jugador firma solo su `10008`, con una clave suya, en un cliente Nostr que el jugador ya use. El juego no pide `nsec`, ni semilla, ni frase.

`npub` en el perfil es opcional. Columna futura `profiles.nostr_npub`, texto, solo si cumple el formato `npub1` de bech32. La escribe el usuario sobre su propia fila. No se guarda la clave privada. Si el campo está vacío, el premio en pantalla sigue existiendo y no hay insignia.

Relays: la fase de emisión usará relays públicos gratuitos que el dueño elija en ese momento. Ejemplos habituales, sin acuerdo de servicio: `wss://relay.damus.io`, `wss://nos.lol`, `wss://relay.nostr.band`. Esta fase no escribe en ninguno. El proyecto no opera un relay aquí. Si un relay desaparece, la insignia puede seguir en otros donde se haya vuelto a publicar el mismo evento.

Metadatos de la definición:

- `d`: opaco en producción para premios secretos. En el ejemplo, `choppy-<award_id>`.
- `name`: para un premio público, `nombre EN / nombre ES`. Para un secreto, `???`.
- `description`: motivo bilingüe solo si el premio no es secreto. Si es secreto, `Hidden award. / Premio oculto.`
- `image`: URL estable `https://bitcoinizate.com/choppy-bitcoin/chance/<archivo>`, con `1920x800`, solo en el evento de ejemplo de un premio que no es secreto y cuya fila es `ok`. En un premio secreto el evento de ejemplo no lleva `image`: la foto es parte del spoiler. La ruta queda en el registro del premio para la colección del juego, una vez obtenido, y para el ordinal si el jugador decide publicarlo. La derivada, cuando exista, iría en `thumb`: `https://bitcoinizate.com/choppy-bitcoin/nft/<award_id>-960.webp`, `960x400`. Hoy `built` es `false` y el `thumb` no se incluye.
- Premios `requiere arte nuevo`: el evento de ejemplo no lleva `image` y `issuable` es `false`.

La imagen grande puede quedarse en la web. La derivada es para el ordinal y para el `thumb`. Nostr no obliga a inscribir el archivo: la insignia apunta a una URL. Si `bitcoinizate.com` deja de servir ese path, el cliente Nostr pierde la imagen aunque el evento siga siendo válido. Por eso el ordinal es el archivo en cadena, y es opcional.

### Ordinals, pagados por el jugador

Fuente: [Ordinal Theory Handbook — Inscriptions](https://docs.ordinals.com/inscriptions.html). El contenido va en el witness de un gasto taproot (commit y luego reveal), dentro de un sobre `OP_FALSE OP_IF ... OP_ENDIF`. El tag `1` es el tipo de contenido. El cuerpo va después de un push vacío (tag `0` en la descripción del handbook). Cada push de datos mide como máximo 520 bytes. El tag `5` es metadata. El tag `17` es properties. Hay tag de padre, puntero y delegado; esta fase no los usa.

El proyecto prepara dos cosas y se detiene:

- el archivo derivado (cuando exista);
- un objeto de metadatos para el tag `5`, el mismo criterio de spoilers que la insignia Nostr, más `award_id`, `edition` y `collection`.

El jugador inscribe con su billetera. La comisión va del jugador a los mineros, a la tarifa que la billetera ofrezca. No hay factura del proyecto, no hay dirección de cobro, no hay custodia, no hay reenvío de un PSBT firmado por el proyecto. Esta fase no construye ni el PSBT ni el archivo derivado.

Los ordinals viajan con el sat. Quien gasta ese sat puede enviar la inscripción a otra persona. No son “soulbound”. Las insignias NIP-58 sí son intransferibles. El aviso legal tiene que decir las dos cosas. Transferir el sat no transfiere derechos sobre el juego.

### Peso y comisiones (orden de magnitud, no es una cotización)

No se consultó ningún mempool ni ningún servicio de pago. Las cifras son aritmética sobre el handbook y sobre el límite de relay estándar de Bitcoin Core (`MAX_STANDARD_TX_WEIGHT` = 400000 unidades de peso). El mercado se mueve. Una cifra de hoy no sirve para mañana.

Cada byte de contenido en el witness cuenta 1 unidad de peso. 4 unidades de peso son 1 vbyte. Un archivo de 61440 bytes (el tope propuesto, 60 KB) aporta 15360 vbytes solo de contenido. El sobre, los prefijos de los pushes de 520 bytes, la firma y el control block suman menos que el archivo, pero no son cero. Un piso razonable para hablar es 16000–20000 vbytes por la derivada completa (commit + reveal contados juntos en este orden de magnitud).

Ejemplos, no ofertas:

| Tarifa ilustrativa | Derivada, 18000 vB | JPEG de 350 KB (solo el contenido, 87500 vB) |
| --- | ---: | ---: |
| 2 sat/vB | 36000 sats | 175000 sats |
| 10 sat/vB | 180000 sats | 875000 sats |
| 50 sat/vB | 900000 sats | 4375000 sats |
| 100 sat/vB | 1800000 sats | 8750000 sats |

Mercado quieto, unos pocos sat/vB: la derivada queda en decenas de miles de sats. Mercado ocupado, decenas a 100 sat/vB: cientos de miles a unos dos millones de sats para la derivada. El JPEG original de 300–700 KB cuesta varias veces más y muchos no caben en un relay estándar.

`chance/obviously-wide.jpg` mide 420594 bytes. El contenido solo ya pasa de 400000 unidades de peso: un reveal estándar no lo retransmite. `chance/battleWon-wide.jpg` mide 390223 bytes. El contenido cabe justo y el sobre lo empuja fuera del límite. Los dos se inscriben solo como derivada. La derivada también es la opción para el resto, aunque el JPEG quepa, porque la comisión baja de orden.

Propuesta de derivada, sin construirla en esta fase: WebP o JPEG, 960×400, como máximo 61440 bytes, URL `https://bitcoinizate.com/choppy-bitcoin/nft/<award_id>-960.webp`. Quién la genera y dónde se aloja es decisión del dueño. Hasta que el archivo exista, `derivative_built` queda en `false`.

## Ediciones

Edición `actual`: el archivo que está hoy en `chance/` y la fila marca `ok`.

Edición `vintage`: un JPEG que estuvo en vivo y se archivó en el hub `ondanueve/bitcoinizate`, bajo `art-archive/choppy/replaced-mpNNN/`. En `replaced-mp188/` el nombre no lleva el infijo `.replaced-`. En `replaced-mp191/` y `replaced-mp192/` sí. No son ediciones los PNG de trabajo, las carpetas `_rejected/`, ni `raw/`, ni las placas sueltas de ajedrez que sirven para encargar `chess7`.

Si una ilustración se vuelve a cambiar:

- el archivo que sale de `chance/` se archiva en el hub (lo hace el humano; esta fase no mueve imágenes);
- ese archivo pasa a ser otra vintage, con su propia fila de edición;
- la definición nueva usa otro `d` (`…-vintage-mpNNN`), no un reemplazo del `image` del `d` ya publicado;
- el kind `8` ya emitido sigue apuntando al `a` viejo;
- la inscripción ya hecha no cambia, porque el contenido está en la cadena.

El kind `30009` se puede reemplazar. Si se reemplaza el tag `image` del mismo `d`, los clientes pasan a mostrar la foto nueva para una insignia vieja. La regla de esta fase es no hacer eso: una edición publicada congela su URL. Otra foto, otro `d`.

La numeración propuesta es abierta: una insignia por `npub` y por edición, no una serie de 100 ejemplares. Cada ordinal es distinto porque cada inscripción tiene su transacción, aunque los bytes de la imagen coincidan. No se promete escasez. Un número de “ejemplar” solo tendría sentido como orden de otorgamiento en `award_grants`, y habría que decidirlo aparte.

## Verificación en el servidor

El premio en pantalla puede seguir siendo inmediato. El coleccionable pide un hecho más fuerte: una fila escrita por el servidor, con evidencia, y un sí explícito de que esa fila basta para firmar.

### Opciones

1. Confiar en las estadísticas del cliente. Es lo que hace hoy `persistAwards`. Se descarta para coleccionables. Quien abre la consola se otorga el premio.
2. Validación de plausibilidad. El servidor rechaza combinaciones imposibles (velas contra tiempo, topes, pausa, cuenta nueva, premio repetido) y guarda la evidencia. No demuestra que la partida ocurrió. Impide el `update` directo y deja un registro. Es la misma familia de controles que `submit_choppy_score`.
3. Reproducción determinista. Haría falta la semilla y el registro de entradas, y un segundo motor que vuelva a jugar la partida. En el código actual `wrng()` usa `mulberry32(S.worldSeed)` solo cuando `S.mp && S.worldSeed`. Si no, usa `Math.random()`. Al salir de versus, la semilla vuelve a 0 y `worldRand` queda en null (`game.js`, asignación de `worldRand` y el reset cuando `!S.mp`). `awardsLive()` exige ranked y prohíbe versus. La semilla que existe no reproduce la partida que gana premios. No hay un log de entradas guardado. Construir eso es cambiar el juego, guardar la cinta, y reimplementar la simulación fuera del cliente. Excede esta fase. Además, un cliente modificado puede enviar una cinta que no es la que se jugó, salvo que el servidor sea quien ejecuta la partida.

Recomendación: la opción 2, más contadores que el servidor ya puede calcular, más revisión humana en los premios `legendaria`. No construir la reproducción en la Fase 1. El brief 06 implementa el SQL. Ninguna de las tres opciones elimina la trampa en un juego que corre entero en el cliente: un parche local puede inventar una partida verosímil. El objetivo es que la consola deje de bastar, y que cada coleccionable tenga una fila auditable.

### SQL esbozado (no aplicado)

No ejecutar este bloque en producción desde esta rama. Es el contrato para el brief 06. Hace falta que `profiles.awards` ya exista (`supabase/supabase-awards.sql`) antes del trigger. El estilo del repo usa cuerpos de función entre comillas simples; aquí van entre `$fn$` para poder leerlos. Al implementarlo, hay que coincidir con el estilo del archivo vecino y probarlo en un proyecto vacío.

```sql
-- Sketch only. Do not run from this branch.

create table if not exists public.score_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  score bigint not null,
  life_t double precision not null,
  candles integer not null,
  created_at timestamptz not null default now()
);

create table if not exists public.award_grants (
  user_id uuid not null references public.profiles (id) on delete cascade,
  award_id text not null,
  granted_at timestamptz not null default now(),
  run_ref text,
  evidence jsonb not null default '{}'::jsonb,
  primary key (user_id, award_id)
);

alter table public.award_grants enable row level security;

drop policy if exists award_grants_select_own on public.award_grants;
create policy award_grants_select_own
  on public.award_grants for select
  using (auth.uid() = user_id);

-- No insert, update, or delete policy. Only the definer function writes.

create or replace function public.guard_awards()
returns trigger
language plpgsql
as $fn$
begin
  if current_setting('app.awards_ok', true) = '1' then
    return new;
  end if;
  if tg_op = 'UPDATE' then
    new.awards := old.awards;
  elsif tg_op = 'INSERT' then
    new.awards := '{}'::text[];
  end if;
  return new;
end;
$fn$;

drop trigger if exists trg_guard_awards on public.profiles;
create trigger trg_guard_awards
before insert or update on public.profiles
for each row execute function public.guard_awards();

create or replace function public.grant_award(
  p_id text,
  p_run_ref text,
  p_evidence jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn$
declare
  uid uuid := auth.uid();
  created timestamptz;
  last_grant timestamptz;
  candles integer;
  life_t double precision;
  known text[] := array[
    'maxi','nocoiner','paper','doubler','tenx','dayTrader','cap21',
    'halver','greedy','opsec','longHaul','marathon','swanHunter','laserEyes',
    'maxedPerk','perkHoarder','goodBud','career',
    'engaged','married','runaway','babyBoard','familyOffice','classicFartface',
    'landowner','notForSale','sellout','miner','citadel','nodes100','declared',
    'beachHolds','fourth','noAid','freeNation',
    'chessWin','chess3','chess7','scoop','unicorn','highRoller','soldPump',
    'regular','veteran','collector','curator'
  ];
  legendaria text[] := array['cap21','fourth','noAid','chess7'];
  existing jsonb;
  collectible boolean := true;
  review text := 'auto';
  n_runs integer;
  n_awards integer;
  solved integer;
begin
  if uid is null then
    raise exception 'not signed in';
  end if;
  if p_id is null or not (p_id = any (known)) then
    raise exception 'unknown award';
  end if;
  if p_evidence is null or jsonb_typeof(p_evidence) <> 'object' then
    raise exception 'bad evidence';
  end if;

  select created_at into created from auth.users where id = uid;
  if created is null or created > now() - interval '7 days' then
    raise exception 'account too new';
  end if;

  select granted_at into last_grant
    from public.award_grants
   where user_id = uid
   order by granted_at desc
   limit 1;
  if last_grant is not null and last_grant > now() - interval '15 seconds' then
    raise exception 'slow down';
  end if;

  if exists (
    select 1 from public.award_grants where user_id = uid and award_id = p_id
  ) then
    select jsonb_build_object('award_id', award_id, 'granted_at', granted_at, 'evidence', evidence)
      into existing
      from public.award_grants
     where user_id = uid and award_id = p_id;
    return existing;
  end if;

  if p_id = 'greedy' then
    raise exception 'greedy withheld';
  end if;

  if coalesce(p_evidence->>'ranked', '') <> 'true'
     or coalesce(p_evidence->>'test', '') = 'true'
     or coalesce(p_evidence->>'versus', '') = 'true' then
    raise exception 'not a ranked run';
  end if;

  candles := nullif(p_evidence->>'candles', '')::integer;
  life_t := nullif(p_evidence->>'life_t', '')::double precision;
  if candles is not null and (candles < 0 or candles > 20000) then
    raise exception 'bad candles';
  end if;
  if candles is not null and candles >= 420 then
    if life_t is null or life_t < 12 then
      raise exception 'short run';
    end if;
    if candles > (life_t * 5 + 8) then
      raise exception 'candle rate';
    end if;
  end if;

  if p_run_ref is not null then
    if not exists (
      select 1 from public.score_log
       where id::text = p_run_ref and user_id = uid
    ) then
      raise exception 'unknown run';
    end if;
  end if;

  if p_id in ('regular','veteran') then
    select count(*) into n_runs
      from public.score_log
     where user_id = uid and candles >= 420;
    if p_id = 'regular' and n_runs < 10 then
      raise exception 'not enough runs';
    end if;
    if p_id = 'veteran' and n_runs < 50 then
      raise exception 'not enough runs';
    end if;
  elsif p_id in ('collector','curator') then
    select count(*) into n_awards
      from public.award_grants
     where user_id = uid
       and award_id not in ('collector','curator');
    if p_id = 'collector' and n_awards < 10 then
      raise exception 'not enough awards';
    end if;
    if p_id = 'curator' and n_awards < 25 then
      raise exception 'not enough awards';
    end if;
  elsif p_id in ('longHaul','marathon','maxi','nocoiner','paper','doubler','tenx','dayTrader','halver','opsec','swanHunter','laserEyes','maxedPerk','perkHoarder','goodBud','career','cap21') then
    if candles is null or candles < 420 then
      raise exception 'short run';
    end if;
    if p_run_ref is null then
      raise exception 'run required';
    end if;
    if p_id = 'longHaul' and candles < 1000 then
      raise exception 'not enough candles';
    end if;
    if p_id = 'marathon' and candles < 2100 then
      raise exception 'not enough candles';
    end if;
    if p_id = 'halver' and (
         coalesce(nullif(p_evidence->>'halvings','')::integer, 0) < 1
      or coalesce(nullif(p_evidence->>'halvings','')::integer, 99) > 64
      or coalesce(p_evidence->>'halveMiss','0') <> '0'
    ) then
      raise exception 'halver evidence';
    end if;
    if p_id = 'swanHunter' and (
         coalesce(nullif(p_evidence->>'swans','')::integer, 0) < 3
      or coalesce(nullif(p_evidence->>'swans','')::integer, 99) > 30
    ) then
      raise exception 'swan evidence';
    end if;
    if p_id = 'laserEyes' and (
         coalesce(nullif(p_evidence->>'lasers','')::integer, 0) < 5
      or coalesce(nullif(p_evidence->>'lasers','')::integer, 99) > 40
    ) then
      raise exception 'laser evidence';
    end if;
    if p_id = 'dayTrader' and (
         coalesce(nullif(p_evidence->>'buys','')::integer, 0)
       + coalesce(nullif(p_evidence->>'sells','')::integer, 0) < 50
    ) then
      raise exception 'trade evidence';
    end if;
    if p_id = 'perkHoarder' and (
         coalesce(nullif(p_evidence->>'haveSum','')::integer, 0) < 15
      or coalesce(nullif(p_evidence->>'haveSum','')::integer, 999) > 80
    ) then
      raise exception 'perk evidence';
    end if;
    if p_id = 'career' and coalesce(nullif(p_evidence->>'job','')::integer, 0) < 7 then
      raise exception 'career evidence';
    end if;
  elsif p_id in ('chessWin','chess3','chess7') then
    solved := coalesce(jsonb_array_length(p_evidence->'solved'), 0);
    if solved < 1 or solved > 7 then
      raise exception 'chess evidence';
    end if;
    if p_id = 'chess3' and solved < 3 then
      raise exception 'chess evidence';
    end if;
    if p_id = 'chess7' and solved < 7 then
      raise exception 'chess evidence';
    end if;
  elsif p_id in ('engaged','married','runaway','babyBoard','familyOffice','classicFartface','landowner','notForSale','sellout','miner','citadel','nodes100','declared','beachHolds','fourth','noAid','freeNation','scoop','unicorn','highRoller','soldPump') then
    if coalesce(p_evidence->>'card','') = '' then
      raise exception 'card required';
    end if;
  else
    raise exception 'unhandled award';
  end if;

  if p_id = any (legendaria) then
    collectible := false;
    review := 'pending';
  end if;

  perform set_config('app.awards_ok', '1', true);

  insert into public.award_grants (user_id, award_id, run_ref, evidence)
  values (
    uid,
    p_id,
    p_run_ref,
    p_evidence || jsonb_build_object('collectible', collectible, 'review', review)
  );

  update public.profiles
     set awards = (
       select coalesce(array_agg(g.award_id order by g.granted_at), '{}')
         from public.award_grants g
        where g.user_id = uid
     )
   where id = uid;

  return jsonb_build_object(
    'award_id', p_id,
    'collectible', collectible,
    'review', review
  );
end;
$fn$;

revoke all on function public.grant_award(text, text, jsonb) from public;
grant execute on function public.grant_award(text, text, jsonb) to authenticated;
```

Notas del esbozo:

- `guard_awards` corre también en `insert`, para que una fila nueva no nazca con premios escritos a mano. `handle_new_user` inserta el perfil sin tocar `awards`; el default `'{}'` se conserva porque el trigger solo vacía la columna cuando la variable no está puesta, y el default ya es vacío. Hay que probar ese camino en el brief 06: si el trigger pisa un default inesperado, se ajusta ahí.
- Una partida otorga varios premios juntos. Un cooldown de 15 segundos por id se comería el resto. El brief 06 debe exponer también `grant_awards(p_ids text[], p_run_ref text, p_evidence jsonb)`, que revisa la pausa una vez y llama la misma lógica por id. No está duplicada aquí para no mantener dos copias del caso. La función de un id es la que pide esta fase.
- `regular`, `veteran`, `collector` y `curator` se cuentan en el servidor (`score_log` y `award_grants`). El número que mande el cliente no cuenta.
- `greedy` se rechaza hasta que el dueño alinee el texto del premio (“comió 0 halvings”) con `runAwardIds`, que hoy lo empuja cuando `halvings` spawn es 0. No se encarga el arte hasta esa decisión. No se cambia `game.js` en esta rama.
- `cap21`, `fourth`, `noAid` y `chess7` quedan con `evidence.collectible = false` y `review = pending`. El premio en pantalla puede existir. La firma del emisor espera un humano. Los otros ids que pasan el filtro quedan `collectible: true`, y aun así la firma es un proceso aparte: el RPC no tiene la clave Nostr.
- La evidencia de carta (`engaged`, isla, póker, etc.) sigue viniendo del cliente. El servidor comprueba que venga una carta, no que la escena haya ocurrido. Por eso los `legendaria` de esa familia van a revisión, y el resto queda en el límite honesto de un juego cliente.
- `opsec` (“no perdió cold storage”) lo gana casi toda partida que no dispara el evento. El filtro no puede inventar una prueba que el cliente no tiene. Queda como premio de pantalla fácil. Su coleccionable, cuando haya arte, debería pedir revisión o un contador de servidor si más adelante existe.
- El mapa de elegibilidad `ok` vive en el manifiesto, no en el RPC. El trabajo del emisor, fuera de la base, rechaza firmar si la fila no es `ok` o si `collectible` no es verdadero. Así un premio sin ilustración puede registrarse como premio de juego y no sale como insignia.
- Antigüedad propuesta: 7 días. Pausa: 15 segundos, igual que el puntaje. Las dos cifras están abiertas.

`profiles_update_own` se queda, porque el perfil también guarda el nombre y el avatar. El trigger es lo que vuelve inútil el `update` de `awards`. Cuando el brief 06 exista, `persistAwards` deja de escribir la columna y pasa a llamar al RPC. Esta rama no toca `auth.js`.

## Privacidad

- El `npub` es opcional.
- No se almacenan claves privadas, semillas, ni `nsec`.
- No se pide la clave privada del jugador. Tampoco la semilla de una billetera.
- Ningún pago pasa por el proyecto. La comisión del ordinal la paga la billetera del jugador directo a la red.
- La clave emisora Nostr no entra al repo, ni al cliente, ni a una variable de GitHub.
- La clave `anon` de Supabase que ya está en `mp.js` y `supabase-lib.js` sigue siendo la única clave de ese servicio en el árbol. Este diseño no añade otra.

## Aviso legal (borrador)

Borrador. Requiere revisión legal humana. No está publicado en `about/` ni en la interfaz. No es consejo legal.

### English

Digital collectibles in Choppy Bitcoin are souvenirs. They have no guaranteed value. They are not an investment, not a promise of profit, and not a claim on Bitcoin or on any other asset.

A collectible does not give you rights in the game, the characters, or the artwork beyond the image file that was linked or inscribed. The illustrations were generated with AI.

A Nostr badge is a public event on third-party relays. It is not transferable under NIP-58. An Ordinal is data on a satoshi. The player who inscribes it pays the network fee from their own wallet and can later spend that satoshi. The project does not take custody of funds, does not charge a mint price, and does not pay the fee.

Relays, explorers, and the website can become unavailable. An inscribed image remains on the Bitcoin network only for as long as that network keeps the transaction. Software and rules can change.

If your age or your local law does not allow you to request this kind of souvenir, do not request it. You are responsible for fees, wallet mistakes, and local rules.

This text is a draft and needs review by a human lawyer before it is shown in the game.

### Español

Los coleccionables digitales de Choppy Bitcoin son recuerdos. No tienen un valor garantizado. No son una inversión, no prometen una ganancia y no son un derecho sobre bitcoin ni sobre otro activo.

Un coleccionable no te da derechos sobre el juego, los personajes ni el arte, más allá del archivo de imagen que se enlazó o se inscribió. Las ilustraciones se generaron con IA.

Una insignia de Nostr es un evento público en relays de terceros. Según NIP-58 no se transfiere. Un ordinal es datos sobre un satoshi. Quien lo inscribe paga la comisión de la red con su propia billetera y después puede gastar ese satoshi. El proyecto no custodia fondos, no cobra un precio por emitir y no paga la comisión.

Los relays, los exploradores y el sitio pueden dejar de estar disponibles. Una imagen inscrita sigue en la red Bitcoin mientras esa red conserve la transacción. El software y las reglas pueden cambiar.

Si tu edad o la ley de tu país no te permiten pedir este tipo de recuerdo, no lo pidas. Tú asumes las comisiones, los errores de la billetera y las reglas locales.

Este texto es un borrador y necesita revisión de un abogado humano antes de mostrarse en el juego.

## Prototipo de colección

`profile/index.html` añade un script mínimo. Solo si la URL lleva `nftpreview=1` crea la etiqueta que carga `/choppy-bitcoin/nft-preview.js?v=mp193`. Sin la bandera no hay petición. `index.html`, `game.js` y `style.css` no cambian. La versión de producción sigue en `mp192`.

La vista es solo del perfil propio, con sesión. No está en `u/index.html`, porque ese perfil es público y mostraría ilustraciones de premios secretos a cualquiera que mire la página. El CSS vive dentro de `nft-preview.js`. Las imágenes usan `loading="lazy"`. El idioma sale de `localStorage["bitcoinizate-lang"]` si es `en` o `es`; si no, del idioma del navegador.

Cada premio obtenido muestra su id, la categoría, la ilustración actual si la fila es `ok`, y las etiquetas Actual y Vintage. La vintage no se descarga: el archivo está en el hub, no en este sitio. Si falta arte, un recuadro dice que la ilustración todavía no está lista. No se emite, no se firma y no se pide un `npub`.

## Riesgos

- Hasta que `guard_awards` esté aplicado, `profiles.awards` sigue siendo escribible por el usuario. Esta rama no lo corrige, a propósito: el brief 06 implementa la verificación.
- Un cliente modificado puede fabricar evidencia verosímil. La revisión humana cubre cuatro premios, no los 46.
- Publicar `docs/nft/` en el sitio revela qué ilustración corresponde a cada premio secreto.
- Difundir los eventos de ejemplo revelaría ids secretos en el tag `d` y, además, no están firmados. No se difunden.
- Dos JPEG elegidos no caben en un reveal de relay estándar.
- `greedy` no coincide entre el texto y el código.
- La mujer del vintage mp191 de `sellout` puede ser vetada.
- El fondo de `islandInspection-a-wide.jpg` ya muestra un pueblo amurallado. Es un anacronismo de arte, no una aparición de Lena.
- Los ordinals se pueden transferir. Llamarlos intransferibles sería falso.
- La definición `30009` es reemplazable. Cambiar su `image` reescribe lo que ven los clientes.
- La derivada de 60 KB no está construida. Sin ella no hay ordinal razonable.
- `?v=mp193` se usa solo en el script de la vista previa. Otra rama en curso (`grokbuild/ci-smoke-test`) puede querer el mismo número para otros archivos. `index.html` de esta rama no se toca.

## Decisiones abiertas, en orden

1. No desplegar `docs/nft/` en el sitio público, o aceptar que el mapa de premios secretos queda en la web.
2. Elegir `d` opacos para premios secretos y guardarlos fuera del cliente, antes de cualquier relay.
3. Dónde vive la clave emisora, quién la opera, y que no entre al repo.
4. Alinear `greedy` (texto contra código) antes de encargar arte o de otorgarlo en el RPC.
5. Vetar o conservar el vintage mp191 de `sellout` (mujer de saco blanco y moño bajo).
6. Aceptar el pueblo anacrónico de `islandInspection-a-wide.jpg` como edición de `landowner`, o encargar otro encuadre.
7. Revisión humana del aviso legal antes de pegarlo en la UI o en `about/`.
8. Cifras de antigüedad de la cuenta y de pausa entre otorgamientos (propuesta: 7 días y 15 segundos).
9. Quién produce la derivada de 960×400 y en qué path se publica.
10. Más adelante, y solo si hace falta: ediciones de `career` por oficio, imagen de `chessWin` según el problema resuelto (sin escribir la jugada), y arte más ceñido para `scoop`, `unicorn`, `highRoller` y `soldPump`.

## Fuentes

- NIP-58, texto en master: https://github.com/nostr-protocol/nips/blob/master/58.md
- Cambio de la lista de perfil a kind 10008: https://github.com/nostr-protocol/nips/pull/2276
- Ordinal Theory Handbook, Inscriptions: https://docs.ordinals.com/inscriptions.html
- Límite de peso estándar de una transacción: constante `MAX_STANDARD_TX_WEIGHT` de Bitcoin Core (400000 unidades de peso). No es una tarifa.

## Fuera de esta fase

Aplicar el SQL, firmar eventos, elegir relays definitivos, inscribir en regtest o en cualquier red, construir derivadas, encargar o generar imágenes, tocar `chance/`, cambiar el otorgamiento de premios, publicar el aviso legal, y el trabajo del brief 06.
