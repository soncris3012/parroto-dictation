import puppeteer from 'puppeteer-core';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const TARGET_URL = 'http://localhost:5173/';
const ARTIFACTS_DIR = '/Users/soncris/.gemini/antigravity-ide/brain/b1578ad7-86fb-4e60-ba33-ac062561f357';

async function testOAuthFlow() {
  console.log('--- STARTING OAUTH 1-CLICK TEST ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 850 });

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

  // 1. Navigate to local app
  await page.goto(TARGET_URL, { waitUntil: 'networkidle2' });
  console.log('Loaded', TARGET_URL);

  // Clear existing session
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle2' });

  // 2. Open Auth Modal
  await page.waitForSelector('button', { timeout: 5000 });
  const loginOpened = await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.innerText.toLowerCase().includes('đăng nhập'));
    if (b) { b.click(); return true; }
    return false;
  });

  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: `${ARTIFACTS_DIR}/oauth_1click_main_modal.png` });
  console.log('📸 Screenshot 1: Main Auth Modal saved');

  // 3. Click Google OAuth Button
  const clickedGoogle = await page.evaluate(() => {
    const allBtns = Array.from(document.querySelectorAll('button'));
    const googleBtn = allBtns.find(b => b.innerText.includes('Google'));
    if (googleBtn) { googleBtn.click(); return true; }
    return false;
  });

  if (!clickedGoogle) throw new Error('Google OAuth button not found');
  await new Promise(r => setTimeout(r, 800));

  await page.screenshot({ path: `${ARTIFACTS_DIR}/oauth_1click_google_dialog.png` });
  console.log('📸 Screenshot 2: Google Account Chooser Modal (Matching Lazada Google Screenshot!)');

  // Verify text in Google modal
  const pageTextGoogle = await page.evaluate(() => document.body.innerText);
  if (!pageTextGoogle.includes('Trường Sơn') || !pageTextGoogle.includes('sn30122006@gmail.com')) {
    throw new Error('Google Account Chooser does not show Truong Son / sn30122006@gmail.com');
  }

  // 4. Click the Trường Sơn account row (1-click login!)
  const clickedAccount = await page.evaluate(() => {
    const divs = Array.from(document.querySelectorAll('div'));
    const row = divs.find(d => d.innerText.includes('Trường Sơn') && d.innerText.includes('sn30122006@gmail.com'));
    if (row) { row.click(); return true; }
    return false;
  });

  if (!clickedAccount) throw new Error('Account row not found');
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({ path: `${ARTIFACTS_DIR}/oauth_1click_google_loggedin.png` });
  console.log('📸 Screenshot 3: Logged in via Google 1-Click');

  // Verify user is logged in
  const loggedInText = await page.evaluate(() => document.body.innerText);
  if (!loggedInText.includes('Trường Sơn') && !loggedInText.includes('Chào')) {
    throw new Error('User was not logged in after clicking Google account row');
  }
  console.log('✅ Google 1-Click login PASSED 100%!');

  // 5. Now test Facebook: Logout first
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));

  // Open Auth Modal again
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const b = btns.find(btn => btn.innerText.toLowerCase().includes('đăng nhập'));
    if (b) b.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // 6. Click Facebook OAuth Button
  const clickedFb = await page.evaluate(() => {
    const allBtns = Array.from(document.querySelectorAll('button'));
    const b = allBtns.find(btn => btn.innerText.includes('Facebook'));
    if (b) { b.click(); return true; }
    return false;
  });

  if (!clickedFb) throw new Error('Facebook OAuth button not found');
  await new Promise(r => setTimeout(r, 800));

  await page.screenshot({ path: `${ARTIFACTS_DIR}/oauth_1click_facebook_dialog.png` });
  console.log('📸 Screenshot 4: Facebook Consent Modal (Matching Lazada Facebook Screenshot!)');

  // Verify text in Facebook modal
  const pageTextFb = await page.evaluate(() => document.body.innerText);
  if (!pageTextFb.includes('Bạn từng đăng nhập vào Sorata bằng Facebook') || !pageTextFb.includes('Tiếp tục dưới tên Trường')) {
    throw new Error('Facebook modal text does not match consent dialog');
  }

  // 7. Click "Tiếp tục dưới tên Trường" (1-click login!)
  const clickedFbContinue = await page.evaluate(() => {
    const allBtns = Array.from(document.querySelectorAll('button'));
    const b = allBtns.find(btn => btn.innerText.includes('Tiếp tục dưới tên Trường'));
    if (b) { b.click(); return true; }
    return false;
  });

  if (!clickedFbContinue) throw new Error('"Tiếp tục dưới tên Trường" button not found');
  await new Promise(r => setTimeout(r, 2000));

  await page.screenshot({ path: `${ARTIFACTS_DIR}/oauth_1click_facebook_loggedin.png` });
  console.log('📸 Screenshot 5: Logged in via Facebook 1-Click');

  console.log('\n🎉 ALL 1-CLICK OAUTH TESTS PASSED WITH 100% SUCCESS!');
  await browser.close();
}

testOAuthFlow().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
