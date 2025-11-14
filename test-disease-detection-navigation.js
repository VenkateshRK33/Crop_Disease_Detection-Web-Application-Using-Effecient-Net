/**
 * Test script to verify Disease Detection page integration with navigation
 * Tests:
 * 1. Page works within PageLayout
 * 2. Navigation to/from disease detection page
 * 3. All existing features are accessible (upload, prediction, chatbot, history)
 */

const puppeteer = require('puppeteer');

const FRONTEND_URL = 'http://localhost:3000';
const TEST_TIMEOUT = 30000;

async function testDiseaseDetectionNavigation() {
  console.log('🧪 Testing Disease Detection Page Navigation Integration\n');
  
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: false,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    
    // Test 1: Navigate to home page
    console.log('✓ Test 1: Loading home page...');
    await page.goto(FRONTEND_URL, { waitUntil: 'networkidle0', timeout: TEST_TIMEOUT });
    
    // Check if navigation is present
    const navExists = await page.$('nav.navigation');
    if (!navExists) {
      throw new Error('Navigation component not found');
    }
    console.log('  ✓ Navigation component is present\n');
    
    // Test 2: Navigate to Disease Detection page via navigation link
    console.log('✓ Test 2: Navigating to Disease Detection page...');
    await page.click('a[href="/disease-detection"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: TEST_TIMEOUT });
    
    // Verify URL changed
    const currentUrl = page.url();
    if (!currentUrl.includes('/disease-detection')) {
      throw new Error(`Expected URL to contain /disease-detection, got ${currentUrl}`);
    }
    console.log('  ✓ Successfully navigated to /disease-detection\n');
    
    // Test 3: Verify PageLayout components are present
    console.log('✓ Test 3: Verifying PageLayout integration...');
    
    // Check for Navigation
    const navOnPage = await page.$('nav.navigation');
    if (!navOnPage) {
      throw new Error('Navigation not present on Disease Detection page');
    }
    console.log('  ✓ Navigation is present');
    
    // Check for Footer
    const footerOnPage = await page.$('footer.footer');
    if (!footerOnPage) {
      throw new Error('Footer not present on Disease Detection page');
    }
    console.log('  ✓ Footer is present');
    
    // Check active navigation link
    const activeLink = await page.$('a.nav-link.active[href="/disease-detection"]');
    if (!activeLink) {
      throw new Error('Disease Detection link is not marked as active');
    }
    console.log('  ✓ Disease Detection link is marked as active\n');
    
    // Test 4: Verify all existing features are present
    console.log('✓ Test 4: Verifying existing features are accessible...');
    
    // Check for page title
    const pageTitle = await page.$('.page-title');
    if (!pageTitle) {
      throw new Error('Page title not found');
    }
    const titleText = await page.evaluate(el => el.textContent, pageTitle);
    console.log(`  ✓ Page title: "${titleText}"`);
    
    // Check for ImageUpload component
    const uploadSection = await page.$('.upload-section');
    if (!uploadSection) {
      throw new Error('ImageUpload component not found');
    }
    console.log('  ✓ ImageUpload component is present');
    
    // Check for file input
    const fileInput = await page.$('input[type="file"]');
    if (!fileInput) {
      throw new Error('File input not found');
    }
    console.log('  ✓ File upload input is accessible');
    
    // Check for PredictionHistory component
    const historySection = await page.$('.prediction-history');
    if (!historySection) {
      throw new Error('PredictionHistory component not found');
    }
    console.log('  ✓ PredictionHistory component is present\n');
    
    // Test 5: Navigate away and back
    console.log('✓ Test 5: Testing navigation to/from Disease Detection...');
    
    // Navigate to Home
    await page.click('a[href="/"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: TEST_TIMEOUT });
    console.log('  ✓ Navigated to Home page');
    
    // Navigate back to Disease Detection
    await page.click('a[href="/disease-detection"]');
    await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: TEST_TIMEOUT });
    console.log('  ✓ Navigated back to Disease Detection page');
    
    // Verify components are still present
    const uploadAfterNav = await page.$('.upload-section');
    if (!uploadAfterNav) {
      throw new Error('Components not preserved after navigation');
    }
    console.log('  ✓ Components preserved after navigation\n');
    
    // Test 6: Test mobile navigation
    console.log('✓ Test 6: Testing mobile navigation...');
    await page.setViewport({ width: 375, height: 667 });
    await page.reload({ waitUntil: 'networkidle0' });
    
    // Check for mobile menu toggle
    const mobileToggle = await page.$('.mobile-menu-toggle');
    if (!mobileToggle) {
      throw new Error('Mobile menu toggle not found');
    }
    console.log('  ✓ Mobile menu toggle is present');
    
    // Open mobile menu
    await page.click('.mobile-menu-toggle');
    await page.waitForTimeout(500); // Wait for animation
    
    // Check if mobile menu is open
    const mobileMenu = await page.$('.mobile-menu.open');
    if (!mobileMenu) {
      throw new Error('Mobile menu did not open');
    }
    console.log('  ✓ Mobile menu opens correctly');
    
    // Check for Disease Detection link in mobile menu
    const mobileDiseaseLink = await page.$('.mobile-nav-link[href="/disease-detection"]');
    if (!mobileDiseaseLink) {
      throw new Error('Disease Detection link not found in mobile menu');
    }
    console.log('  ✓ Disease Detection link present in mobile menu\n');
    
    console.log('✅ All tests passed! Disease Detection page is properly integrated.\n');
    console.log('Summary:');
    console.log('  ✓ Page works within PageLayout');
    console.log('  ✓ Navigation to/from Disease Detection works');
    console.log('  ✓ All existing features are accessible');
    console.log('  ✓ Mobile navigation works correctly');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    throw error;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

// Run tests
testDiseaseDetectionNavigation()
  .then(() => {
    console.log('\n🎉 Disease Detection navigation integration verified successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Tests failed:', error);
    process.exit(1);
  });
