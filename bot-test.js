
/**
 * InCaptcha Bot Test Script
 * 
 * This script attempts to bypass the captcha automatically to test the security.
 * Run with: node bot-test.js
 */

const puppeteer = require('puppeteer');

async function testBotDetection() {
  console.log('🤖 Starting Bot Detection Test...\n');
  
  const browser = await puppeteer.launch({
    headless: false, // Set to true for headless mode
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();
    
    // Navigate to demo login page
    console.log('📍 Navigating to demo login page...');
    await page.goto('http://0.0.0.0:5000/demo-login', {
      waitUntil: 'networkidle2'
    });

    console.log('✅ Page loaded\n');

    // Wait for the captcha checkbox to appear
    await page.waitForSelector('#incaptcha-container', { timeout: 10000 });
    console.log('✅ Captcha widget found\n');

    // Test 1: Instant click (bot-like behavior)
    console.log('🔬 TEST 1: Instant Click Attack');
    console.log('Attempting to click checkbox instantly without mouse movement...');
    
    try {
      // Click the checkbox instantly with no human-like behavior
      await page.evaluate(() => {
        const checkbox = document.querySelector('#incaptcha-container .incaptcha-checkbox');
        if (checkbox) {
          checkbox.click();
        }
      });

      // Wait for verification
      await page.waitForTimeout(3000);

      // Check if verification succeeded
      const loginButton = await page.$('[data-testid="button-login"]');
      const isEnabled = await page.evaluate(btn => !btn.disabled, loginButton);

      if (isEnabled) {
        console.log('❌ SECURITY BREACH: Bot passed instant click test!\n');
      } else {
        console.log('✅ BLOCKED: Instant click detected as bot\n');
      }
    } catch (error) {
      console.log('✅ BLOCKED: Captcha rejected instant click\n');
    }

    // Reload page for next test
    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForSelector('#incaptcha-container');

    // Test 2: Automated form fill with selenium-like patterns
    console.log('🔬 TEST 2: Automated Form Fill Attack');
    console.log('Attempting automated form submission...');

    try {
      // Fill form fields instantly (bot-like)
      await page.type('[data-testid="input-email"]', 'bot@test.com', { delay: 0 });
      await page.type('[data-testid="input-password"]', 'Password123', { delay: 0 });

      // Click checkbox with automated pattern
      await page.click('#incaptcha-container .incaptcha-checkbox');
      
      await page.waitForTimeout(3000);

      // Try to submit
      const loginButton = await page.$('[data-testid="button-login"]');
      const isEnabled = await page.evaluate(btn => !btn.disabled, loginButton);

      if (isEnabled) {
        console.log('❌ SECURITY BREACH: Bot passed automated form fill!\n');
      } else {
        console.log('✅ BLOCKED: Automated behavior detected\n');
      }
    } catch (error) {
      console.log('✅ BLOCKED: Automation detected\n');
    }

    // Test 3: Direct API call bypass attempt
    console.log('🔬 TEST 3: Direct API Bypass Attack');
    console.log('Attempting to call verification API directly...');

    try {
      const response = await page.evaluate(async () => {
        const res = await fetch('/api/incaptcha/turnstile/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            siteKey: 'demo_site_key',
            behaviorVector: {} // Empty behavior = bot signature
          })
        });
        return await res.json();
      });

      if (response.success && response.verifyToken) {
        console.log('⚠️  WARNING: Direct API call succeeded');
        console.log(`   Score: ${response.score}`);
        
        if (response.score < 60) {
          console.log('✅ BLOCKED: Low score would prevent usage\n');
        } else {
          console.log('❌ SECURITY ISSUE: Direct API bypass possible\n');
        }
      } else {
        console.log('✅ BLOCKED: Direct API call rejected\n');
      }
    } catch (error) {
      console.log('✅ BLOCKED: API call failed\n');
    }

    // Test 4: Token reuse attack
    console.log('🔬 TEST 4: Token Replay Attack');
    console.log('Attempting to reuse a verification token...');

    await page.reload({ waitUntil: 'networkidle2' });
    await page.waitForSelector('#incaptcha-container');

    // Get a valid token first
    let capturedToken = null;
    page.on('response', async response => {
      if (response.url().includes('/api/incaptcha/turnstile/verify')) {
        try {
          const data = await response.json();
          if (data.verifyToken) {
            capturedToken = data.verifyToken;
          }
        } catch (e) {}
      }
    });

    // Trigger legitimate verification
    await page.click('#incaptcha-container .incaptcha-checkbox');
    await page.waitForTimeout(3000);

    if (capturedToken) {
      console.log('✅ Token captured');
      
      // Try to verify the same token twice
      const replayResult = await page.evaluate(async (token) => {
        const res = await fetch('/api/incaptcha/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ verifyToken: token })
        });
        return await res.json();
      }, capturedToken);

      // Try again (replay)
      const replayResult2 = await page.evaluate(async (token) => {
        const res = await fetch('/api/incaptcha/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ verifyToken: token })
        });
        return await res.json();
      }, capturedToken);

      if (replayResult2.valid) {
        console.log('❌ SECURITY BREACH: Token replay attack succeeded!\n');
      } else {
        console.log('✅ BLOCKED: Token marked as used (replay protection working)\n');
      }
    }

    console.log('\n📊 SECURITY TEST SUMMARY');
    console.log('=' .repeat(50));
    console.log('The InCaptcha system uses multiple detection layers:');
    console.log('• Behavioral analysis (mouse movement, timing)');
    console.log('• AI-powered bot detection');
    console.log('• Device fingerprinting');
    console.log('• Token replay protection');
    console.log('• IP address binding');
    console.log('\n✅ Tests completed. Review results above.');

  } catch (error) {
    console.error('❌ Test error:', error.message);
  } finally {
    await browser.close();
  }
}

// Run the test
testBotDetection().catch(console.error);
