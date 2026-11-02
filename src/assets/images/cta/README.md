# Immagini CTA InBallet

Immagini generate con imagegen integrato, con stile fotografico realistico. Sono ambientazioni sintetiche: non documentano persone o sale reali della scuola.

## Formati

- `*-desktop.webp`: 2560 × 640, panoramica per CTA con testo centrato.
- `*-tablet.webp`: 1600 × 800, ritaglio dedicato con punto focale selezionato per tema.
- `*-mobile.webp`: 1200 × 1400, generazione verticale dedicata, soggetti nella parte inferiore.

Ogni tema ha tutti e tre i file. Le immagini WebP sono servite tramite `sfondoCta()` in `src/lib/images.ts`, con breakpoint a 900 e 600 px. Tutti i titoli e i pulsanti restano HTML, non sono inclusi nelle immagini.

## Temi e assegnazioni

| Tema | Uso |
| --- | --- |
| danza | Chi siamo, danza classica/contemporanea, Modern, adulti, lezioni individuali |
| urban | Hip-hop, Breaking, Heels, acrobatica, Contaminato, ragazzi |
| bambini | Avviamento, educazione, infanzia, bambini, classi integrate, collaborazioni con scuole |
| benessere | Yoga, Pilates, Classi |
| formazione | Formazione insegnanti e personalizzata |
| comunita | NoiConVoi, sostenitori |
| ascolto | Sportello psicologico |

## Prompt utilizzati

### danza / wide

Use case: photorealistic-natural. Create ONE premium authentic editorial PHOTOGRAPH for the contact CTA at the bottom of an Italian dance-school website (InBallet). Believable materials, skin and bodies, no illustration/CGI, no logos or text. Cohesive natural blue-gray / warm oak color palette. Existing HTML adds centered white title, paragraph and buttons, so leave the central 55% quiet and uncluttered with naturally dim architecture; do not paint fake gradients. A spacious real Italian ballet / contemporary dance studio with one adult dancer standing relaxed beside the barre at the LEFT margin, wearing simple black practice clothing. Landscape panoramic 3:1, 3072x1024 if possible. IMPORTANT: photograph from far away. People or chairs SMALL in the frame, maximum 35% of the total image height, with their highest point below y=30% and lowest point above y=70%. Place the subject group in the LEFT quarter, center and right are quiet studio/room space. It must withstand cropping the central strip to 4:1 or 5:1 without cutting off any head or feet. Natural editorial photo, no fake Photoshop blank panels.

### danza / mobile

Photorealistic InBallet CTA, dedicated portrait with negative space for copy.

### urban / wide

Use case: photorealistic-natural. Create ONE premium authentic editorial PHOTOGRAPH for the contact CTA at the bottom of an Italian dance-school website (InBallet). Believable materials, skin and bodies, no illustration/CGI, no logos or text. Cohesive natural blue-gray / warm oak color palette. Existing HTML adds centered white title, paragraph and buttons, so leave the central 55% quiet and uncluttered with naturally dim architecture; do not paint fake gradients. Urban dance rehearsal in a real modern studio: two young ADULT dancers in modest loose black and charcoal streetwear, understated hip-hop practice stance, correct anatomy. No acrobatics or exaggerated limbs. Landscape panoramic 3:1, 3072x1024 if possible. IMPORTANT: photograph from far away. All people are SMALL DISTANT figures, maximum 35% of the total image height, with heads below y=30% and feet above y=70%, located near x=20% or x=80%, never in the central half. Leave architecture above and below; suitable for cropping the central horizontal strip to 4:1 and 5:1 while keeping the entire small bodies visible.

### urban / mobile

Use case: photorealistic-natural. Create ONE premium authentic editorial PHOTOGRAPH for the contact CTA at the bottom of an Italian dance-school website (InBallet). Believable materials, skin and bodies, no illustration/CGI, no logos or text. Cohesive natural blue-gray / warm oak color palette. Existing HTML adds centered white title, paragraph and buttons, so leave the central 55% quiet and uncluttered with naturally dim architecture; do not paint fake gradients. Urban dance rehearsal in a real modern studio: two young ADULT dancers in modest loose black and charcoal streetwear, understated hip-hop practice stance, correct anatomy. No acrobatics or exaggerated limbs. Portrait 6:7, 1200x1400 if possible. The people are distant, low in the frame at the far lower-right or lower-left margin, within the bottom 30% of the image. Leave the top 65% and central area as naturally dim, uncluttered studio architecture for centered website copy. No huge closeup and no artificial blur.

### bambini / wide

