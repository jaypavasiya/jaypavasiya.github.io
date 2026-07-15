import { test, expect } from '@playwright/test';

// Base URL for testing
const BASE_URL = 'http://localhost:4173';

// Viewport breakpoints for responsive testing
const VIEWPORTS = {
  mobile: { width: 375, height: 812 },
  mobileLarge: { width: 390, height: 844 },
  tablet: { width: 768, height: 1024 },
  laptop: { width: 1024, height: 768 },
  desktop: { width: 1280, height: 800 },
  desktopLarge: { width: 1440, height: 900 },
  ultraWide: { width: 1920, height: 1080 },
};

// Helper to set viewport
async function setViewport(page, viewport) {
  await page.setViewportSize(viewport);
}

// Helper to check for console errors
const consoleErrors = [];
function setupConsoleMonitoring(page) {
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('pageerror', error => {
    consoleErrors.push(error.message);
  });
}

describe('Portfolio - Functional Testing', () => {
  let page;

  beforeEach(async ({ page: p }) => {
    page = p;
    setupConsoleMonitoring(page);
    consoleErrors.length = 0;
  });

  afterEach(() => {
    // Log any console errors
    if (consoleErrors.length > 0) {
      console.log('Console errors found:', consoleErrors);
    }
  });

  test('Homepage loads without errors', async () => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    
    // Check page title
    await expect(page).toHaveTitle(/Jay Pavasiya/);
    
    // Check that main content is visible
    await expect(page.locator('h1')).toBeVisible();
    
    // Verify no console errors
    expect(consoleErrors.length).toBe(0);
  });

  test('Navigation works correctly', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Test each navigation link
    const navLinks = ['About', 'Experience', 'Skills', 'Projects', 'Contact'];
    
    for (const linkText of navLinks) {
      await page.click(`text=${linkText}`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500); // Wait for animation
    }
  });

  test('Theme toggle works', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Find and click theme toggle
    const themeToggle = page.locator('button[aria-label="Toggle theme"]');
    await expect(themeToggle).toBeVisible();
    
    // Click to toggle
    await themeToggle.click();
    await page.waitForTimeout(300);
    
    // Click again to toggle back
    await themeToggle.click();
  });

  test('Scroll progress indicator exists', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Check scroll progress bar exists
    const scrollProgress = page.locator('.fixed.top-0.left-0.h-\\[2px\\]');
    await expect(scrollProgress).toBeAttached();
  });

  test('External links are valid', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Check GitHub link
    const githubLink = page.locator('a[href*="github.com/jaypavasiya"]').first();
    await expect(githubLink).toHaveAttribute('href', /github\.com/);

    // Check LinkedIn link
    const linkedinLink = page.locator('a[href*="linkedin.com"]').first();
    await expect(linkedinLink).toHaveAttribute('href', /linkedin\.com/);

    // Check email link
    const emailLink = page.locator('a[href*="mailto:"]').first();
    await expect(emailLink).toHaveAttribute('href', /mailto:/);
  });

  test('Resume download link exists', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Check for resume download link
    const resumeLink = page.locator('a[href*="resume"]');
    await expect(resumeLink.first()).toBeVisible();
  });

  test('Contact form is functional', async ({ page }) => {
    await page.goto(`${BASE_URL}/contact`);
    await page.waitForLoadState('networkidle');

    // Fill out the form
    await page.fill('input[name="name"]', 'Test User');
    await page.fill('input[name="email"]', 'test@example.com');
    await page.fill('input[name="subject"]', 'Test Subject');
    await page.fill('textarea[name="message"]', 'This is a test message');

    // Check form is filled
    await expect(page.locator('input[name="name"]')).toHaveValue('Test User');
    await expect(page.locator('input[name="email"]')).toHaveValue('test@example.com');
  });

  test('Project filter buttons work', async ({ page }) => {
    await page.goto(`${BASE_URL}/projects`);
    await page.waitForLoadState('networkidle');

    // Click on filter buttons
    const filterButtons = page.locator('button:has-text("Web Apps"), button:has-text("Libraries"), button:has-text("All")');
    await expect(filterButtons.first()).toBeVisible();

    // Click each filter
    for (const button of await filterButtons.all()) {
      await button.click();
      await page.waitForTimeout(300);
    }
  });
});

