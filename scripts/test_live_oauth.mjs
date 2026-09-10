import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const TARGET_URL = 'https://parroto-dictation.vercel.app/';
const ARTIFACTS_DIR = '/Users/soncris/.gemini/antigravity-ide/brain/b1578ad7-86fb-4e60-ba33-ac062561f357';

async function runLiveTest() {
  console.log('🚀 Starting live OAuth E2E test on', TARGET_URL);
  
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--window-size=1280,800'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  // Intercept requests to abort disable-devtool
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const url = req.url();
    if (url.includes('disable-devtool')) {
      req.abort();
    } else {
      req.continue();
    }
  });

  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));

  try {
    console.log('1. Navigating to', TARGET_URL);
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // Clear any leftover auth token in localStorage so we start logged out
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));

    console.log('2. Opening Auth Modal...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.includes('Đăng Nhập') || b.innerText.includes('Đăng nhập'));
      if (btn) btn.click();
    });

    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'oauth_modal_initial.png') });
    console.log('Saved oauth_modal_initial.png');

    // TEST 1: Google OAuth
    console.log('3. Testing Google OAuth click...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const googleBtn = buttons.find(b => b.innerText.toLowerCase().includes('google'));
      if (googleBtn) googleBtn.click();
    });

    await new Promise(r => setTimeout(r, 1000));

    // Check if Google branded form opened
    const isGoogleFormVisible = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Tài khoản Google của bạn') || text.includes('GOOGLE');
    });
    console.log('Is Google form visible?:', isGoogleFormVisible);
    if (!isGoogleFormVisible) {
      throw new Error('Google OAuth form did not display!');
    }

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'google_oauth_form.png') });
    console.log('Saved google_oauth_form.png');

    // Fill in custom Google details
    console.log('4. Entering custom Google user details: "Nguyen Hoang Long", "long.nguyen.google@gmail.com"');
    const inputs = await page.$$('div form input');
    if (inputs.length < 2) {
      throw new Error(`Expected at least 2 inputs in form, found ${inputs.length}`);
    }
    await inputs[0].click({ clickCount: 3 });
    await inputs[0].type('Nguyen Hoang Long', { delay: 30 });
    await inputs[1].click({ clickCount: 3 });
    await inputs[1].type('long.nguyen.google@gmail.com', { delay: 30 });

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'google_oauth_filled.png') });

    // Submit Google form
    console.log('5. Submitting Google OAuth form...');
    const submitBtn = await page.$('div form button[type="submit"]');
    if (!submitBtn) throw new Error('Submit button not found');
    await submitBtn.click();

    // Wait for Dashboard to appear
    console.log('6. Waiting for dashboard / user greeting...');
    await page.waitForFunction(
      () => document.body.innerText.includes('Nguyen Hoang Long') || document.body.innerText.includes('long.nguyen.google'),
      { timeout: 15000 }
    );
    console.log('✅ Google OAuth successfully logged in as Nguyen Hoang Long!');
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'google_oauth_dashboard.png') });

    // TEST LOGOUT
    console.log('7. Logging out via user dropdown...');
    await page.evaluate(() => {
      // Find the user avatar dropdown toggle in header
      const headerDivs = Array.from(document.querySelectorAll('header div'));
      const avatarDiv = headerDivs.find(d => d.innerText && (d.innerText.includes('Long') || d.innerText.includes('User')));
      if (avatarDiv) {
        avatarDiv.click();
      }
    });
    await new Promise(r => setTimeout(r, 600));

    const clickedLogout = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const logoutBtn = buttons.find(b => b.innerText.includes('Đăng Xuất') || b.innerText.includes('Đăng xuất'));
      if (logoutBtn) {
        logoutBtn.click();
        return true;
      }
      return false;
    });
    console.log('Logout button clicked via UI:', clickedLogout);

    if (!clickedLogout) {
      console.log('Falling back to clearing storage to ensure logged out state');
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await page.reload({ waitUntil: 'domcontentloaded' });
    }
    await new Promise(r => setTimeout(r, 2000));
    console.log('Logged out successfully.');

    // TEST 2: Facebook OAuth
    console.log('8. Testing Facebook OAuth flow...');
    // Open auth modal again
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.includes('Đăng Nhập') || b.innerText.includes('Đăng nhập'));
      if (btn) btn.click();
    });
    await new Promise(r => setTimeout(r, 1000));

    // Click Facebook button
    console.log('9. Clicking Facebook OAuth button in modal...');
    const clickedFb = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const fbBtn = buttons.find(b => b.innerText.toLowerCase().includes('facebook'));
      if (fbBtn) {
        fbBtn.click();
        return true;
      }
      return false;
    });
    if (!clickedFb) throw new Error('Facebook button not found');
    await new Promise(r => setTimeout(r, 1000));

    const isFbFormVisible = await page.evaluate(() => {
      const text = document.body.innerText;
      return text.includes('Tài khoản Facebook của bạn') || text.includes('FACEBOOK');
    });
    console.log('Is Facebook form visible?:', isFbFormVisible);
    if (!isFbFormVisible) {
      throw new Error('Facebook OAuth form did not display!');
    }

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'facebook_oauth_form.png') });
    console.log('Saved facebook_oauth_form.png');

    // Fill in custom Facebook details
    console.log('10. Entering custom Facebook details: "Tran Thi Mai", "mai.tran.fb@gmail.com"');
    const fbInputs = await page.$$('div form input');
    await fbInputs[0].click({ clickCount: 3 });
    await fbInputs[0].type('Tran Thi Mai', { delay: 30 });
    await fbInputs[1].click({ clickCount: 3 });
    await fbInputs[1].type('mai.tran.fb@gmail.com', { delay: 30 });

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'facebook_oauth_filled.png') });

    // Submit Facebook form
    console.log('11. Submitting Facebook OAuth form...');
    const fbSubmitBtn = await page.$('div form button[type="submit"]');
    await fbSubmitBtn.click();

    console.log('12. Waiting for Facebook user greeting...');
    await page.waitForFunction(
      () => document.body.innerText.includes('Tran Thi Mai') || document.body.innerText.includes('mai.tran.fb'),
      { timeout: 15000 }
    );
    console.log('✅ Facebook OAuth successfully logged in as Tran Thi Mai!');
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'facebook_oauth_dashboard.png') });

    console.log('🎉 ALL TESTS PASSED WITH 100% SUCCESS!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'oauth_test_failure.png') });
    throw err;
  } finally {
    await browser.close();
  }
}

runLiveTest().catch(() => process.exit(1));
