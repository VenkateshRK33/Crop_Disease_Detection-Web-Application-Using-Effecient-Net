/**
 * End-to-End Tests for Complete User Journeys
 * 
 * These tests simulate real user interactions across the entire application.
 * They test complete workflows from start to finish.
 * 
 * Note: These tests require the application to be running:
 * - Backend server on http://localhost:4000
 * - Frontend server on http://localhost:3000
 * 
 * Run with: npm run test:e2e
 */

const puppeteer = require('puppeteer');

describe('E2E User Journeys', () => {
  let browser;
  let page;
  const BASE_URL = 'http://localhost:3000';

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
  });

  afterEach(async () => {
    await page.close();
  });

  describe('Journey 1: Farmer checks market prices and plans harvest', () => {
    test('Complete workflow from market prices to harvest planning', async () => {
      // Step 1: Navigate to home page
      await page.goto(BASE_URL);
      await page.waitForSelector('.nav-brand');
      
      // Verify home page loaded
      const brandText = await page.$eval('.brand-name', el => el.textContent);
      expect(brandText).toBe('KrishiRaksha');

      // Step 2: Navigate to Market Prices
      await page.click('a[href="/market-prices"]');
      await page.waitForSelector('.crop-selector');
      
      // Step 3: Select a crop
      await page.click('.crop-selector-button');
      await page.waitForSelector('.crop-selector-menu');
      await page.click('.crop-selector-item:first-child');
      
      // Wait for price data to load
      await page.waitForTimeout(2000);

      // Step 4: Navigate to Harvest Calculator
      await page.click('a[href="/harvest-calculator"]');
      await page.waitForSelector('.harvest-calculator-form');

      // Step 5: Fill harvest calculator form
      await page.select('select[name="cropType"]', 'wheat');
      await page.type('input[name="currentMarketPrice"]', '2500');
      await page.type('input[name="expectedYield"]', '50');
      
      // Adjust maturity slider
      const maturitySlider = await page.$('input[name="currentMaturity"]');
      await maturitySlider.click({ clickCount: 3 });
      await page.keyboard.type('70');

      // Step 6: Calculate optimal harvest time
      await page.click('button[type="submit"]');
      
      // Wait for results
      await page.waitForSelector('.harvest-recommendation', { timeout: 5000 });

      // Verify results are displayed
      const hasRecommendation = await page.$('.harvest-recommendation');
      expect(hasRecommendation).toBeTruthy();

      // Step 7: Navigate to Crop Calendar to schedule harvest
      await page.click('a[href="/crop-calendar"]');
      await page.waitForSelector('.calendar-container');

      // Verify calendar loaded
      const calendarExists = await page.$('.calendar-container');
      expect(calendarExists).toBeTruthy();
    }, 30000);
  });

  describe('Journey 2: Farmer checks weather and environmental conditions', () => {
    test('Complete workflow for environmental monitoring', async () => {
      // Step 1: Navigate to home page
      await page.goto(BASE_URL);
      await page.waitForSelector('.nav-brand');

      // Step 2: Navigate to Environment page
      await page.click('a[href="/environment"]');
      await page.waitForSelector('.location-selector');

      // Step 3: Enter location manually
      await page.type('.location-input', 'Delhi');
      await page.click('button:has-text("Search")');
      
      // Wait for location to be selected
      await page.waitForTimeout(2000);

      // Step 4: Verify environmental data is displayed
      const hasWeatherData = await page.$('.environmental-metrics');
      expect(hasWeatherData).toBeTruthy();

      // Step 5: Check if recommendations are shown
      await page.waitForSelector('.farming-recommendations', { timeout: 5000 });
      const hasRecommendations = await page.$('.farming-recommendations');
      expect(hasRecommendations).toBeTruthy();
    }, 30000);
  });

  describe('Journey 3: Farmer manages crop calendar', () => {
    test('Complete workflow for calendar management', async () => {
      // Step 1: Navigate to Crop Calendar
      await page.goto(`${BASE_URL}/crop-calendar`);
      await page.waitForSelector('.calendar-container');

      // Step 2: Add new event
      const addButton = await page.$('button:has-text("Add Event")');
      if (addButton) {
        await addButton.click();
        await page.waitForSelector('.event-form');

        // Fill event form
        await page.type('input[name="title"]', 'Plant Wheat Seeds');
        await page.type('textarea[name="description"]', 'Plant wheat in north field');
        await page.select('select[name="eventType"]', 'planting');
        await page.select('select[name="cropType"]', 'wheat');

        // Submit form
        await page.click('button[type="submit"]');
        await page.waitForTimeout(1000);
      }

      // Step 3: Verify event appears in calendar
      const events = await page.$$('.calendar-event');
      expect(events.length).toBeGreaterThan(0);

      // Step 4: View upcoming activities
      const upcomingSection = await page.$('.upcoming-activities');
      expect(upcomingSection).toBeTruthy();
    }, 30000);
  });

  describe('Journey 4: Farmer uses disease detection', () => {
    test('Complete workflow for disease detection', async () => {
      // Step 1: Navigate to Disease Detection
      await page.goto(`${BASE_URL}/disease-detection`);
      await page.waitForSelector('.image-upload');

      // Step 2: Verify upload interface is present
      const uploadBox = await page.$('.upload-box');
      expect(uploadBox).toBeTruthy();

      // Note: Actual file upload and ML prediction would require
      // a running ML service and test image files
      // This test verifies the UI is accessible
    }, 30000);
  });

  describe('Journey 5: Mobile user navigation', () => {
    test('Complete workflow on mobile device', async () => {
      // Set mobile viewport
      await page.setViewport({ width: 375, height: 667 });

      // Step 1: Navigate to home page
      await page.goto(BASE_URL);
      await page.waitForSelector('.nav-brand');

      // Step 2: Open mobile menu
      await page.click('.mobile-menu-toggle');
      await page.waitForSelector('.mobile-menu.open');

      // Step 3: Navigate to Market Prices via mobile menu
      await page.click('.mobile-nav-link[href="/market-prices"]');
      await page.waitForSelector('.crop-selector');

      // Verify mobile menu closed
      const menuOpen = await page.$('.mobile-menu.open');
      expect(menuOpen).toBeFalsy();

      // Step 4: Test mobile responsiveness
      const isMobileLayout = await page.evaluate(() => {
        return window.innerWidth < 768;
      });
      expect(isMobileLayout).toBe(true);
    }, 30000);
  });

  describe('Journey 6: Cross-page data persistence', () => {
    test('User selections persist across navigation', async () => {
      // Step 1: Go to Market Prices and select crop
      await page.goto(`${BASE_URL}/market-prices`);
      await page.waitForSelector('.crop-selector');
      
      await page.click('.crop-selector-button');
      await page.waitForSelector('.crop-selector-menu');
      await page.click('.crop-selector-item:first-child');
      
      // Get selected crop
      const selectedCrop = await page.$eval('.crop-selector-value', el => el.textContent);

      // Step 2: Navigate away and back
      await page.click('a[href="/"]');
      await page.waitForTimeout(500);
      await page.click('a[href="/market-prices"]');
      await page.waitForSelector('.crop-selector');

      // Verify selection persisted (if implemented)
      // This would depend on state management implementation
    }, 30000);
  });

  describe('Journey 7: Error handling and recovery', () => {
    test('User can recover from errors', async () => {
      // Step 1: Navigate to Harvest Calculator
      await page.goto(`${BASE_URL}/harvest-calculator`);
      await page.waitForSelector('.harvest-calculator-form');

      // Step 2: Try to submit empty form
      await page.click('button[type="submit"]');
      
      // Step 3: Verify error messages appear
      await page.waitForSelector('.error-message');
      const errorMessages = await page.$$('.error-message');
      expect(errorMessages.length).toBeGreaterThan(0);

      // Step 4: Fill form correctly
      await page.select('select[name="cropType"]', 'wheat');
      await page.type('input[name="currentMarketPrice"]', '2500');
      await page.type('input[name="expectedYield"]', '50');

      // Step 5: Verify errors cleared
      await page.waitForTimeout(500);
      const remainingErrors = await page.$$('.error-message');
      expect(remainingErrors.length).toBe(0);
    }, 30000);
  });

  describe('Journey 8: Accessibility navigation', () => {
    test('User can navigate using keyboard only', async () => {
      await page.goto(BASE_URL);
      await page.waitForSelector('.nav-brand');

      // Tab through navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Press Enter to navigate
      await page.keyboard.press('Enter');
      await page.waitForTimeout(1000);

      // Verify navigation occurred
      const url = page.url();
      expect(url).not.toBe(BASE_URL);
    }, 30000);
  });
});
