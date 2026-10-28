// Every visual knob for the procedural "toy Jay". Tune these against a
// reference photo; the Avatar component reads nothing else for appearance.

export type HairStyle = 'quiff' | 'short' | 'buzz' | 'curly'
export type GlassesShape = 'rounded-rect' | 'round' | 'geometric'
export type ShirtStyle = 'tee' | 'polo'

export type AvatarConfig = {
  skinColor: string
  // Slightly darker skin used for nose, ears and hands so they read in shade.
  skinShadeColor: string
  blushColor: string
  blush: boolean
  hairColor: string
  hairStyle: HairStyle
  // 0..1, how far the fringe/quiff sticks up.
  hairVolume: number
  eyeColor: string
  browColor: string
  glassesColor: string
  glassesShape: GlassesShape
  // Frame size multiplier (1 = sits snugly around the eyes).
  glassesScale: number
  // Thin metal wire instead of a chunky acetate frame.
  glassesWire: boolean
  // Optional darker bar along the top of each lens (browline frames).
  glassesBrowColor: string | null
  lensTint: string
  lensOpacity: number
  shirtColor: string
  shirtStyle: ShirtStyle
  // Small chest print / collar trim / button colour.
  shirtTrimColor: string
  watch: boolean
  watchColor: string
  pantsColor: string
  shoeColor: string
  soleColor: string
  beard: boolean
  beardColor: string
  mustache: boolean
}

// Tuned from Jay's photo: short black hair swept up on top, full short
// beard, thin gold-wire geometric glasses with a dark browline, black
// collared shirt, black digital watch.
export const avatarConfig: AvatarConfig = {
  // Sampled from the photo: lit skin ≈ #eeaf98, shaded ≈ #b3826d.
  // The scene lighting brightens the base a little, so it sits between.
  skinColor: '#d99c80',
  skinShadeColor: '#c3866b',
  blushColor: '#e07a6a',
  blush: false,
  hairColor: '#151110',
  hairStyle: 'quiff',
  hairVolume: 0.85,
  eyeColor: '#17110d',
  browColor: '#151110',
  glassesColor: '#c9b58a',
  glassesShape: 'geometric',
  glassesScale: 1.04,
  glassesWire: true,
  glassesBrowColor: '#1a1816',
  lensTint: '#dfe9ff',
  lensOpacity: 0.22,
  shirtColor: '#1f1e22',
  shirtStyle: 'polo',
  shirtTrimColor: '#55545c',
  watch: true,
  watchColor: '#141414',
  pantsColor: '#34405a',
  shoeColor: '#f6f2ea',
  soleColor: '#2a2725',
  beard: true,
  beardColor: '#151110',
  mustache: true,
}
