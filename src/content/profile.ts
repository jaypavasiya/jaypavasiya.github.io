// Single source of truth for everything personal on the site.
// Sources: Jay's LinkedIn export (Oct 2026) and GitHub profile README.
// Anything marked `pending: true` renders with a visible "to confirm" tag.

export const profile = {
  name: 'Jay Pavasiya',
  firstName: 'Jay',
  role: 'Senior Frontend Developer',
  tagline: 'Shipping with AI',
  location: 'Gujarat, India',
  intro:
    'I build modern, scalable web apps: pixel-perfect frontends, the real-time bits behind them, and enough backend to ship the whole thing.',
  about: [
    'I started in 2019 as a graphic designer, moved into React the same year and haven’t looked back. Today I’m a senior frontend developer on Vibelets.ai, working remotely from Gujarat.',
    'Most of my days are React: React Query, Redux, custom hooks and Context, built with Vite or Webpack, tested with Cypress. I like real-time apps over WebSockets, and I use Python for backend services, automation and integrations.',
    'I pair-program with AI coding tools every day. They take me from idea to shipped feature much faster, so my time goes into product and architecture instead of boilerplate.',
  ],
  askMeAbout: ['React architecture', 'real-time apps', 'shipping fast with AI', 'build tooling', 'WebAssembly'],
  email: 'jaypavasiya7@gmail.com',
  socials: [
    { label: 'GitHub', href: 'https://github.com/jaypavasiya' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/in/jaypavasiya' },
    { label: 'X', href: 'https://x.com/jay_pavasiya' },
    { label: 'Stack Overflow', href: 'https://stackoverflow.com/users/13516564/jay' },
  ],
} as const

export type Job = {
  company: string
  role: string
  period: string
  location: string
  summary: string
  pending?: boolean
}

// From LinkedIn, newest first. Summaries only state what the profile says.
export const experience: Job[] = [
  {
    company: 'Vibelets.ai',
    role: 'Senior Frontend Developer',
    period: 'Sep 2025 to now',
    location: 'Gurugram · Remote',
    summary: 'Frontend for Vibelets, an AI marketing product: chat-driven agent UX, real-time streaming and the React data layer behind it.',
  },
  {
    company: 'Adsparkx',
    role: 'Frontend Developer',
    period: 'Jul 2023 to now',
    location: 'Delhi · Remote',
    summary: 'Frontend development in JavaScript and React across Adsparkx’s ad-tech products.',
  },
  {
    company: 'Across Infotech',
    role: 'Frontend Developer',
    period: 'Jul 2023 to Dec 2024',
    location: 'Surat, Gujarat',
    summary: 'Front-end development with React.js.',
  },
  {
    company: 'Eliteware Solutions',
    role: 'Frontend Developer · Freelance',
    period: 'Jan 2023 to Jun 2023',
    location: 'Vadodara · Remote',
    summary: 'Freelance front-end development in JavaScript.',
  },
  {
    company: 'Artoon Solutions',
    role: 'Sr. React.js Developer',
    period: 'Dec 2019 to Jan 2023',
    location: 'Surat, Gujarat',
    summary: 'Three years of React and TypeScript front-end development, growing into a senior React role.',
  },
  {
    company: 'Oceantecnoweb',
    role: 'Graphic Designer',
    period: 'Mar 2019 to Oct 2019',
    location: 'Surat, Gujarat',
    summary: 'Where it started: design first, code second. It still shapes how I build UI.',
  },
]

export const education = {
  school: 'Sutex Bank College of Computer Applications',
  degree: 'Bachelor’s, Computer Science',
  period: '2016 to 2019',
}

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
  frontend: ['React', 'TypeScript', 'Next.js', 'React Query', 'Redux', 'Tailwind', 'SCSS', 'Astro', 'Angular', 'Three.js', 'GSAP'],
  backend: ['Node.js', 'Python', 'Express', 'WebSockets', 'Socket.io', 'MongoDB', 'PostgreSQL'],
  tools: ['Vite', 'Webpack', 'Cypress', 'Selenium', 'Docker', 'Git', 'GitHub Actions', 'Figma', 'AI agents'],
}
