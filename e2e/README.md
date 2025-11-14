# End-to-End Testing Guide

This directory contains end-to-end (E2E) tests for the KrishiRaksha Farmer Platform.

## Overview

E2E tests simulate real user interactions with the application, testing complete workflows from start to finish. These tests ensure that all components work together correctly and that the user experience is smooth across different browsers and devices.

## Test Suites

### 1. User Journeys (`user-journeys.test.js`)
Tests complete user workflows:
- **Journey 1**: Farmer checks market prices and plans harvest
- **Journey 2**: Farmer checks weather and environmental conditions
- **Journey 3**: Farmer manages crop calendar
- **Journey 4**: Farmer uses disease detection
- **Journey 5**: Mobile user navigation
- **Journey 6**: Cross-page data persistence
- **Journey 7**: Error handling and recovery
- **Journey 8**: Accessibility navigation

### 2. Browser Compatibility (`browser-compatibility.test.js`)
Tests across different browsers and devices:
- Chrome/Chromium compatibility
- Responsive design (Desktop, Tablet, Mobile)
- Performance metrics
- Accessibility compliance

## Prerequisites

### Required Software
1. **Node.js** (v14 or higher)
2. **npm** or **yarn**
3. **Puppeteer** (installed automatically with dependencies)

### Running Services
Before running E2E tests, ensure the following services are running:

1. **Backend Server**
   ```bash
   npm run start:backend
   ```
   Should be running on `http://localhost:4000`

2. **Frontend Server**
   ```bash
   cd frontend-react && npm start
   ```
   Should be running on `http://localhost:3000`

3. **ML Service** (for disease detection tests)
   ```bash
   python api_service.py
   ```
   Should be running on `http://localhost:5000`

## Installation

Install E2E testing dependencies:

```bash
npm install --save-dev puppeteer jest
```

## Running Tests

### Run All E2E Tests
```bash
npm run test:e2e
```

### Run Specific Test Suite
```bash
# User journeys only
npx jest e2e/user-journeys.test.js

# Browser compatibility only
npx jest e2e/browser-compatibility.test.js
```

### Run in Headed Mode (See Browser)
```bash
# Modify the test file to set headless: false
# Or use environment variable
HEADLESS=false npm run test:e2e
```

### Run with Specific Viewport
```bash
# Tests will automatically test multiple viewports
# See browser-compatibility.test.js for viewport configurations
```

## Test Configuration

### Timeouts
- Default test timeout: 30 seconds
- Page load timeout: 5 seconds
- Element wait timeout: 5 seconds

### Viewports Tested
- **Desktop**: 1920x1080, 1280x720
- **Tablet**: 768x1024
- **Mobile**: 
  - iPhone SE: 375x667
  - iPhone XR: 414x896
  - Android: 360x640
  - Small: 320x568

## Writing New E2E Tests

### Basic Structure
```javascript
describe('Test Suite Name', () => {
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

  test('Test description', async () => {
    await page.goto('http://localhost:3000');
    await page.waitForSelector('.some-element');
    
    // Your test logic here
    
    expect(something).toBe(expected);
  });
});
```

### Best Practices

1. **Wait for Elements**
   ```javascript
   await page.waitForSelector('.element');
   ```

2. **Use Descriptive Selectors**
   ```javascript
   // Good
   await page.click('button[aria-label="Submit form"]');
   
   // Avoid
   await page.click('.btn-1');
   ```

3. **Test User Flows, Not Implementation**
   ```javascript
   // Good - tests user behavior
   await page.click('a[href="/market-prices"]');
   await page.waitForSelector('.crop-selector');
   
   // Avoid - tests implementation details
   expect(component.state.selectedCrop).toBe('wheat');
   ```

4. **Handle Async Operations**
   ```javascript
   await page.waitForTimeout(1000); // Use sparingly
   await page.waitForSelector('.result'); // Preferred
   ```

5. **Clean Up After Tests**
   ```javascript
   afterEach(async () => {
     // Clear any test data
     // Close pages
     await page.close();
   });
   ```

## Debugging Tests

### Take Screenshots
```javascript
await page.screenshot({ path: 'debug-screenshot.png' });
```

### Console Logs
```javascript
page.on('console', msg => console.log('PAGE LOG:', msg.text()));
```

### Pause Execution
```javascript
await page.evaluate(() => debugger);
```

### Run in Headed Mode
```javascript
const browser = await puppeteer.launch({ 
  headless: false,
  slowMo: 100 // Slow down by 100ms
});
```

## Continuous Integration

### GitHub Actions Example
```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm run start:backend &
      - run: cd frontend-react && npm install && npm start &
      - run: sleep 10 # Wait for servers to start
      - run: npm run test:e2e
```

## Troubleshooting

### Tests Timeout
- Increase timeout in test configuration
- Check if services are running
- Verify network connectivity

### Elements Not Found
- Add explicit waits: `await page.waitForSelector()`
- Check if element selector is correct
- Verify page has loaded completely

### Browser Launch Fails
- Install required dependencies: `sudo apt-get install -y chromium-browser`
- Use `--no-sandbox` flag in CI environments

### Flaky Tests
- Add proper waits instead of fixed timeouts
- Ensure test data is properly set up
- Check for race conditions

## Coverage

E2E tests cover:
- ✅ All main user journeys
- ✅ Navigation flows
- ✅ Form submissions
- ✅ API integrations
- ✅ Error handling
- ✅ Mobile responsiveness
- ✅ Browser compatibility
- ✅ Accessibility features

## Maintenance

- Review and update tests when features change
- Keep selectors up to date with UI changes
- Add new tests for new features
- Remove obsolete tests
- Monitor test execution time

## Resources

- [Puppeteer Documentation](https://pptr.dev/)
- [Jest Documentation](https://jestjs.io/)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Responsive Design Testing](https://developers.google.com/web/tools/chrome-devtools/device-mode)
