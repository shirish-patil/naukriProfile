const { Before, After, BeforeAll, setDefaultTimeout, Status } = require('@cucumber/cucumber');
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Whole scenario can take a while (uploads + waits). 120s per step.
setDefaultTimeout(120 * 1000);

BeforeAll(function () {
  for (const dir of ['auth', 'reports', 'screenshots']) {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  }
});

Before(async function () {
  const headless = String(process.env.HEADLESS ?? 'true').toLowerCase() !== 'false';
  this.browser = await chromium.launch({
    headless,
    args: ['--disable-blink-features=AutomationControlled', '--no-sandbox']
  });

  const storagePath = process.env.STORAGE_STATE || 'auth/storageState.json';
  const contextOptions = {
    viewport: { width: 1366, height: 900 },
    userAgent:
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
      '(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
  };

  // Reuse the saved login session if it exists — this is what avoids
  // needing 2FA / password entry on every daily run.
  if (fs.existsSync(storagePath)) {
    contextOptions.storageState = storagePath;
  }

  this.context = await this.browser.newContext(contextOptions);
  this.page = await this.context.newPage();
});

After(async function (scenario) {
  // On failure, capture a screenshot for debugging the scheduled run.
  if (scenario.result && scenario.result.status === Status.FAILED && this.page) {
    try {
      const safeName = scenario.pickle.name.replace(/[^a-z0-9]/gi, '_');
      const file = path.join('screenshots', `${safeName}_${Date.now()}.png`);
      const buffer = await this.page.screenshot({ path: file, fullPage: true });
      this.attach(buffer, 'image/png');
      console.error(`Failure screenshot saved to ${file}`);
    } catch (e) {
      console.error('Could not capture screenshot:', e.message);
    }
  }

  if (this.page) await this.page.close().catch(() => {});
  if (this.context) await this.context.close().catch(() => {});
  if (this.browser) await this.browser.close().catch(() => {});
});