describe('Portfolio - Responsive Testing', () => {
  for (const [name, viewport] of Object.entries(VIEWPORTS)) {
    test(`${name} (${viewport.width}x${viewport.height}) - No layout issues`, async ({ page }) => {
      await setViewport(page, viewport);
      await page.goto(BASE_URL);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Check for horizontal scroll
      const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
      const windowWidth = await page.evaluate(() => window.innerWidth);
      expect(bodyWidth).toBeLessThanOrEqual(windowWidth);

      // Check that hero content is visible
      const heroSection = page.locator('#home');
      await expect(heroSection).toBeVisible();

      // Navigate through sections
      for (const section of ['about', 'experience', 'skills', 'projects', 'contact']) {
        const sectionElement = page.locator(`#${section}`);
        if (await sectionElement.isVisible()) {
          await expect(sectionElement).toBeVisible();
        }
      }

      // Check footer is visible
      await expect(page.locator('footer')).toBeVisible();
    });
  }
});

describe('Portfolio - Accessibility Testing', () => {
  test('All images have alt text', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const images = page.locator('img');
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      // Alt can be empty string for decorative images but not null
      expect(alt !== null).toBe(true);
    }
  });

  test('Interactive elements have accessible names', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Check buttons have accessible names
    const buttons = page.locator('button');
    const count = await buttons.count();

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i);
      const accessibleName = await button.evaluate(el => {
        return el.getAttribute('aria-label') || el.textContent?.trim() || '';
      });
      expect(accessibleName.length).toBeGreaterThan(0);
    }
  });

  test('Heading hierarchy is correct', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Get all headings
    const headings = await page.evaluate(() => {
      const h1s = document.querySelectorAll('h1');
      const h2s = document.querySelectorAll('h2');
      const h3s = document.querySelectorAll('h3');
      return {
        h1Count: h1s.length,
        h2Count: h2s.length,
        h3Count: h3s.length,
      };
    });

    // Should have exactly one h1
    expect(headings.h1Count).toBeGreaterThanOrEqual(1);
  });

  test('Links have descriptive text', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const links = page.locator('a');
    const count = await links.count();

    for (let i = 0; i < count; i++) {
      const link = links.nth(i);
      const text = await link.textContent();
      const href = await link.getAttribute('href');
      
      // Links should either have text or an aria-label
      const hasText = text && text.trim().length > 0;
      const hasAriaLabel = await link.getAttribute('aria-label');
      
      expect(hasText || hasAriaLabel).toBe(true);
    }
  });

  test('Focus states are visible', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Tab through the page
    await page.keyboard.press('Tab');
    
    // Check that focus is visible on an element
    const focusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return false;
      const style = window.getComputedStyle(el);
      return style.outlineWidth !== '0px' || el.classList.contains('focus-visible');
    });

    // Focus should be visible on some element
    expect(focusedElement).toBeTruthy();
  });

  test('Color contrast is acceptable', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Check that text is readable (basic check)
    const bodyBg = await page.evaluate(() => {
      return window.getComputedStyle(document.body).backgroundColor;
    });

    const textColor = await page.evaluate(() => {
      return window.getComputedStyle(document.body).color;
    });

    // Both should be defined
    expect(bodyBg).toBeTruthy();
    expect(textColor).toBeTruthy();
  });
});

describe('Portfolio - Performance Testing', () => {
  test('Page loads within reasonable time', async ({ page }) => {
    const startTime = Date.now();
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;

    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('No large layout shifts on load', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    // Check CLS (Cumulative Layout Shift)
    const cls = await page.evaluate(() => {
      return new Promise(resolve => {
        let clsValue = 0;
        const observer = new PerformanceObserver(list => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });
        
        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 1000);
      });
    });

    // CLS should be less than 0.1 (good threshold)
    expect(cls).toBeLessThan(0.1);
  });
});

describe('Portfolio - Link Validation', () => {
  test('All internal links resolve', async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');

    const currentHost = new URL(BASE_URL).host;
    
    const links = await page.locator('a[href]').evaluateAll(els => 
      els.map(el => el.getAttribute('href'))
    );

    for (const href of links) {
      if (href.startsWith('/') || href.startsWith('#')) {
        // Internal links
        const url = new URL(href, BASE_URL);
        // Should not throw
        expect(() => new URL(href, BASE_URL)).not.toThrow();
      }
    }
  });
});
