const fs = require('fs');
const https = require('https');

async function translateText(text) {
  return new Promise((resolve, reject) => {
    const query = encodeURIComponent(text);
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&q=${query}`;
    
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const translatedText = json[0].map(item => item[0]).join('');
          resolve(translatedText);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

async function run() {
  console.log('Loading data...');
  const fileContent = fs.readFileSync('./src/data/vocabularyDecksData.js', 'utf8');
  const match = fileContent.match(/export const vocabularyDecksData = (\[[\s\S]*\]);/);
  let data = eval(match[1]);

  let corruptedWords = [];
  data.forEach(deck => {
    deck.words.forEach(w => {
      if (w.word === w.meaning) {
        corruptedWords.push(w);
      }
    });
  });

  console.log(`Found ${corruptedWords.length} corrupted words. Translating in batches...`);
  
  const BATCH_SIZE = 50;
  for (let i = 0; i < corruptedWords.length; i += BATCH_SIZE) {
    const batch = corruptedWords.slice(i, i + BATCH_SIZE);
    const textToTranslate = batch.map(w => w.word).join('\n');
    try {
      const translated = await translateText(textToTranslate);
      const translatedLines = translated.split('\n').map(l => l.trim());
      
      batch.forEach((w, idx) => {
        if (translatedLines[idx] && translatedLines[idx].toLowerCase() !== w.word.toLowerCase()) {
          w.meaning = translatedLines[idx].toLowerCase();
        } else {
          // just leave it or capitalize
          w.meaning = w.word;
        }
      });
      console.log(`Processed batch ${i / BATCH_SIZE + 1} / ${Math.ceil(corruptedWords.length / BATCH_SIZE)}`);
    } catch (e) {
      console.error('Translation error on batch', i, e);
    }
    // Small delay to prevent rate limit
    await new Promise(r => setTimeout(r, 400));
  }

  const newContent = fileContent.replace(
    /export const vocabularyDecksData = (\[[\s\S]*\]);/,
    'export const vocabularyDecksData = ' + JSON.stringify(data, null, 2) + ';'
  );
  
  fs.writeFileSync('./src/data/vocabularyDecksData.js', newContent, 'utf8');
  console.log('Done fixing vocabulary!');
}

run();