Use case: photorealistic-natural. Create ONE premium authentic editorial PHOTOGRAPH for the contact CTA at the bottom of an Italian dance-school website (InBallet). Believable materials, skin and bodies, no illustration/CGI, no logos or text. Cohesive natural blue-gray / warm oak color palette. Existing HTML adds centered white title, paragraph and buttons, so leave the central 55% quiet and uncluttered with naturally dim architecture; do not paint fake gradients. A small real-looking dance class for children aged 6-9, dressed in simple modest practice T-shirts and leggings, with an adult teacher. A gentle introductory movement, no professional tutus, no jumps. Welcoming local dance-school atmosphere. Landscape panoramic 3:1, 3072x1024 if possible. IMPORTANT: photograph from far away. All people are SMALL DISTANT figures, maximum 35% of the total image height, with heads below y=30% and feet above y=70%, located near x=20% or x=80%, never in the central half. Leave architecture above and below; suitable for cropping the central horizontal strip to 4:1 and 5:1 while keeping the entire small bodies visible.

### bambini / mobile

Use case: photorealistic-natural. Create ONE premium authentic editorial PHOTOGRAPH for the contact CTA at the bottom of an Italian dance-school website (InBallet). Believable materials, skin and bodies, no illustration/CGI, no logos or text. Cohesive natural blue-gray / warm oak color palette. Existing HTML adds centered white title, paragraph and buttons, so leave the central 55% quiet and uncluttered with naturally dim architecture; do not paint fake gradients. A small real-looking dance class for children aged 6-9, dressed in simple modest practice T-shirts and leggings, with an adult teacher. A gentle introductory movement, no professional tutus, no jumps. Welcoming local dance-school atmosphere. Portrait 6:7, 1200x1400 if possible. The people are distant, low in the frame at the far lower-right or lower-left margin, within the bottom 30% of the image. Leave the top 65% and central area as naturally dim, uncluttered studio architecture for centered website copy. No huge closeup and no artificial blur.

### benessere / wide

Use case: photorealistic-natural. Create ONE premium authentic editorial PHOTOGRAPH for the contact CTA at the bottom of an Italian dance-school website (InBallet). Believable materials, skin and bodies, no illustration/CGI, no logos or text. Cohesive natural blue-gray / warm oak color palette. Existing HTML adds centered white title, paragraph and buttons, so leave the central 55% quiet and uncluttered with naturally dim architecture; do not paint fake gradients. A calm yoga and Pilates studio with two adult practitioners on charcoal exercise mats, doing simple seated or standing breathing practice with naturally correct anatomy. Quiet wellbeing, warm wood and blue-gray walls, not a spa. Landscape panoramic 3:1, 3072x1024 if possible. IMPORTANT: photograph from far away. All people are SMALL DISTANT figures, maximum 35% of the total image height, with heads below y=30% and feet above y=70%, located near x=20% or x=80%, never in the central half. Leave architecture above and below; suitable for cropping the central horizontal strip to 4:1 and 5:1 while keeping the entire small bodies visible.

### benessere / mobile

Use case: photorealistic-natural. Create ONE premium authentic editorial PHOTOGRAPH for the contact CTA at the bottom of an Italian dance-school website (InBallet). Believable materials, skin and bodies, no illustration/CGI, no logos or text. Cohesive natural blue-gray / warm oak color palette. Existing HTML adds centered white title, paragraph and buttons, so leave the central 55% quiet and uncluttered with naturally dim architecture; do not paint fake gradients. A calm yoga and Pilates studio with two adult practitioners on charcoal exercise mats, doing simple seated or standing breathing practice with naturally correct anatomy. Quiet wellbeing, warm wood and blue-gray walls, not a spa. Portrait 6:7, 1200x1400 if possible. The people are distant, low in the frame at the far lower-right or lower-left margin, within the bottom 30% of the image. Leave the top 65% and central area as naturally dim, uncluttered studio architecture for centered website copy. No huge closeup and no artificial blur.

### formazione / wide

Use case: photorealistic-natural. Create ONE premium authentic editorial PHOTOGRAPH for the contact CTA at the bottom of an Italian dance-school website (InBallet). Believable materials, skin and bodies, no illustration/CGI, no logos or text. Cohesive natural blue-gray / warm oak color palette. Existing HTML adds centered white title, paragraph and buttons, so leave the central 55% quiet and uncluttered with naturally dim architecture; do not paint fake gradients. A professional dance teacher mentoring one adult trainee beside a studio barre, both wearing understated modest black practice clothes, an authentic conversational teaching moment. A closed notebook rests on a bench at the edge, no readable text. Landscape panoramic 3:1, 3072x1024 if possible. IMPORTANT: photograph from far away. People or chairs SMALL in the frame, maximum 35% of the total image height, with their highest point below y=30% and lowest point above y=70%. Place the subject group in the LEFT quarter, center and right are quiet studio/room space. It must withstand cropping the central strip to 4:1 or 5:1 without cutting off any head or feet. Natural editorial photo, no fake Photoshop blank panels.

### formazione / mobile

