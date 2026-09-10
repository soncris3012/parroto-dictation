import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const TARGET_URL = 'http://localhost:5173/';
const ARTIFACTS_DIR = '/Users/soncris/.gemini/antigravity-ide/brain/b1578ad7-86fb-4e60-ba33-ac062561f357';

async function testOAuth2StandardFlow() {
  console.log('🚀 Starting OAuth 2.0 Standard Flow E2E Test...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 850 });

  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (req.url().includes('disable-devtool')) {
      req.abort();
    } else {
      req.continue();
    }
  });

  // 1. Navigate to local app
  await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle2' });

  // 2. Open Auth Modal
  await page.waitForSelector('button', { timeout: 5000 });
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.innerText.toLowerCase().includes('đăng nhập'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // 3. Open OAuth 2.0 Configuration Tab
  console.log('Opening OAuth 2.0 Configuration tab...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.innerText.includes('Cấu hình OAuth 2.0'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'oauth2_config_panel.png') });
  console.log('📸 Screenshot: oauth2_config_panel.png');

  // Verify Redirect URI is displayed
  const configText = await page.evaluate(() => document.body.innerText);
  if (!configText.includes('/auth/callback')) {
    throw new Error('Redirect URI not displayed in config panel');
  }

  // 4. Test Google Authorization Code callback flow
  console.log('Testing Google Authorization Code callback exchange...');
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.innerText.includes('Test Code Google'));
    if (b) b.click();
  });

  // Wait for callback processing
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'oauth2_callback_processing.png') });
  console.log('📸 Screenshot: oauth2_callback_processing.png');

  // Wait for redirect to dashboard
  await new Promise(r => setTimeout(r, 2200));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'oauth2_dashboard_success.png') });
  console.log('📸 Screenshot: oauth2_dashboard_success.png');

  const loggedText = await page.evaluate(() => document.body.innerText);
  if (!loggedText.includes('Trường Sơn') && !loggedText.includes('Chào')) {
    throw new Error('OAuth 2.0 callback exchange failed to log user in');
  }

  console.log('\n🎉 OAUTH 2.0 AUTHORIZATION CODE GRANT FLOW PASSED 100%!');
  await browser.close();
}

testOAuth2StandardFlow().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
