# Arc-card image rules

This file is the source of truth for new and replacement arc-card illustrations.

## Output and composition

- Create every replacement as a new original panoramic composition using the canonical cinematic **2.4:1** aspect ratio.
- Design the illustration to occupy all or nearly all of the available game width: approximately **480 × 200 CSS px** on desktop, with responsive scaling on smaller screens.
- **1920 × 800 px is the preferred master export size when practical, not a hard acceptance requirement.** Equivalent resolutions are acceptable only when they preserve the canonical 2.4:1 ratio, remain sharp at card size, and match the rest of the series.
- Do not crop, extend, pad, stretch, or resize an older square illustration as a replacement.
- Do not use letterboxing or internal margins to fake the panoramic format; the scene itself must fill the canvas.
- Keep principal characters and essential story information inside central safe margins.
- Maintain series consistency in aspect ratio, displayed visual height, perceived subject scale, safe margins, and framing.
- The scene must remain readable at card size. Prefer clear silhouettes and one coherent narrative beat.
- Do not add black bars, watermarks, UI chrome, or decorative borders.

## Choppy — mandatory model sheet

Use `choppy-bitcoin/chance/nobodyKnows.jpg` only as the current in-repository character reference for Choppy's design, not as a composition or prop reference.

Choppy must always have:

- a bright, saturated orange-gold coin body;
- a clean, intact, centered **white Bitcoin ₿ symbol** on the front;
- a vivid red cloth headband around the upper coin, with a visible tied knot and trailing tails;
- large black sunglasses set low on the coin;
- no nose and no mouth;
- orange arms and legs;
- white cartoon gloves with plausible fingers;
- brown-and-white sneakers.

Reject an image if the emblem is gold, dark, malformed, partly hidden, or replaced by a generic B; if the red headband is absent; if Choppy is pale yellow instead of orange; or if facial features, extra limbs, missing limbs, deformed gloves, or incorrect shoes appear.

## Character and story boundaries

- **Lena must never appear in Bitcoin Country, island, sovereignty, diplomacy, settlement, mining, citadel, independence, or bloc-war scenes.** Lena belongs to the family/relationship arc.
- Do not use an unnamed woman as a visual stand-in for Lena in an island scene.
- Include another named female character only when the card explicitly requires her. Make her role unambiguous and visually distinct from Lena.
- Madame Luck remains off-island unless the card text explicitly says she travels there. A call, message, or implied remote conversation must not be turned into her physical presence on the island.
- Use the card's current text, IDs, conditions, sequence, and approved character references to determine who is actually present. Do not add characters merely to fill the frame.

## Scope exclusions

- Do not select, edit, redraw, regenerate, retouch, remap, or change tracking status for any arc card related to `perk jobs`.
- Exclude `perk jobs` cards from all triage levels, even when their art is missing, incorrect, basic, or otherwise pending.
- If a card's relationship to `perk jobs` is uncertain, leave it untouched and choose a clearly unrelated card.

## Text, documents, and props

- Avoid visible text, numbers, percentages, currency symbols, page counts, labels, captions, interface text, and invented logos.
- Never literalize mechanical values such as “+35%” inside the art.
- Do not use piles of paperwork, foreground maps, screens, dossiers, contracts, or official documents as generic shorthand.
- Documents and props are allowed only when required by the scene, and must be plausible, secondary, unlabeled, and free of legible text.
- Prefer environmental storytelling, character blocking, gesture, lighting, and expression over signs or explanatory props.

### Reusable world-news device

- For cards whose central event is explicitly public news about the wider world, a folded fictional newspaper named **THE NEW FORK TIMES** may be the principal illustration.
- Keep its identity consistent across the series: the exact masthead `THE NEW FORK TIMES`, restrained black-and-cream broadsheet design, one concise story-specific headline, and one strong editorial photograph.
- The masthead and the single headline are intentional exceptions to the general no-text rule. Do not add subheads, captions, dates, prices, bylines, page numbers, charts, article columns, or fake filler copy.
- Crop, fold, shadow, or defocus the lower page so no body text is visible or simulated.
- Use this device only when the card describes public news; do not turn private conversations or local decisions into newspaper covers.

## Style and quality

- Use polished cinematic stylized 3D illustration with coherent lighting, believable materials, and environmental depth.
- Compose specifically for the card's story. Do not reuse a generic tropical island, boardroom, or office setup when the narrative calls for something else.
- Preserve uncropped, undistorted characters and objects.
- Reject and revise anatomy errors, extra fingers or limbs, inconsistent character design, text artifacts, weak or confusing composition, implausible objects, or contradictions with the card.

## Required review before publication

1. Inspect the full-resolution image and confirm its actual aspect ratio is **2.4:1** (allowing only negligible export/encoding tolerance); exact pixel dimensions are not mandatory.
2. Inspect it at approximately **480 × 200 CSS px**, filling the desktop card width, and in a smaller responsive viewport.
3. Compare it beside accepted cards and confirm consistent visual height, framing, safe margins, and perceived subject scale.
4. Confirm the card's characters, location, action, and narrative logic.
5. Check every Choppy invariant above when Choppy is present.
6. Confirm Lena is absent from every Bitcoin Country/island scene.
7. Confirm there is no unintended text and every prop is plausible.
8. Publish the asset, mapping, and status update only after all checks pass.
9. Keep the older image in branch/PR history until the replacement is verified.
