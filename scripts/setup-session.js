/**
 * One-time (or occasional) session setup.
 *
 * Run this once with:  npm run login
 *
 * It opens a real browser window, auto-fills your credentials from .env,
 * and then PAUSES so you can complete any 2FA / OTP / captcha by hand.
 * Once you're on your Naukri dashboard, come back to the terminal and
 * press ENTER — the logged-in session is saved to auth/storageState.json
 * and reused by every future daily run (no password / 2FA needed again
 * until the session eventually expires).
 */
const { chromium } = require('playwright');
const fs = require('fs');
const readline = require('readline');
require('dotenv').config();

function waitForEnter(prompt) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(prompt, () => { rl.close(); resolve(); }));
}

(async () => {
  const storagePath = process.env.STORAGE_STATE || 'auth/storageState.json';
  if (!fs.existsSync('auth')) fs.mkdirSync('auth', { recursive: true });

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1366, height: 900 }
  });
  const page = await context.newPage();

  console.log('Opening Naukri login...');
  await page.goto('https://www.naukri.com/nlogin/login', { waitUntil: 'domcontentloaded' });

  const email = process.env.NAUKRI_EMAIL;
  const password = process.env.NAUKRI_PASSWORD;

  try {
    if (email) await page.locator('#usernameField, input[placeholder*="Email"]').first().fill(email);
    if (password) await page.locator('#passwordField, input[type="password"]').first().fill(password);
    console.log('Credentials pre-filled from .env.');
  } catch (e) {
    console.log('Could not auto-fill (page layout changed) — just log in manually.');
  }

  console.log('\n>>> Complete the login in the browser window (click Login, enter any OTP/2FA).');
  console.log('>>> When you can see your Naukri dashboard, return here and press ENTER.\n');
  await waitForEnter('Press ENTER after you are fully logged in... ');

  await context.storageState({ path: storagePath });
  console.log(`\n✅ Session saved to ${storagePath}. You're set for daily runs.`);

  await browser.close();
  process.exit(0);
})().catch((err) => {
  console.error('Session setup failed:', err);
  process.exit(1);
});
