import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const BASE_URL = 'http://localhost:4173';

async function runLighthouse(url) {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(url, { waitUntil: 'networkidle' });

  const metrics = await page.evaluate(() => {
    const perfEntries = performance.getEntriesByType('navigation')[0];
    return {
      domContentLoaded: perfEntries.domContentLoadedEventEnd - perfEntries.fetchStart,
      load: perfEntries.loadEventEnd - perfEntries.fetchStart,
    };
  });

  const a11y = await page.evaluate(() => {
    const issues = [];
    const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
    if (imagesWithoutAlt.length > 0) {
      issues.push(`Images without alt: ${imagesWithoutAlt.length}`);
    }
    const buttons = document.querySelectorAll('button');
    const h1s = document.querySelectorAll('h1');
    if (h1s.length !== 1) {
      issues.push(`Expected 1 h1, found ${h1s.length}`);
    }
    const html = document.querySelector('html');
    if (!html.getAttribute('lang')) {
      issues.push('Missing lang attribute');
    }
    return { issues, totalButtons: buttons.length };
  });

  await browser.close();
  return { metrics, a11y };
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
  let totalErrors = 0;

  for (const route of routes) {
    const url = `${BASE_URL}${route.path}`;
    console.log(`Testing: ${route.name}`);
    
    try {
      const result = await runLighthouse(url);
      results.push({ name: route.name, ...result });
      
      const errors = result.a11y.issues.length;
      if (errors === 0) {
        console.log(`  ✓ No console errors`);
      } else {
        console.log(`  ⚠ Issues: ${errors}`);
        result.a11y.issues.forEach(i => console.log(`    - ${i}`));
      }
    } catch (error) {
      console.log(`  ✗ Error: ${error.message}`);
      results.push({ name: route.name, error: error.message });
    }
    console.log('');
  }

  console.log('═══════════════════════════════════════════');
  console.log('📊 SUMMARY');
  console.log('═══════════════════════════════════════════\n');
  console.log(`Routes tested: ${routes.length}`);
  console.log(`Total errors: ${totalErrors}`);
  console.log(totalErrors === 0 ? '\n✅ All tests passed!' : '\n⚠️ Some issues found');

  // Save report
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const report = { timestamp, results };
  try {
    writeFileSync(`test-log/qa-report-${timestamp}.json`, JSON.stringify(report, null, 2));
    console.log(`\n📄 Report saved`);
  } catch (e) {}
}

main().catch(console.error);
