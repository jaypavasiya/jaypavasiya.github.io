// Every visual knob for the procedural "toy Jay". Tune these against a
// reference photo; the Avatar component reads nothing else for appearance.

export type HairStyle = 'quiff' | 'short' | 'buzz' | 'curly'
export type GlassesShape = 'rounded-rect' | 'round'

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
  lensTint: string
  lensOpacity: number
  shirtColor: string
  // Small chest print / collar trim colour.
  shirtTrimColor: string
  pantsColor: string
  shoeColor: string
  soleColor: string
  beard: boolean
  beardColor: string
  mustache: boolean
}

export const avatarConfig: AvatarConfig = {
  skinColor: '#b9805a',
  skinShadeColor: '#a46c48',
  blushColor: '#e07a6a',
  blush: true,
  hairColor: '#1c1612',
  hairStyle: 'quiff',
  hairVolume: 0.7,
  eyeColor: '#17110d',
  browColor: '#1c1612',
  glassesColor: '#16151a',
  glassesShape: 'rounded-rect',
  glassesScale: 1,
  lensTint: '#cfe0ff',
  lensOpacity: 0.28,
  shirtColor: '#ff4d1a',
  shirtTrimColor: '#ffc83d',
  pantsColor: '#2b3346',
  shoeColor: '#f6f2ea',
  soleColor: '#2a2725',
  beard: false,
  beardColor: '#2a211b',
  mustache: false,
}
