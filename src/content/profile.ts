// Single source of truth for everything personal on the site.
// Only facts confirmed from Jay's GitHub profile/README are filled in.
// Anything marked `pending: true` is waiting on Jay's LinkedIn export and
// renders with a visible "to confirm" tag until it is verified.

export const profile = {
  name: 'Jay Pavasiya',
  firstName: 'Jay',
  role: 'Full-Stack Developer',
  tagline: 'Shipping with AI',
  location: 'Gujarat, India',
  intro:
    'I build end to end: pixel-perfect frontends, the APIs behind them, and the real-time bits in between.',
  about: [
    'I’m a full-stack developer from Gujarat, India. I started on the frontend, fell for React, and kept going down the stack until I could ship a whole product on my own.',
    'These days I pair-program with AI coding tools every day. They take me from idea to shipped feature much faster, so my time goes into product and architecture instead of boilerplate.',
  ],
  askMeAbout: ['shipping fast with AI', 'React architecture', 'state management', 'real-time apps'],
  email: 'jaypavasiya7@gmail.com',
  socials: [
    { label: 'GitHub', href: 'https://github.com/jaypavasiya' },
    { label: 'LinkedIn', href: 'https://in.linkedin.com/in/jaypavasiya' },
    { label: 'X', href: 'https://x.com/jay_pavasiya' },
    { label: 'Stack Overflow', href: 'https://stackoverflow.com/users/13516564/jay' },
  ],
} as const

export type Job = {
  company: string
  role: string
  period: string
  summary: string
  pending?: boolean
}

// TODO(jay): replace with LinkedIn experience. These came from an earlier
// draft of the site and have not been verified.
export const experience: Job[] = [
  {
    company: 'Adsparkx · Vibelets',
    role: 'Developer',
    period: '2022 to now',
    summary: 'Building Vibelets, an AI marketing product: chat-driven UX, real-time streaming and the React data layer behind it.',
    pending: true,
  },
  {
    company: 'Light-Line',
    role: 'Frontend Developer',
    period: '2021 to 2022',
    summary: 'Frontend work across client web apps with React and Angular.',
    pending: true,
  },
  {
    company: 'Freelance',
    role: 'Web Developer',
    period: '2020 to 2021',
    summary: 'Websites and small web apps for clients.',
    pending: true,
  },
]

export type Project = {
  name: string
  blurb: string
  tags: string[]
  href: string
  year: string
}

// Real public repositories on github.com/jaypavasiya.
export const projects: Project[] = [
  {
    name: 'This portfolio',
    blurb: 'A playable portfolio: a physics world, a toy version of me, and too much kinetic type.',
    tags: ['React', 'Three.js', 'Rapier', 'GSAP'],
    href: 'https://github.com/jaypavasiya/jaypavasiya.github.io',
    year: '2026',
  },
  {
    name: 'Chat Server',
    blurb: 'A simple real-time chat server over WebSockets.',
    tags: ['Node.js', 'Socket.IO'],
    href: 'https://github.com/jaypavasiya/chat-server',
    year: '2022',
  },
  {
    name: 'React + TypeScript + React Query',
    blurb: 'A starter for typed data fetching with React Query.',
    tags: ['React', 'TypeScript', 'React Query'],
    href: 'https://github.com/jaypavasiya/react-with-typescript',
    year: '2022',
  },
  {
    name: 'Snake Game',
    blurb: 'The classic, rebuilt in React.',
    tags: ['React', 'Game loop'],
    href: 'https://github.com/jaypavasiya/snake-game',
    year: '2022',
  },
  {
    name: 'React Boilerplate with Redux',
    blurb: 'An opinionated Create React App setup with Redux wired in.',
    tags: ['React', 'Redux'],
    href: 'https://github.com/jaypavasiya/react-boilerplate-with-redux',
    year: '2022',
  },
  {
    name: 'Hello, every language',
    blurb: 'Hello world in as many programming languages as people will contribute.',
    tags: ['Open source'],
    href: 'https://github.com/jaypavasiya/knowledge-share-multi-language',
    year: '2021',
  },
]

export const skills = {
  frontend: ['React', 'TypeScript', 'Next.js', 'Astro', 'Angular', 'Redux', 'Tailwind', 'Sass', 'Three.js', 'GSAP'],
  backend: ['Node.js', 'Express', 'REST', 'WebSockets', 'MongoDB', 'PostgreSQL'],
  tools: ['Docker', 'Git', 'GitHub Actions', 'Vercel', 'Figma', 'AI agents'],
}
