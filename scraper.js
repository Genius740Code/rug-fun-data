// scraper.js
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'data/multipliers.json');

// Ensure data directory exists
if (!fs.existsSync(path.dirname(DATA_FILE))) {
  fs.mkdirSync(path.dirname(DATA_FILE));
}

// Initialize file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify({ multipliers: [] }));
}

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.goto("https://rugs.fun/", { waitUntil: 'networkidle2' });

  const selector = "#root > div > div:nth-child(2) > div > div:nth-child(3) > div > div:nth-child(1) > div > div:nth-child(4) > div:nth-child(8) > div > div";
  await page.waitForSelector(selector);

  let lastMultiplier = null;

  setInterval(async () => {
    try {
      const multiplier = await page.evaluate((sel) => {
        const el = document.querySelector(sel);
        return el ? el.innerText.trim() : null;
      }, selector);

      if (multiplier && multiplier !== lastMultiplier) {
        lastMultiplier = multiplier;
        console.log("New multiplier:", multiplier);

        // Read existing data
        const data = JSON.parse(fs.readFileSync(DATA_FILE));
        data.multipliers.push({
          value: multiplier,
          timestamp: new Date().toISOString()
        });
        
        // Save updated data
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
      }
    } catch (err) {
      console.error('Error:', err);
    }
  }, 3000);
})();