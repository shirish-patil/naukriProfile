// BasePage: shared helpers every page object inherits.
class BasePage {
  /** @param {import('playwright').Page} page */
  constructor(page) {
    this.page = page;
  }

  async goto(url, options = {}) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000, ...options });
  }

  /**
   * Try a list of selectors in order; return the first Locator that is visible.
   * Makes the framework resilient to Naukri's periodic UI/DOM changes.
   * @param {string[]} selectors
   * @param {number} timeout total ms to keep polling across all selectors
   */
  async firstVisible(selectors, timeout = 20000) {
    const deadline = Date.now() + timeout;
    let lastErr;
    while (Date.now() < deadline) {
      for (const sel of selectors) {
        const loc = this.page.locator(sel).first();
        try {
          if (await loc.isVisible()) return loc;
        } catch (e) {
          lastErr = e;
        }
      }
      await this.page.waitForTimeout(500);
    }
    throw new Error(
      `None of the selectors became visible within ${timeout}ms: ${JSON.stringify(selectors)}` +
      (lastErr ? ` (last error: ${lastErr.message})` : '')
    );
  }

  /** Locate an element (visible or not) from a list of candidate selectors. */
  async firstPresent(selectors, timeout = 20000) {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      for (const sel of selectors) {
        const loc = this.page.locator(sel).first();
        if (await loc.count()) return loc;
      }
      await this.page.waitForTimeout(500);
    }
    throw new Error(`None of the selectors were found within ${timeout}ms: ${JSON.stringify(selectors)}`);
  }

  async currentUrl() {
    return this.page.url();
  }
}

module.exports = { BasePage };
