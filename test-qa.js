import { chromium } from 'playwright';
import { writeFileSync, mkdirSync, existsSync } from 'fs';

const BASE_URL = 'http://localhost:4173';
const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, '-');
const TEST_DIR = `./test-log/${TIMESTAMP}`;

// Ensure test directory exists
if (!existsSync(TEST_DIR)) {
  mkdirSync(TEST_DIR, { recursive: true });
}

const VIEWPORTS = {
  mobile: { width: 375, height: 812, name: 'mobile-375' },
  tablet: { width: 768, height: 1024, name: 'tablet-768' },
  desktop: { width: 1440, height: 900, name: 'desktop-1440' },
};

const PAGES = [
  { path: '/', name: 'Home' },
  { path: '/about', name: 'About' },
  { path: '/experience', name: 'Experience' },
  { path: '/skills', name: 'Skills' },
  { path: '/projects', name: 'Projects' },
  { path: '/contact', name: 'Contact' },
];

async function screenshotPage(page, url, viewport, name) {
  await page.setViewportSize({ width: viewport.width, height: viewport.height });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  
  const path = `${TEST_DIR}/${name}-${viewport.name}.png`;
  await page.screenshot({ path, fullPage: false });
  console.log(`  📸 Screenshot: ${path}`);
  return path;
}

async function checkConsole(page) {
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', err => errors.push(err.message));
  return errors;
}

async function checkAccessibility(page) {
  const issues = [];
  
  // Check for images without alt
  const imagesWithoutAlt = await page.$$eval('img', imgs => imgs.filter(img => !img.getAttribute('alt') && !img.getAttribute('aria-hidden')).length);
  if (imagesWithoutAlt > 0) issues.push(`Images without alt: ${imagesWithoutAlt}`);

  // Check h1 count
  const h1Count = await page.$$eval('h1', h1s => h1s.length);
  if (h1Count !== 1) issues.push(`h1 count: ${h1Count} (expected 1)`);

  // Check lang attribute
  const hasLang = await page.$eval('html', el => el.hasAttribute('lang'));
  if (!hasLang) issues.push('Missing lang attribute');

  // Check for buttons without accessible names
  const buttonsWithoutNames = await page.$$eval('button', btns => 
    btns.filter(btn => !btn.getAttribute('aria-label') && !btn.textContent.trim()).length
  );
  if (buttonsWithoutNames > 0) issues.push(`Buttons without names: ${buttonsWithoutNames}`);

  return issues;
}

async function getMetrics(page) {
  return await page.evaluate(() => {
    const entries = performance.getEntriesByType('navigation');
    const nav = entries[0] || {};
    return {
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd - nav.fetchStart),
      load: Math.round(nav.loadEventEnd - nav.fetchStart),
      firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
    };
  });
}

async function checkLayout(page) {
  const issues = [];
  
  // Check for horizontal scroll
  const hasHorizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  if (hasHorizontalScroll) issues.push('Horizontal scroll detected');

  // Check for elements overflowing viewport
  const overflowElements = await page.evaluate(() => {
    const elements = document.querySelectorAll('*');
    const overflowing = [];
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.right > window.innerWidth + 10 || rect.bottom > window.innerHeight + 10) {
        if (el.offsetWidth > 0) overflowing.push(el.tagName);
      }
    });
    return [...new Set(overflowing)].slice(0, 5);
  });
  if (overflowElements.length > 0) {
    issues.push(`Overflow elements: ${overflowElements.join(', ')}`);
  }

  return issues;
}

async function runTests() {
  console.log('🚀 Starting Portfolio QA Tests\n');
  console.log(`📁 Output: ${TEST_DIR}\n`);

  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const viewport of Object.values(VIEWPORTS)) {
    console.log(`\n${'═'.repeat(50)}`);
    console.log(`📱 Testing: ${viewport.name} (${viewport.width}x${viewport.height})`);
    console.log('═'.repeat(50));

    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
    });
    const page = await context.newPage();

    for (const pageInfo of PAGES) {
      const url = `${BASE_URL}${pageInfo.path}`;
      console.log(`\n  📄 ${pageInfo.name}:`);
      
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      page.on('pageerror', err => errors.push(err.message));

      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
        await page.waitForTimeout(500);

        // Take screenshot
        const imgPath = `${TEST_DIR}/${pageInfo.name.toLowerCase()}-${viewport.name}.png`;
        await page.screenshot({ path: imgPath, fullPage: false });
        console.log(`    ✓ Screenshot saved`);

        // Check accessibility
        const a11yIssues = await checkAccessibility(page);
        if (a11yIssues.length === 0) {
          console.log(`    ✓ Accessibility OK`);
        } else {
          a11yIssues.forEach(i => console.log(`    ⚠ ${i}`));
        }

        // Check layout
        const layoutIssues = await checkLayout(page);
        if (layoutIssues.length === 0) {
          console.log(`    ✓ Layout OK`);
        } else {
          layoutIssues.forEach(i => console.log(`    ⚠ ${i}`));
        }

        // Report console errors
        if (errors.length === 0) {
          console.log(`    ✓ No console errors`);
        } else {
          errors.forEach(e => console.log(`    ✗ ${e.substring(0, 100)}`));
        }

        results.push({
          page: pageInfo.name,
          viewport: viewport.name,
          errors: errors.length,
          a11yIssues,
          layoutIssues,
          screenshot: imgPath,
        });

      } catch (err) {
        console.log(`    ✗ Error: ${err.message}`);
        results.push({
          page: pageInfo.name,
          viewport: viewport.name,
          error: err.message,
        });
      }
    }

    await context.close();
  }

  await browser.close();

  // Summary
  console.log(`\n${'═'.repeat(50)}`);
  console.log('📊 SUMMARY');
  console.log('═'.repeat(50));
  
  const totalErrors = results.reduce((sum, r) => sum + (r.errors || 0), 0);
  const passedPages = results.filter(r => !r.error && r.errors === 0).length;
  
  console.log(`Total pages tested: ${results.length}`);
  console.log(`Pages with 0 errors: ${passedPages}`);
  console.log(`Total console errors: ${totalErrors}`);

  // Save results
  const report = {
    timestamp: TIMESTAMP,
    results,
    summary: { totalErrors, passedPages },
  };
  
  writeFileSync(`${TEST_DIR}/report.json`, JSON.stringify(report, null, 2));
  writeFileSync(`test-log/latest.json`, JSON.stringify(report, null, 2));
  
  console.log(`\n📄 Full report: ${TEST_DIR}/report.json`);
  console.log('\n✅ Testing complete!');

  return report;
}

runTests().catch(console.error);
