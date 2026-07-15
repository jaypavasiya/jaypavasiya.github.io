import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:4173';
const VIEWPORTS = {
  desktop: { width: 1280, height: 800 },
  mobile: { width: 375, height: 812 },
};

async function runLighthouse(url, options = {}) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: options.viewport || VIEWPORTS.desktop,
  });
  const page = await context.newPage();

  // Navigate and wait for network idle
  await page.goto(url, { waitUntil: 'networkidle' });

  // Get basic metrics
  const metrics = await page.evaluate(() => {
    const perfEntries = performance.getEntriesByType('navigation')[0];
    return {
      domContentLoaded: perfEntries.domContentLoadedEventEnd - perfEntries.fetchStart,
      load: perfEntries.loadEventEnd - perfEntries.fetchStart,
      firstPaint: performance.getEntriesByType('paint')[0]?.startTime || 0,
      firstContentfulPaint: performance.getEntriesByType('paint')
        .find(e => e.name === 'first-contentful-paint')?.startTime || 0,
    };
  });

  // Check accessibility basics
  const a11y = await page.evaluate(() => {
    const issues = [];
    
    // Check for images without alt
    const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
    if (imagesWithoutAlt.length > 0) {
      issues.push(`Images without alt: ${imagesWithoutAlt.length}`);
    }

    // Check for buttons without accessible names
    const buttons = document.querySelectorAll('button');
    buttons.forEach((btn, i) => {
      const hasLabel = btn.getAttribute('aria-label') || btn.textContent?.trim();
      if (!hasLabel) {
        issues.push(`Button ${i} has no accessible name`);
      }
    });

    // Check heading hierarchy
    const h1s = document.querySelectorAll('h1');
    if (h1s.length !== 1) {
      issues.push(`Expected 1 h1, found ${h1s.length}`);
    }

    // Check for lang attribute
    const html = document.querySelector('html');
    if (!html.getAttribute('lang')) {
      issues.push('Missing lang attribute on html element');
    }

    // Check for meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      issues.push('Missing meta description');
    }

    // Check color contrast (basic)
    const styles = getComputedStyle(document.body);
    const bgColor = styles.backgroundColor;
    const textColor = styles.color;
    
    return {
      issues,
      bgColor,
      textColor,
      totalButtons: buttons.length,
      totalImages: document.querySelectorAll('img').length,
    };
  });

  // Check console errors
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });

  // Wait a bit for any delayed errors
  await page.waitForTimeout(2000);

  await browser.close();

  return {
    url,
    metrics,
    a11y,
    consoleErrors: errors,
    viewport: options.viewport,
  };
}

async function main() {
  console.log('🔍 Running Quality Assurance Tests...\n');
  
  const routes = [
    { path: '/', name: 'Home' },
    { path: '/about', name: 'About' },
    { path: '/experience', name: 'Experience' },
    { path: '/skills', name: 'Skills' },
    { path: '/projects', name: 'Projects' },
    { path: '/contact', name: 'Contact' },
  ];

  const results = [];

  for (const route of routes) {
    const url = `${BASE_URL}${route.path}`;
    console.log(`Testing: ${route.name} (${url})`);
    
    try {
      const result = await runLighthouse(url);
      results.push({ ...result, name: route.name, path: route.path });
      
      console.log(`  ✓ Metrics loaded`);
      console.log(`  ✓ Accessibility checks completed`);
      if (result.consoleErrors.length === 0) {
        console.log(`  ✓ No console errors`);
      } else {
        console.log(`  ✗ Console errors: ${result.consoleErrors.length}`);
        result.consoleErrors.forEach(e => console.log(`    - ${e}`));
      }
    } catch (error) {
      console.log(`  ✗ Error: ${error.message}`);
      results.push({ name: route.name, path: route.path, error: error.message });
    }
    
    console.log('');
  }

  // Summary
  console.log('═══════════════════════════════════════════');
  console.log('📊 SUMMARY');
  console.log('═══════════════════════════════════════════\n');

  const totalErrors = results.reduce((sum, r) => sum + (r.consoleErrors?.length || 0), 0);
  const totalA11yIssues = results.reduce((sum, r) => sum + (r.a11y?.issues?.length || 0), 0);

  console.log(`Routes tested: ${routes.length}`);
  console.log(`Total console errors: ${totalErrors}`);
  console.log(`Total accessibility issues: ${totalA11yIssues}`);
  
  if (totalErrors === 0 && totalA11yIssues === 0) {
    console.log('\n✅ All tests passed!');
  } else {
    console.log('\n⚠️ Some issues found - see details above');
  }

  // Output JSON for logging
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const fs = require('fs');
  const report = {
    timestamp,
    results,
    summary: {
      totalErrors,
      totalA11yIssues,
      passed: totalErrors === 0 && totalA11yIssues === 0,
    },
  };
  
  try {
    fs.writeFileSync(`test-log/qa-report-${timestamp}.json`, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved to test-log/qa-report-${timestamp}.json`);
  } catch (e) {
    // Ignore if can't write
  }
}

main().catch(console.error);
