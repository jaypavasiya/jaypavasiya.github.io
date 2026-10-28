// Every visual knob for the procedural "Jay". Tuned against Jay's Ready
// Player Me avatar (proportions, hair, face) and his photo (hair shape, skin).
// The Avatar component reads nothing else for appearance.

export type HairStyle = 'quiff' | 'crop' | 'buzz'
export type GlassesShape = 'rounded-rect' | 'round' | 'geometric'

export type AvatarConfig = {
  // --- Skin ---------------------------------------------------------------
  skinColor: string
  // Slightly darker skin for ears, nostrils and creases so they read in shade.
  skinShadeColor: string
  lipColor: string

  // --- Hair ---------------------------------------------------------------
  hairColor: string
  // Lighter brown caught on the crest of each strand so the texture reads.
  hairHighlightColor: string
  hairStyle: HairStyle
  // 0..1, how high the top is swept up (quiff/crop only).
  hairVolume: number
  // 0..1, how far the quiff's volume is pulled towards the front hairline.
  hairForward: number

  // --- Face ---------------------------------------------------------------
  eyeWhiteColor: string
  irisColor: string
  browColor: string

  // --- Facial hair --------------------------------------------------------
  facialHairColor: string
  mustache: boolean
  // Chin beard / goatee under the lower lip (painted + slightly raised).
  goatee: boolean
  // Painted shadow along the jaw and cheeks (vertex colour on the head).
  stubble: boolean
  stubbleColor: string
  // 0..1 blend of stubbleColor over the skin.
  stubbleStrength: number

  // --- Glasses ------------------------------------------------------------
  glasses: boolean
  glassesShape: GlassesShape
  glassesColor: string
  // Lens size multiplier (1 = sits snugly around the eyes).
  glassesScale: number
  // Rim thickness in model units (~0.004 thin wire .. 0.01 chunky acetate).
  glassesRim: number
  glassesMetal: boolean
  lensTint: string
  lensOpacity: number

  // --- Clothes ------------------------------------------------------------
  shirtColor: string
  // Ribbed crew neckline colour (same as the shirt for a plain tee).
  neckRibColor: string
  pantsColor: string
  // Contrast stitching / seams on the jeans.
  pantsSeamColor: string
  shoeColor: string
  soleColor: string
  // Small accent on the sneaker heel tab.
  shoeAccentColor: string
  watch: boolean
  watchColor: string
}

// Jay: Ready Player Me look in a plain black crew-neck tee. Short dark hair
// swept up and slightly forward, thin dark rounded-rect glasses, mustache +
// chin beard with jawline stubble, dark jeans, clean white sneakers and a
// black digital watch on the left wrist.
export const avatarConfig: AvatarConfig = {
  // Sampled from the photo: lit skin ≈ #eeaf98, shaded ≈ #b3826d.
  skinColor: '#d99c80',
  skinShadeColor: '#c3866b',
  lipColor: '#a8625a',

  hairColor: '#1c1512',
  hairHighlightColor: '#4a3529',
  hairStyle: 'quiff',
  hairVolume: 0.8,
  hairForward: 0.45,

  eyeWhiteColor: '#f4efe9',
  irisColor: '#4a2e1e',
  browColor: '#1c1512',

  facialHairColor: '#231a16',
  mustache: true,
  goatee: true,
  stubble: true,
  stubbleColor: '#5f463d',
  stubbleStrength: 0.42,

  glasses: true,
  glassesShape: 'rounded-rect',
  glassesColor: '#2a2a2e',
  glassesScale: 1,
  glassesRim: 0.0038,
  glassesMetal: false,
  lensTint: '#e6eefc',
  lensOpacity: 0.16,

  shirtColor: '#1b1b1f',
  neckRibColor: '#232328',
  pantsColor: '#262e3e',
  pantsSeamColor: '#6b5a44',
  shoeColor: '#f4f1ea',
  soleColor: '#e2dccf',
  shoeAccentColor: '#2a2a2e',
  watch: true,
  watchColor: '#151515',
}
