# Jay Pavasiya - Portfolio V2

A modern, production-ready developer portfolio featuring premium animations, 3D effects, and excellent performance.

![Portfolio Preview](https://via.placeholder.com/1200x630/0a0a0b/6366f1?text=JP+Portfolio)

## Features

### Premium Design
- **3D Hero Section** - Interactive floating shapes using Three.js/React Three Fiber
- **Smooth Animations** - Framer Motion for fluid page transitions and micro-interactions
- **Custom Cursor** - Magnetic hover effects and smooth cursor tracking
- **Glass Morphism** - Modern glass-style UI elements
- **Dark/Light Mode** - Theme persistence with smooth transitions

### Sections
- **Hero** - Full-screen intro with animated name reveal, stats, and CTA
- **About** - Professional profile with highlights and quick facts
- **Experience** - Interactive timeline with work history
- **Skills** - Animated progress bars with category filtering
- **Projects** - Case study format with problem/solution cards
- **Contact** - Professional contact form with social links

### Performance
- **Lazy Loading** - All sections lazy-loaded for fast initial load
- **Code Splitting** - Manual chunks for optimal bundle sizes
- **Vite Build** - Sub-5-second production builds
- **Smooth Scroll** - Lenis integration for premium scrolling feel

### Accessibility
- Semantic HTML throughout
- ARIA labels on interactive elements
- Keyboard navigation support
- Reduced motion support
- Focus states visible

## Tech Stack

- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **Three.js** - 3D graphics
- **React Three Fiber** - React renderer for Three.js
- **Lenis** - Smooth scroll
- **Lucide React** - Icons

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/jaypavasiya/jaypavasiya.github.io.git
cd jaypavasiya.github.io

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   └── Layout.jsx      # Main layout wrapper
│   ├── sections/
│   │   ├── Home.jsx       # Hero section
│   │   ├── About.jsx       # About section
│   │   ├── Experience.jsx  # Experience timeline
│   │   ├── Skills.jsx      # Skills showcase
│   │   ├── Projects.jsx    # Projects showcase
│   │   └── Contact.jsx     # Contact form
│   └── ui/
│       └── LoadingScreen.jsx
├── hooks/
│   └── useTheme.js         # Theme toggle hook
├── styles/
│   └── index.css           # Tailwind + custom styles
├── App.jsx                 # Main app component
└── main.jsx               # Entry point
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run deploy` | Deploy to GitHub Pages |

## Deployment

The site is configured for GitHub Pages deployment. To deploy:

```bash
npm run deploy
```

This will build the production bundle and push it to the `gh-pages` branch.

## Customization

### Adding Resume
Place your resume PDF at `public/resume.pdf` and the download button will work automatically.

### Updating Projects
Edit the `projects` array in `src/components/sections/Projects.jsx` to add your own projects.

### Theme Colors
Edit `tailwind.config.js` to customize the color scheme:

```js
colors: {
  accent: {
    DEFAULT: '#6366f1',  // Primary accent color
    light: '#818cf8',
    dark: '#4f46e5',
  },
}
```

## Testing

```bash
# Run QA tests
npm run preview -- --host &
node qa-test.js

# Run Playwright tests
npx playwright test
```

## Performance Targets

| Metric | Target |
|--------|--------|
| Performance | ≥ 95 |
| Accessibility | ≥ 95 |
| Best Practices | 100 |
| SEO | 100 |

## Known Limitations

1. Contact form is simulated (no backend connected)
2. Three.js bundle is large (~240KB gzipped) but lazy-loaded
3. Resume download requires adding `public/resume.pdf`

## Future Enhancements

- [ ] Add blog section with MDX
- [ ] Integrate GitHub API for live stats
- [ ] Add testimonials section
- [ ] Implement live project previews
- [ ] Add more 3D interactive elements
- [ ] A/B testing for hero variations

## License

MIT License - feel free to use this as a template for your own portfolio.

## Contact

- **GitHub**: [jaypavasiya](https://github.com/jaypavasiya)
- **LinkedIn**: [jaypavasiya](https://www.linkedin.com/in/jaypavasiya)
- **Twitter**: [jay_pavasiya](https://twitter.com/jay_pavasiya)
- **Email**: jaypavasiya7@gmail.com
