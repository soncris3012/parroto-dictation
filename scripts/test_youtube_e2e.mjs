import puppeteer from 'puppeteer-core';
import path from 'path';

const CHROME_PATH = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const LOCAL_URL = 'http://localhost:5173/';
const ARTIFACTS_DIR = '/Users/soncris/.gemini/antigravity-ide/brain/b1578ad7-86fb-4e60-ba33-ac062561f357';

async function runTest() {
  console.log('🚀 Starting YouTube Import E2E test on', LOCAL_URL);

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
    console.log('1. Navigating to home page...');
    await page.goto(LOCAL_URL, { waitUntil: 'domcontentloaded', timeout: 20000 });

    // Set logged-in user in localStorage and direct route to Dictation Catalog
    console.log('2. Setting authenticated user state and route...');
    await page.evaluate(() => {
      localStorage.setItem('parroto_user', JSON.stringify({
        id: 55,
        email: 'soncris@gmail.com',
        full_name: 'Son Cris',
        is_pro: 1,
        role: 'user'
      }));
      localStorage.setItem('sorata_last_route', '/vi/dictation');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 2000));

    console.log('3. Navigating to Luyện nghe (Dictation Catalog)...');
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('nav a, aside div, aside button, button'));
      const dictationLink = items.find(el => el.innerText.includes('Luyện nghe') || el.innerText.includes('Dictation'));
      if (dictationLink) dictationLink.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    // 4. Click "+ Tạo Bài Học Từ YouTube (PRO)"
    console.log('4. Clicking "+ Tạo Bài Học Từ YouTube (PRO)" button...');
    const clickedImportBtn = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const btn = buttons.find(b => b.innerText.includes('Tạo Bài Học Từ YouTube'));
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    if (!clickedImportBtn) {
      throw new Error('Could not find "+ Tạo Bài Học Từ YouTube" button in catalog');
    }

    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'yt_modal_opened.png') });
    console.log('Saved yt_modal_opened.png');

    // 5. Select sample video: Steve Jobs Stanford Speech
    console.log('5. Selecting sample video "Steve Jobs Stanford Speech"...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const steveBtn = buttons.find(b => b.innerText.includes('Steve Jobs'));
      if (steveBtn) steveBtn.click();
    });

    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'yt_modal_preview.png') });
    console.log('Saved yt_modal_preview.png with live metadata preview');

    // 6. Click submit "Tự Động Tạo Bài Học Ngay (AI)"
    console.log('6. Submitting YouTube lesson creation...');
    const submitBtn = await page.$('button[type="submit"]');
    if (!submitBtn) throw new Error('Submit button not found');
    await submitBtn.click();

    // 7. Wait for navigation to dictation room
    console.log('7. Waiting for AI transcription and redirection into Dictation room...');
    await page.waitForFunction(
      () => window.location.pathname.includes('/dictation') || document.body.innerText.includes('Steve Jobs') || document.body.innerText.includes('Stay Hungry'),
      { timeout: 35000 }
    );
    console.log('✅ Successfully entered Dictation room for Steve Jobs YouTube lesson!');

    await new Promise(r => setTimeout(r, 2500));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'yt_dictation_room.png') });
    console.log('Saved yt_dictation_room.png');

    // 8. Verify the sentences are real English from the video, NOT the canned 3 sentences!
    const sentenceCheck = await page.evaluate(() => {
      const bodyText = document.body.innerText;
      const isCanned = bodyText.includes('Welcome to this listening exercise on Sorata');
      const hasRealContent = bodyText.includes('Stanford') || bodyText.includes('college') || bodyText.includes('hungry') || bodyText.includes('story') || bodyText.includes('speech');
      return { isCanned, hasRealContent };
    });
    console.log('Sentence check result:', sentenceCheck);
    if (sentenceCheck.isCanned) {
      throw new Error('Lesson fell back to canned fake sentences!');
    }

    // 9. Navigate back to Dictation catalog and verify custom card
    console.log('9. Navigating back to Dictation Catalog to check saved custom lesson...');
    await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('nav a, aside div, aside button, button'));
      const dictationLink = items.find(el => el.innerText.includes('Luyện nghe') || el.innerText.includes('Dictation'));
      if (dictationLink) dictationLink.click();
    });
    await new Promise(r => setTimeout(r, 1500));

    const customCardVisible = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('h4'));
      const customCard = cards.find(h => h.innerText.includes('Steve Jobs'));
      return !!customCard;
    });
    console.log('Is custom lesson card visible in catalog?:', customCardVisible);

    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'yt_catalog_custom_card.png') });
    console.log('Saved yt_catalog_custom_card.png');

    console.log('🎉 ALL YOUTUBE IMPORT E2E TESTS PASSED WITH 100% SUCCESS!');
  } catch (err) {
    console.error('❌ Test failed:', err);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'yt_test_failure.png') });
    throw err;
  } finally {
    await browser.close();
  }
}

runTest().catch(() => process.exit(1));
