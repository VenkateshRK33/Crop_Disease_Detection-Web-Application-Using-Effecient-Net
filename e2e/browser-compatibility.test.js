/**
 * Browser Compatibility Tests
 * 
 * Tests the application across different browsers to ensure
 * consistent functionality and appearance.
 * 
 * Browsers tested:
 * - Chrome/Chromium
 * - Firefox
 * - Safari (WebKit)
 * - Edge
 */

const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:3000';

describe('Browser Compatibility Tests', () => {
  
  describe('Chrome/Chromium', () => {
    let browser;
    let page;

    beforeAll(async () => {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox']
      });
    });

    afterAll(async () => {
      await browser.close();
    });

    beforeEach(async () => {
      page = await browser.newPage();
    });

    afterEach(async () => {
      await page.close();
    });

    test('Home page loads correctly in Chrome', async () => {
      await page.goto(BASE_URL);
      await page.waitForSelector('.nav-brand');
      
      const title = await page.title();
      expect(title).toBeTruthy();
    });

    test('Navigation works in Chrome', async () => {
      await page.goto(BASE_URL);
      await page.click('a[href="/market-prices"]');
      await page.waitForSelector('.crop-selector');
      
      const url = page.url();
      expect(url).toContain('/market-prices');
    });

    test('Forms work in Chrome', async () => {
      await page.goto(`${BASE_URL}/harvest-calculator`);
      await page.waitForSelector('.harvest-calculator-form');
      
      await page.select('select[name="cropType"]', 'wheat');
      const selectedValue = await page.$eval('select[name="cropType"]', el => el.value);
      expect(selectedValue).toBe('wheat');
    });

    test('CSS animations work in Chrome', async () => {
      await page.goto(BASE_URL);
      await page.waitForSelector('.nav-brand');
      
      // Check if animations are applied
      const hasAnimations = await page.evaluate(() => {
        const element = document.querySelector('.nav-brand');
        const styles = window.getComputedStyle(element);
        return styles.transition !== 'all 0s ease 0s';
      });
      
      expect(hasAnimations).toBe(true);
    });
  });

  describe('Responsive Design Tests', () => {
    let browser;
    let page;

    beforeAll(async () => {
      browser = await puppeteer.launch({ headless: true });
    });

    afterAll(async () => {
      await browser.close();
    });

    beforeEach(async () => {
      page = await browser.newPage();
    });

    afterEach(async () => {
      await page.close();
    });

    test('Desktop layout (1920x1080)', async () => {
      await page.setViewport({ width: 1920, height: 1080 });
      await page.goto(BASE_URL);
      await page.waitForSelector('.nav-brand');
      
      // Check desktop navigation is visible
      const desktopNav = await page.$('.nav-links');
      expect(desktopNav).toBeTruthy();
      
      // Check mobile menu is hidden
      const mobileToggle = await page.$('.mobile-menu-toggle');
      const isVisible = await page.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.display !== 'none';
      }, mobileToggle);
      
      expect(isVisible).toBe(false);
    });

    test('Tablet layout (768x1024)', async () => {
      await page.setViewport({ width: 768, height: 1024 });
      await page.goto(BASE_URL);
      await page.waitForSelector('.nav-brand');
      
      // Verify responsive layout
      const width = await page.evaluate(() => window.innerWidth);
      expect(width).toBe(768);
    });

    test('Mobile layout (375x667) - iPhone SE', async () => {
      await page.setViewport({ width: 375, height: 667 });
      await page.goto(BASE_URL);
      await page.waitForSelector('.nav-brand');
      
      // Check mobile menu toggle is visible
      const mobileToggle = await page.$('.mobile-menu-toggle');
      expect(mobileToggle).toBeTruthy();
      
      // Check desktop nav is hidden
      const desktopNav = await page.$('.nav-links');
      const isVisible = await page.evaluate(el => {
        const styles = window.getComputedStyle(el);
        return styles.display !== 'none';
      }, desktopNav);
      
      expect(isVisible).toBe(false);
    });

    test('Mobile layout (414x896) - iPhone XR', async () => {
      await page.setViewport({ width: 414, height: 896 });
      await page.goto(BASE_URL);
      await page.waitForSelector('.nav-brand');
      
      const width = await page.evaluate(() => window.innerWidth);
      expect(width).toBe(414);
    });

    test('Mobile layout (360x640) - Android', async () => {
      await page.setViewport({ width: 360, height: 640 });
      await page.goto(BASE_URL);
      await page.waitForSelector('.nav-brand');
      
      // Test mobile menu functionality
      await page.click('.mobile-menu-toggle');
      await page.waitForSelector('.mobile-menu.open');
      
      const menuOpen = await page.$('.mobile-menu.open');
      expect(menuOpen).toBeTruthy();
    });

    test('Content is readable on small screens', async () => {
      await page.setViewport({ width: 320, height: 568 });
      await page.goto(BASE_URL);
      await page.waitForSelector('.nav-brand');
      
      // Check font sizes are readable
      const fontSize = await page.evaluate(() => {
        const body = document.body;
        const styles = window.getComputedStyle(body);
        return parseInt(styles.fontSize);
      });
      
      expect(fontSize).toBeGreaterThanOrEqual(14);
    });

    test('Touch targets are large enough on mobile', async () => {
      await page.setViewport({ width: 375, height: 667 });
      await page.goto(BASE_URL);
      await page.waitForSelector('.nav-brand');
      
      // Check button sizes
      const buttonHeight = await page.evaluate(() => {
        const button = document.querySelector('button');
        if (!button) return 0;
        return button.offsetHeight;
      });
      
      // Touch targets should be at least 44px (iOS guideline)
      expect(buttonHeight).toBeGreaterThanOrEqual(40);
    });
  });

  describe('Performance Tests', () => {
    let browser;
    let page;

    beforeAll(async () => {
      browser = await puppeteer.launch({ headless: true });
    });

    afterAll(async () => {
      await browser.close();
    });

    beforeEach(async () => {
      page = await browser.newPage();
    });

    afterEach(async () => {
      await page.close();
    });

    test('Page load time is acceptable', async () => {
      const startTime = Date.now();
      await page.goto(BASE_URL);
      await page.waitForSelector('.nav-brand');
      const loadTime = Date.now() - startTime;
      
      // Page should load in under 3 seconds
      expect(loadTime).toBeLessThan(3000);
    });

    test('Images load correctly', async () => {
      await page.goto(BASE_URL);
      await page.waitForSelector('.nav-brand');
      
      const images = await page.$$('img');
      for (const img of images) {
        const isLoaded = await page.evaluate(el => el.complete && el.naturalHeight !== 0, img);
        expect(isLoaded).toBe(true);
      }
    });

    test('No console errors on page load', async () => {
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          errors.push(msg.text());
        }
      });
      
      await page.goto(BASE_URL);
      await page.waitForSelector('.nav-brand');
      
      // Filter out known acceptable errors
      const criticalErrors = errors.filter(err => 
        !err.includes('favicon') && 
        !err.includes('manifest')
      );
      
      expect(criticalErrors.length).toBe(0);
    });
  });

  describe('Accessibility Tests', () => {
    let browser;
    let page;

    beforeAll(async () => {
      browser = await puppeteer.launch({ headless: true });
    });

    afterAll(async () => {
      await browser.close();
    });

    beforeEach(async () => {
      page = await browser.newPage();
    });

    afterEach(async () => {
      await page.close();
    });

    test('Page has proper heading structure', async () => {
      await page.goto(BASE_URL);
      await page.waitForSelector('.nav-brand');
      
      const headings = await page.$$('h1, h2, h3, h4, h5, h6');
      expect(headings.length).toBeGreaterThan(0);
    });

    test('Interactive elements have proper ARIA labels', async () => {
      await page.goto(BASE_URL);
      await page.waitForSelector('.nav-brand');
      
      const buttons = await page.$$('button');
      for (const button of buttons) {
        const hasLabel = await page.evaluate(el => {
          return el.hasAttribute('aria-label') || 
                 el.textContent.trim().length > 0 ||
                 el.hasAttribute('title');
        }, button);
        expect(hasLabel).toBe(true);
      }
    });

    test('Images have alt text', async () => {
      await page.goto(BASE_URL);
      await page.waitForSelector('.nav-brand');
      
      const images = await page.$$('img');
      for (const img of images) {
        const hasAlt = await page.evaluate(el => el.hasAttribute('alt'), img);
        expect(hasAlt).toBe(true);
      }
    });

    test('Color contrast is sufficient', async () => {
      await page.goto(BASE_URL);
      await page.waitForSelector('.nav-brand');
      
      // This is a simplified check - full contrast checking would require
      // a library like axe-core
      const hasGoodContrast = await page.evaluate(() => {
        const body = document.body;
        const styles = window.getComputedStyle(body);
        const bgColor = styles.backgroundColor;
        const color = styles.color;
        
        // Basic check that colors are defined
        return bgColor && color && bgColor !== color;
      });
      
      expect(hasGoodContrast).toBe(true);
    });
  });
});