Use case: photorealistic-natural. Create ONE premium authentic editorial PHOTOGRAPH for the contact CTA at the bottom of an Italian dance-school website (InBallet). Believable materials, skin and bodies, no illustration/CGI, no logos or text. Cohesive natural blue-gray / warm oak color palette. Existing HTML adds centered white title, paragraph and buttons, so leave the central 55% quiet and uncluttered with naturally dim architecture; do not paint fake gradients. A professional dance teacher mentoring one adult trainee beside a studio barre, both wearing understated modest black practice clothes, an authentic conversational teaching moment. A closed notebook rests on a bench at the edge, no readable text. Portrait 6:7, 1200x1400 if possible. All people/chairs/props low and to the right, occupying the BOTTOM 30% of the frame, leaving top 65% and center quiet and naturally dim for centered white website copy. Use a real photographic interior. No closeups.

### comunita / wide

Use case: photorealistic-natural. Create ONE premium authentic editorial PHOTOGRAPH for the contact CTA at the bottom of an Italian dance-school website (InBallet). Believable materials, skin and bodies, no illustration/CGI, no logos or text. Cohesive natural blue-gray / warm oak color palette. Existing HTML adds centered white title, paragraph and buttons, so leave the central 55% quiet and uncluttered with naturally dim architecture; do not paint fake gradients. An inclusive Italian community movement workshop, a small diverse group of adults of varied ages and abilities including one adult wheelchair user, standing or seated in a loose circle doing a simple expressive hand movement with a facilitator. Natural, dignified, candid, no charity stereotypes, no impossible anatomy. Landscape panoramic 3:1, 3072x1024 if possible. IMPORTANT: photograph from far away. People or chairs SMALL in the frame, maximum 35% of the total image height, with their highest point below y=30% and lowest point above y=70%. Place the subject group in the LEFT quarter, center and right are quiet studio/room space. It must withstand cropping the central strip to 4:1 or 5:1 without cutting off any head or feet. Natural editorial photo, no fake Photoshop blank panels.

### comunita / mobile

Use case: photorealistic-natural. Create ONE premium authentic editorial PHOTOGRAPH for the contact CTA at the bottom of an Italian dance-school website (InBallet). Believable materials, skin and bodies, no illustration/CGI, no logos or text. Cohesive natural blue-gray / warm oak color palette. Existing HTML adds centered white title, paragraph and buttons, so leave the central 55% quiet and uncluttered with naturally dim architecture; do not paint fake gradients. An inclusive Italian community movement workshop, a small diverse group of adults of varied ages and abilities including one adult wheelchair user, standing or seated in a loose circle doing a simple expressive hand movement with a facilitator. Natural, dignified, candid, no charity stereotypes, no impossible anatomy. Portrait 6:7, 1200x1400 if possible. All people/chairs/props low and to the right, occupying the BOTTOM 30% of the frame, leaving top 65% and center quiet and naturally dim for centered white website copy. Use a real photographic interior. No closeups.

### ascolto / wide

Use case: photorealistic-natural. Create ONE premium authentic editorial PHOTOGRAPH for the contact CTA at the bottom of an Italian dance-school website (InBallet). Believable materials, skin and bodies, no illustration/CGI, no logos or text. Cohesive natural blue-gray / warm oak color palette. Existing HTML adds centered white title, paragraph and buttons, so leave the central 55% quiet and uncluttered with naturally dim architecture; do not paint fake gradients. A welcoming, tasteful private counseling room in an Italian community center: two simple comfortable fabric armchairs facing each other obliquely, a warm reading lamp, a small plant, a discreet closed notebook. No people, no medical equipment, no writing. Calm, safe and authentic rather than luxurious. Landscape panoramic 3:1, 3072x1024 if possible. IMPORTANT: photograph from far away. People or chairs SMALL in the frame, maximum 35% of the total image height, with their highest point below y=30% and lowest point above y=70%. Place the subject group in the LEFT quarter, center and right are quiet studio/room space. It must withstand cropping the central strip to 4:1 or 5:1 without cutting off any head or feet. Natural editorial photo, no fake Photoshop blank panels.

### ascolto / mobile

Use case: photorealistic-natural. Create ONE premium authentic editorial PHOTOGRAPH for the contact CTA at the bottom of an Italian dance-school website (InBallet). Believable materials, skin and bodies, no illustration/CGI, no logos or text. Cohesive natural blue-gray / warm oak color palette. Existing HTML adds centered white title, paragraph and buttons, so leave the central 55% quiet and uncluttered with naturally dim architecture; do not paint fake gradients. A welcoming, tasteful private counseling room in an Italian community center: two simple comfortable fabric armchairs facing each other obliquely, a warm reading lamp, a small plant, a discreet closed notebook. No people, no medical equipment, no writing. Calm, safe and authentic rather than luxurious. Portrait 6:7, 1200x1400 if possible. All people/chairs/props low and to the right, occupying the BOTTOM 30% of the frame, leaving top 65% and center quiet and naturally dim for centered white website copy. Use a real photographic interior. No closeups.

