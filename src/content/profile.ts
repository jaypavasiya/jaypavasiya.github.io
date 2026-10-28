// Single source of truth for everything personal on the site.
// Sources: Jay's LinkedIn export (Oct 2026) and GitHub profile README.
// Anything marked `pending: true` renders with a visible "to confirm" tag.

export const profile = {
  name: 'Jay Pavasiya',
  firstName: 'Jay',
  role: 'Senior Software Engineer',
  // Short line under the role in the hero.
  focus: 'React, TypeScript & real-time UI',
  since: 2019,
  intro:
    'I build modern, scalable web apps: pixel-perfect frontends, the real-time bits behind them, and enough backend to ship the whole thing.',
  about: [
    'I started in 2019 as a graphic designer, moved into React the same year and haven’t looked back. Today I’m a senior software engineer at Vibelets.ai.',
    'Most of my days are React: React Query, Redux, custom hooks and Context, built with Vite or Webpack, tested with Cypress. I like real-time apps over WebSockets, and I use Python for backend services, automation and integrations.',
  ],
  askMeAbout: ['React architecture', 'real-time apps', 'testing with Cypress', 'build tooling', 'WebAssembly'],
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
  summary: string
  pending?: boolean
}

// From LinkedIn, newest first. Summaries only state what the profile says.
export const experience: Job[] = [
  {
    company: 'Vibelets.ai',
    role: 'Senior Software Engineer',
    period: 'Sep 2025 to now',
    summary: 'Frontend for Vibelets, an AI marketing product: chat-driven agent UX, real-time streaming and the React data layer behind it.',
  },
  {
    company: 'Adsparkx',
    role: 'Frontend Developer',
    period: 'Jul 2023 to now',
    summary: 'Frontend development in JavaScript and React across Adsparkx’s ad-tech products.',
  },
  {
    company: 'Across Infotech',
    role: 'Frontend Developer',
    period: 'Jul 2023 to Dec 2024',
    summary: 'Front-end development with React.js.',
  },
  {
    company: 'Eliteware Solutions',
    role: 'Frontend Developer · Freelance',
    period: 'Jan 2023 to Jun 2023',
    summary: 'Freelance front-end development in JavaScript.',
  },
  {
    company: 'Artoon Solutions',
    role: 'Sr. React.js Developer',
    period: 'Dec 2019 to Jan 2023',
    summary: 'Three years of React and TypeScript front-end development, growing into a senior React role.',
  },
  {
    company: 'Oceantecnoweb',
    role: 'Graphic Designer',
    period: 'Mar 2019 to Oct 2019',
    summary: 'Where it started: design first, code second. It still shapes how I build UI.',
  },
]

export const education = {
  school: 'Sutex Bank College of Computer Applications',
  degree: 'Bachelor’s, Computer Science',
  period: '2016 to 2019',
}

export type CompanyProject = {
  product: string
  company: string
  role: string
  period: string
  // The product's own public pitch, from its website.
  pitch: string
  // What Jay worked on, kept high level: the details are under NDA.
  focus: string[]
  stack: string[]
  url: string
}

// Company work. Shown as confidential cases: what the product is (public),
// what Jay owned (high level), and a link to the public site. No screenshots,
// metrics or internals without the company's approval.
export const companyWork: CompanyProject[] = [
  {
    product: 'Vibelets',
    company: 'Vibelets.ai',
    role: 'Senior Software Engineer',
    period: '2025 to now',
    pitch: 'An AI growth team for Meta ads: it learns the business, plans next week’s ads, then creates and launches them, with the owner approving every move.',
    focus: ['Chat and agent experience', 'Real-time streaming UI', 'React data layer and state'],
    stack: ['React', 'TypeScript', 'React Query', 'Redux', 'WebSockets'],
    url: 'https://vibelets.ai',
  },
  {
    product: 'AdUnbox',
    company: 'Adsparkx',
    role: 'Frontend Developer',
    period: '2023 to now',
    pitch: 'An ad management platform that handles ad automations and performance tracking, so teams can focus on growth.',
    focus: ['Campaign and automation dashboards', 'Performance reporting UI', 'Shared component system'],
    stack: ['React', 'JavaScript', 'SCSS'],
    url: 'https://adunbox.com',
  },
]

export type Project = {
  name: string
  blurb: string
  tags: string[]
  href: string
  year: string
}

// Side projects: public repositories on github.com/jaypavasiya.
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
]

export const skills = {
  frontend: ['React', 'TypeScript', 'Next.js', 'React Query', 'Redux', 'Tailwind', 'SCSS', 'Astro', 'Angular', 'Three.js', 'GSAP'],
  backend: ['Node.js', 'Python', 'Express', 'WebSockets', 'Socket.io', 'MongoDB', 'PostgreSQL'],
  tools: ['Vite', 'Webpack', 'Cypress', 'Selenium', 'Docker', 'Git', 'GitHub Actions', 'Figma', 'AI agents'],
}
