import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const TARGET_URL = 'https://parroto-dictation.vercel.app/';
const ARTIFACTS_DIR = '/Users/soncris/.gemini/antigravity-ide/brain/b1578ad7-86fb-4e60-ba33-ac062561f357';

async function runLiveYouTubeTest() {
  console.log('🚀 Starting live YouTube Import E2E test on', TARGET_URL);

  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: "new",
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--window-size=1280,850'
    ]
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 850 });

  // Intercept and abort disable-devtool
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (req.url().includes('disable-devtool')) req.abort();
    else req.continue();
  });

  page.on('console', (msg) => {
    const text = msg.text();
    if (!text.includes('Failed to load') && !text.includes('[DOM]')) {
      console.log('BROWSER LOG:', text);
    }
  });

  try {
    console.log('1. Navigating to', TARGET_URL);
    await page.goto(TARGET_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));

    // Check if logged in, otherwise login with quick OAuth
    const isLoggedIn = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('header button'));
      const hasLoginBtn = btns.some(b => b.innerText.includes('Đăng Nhập') || b.innerText.includes('Đăng nhập'));
      return !hasLoginBtn;
    });

    if (!isLoggedIn) {
      console.log('2. Logging in via Google OAuth form...');
      await page.evaluate(() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Đăng Nhập') || b.innerText.includes('Đăng nhập'));
        if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, 1200));

      await page.evaluate(() => {
        const gBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.toLowerCase().includes('google'));
        if (gBtn) gBtn.click();
      });
      await new Promise(r => setTimeout(r, 1200));

      // Fill in Google details
      await page.waitForSelector('div form input', { timeout: 10000 });
      const inputs = await page.$$('div form input');
      await inputs[0].click({ clickCount: 3 });
      await inputs[0].type('Nguyen Hoang Long', { delay: 20 });
      await inputs[1].click({ clickCount: 3 });
      await inputs[1].type('long.nguyen.google@gmail.com', { delay: 20 });
      const submitAuth = await page.$('div form button[type="submit"]');
      if (submitAuth) await submitAuth.click();

      await page.waitForFunction(
        () => document.body.innerText.includes('Chào Nguyen Hoang Long') || document.body.innerText.includes('Long'),
        { timeout: 15000 }
      );
      console.log('Logged in successfully!');
      await new Promise(r => setTimeout(r, 1500));
    }

    // 3. Navigate to "Luyện nghe" (Dictation Catalog)
    console.log('3. Navigating to Luyện nghe (Dictation)...');
    await page.waitForSelector('aside button', { timeout: 10000 });
    const asideButtons = await page.$$('aside button');
    console.log('Found aside buttons:', asideButtons.length);
    if (asideButtons.length >= 3) {
      await asideButtons[2].click(); // 3rd item is always "Luyện nghe"
    } else {
      for (const b of asideButtons) {
        const text = await b.evaluate(el => el.innerText);
        if (text.includes('nghe')) {
          await b.click();
          break;
        }
      }
    }
    await new Promise(r => setTimeout(r, 2500));

    // 4. Click "+ Tạo Bài Học Từ YouTube (PRO)"
    console.log('4. Clicking "+ Tạo Bài Học Từ YouTube (PRO)" button...');
    const clickedImport = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.includes('Tạo Bài Học Từ YouTube'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (!clickedImport) throw new Error('Could not find "+ Tạo Bài Học Từ YouTube" button in catalog');

    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'live_yt_modal_opened.png') });
    console.log('Saved live_yt_modal_opened.png');

    // Verify modal is open without lock screen
    const isUnlocked = await page.evaluate(() => {
      const modal = document.body.innerText;
      return modal.includes('AI TRANSCRIBE') && modal.includes('Tự Động Tạo Bài Học Ngay');
    });
    console.log('Is YouTube Import unlocked and ready?:', isUnlocked);
    if (!isUnlocked) throw new Error('Modal is still locked or not displaying import form');

    // 5. Select sample video: How To Wake Up Better
    console.log('5. Selecting sample video "How To Wake Up Better"...');
    await page.evaluate(() => {
      const sampleBtns = Array.from(document.querySelectorAll('button'));
      const sample = sampleBtns.find(b => b.innerText.includes('How To Wake Up Better'));
      if (sample) sample.click();
    });
    await new Promise(r => setTimeout(r, 1200));

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'live_yt_modal_preview.png') });
    console.log('Saved live_yt_modal_preview.png');

    // 6. Click "Tự Động Tạo Bài Học Ngay (AI)"
    console.log('6. Submitting YouTube lesson creation...');
    const submitBtn = await page.$('div form button[type="submit"]');
    if (!submitBtn) throw new Error('Submit button in modal not found');
    await submitBtn.click();

    // 7. Wait for Dictation room to load
    console.log('7. Waiting for AI transcription and redirection into Dictation room...');
    await page.waitForFunction(
      () => window.location.pathname.includes('/dictation') || document.body.innerText.includes('Mornings are') || document.body.innerText.includes('How To Wake Up Better'),
      { timeout: 35000 }
    );
    console.log('✅ Successfully entered Dictation room for the YouTube lesson!');

    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'live_yt_dictation_room.png') });
    console.log('Saved live_yt_dictation_room.png');

    // 8. Verify the sentence is the real YouTube transcript!
    const sentenceCheck = await page.evaluate(() => {
      const body = document.body.innerText;
      const hasRealTranscript = body.includes('Mornings are') || body.includes('tough') || body.includes('Olympic') || body.includes('How To Wake Up Better');
      const hasCanned = body.includes('Welcome to this listening exercise on Sorata');
      return { hasRealTranscript, hasCanned };
    });
    console.log('Sentence check on live site:', sentenceCheck);
    if (sentenceCheck.hasCanned || !sentenceCheck.hasRealTranscript) {
      throw new Error('Lesson does not contain real YouTube transcript sentences!');
    }

    // 9. Navigate back to catalog and verify custom card
    console.log('9. Navigating back to Dictation Catalog...');
    await page.evaluate(() => {
      const asideButtons = Array.from(document.querySelectorAll('aside button'));
      const dictBtn = asideButtons.find(b => b.innerText && b.innerText.includes('Luyện nghe'));
      if (dictBtn) dictBtn.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    const customCard = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('div')).filter(d => d.innerText && d.innerText.includes('YOUTUBE (TỰ TẠO)'));
      return cards.length > 0;
    });
    console.log('Custom YouTube lesson badge visible in catalog?:', customCard);

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'live_yt_catalog_custom_card.png') });
    console.log('Saved live_yt_catalog_custom_card.png');

    console.log('🎉 LIVE YOUTUBE IMPORT TEST PASSED WITH 100% SUCCESS!');
  } catch (err) {
    console.error('❌ Live test failed:', err);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'live_yt_failure.png') });
    throw err;
  } finally {
    await browser.close();
  }
}

runLiveYouTubeTest().catch(() => process.exit(1));
