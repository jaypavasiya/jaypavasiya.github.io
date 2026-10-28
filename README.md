# jaypavasiya.github.io (v3)

A playable portfolio. Walk a toy version of me around a physics island, knock the letters of my name over, then scroll through the rest of the site.

Inspired by [Bruno Simon](https://bruno-simon.com), [Stas Bondar](https://www.stabondar.com) and [Antoine Wodniack](https://wodniack.dev).

## Stack

- Vite, React 19, TypeScript
- Three.js with React Three Fiber, drei and Rapier physics for the hero
- GSAP (SplitText, ScrambleText, Flip, ScrollTrigger) and Lenis for motion
- Matter.js for the skills pile

## Run it

Needs Node 22.12 or newer.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check and build to dist/
```

## Edit content

Everything personal lives in `src/content/profile.ts`. Entries marked `pending: true` show a "to confirm" tag on the site until they are verified.

The 3D character's look (skin, hair, glasses, clothes) is in `src/three/avatarConfig.ts`.

## Deploy

`.github/workflows/deploy.yml` builds and publishes to GitHub Pages on every push to `master`. It needs **Settings → Pages → Source** set to **GitHub Actions**.
